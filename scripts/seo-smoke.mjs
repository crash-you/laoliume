/**
 * seo-smoke.mjs — 线上 HTTP smoke test（真实 GET，读 dist 构建产物作为预期）
 *
 * 用法:
 *   node scripts/seo-smoke.mjs \
 *     --base-url https://laoliu.me \            # 访问地址（可指向预览/本地）
 *     --canonical-origin https://laoliu.me \    # 预期 canonical 站点（默认生产域）
 *     --env production|preview|local \          # 目标环境，决定 noindex 预期
 *     --expected-commit <sha>                   # 部署提交核验（可选）
 *     --out docs/reports/smoke-<ts>.md
 *
 * 退出码: 0=全部必需检查通过；1=确定的断言失败；2=未验证/证据不足。
 * 网络错误 -> 未验证（2）；协议/断言错误 -> 失败（1）；二者都不能伪装 exit 0。
 * 本文件同时导出 runSmoke，供反例测试（scripts/test-negative.mjs）复用。
 *
 * 正文定义：与 seo-check 共用 scripts/html-prose.mjs（真实 .prose 子树），
 * 线上与本地预期使用头/中/尾三段指纹的一致性策略，不只保留单点 30 字符指纹。
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { extractProseParts, metaTag, titleTag } from './html-prose.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROD = 'https://laoliu.me';
const DIST = join(root, 'dist');

/** 发起 GET，返回 { status, headers, body, bodyBuffer, finalUrl, chain, error, errorKind }
 *  body 为文本；bodyBuffer 为原始二进制（图片魔数检查用） */
export async function get(url, maxRedirect = 6) {
  const chain = [];
  const seen = new Set();
  let current = url;
  for (let i = 0; i <= maxRedirect; i++) {
    if (seen.has(current)) {
      return { error: `重定向循环：${current} 再次出现`, errorKind: 'protocol', chain };
    }
    seen.add(current);
    let resp;
    try {
      resp = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    } catch (e) {
      return { error: e.message, errorKind: 'network', chain };
    }
    const h = {};
    resp.headers.forEach((v, k) => (h[k.toLowerCase()] = v));
    chain.push({ url: current, status: resp.status, location: resp.headers.get('location') });
    if ([301, 302, 303, 307, 308].includes(resp.status)) {
      const loc = resp.headers.get('location');
      if (!loc) return { error: '重定向缺少 Location', errorKind: 'protocol', chain };
      let next;
      try {
        next = new URL(loc, current).href;
      } catch {
        return { error: `Location 非法: ${loc}`, errorKind: 'protocol', chain };
      }
      if (next === current) {
        return { error: `重定向自指: ${current}`, errorKind: 'protocol', chain };
      }
      current = next;
      continue;
    }
    const bodyBuffer = Buffer.from(await resp.arrayBuffer().catch(() => new ArrayBuffer(0)));
    const body = bodyBuffer.toString('utf-8');
    return { status: resp.status, headers: h, body, bodyBuffer, chain, finalUrl: current };
  }
  return { error: '重定向次数超限（疑似循环）', errorKind: 'protocol', chain };
}

const normalize = (s) => (s || '').replace(/\s+/g, '');

/* ---------- 索引指令解析（HTML meta + HTTP 头，含 Googlebot 专用与 none 等价） ---------- */

/**
 * 解析 robots 指令字符串（如 "noindex, nofollow" 或 "none"）为规范化集合。
 * - none 等价于 noindex + nofollow
 * - 只解析明确支持的指令；未知指令报告但不猜测
 */
function parseDirectives(str) {
  const tokens = String(str || '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const set = new Set(tokens);
  if (set.has('none')) {
    set.add('noindex');
    set.add('nofollow');
  }
  return { tokens, set };
}

/**
 * 从 HTML 提取 robots 指令（通用 + Googlebot 专用）。
 * 返回 { robots: {tokens,set}|null, googlebot: {tokens,set}|null }
 * 属性顺序、单双引号均可；多条 meta 时合并。
 */
export function parseHtmlRobots(html) {
  const result = { robots: null, googlebot: null };
  const metas = [...html.matchAll(/<meta\s[^>]*>/gi)];
  for (const m of metas) {
    const tag = m[0];
    const name = (tag.match(/\sname\s*=\s*["']([^"']*)["']/i) || [])[1];
    if (!name) continue;
    const content = (tag.match(/\scontent\s*=\s*["']([^"']*)["']/i) || [])[1];
    if (content === undefined) continue;
    const key = name.toLowerCase();
    if (key === 'robots' || key === 'googlebot') {
      const parsed = parseDirectives(content);
      if (result[key]) {
        // 合并多条
        parsed.tokens = [...result[key].tokens, ...parsed.tokens];
        for (const t of parsed.set) result[key].set.add(t);
        result[key].tokens = parsed.tokens;
      } else {
        result[key] = parsed;
      }
    }
  }
  return result;
}

/** 从 X-Robots-Tag 头提取指令（支持多个头值与 Googlebot 专用段） */
export function parseHeaderRobots(headers) {
  const raw = headers['x-robots-tag'];
  if (!raw) return { robots: null, googlebot: null };
  const result = { robots: null, googlebot: null };
  // X-Robots-Tag 可有多个值（逗号分隔或数组）；Googlebot 专用格式 "googlebot: noindex"
  const parts = Array.isArray(raw) ? raw : [raw];
  for (const part of parts) {
    for (const seg of String(part).split(/(?<=[a-z0-9])\s*,\s*(?=[a-z0-9])/i)) {
      const agentMatch = seg.match(/^([a-z][a-z0-9_-]*)\s*:\s*(.+)$/i);
      if (agentMatch && /googlebot/i.test(agentMatch[1])) {
        const parsed = parseDirectives(agentMatch[2]);
        result.googlebot = result.googlebot
          ? { tokens: [...result.googlebot.tokens, ...parsed.tokens], set: new Set([...result.googlebot.set, ...parsed.set]) }
          : parsed;
      } else {
        const parsed = parseDirectives(seg);
        result.robots = result.robots
          ? { tokens: [...result.robots.tokens, ...parsed.tokens], set: new Set([...result.robots.set, ...parsed.set]) }
          : parsed;
      }
    }
  }
  return result;
}

/** 综合判断页面是否对 Googlebot 生效 noindex（HTML + HTTP 头，含 Googlebot 专用指令） */
export function effectiveNoindex(html, headers) {
  const fromHtml = parseHtmlRobots(html || '');
  const fromHeader = parseHeaderRobots(headers || {});
  const sources = {
    htmlRobots: fromHtml.robots,
    htmlGooglebot: fromHtml.googlebot,
    headerRobots: fromHeader.robots,
    headerGooglebot: fromHeader.googlebot,
  };
  // Googlebot 专用指令优先；其次通用指令
  for (const key of ['htmlGooglebot', 'headerGooglebot', 'htmlRobots', 'headerRobots']) {
    if (sources[key]?.set.has('noindex')) return { noindex: true, source: key };
  }
  return { noindex: false, source: null };
}

/* ---------- robots.txt 分组评估 ---------- */

/**
 * 按 User-agent 分组解析 robots.txt，评估主流搜索爬虫是否被允许抓取。
 * 不用「文件里有 Allow:/」证明允许——按最长匹配规则评估。
 * 返回 { groups: [{agents, rules}], sitemaps: [], allowsCrawler(ua) }
 */
export function parseRobots(txt) {
  const lines = String(txt || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, '').trim())
    .filter(Boolean);
  const groups = [];
  let current = null;
  const sitemaps = [];
  for (const line of lines) {
    const m = line.match(/^(user-agent|sitemap|disallow|allow|crawl-delay)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'user-agent') {
      if (!current || current.rules.length > 0 || current.agents.length === 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (key === 'sitemap') {
      sitemaps.push(value);
    } else if (current) {
      current.rules.push({ type: key, path: value });
    }
  }
  // 评估某 UA 是否允许抓取某路径（最长匹配；Disallow 优先于 Allow 同长度）
  function allowsCrawler(ua, path = '/') {
    const uaLower = ua.toLowerCase();
    let best = null; // { type, len, group }
    for (const g of groups) {
      const matches = g.agents.some(
        (a) => a === '*' || a === uaLower || uaLower.includes(a) || a.includes(uaLower)
      );
      if (!matches) continue;
      for (const r of g.rules) {
        if (path.startsWith(r.path)) {
          const len = r.path.length;
          if (!best || len > best.len || (len === best.len && r.type === 'disallow')) {
            best = { type: r.type, len, group: g };
          }
        }
      }
    }
    if (!best) return { allowed: true, reason: '无匹配规则，默认允许' };
    return {
      allowed: best.type === 'allow',
      reason: `匹配 ${best.type}: ${best.path || '/'}（组: ${best.group.agents.join(', ')}）`,
    };
  }
  return { groups, sitemaps, allowsCrawler };
}

/* ---------- 主流程 ---------- */

/**
 * runSmoke({ baseUrl, canonicalOrigin, env, slugs, getArticle, expectedCommit, deployment })
 * - slugs: 预期可索引文章 slug 列表
 * - getArticle(slug): 返回 { title, fp: {length, head, middle, tail} } | null（从 dist 提取）
 * - deployment: 'workers' | 'pages' | null（部署架构；null 表示未验证）
 * 返回 { results, exitCode }
 */
export async function runSmoke({ baseUrl, canonicalOrigin, env, slugs, getArticle, expectedCommit }) {
  const results = [];
  const record = (name, status, detail) => results.push({ name, status, detail });
  const BASE = baseUrl.replace(/\/$/, '');
  const ORIGIN = canonicalOrigin.replace(/\/$/, '');

  // 首页
  {
    const r = await get(BASE + '/');
    if (r.error) record('首页', '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record('首页', '失败', `HTTP ${r.status}`);
    else {
      const issues = [];
      if (!/<title>佬刘AI/.test(r.body)) issues.push('未含预期标题（可能挑战页/错误模板）');
      if (env === 'production') {
        const eff = effectiveNoindex(r.body, r.headers);
        if (eff.noindex) issues.push(`生产首页 noindex（来源: ${eff.source}）`);
      }
      if (expectedCommit && !r.body.includes(`name="build-commit" content="${expectedCommit}"`)) {
        issues.push(`线上 build-commit 与预期 ${expectedCommit} 不一致（可能未部署对应提交）`);
      }
      if (!r.body.includes('https://wzyp.cn/shop/liu')) issues.push('缺少 AI会员代充入口链接');
      // 最终 URL 必须是预期规范页（不被跳到 www 或别的域）
      if (r.finalUrl !== BASE + '/') issues.push(`最终 URL ${r.finalUrl} 不是预期的 ${BASE}/`);
      if (issues.length) record('首页', '失败', issues.join('；'));
      else {
        record('首页', '已通过', '200 + 标题 + 索引指令 + 业务入口 + 规范地址');
        if (expectedCommit) record('部署提交核验', '已通过', `线上 build-commit = ${expectedCommit}`);
      }
    }
  }

  // 全部正式文章
  for (const slug of slugs) {
    const exp = getArticle(slug);
    const r = await get(`${BASE}/${slug}/`);
    if (r.error) record(`文章 /${slug}/`, '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record(`文章 /${slug}/`, '失败', `HTTP ${r.status}`);
    else if (!exp) record(`文章 /${slug}/`, '失败', 'dist 缺少预期产物');
    else {
      const issues = [];
      const liveTitle = titleTag(r.body);
      if (liveTitle !== exp.title) issues.push(`标题不符（期望 ${exp.title}，实际 ${liveTitle}）`);
      const canonical = (r.body.match(/<link\s[^>]*rel\s*=\s*["']canonical["'][^>]*>/i) || [''])[0];
      const canonicalHref = (canonical.match(/\shref\s*=\s*["']([^"']*)["']/i) || [])[1];
      if (canonicalHref !== `${ORIGIN}/${slug}/`) {
        issues.push(`canonical 不是 ${ORIGIN}/${slug}/（实际 ${canonicalHref}）`);
      }
      if (env === 'production') {
        const eff = effectiveNoindex(r.body, r.headers);
        if (eff.noindex) issues.push(`正式文章 noindex（来源: ${eff.source}）`);
      }
      // 正文：真实 .prose 子树 + 头/中/尾三段指纹
      const parts = extractProseParts(r.body);
      if (!parts) issues.push('正文 .prose 缺失（可能只剩侧栏/模板）');
      else if (parts.length < 80) issues.push(`正文过短（${parts.length} 字符）`);
      else if (exp.fp) {
        const mismatches = [];
        if (parts.head !== exp.fp.head) mismatches.push('头段');
        if (parts.middle !== exp.fp.middle) mismatches.push('中段');
        if (parts.tail !== exp.fp.tail) mismatches.push('尾段');
        if (mismatches.length) issues.push(`正文与构建产物不一致（${mismatches.join('/')}指纹不匹配）`);
      }
      if (r.finalUrl !== `${BASE}/${slug}/`) issues.push(`最终 URL ${r.finalUrl} 异常`);
      if (issues.length) record(`文章 /${slug}/`, '失败', issues.join('；'));
      else record(`文章 /${slug}/`, '已通过', '200 + 标题/canonical/正文三段一致');
    }
  }

  // 非规范入口（全部 slug，不只前 3 个）
  for (const slug of slugs) {
    const checkName = `非规范入口 /${slug}`;
    const r = await get(`${BASE}/${slug}`);
    if (r.error) {
      record(checkName, r.errorKind === 'protocol' ? '失败' : '未验证', r.error);
      continue;
    }
    const first = r.chain[0];
    const final = r.chain[r.chain.length - 1];
    const issues = [];
    if (![301, 308].includes(first.status)) {
      issues.push(`首跳 ${first.status}（期望 301/308 永久跳转；302/303/307 是临时跳转不算）`);
    }
    if (final.status !== 200) issues.push(`终点 HTTP ${final.status}`);
    if (final.url !== `${BASE}/${slug}/`) issues.push(`终点异常 ${final.url}`);
    // 每跳 Location 与最终 origin 记录
    const hops = r.chain
      .slice(0, -1)
      .map((c) => `${c.status}->${c.location}`)
      .join(' | ');
    const finalOrigin = new URL(final.url).origin;
    if (finalOrigin !== new URL(BASE).origin) issues.push(`最终 origin ${finalOrigin} 不是 ${new URL(BASE).origin}`);
    if (issues.length) record(checkName, '失败', `${issues.join('；')}；链路: ${hops || '无跳转'}`);
    else record(checkName, '已通过', `永久跳转(${first.status})，${r.chain.length - 1} 跳，链路: ${hops}`);
  }

  // 随机 404
  {
    const rnd = 'no-such-page-' + Date.now().toString(36);
    const r = await get(`${BASE}/${rnd}`);
    if (r.error) record('随机 404', '未验证', `网络错误: ${r.error}`);
    else if (r.status === 404) record('随机 404', '已通过', '真实 404');
    else if (r.status === 200) record('随机 404', '失败', '200（软 404）');
    else record('随机 404', '失败', `HTTP ${r.status}`);
  }

  // robots：按 User-agent 分组评估主流搜索爬虫
  {
    const r = await get(BASE + '/robots.txt');
    if (r.error) record('robots.txt', '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record('robots.txt', '失败', `HTTP ${r.status}`);
    else {
      const parsed = parseRobots(r.body);
      const issues = [];
      // 主流搜索爬虫必须允许抓取
      for (const ua of ['Googlebot', 'Bingbot']) {
        const verdict = parsed.allowsCrawler(ua);
        if (!verdict.allowed) issues.push(`${ua} 被禁抓取（${verdict.reason}）`);
      }
      // Sitemap 声明（发现/配置一致性要求，不宣称缺这行就无法收录）
      if (!parsed.sitemaps.some((s) => s === PROD + '/sitemap.xml')) {
        issues.push(`缺少 Sitemap: ${PROD}/sitemap.xml 声明（影响发现效率，非收录阻断）`);
      }
      // AI 训练爬虫策略仅记录，不判失败（站长商业决策）
      const aiCrawlers = ['GPTBot', 'ClaudeBot', 'CCBot'].filter((ua) => !parsed.allowsCrawler(ua).allowed);
      if (issues.length) record('robots.txt', '失败', issues.join('；'));
      else {
        const aiNote = aiCrawlers.length ? `；AI 爬虫被禁: ${aiCrawlers.join(', ')}（站长策略，不判失败）` : '';
        record('robots.txt', '已通过', `200 + 搜索爬虫允许 + Sitemap 声明${aiNote}`);
      }
    }
  }

  // sitemap：Content-Type + XML 根 + 结构 + URL 集合与本地预期一致
  {
    const r = await get(BASE + '/sitemap.xml');
    if (r.error) record('sitemap.xml', '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record('sitemap.xml', '失败', `HTTP ${r.status}`);
    else {
      const issues = [];
      const ct = r.headers['content-type'] || '';
      if (!/xml/i.test(ct)) issues.push(`Content-Type 异常: ${ct || '(空)'}`);
      const valid = XMLValidator.validate(r.body);
      if (valid !== true) issues.push(`XML 解析失败: ${String(valid.err?.msg ?? valid)}`);
      else {
        const parsed = new XMLParser().parse(r.body, { ignoreAttributes: false });
        if (!parsed.urlset) {
          issues.push(`XML 根不是 urlset（可能是合法 XHTML 错误页）`);
        } else {
          const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
          const locs = urls.map((u) => u?.loc).filter(Boolean);
          if (!locs.length) issues.push('sitemap 无 <loc>');
          // URL 集合与本地预期一致
          const expectedLocs = [ORIGIN + '/', ...slugs.map((s) => `${ORIGIN}/${s}/`)];
          const missing = expectedLocs.filter((l) => !locs.includes(l));
          const extra = locs.filter((l) => !expectedLocs.includes(l));
          if (missing.length) issues.push(`sitemap 缺少预期 URL: ${missing.join(', ')}`);
          if (extra.length) issues.push(`sitemap 有预期外 URL: ${extra.join(', ')}`);
          // 去重
          const dup = locs.filter((l, i) => locs.indexOf(l) !== i);
          if (dup.length) issues.push(`sitemap 有重复 URL: ${[...new Set(dup)].join(', ')}`);
        }
      }
      if (issues.length) record('sitemap.xml', '失败', issues.join('；'));
      else record('sitemap.xml', '已通过', '200 + XML 合法 + URL 集合与本地预期一致');
    }
  }

  // RSS：Content-Type + XML 根 + 结构
  {
    const r = await get(BASE + '/rss.xml');
    if (r.error) record('rss.xml', '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record('rss.xml', '失败', `HTTP ${r.status}`);
    else {
      const issues = [];
      const ct = r.headers['content-type'] || '';
      if (!/xml/i.test(ct)) issues.push(`Content-Type 异常: ${ct || '(空)'}`);
      const valid = XMLValidator.validate(r.body);
      if (valid !== true) issues.push(`XML 解析失败: ${String(valid.err?.msg ?? valid)}`);
      else {
        const parsed = new XMLParser().parse(r.body);
        if (!parsed.rss?.channel?.title) issues.push('XML 根不是 rss/channel 结构');
        else {
          const items = parsed.rss.channel.item;
          const itemCount = Array.isArray(items) ? items.length : items ? 1 : 0;
          if (itemCount === 0) issues.push('RSS 无 item');
          else if (itemCount !== slugs.length) {
            issues.push(`RSS item 数 ${itemCount} 与预期 ${slugs.length} 不一致`);
          }
        }
      }
      if (issues.length) record('rss.xml', '失败', issues.join('；'));
      else record('rss.xml', '已通过', '200 + XML 合法 + item 集合一致');
    }
  }

  // 资源：真实 MIME + 文件内容（不只 200 + content-type 字符串）
  for (const [name, path] of [
    ['正文图片', '/images/codex-buy/image-1.png'],
    ['OG 分享图', '/og/default.png'],
    ['favicon', '/favicon.svg'],
  ]) {
    const r = await get(BASE + path);
    if (r.error) record(name, '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record(name, '失败', `HTTP ${r.status}`);
    else {
      const issues = [];
      const ct = r.headers['content-type'] || '';
      if (!ct.startsWith('image/')) issues.push(`Content-Type 不是 image/*: ${ct || '(空)'}`);
      // 真实文件内容魔数检查（PNG: 89504E47，SVG: <svg 或 <?xml）
      if (path.endsWith('.png')) {
        const buf = r.bodyBuffer || Buffer.from(r.body, 'binary');
        if (!(buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)) {
          issues.push('内容不是真实 PNG（魔数不匹配，可能是 HTML 错误页）');
        }
      } else if (path.endsWith('.svg')) {
        if (!/^\s*(<\?xml|<svg)/i.test(r.body)) issues.push('内容不是 SVG');
      }
      if (r.body.startsWith('<!DOCTYPE') || r.body.startsWith('<html')) issues.push('返回 HTML 而非图片');
      if (issues.length) record(name, '失败', issues.join('；'));
      else record(name, '已通过', `200 + ${ct} + 内容魔数正确`);
    }
  }

  // API：GET 验证 JSON、字段与 X-Robots-Tag 契约（不对生产 API POST）
  {
    const r = await get(BASE + '/api/views/codex-buy');
    if (r.error) record('阅读量 API(GET)', '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record('阅读量 API(GET)', '失败', `HTTP ${r.status}`);
    else {
      const issues = [];
      try {
        const j = JSON.parse(r.body);
        if (typeof j.views !== 'number' && j.views !== null) issues.push('缺 views 字段');
      } catch {
        issues.push('非合法 JSON');
      }
      // X-Robots-Tag: noindex 契约（JSON 非 HTML 用 HTTP 头）
      const xrt = r.headers['x-robots-tag'] || '';
      if (!/noindex/i.test(xrt)) issues.push(`缺少 X-Robots-Tag: noindex（实际: ${xrt || '无'}）`);
      if (issues.length) record('阅读量 API(GET)', '失败', issues.join('；'));
      else record('阅读量 API(GET)', '已通过', '200 + JSON + X-Robots-Tag: noindex');
    }
  }

  const passed = results.filter((r) => r.status === '已通过').length;
  const failed = results.filter((r) => r.status === '失败').length;
  const unverified = results.filter((r) => r.status === '未验证').length;
  let exitCode = 0;
  if (failed) exitCode = 1;
  else if (unverified) exitCode = 2;
  return { results, passed, failed, unverified, exitCode, BASE, ORIGIN, env, startedAt: new Date() };
}

/** 从 dist 构建产物读取预期集合 */
function distExpectations() {
  const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf-8');
  const parsed = new XMLParser().parse(xml);
  const locs = (Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url])
    .map((u) => u.loc)
    .filter(Boolean);
  const slugs = locs
    .filter((l) => l.startsWith(PROD + '/') && l !== PROD + '/')
    .map((l) => l.replace(PROD + '/', '').replace(/\/$/, ''));
  const getArticle = (slug) => {
    const file = join(DIST, slug, 'index.html');
    if (!existsSync(file)) return null;
    const html = readFileSync(file, 'utf-8');
    const title = titleTag(html);
    const fp = extractProseParts(html);
    return { title, fp };
  };
  return { slugs, getArticle };
}

/* ---------- CLI ---------- */
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const args = Object.fromEntries(
    process.argv.slice(2).reduce((acc, cur, i, arr) => {
      if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
      return acc;
    }, [])
  );

  // 参数校验：无效 env / origin / SHA 明确报错（不静默回退）
  const baseUrl = (args['base-url'] ?? PROD).replace(/\/$/, '');
  const canonicalOrigin = (args['canonical-origin'] ?? PROD).replace(/\/$/, '');
  const env = args.env ?? 'production';
  const expectedCommit = args['expected-commit'] ?? '';

  const errors = [];
  if (!['production', 'preview', 'local'].includes(env)) {
    errors.push(`--env 无效: ${env}（可选 production|preview|local）`);
  }
  for (const [label, u] of [['--base-url', baseUrl], ['--canonical-origin', canonicalOrigin]]) {
    try {
      const parsed = new URL(u);
      if (!['http:', 'https:'].includes(parsed.protocol)) errors.push(`${label} 协议必须是 http/https: ${u}`);
    } catch {
      errors.push(`${label} 无法解析为 URL: ${u}`);
    }
  }
  if (expectedCommit && !/^[0-9a-f]{7,40}$/i.test(expectedCommit)) {
    errors.push(`--expected-commit 不是合法的 git SHA: ${expectedCommit}`);
  }
  // base-url 与 canonical-origin 必须是独立参数：本地/预览请求地址不等于生产规范地址是合法场景，
  // 但 env=production 时 canonical-origin 必须是生产域（防止误把预览当生产验收）
  if (env === 'production' && canonicalOrigin !== PROD) {
    errors.push(`生产验收的 --canonical-origin 必须是 ${PROD}（实际 ${canonicalOrigin}）`);
  }
  if (errors.length) {
    console.error('参数错误:');
    errors.forEach((e) => console.error('  ' + e));
    process.exit(2);
  }

  const { slugs, getArticle } = distExpectations();
  if (!slugs.length) {
    console.error('dist/sitemap.xml 无文章 loc（先构建）');
    process.exit(2);
  }
  const res = await runSmoke({ baseUrl, canonicalOrigin, env, slugs, getArticle, expectedCommit });

  const lines = [];
  lines.push('# 线上 HTTP Smoke Test 报告');
  lines.push('');
  lines.push(`- 访问地址 base-url: ${res.BASE}`);
  lines.push(`- 预期 canonical-origin: ${res.ORIGIN}`);
  lines.push(`- 目标环境: ${res.env}`);
  lines.push(`- 来源产物: dist/（${slugs.length} 篇可索引文章）`);
  lines.push(`- 部署提交核验: ${expectedCommit || '未指定'}`);
  lines.push(`- 命令: node scripts/seo-smoke.mjs --base-url ${baseUrl} --canonical-origin ${canonicalOrigin} --env ${env}${expectedCommit ? ' --expected-commit ' + expectedCommit : ''}`);
  lines.push(`- 时间: ${res.startedAt.toISOString()}`);
  lines.push(`- 环境: Node ${process.version}`);
  lines.push('');
  lines.push('| 检查项 | 结果 | 说明 |');
  lines.push('|---|---|---|');
  for (const r of res.results) lines.push(`| ${r.name} | ${r.status} | ${r.detail.replace(/\|/g, '/')} |`);
  lines.push('');
  lines.push(`**统计**: 已通过 ${res.passed} / 失败 ${res.failed} / 未验证 ${res.unverified}（共 ${res.results.length} 项）`);
  lines.push('');
  if (res.failed) lines.push(`**结果**: 失败（${res.failed} 项确定失败）`);
  else if (res.unverified) lines.push(`**结果**: 未完成验证（${res.unverified} 项未验证）`);
  else lines.push('**结果**: 全部必需检查通过');
  lines.push(`**退出码**: ${res.exitCode}`);

  const report = lines.join('\n');
  console.log(report);
  if (args.out) {
    const outPath = join(root, args.out);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, report);
    console.log(`\n报告已写入: ${args.out}`);
  }
  process.exit(res.exitCode);
}
