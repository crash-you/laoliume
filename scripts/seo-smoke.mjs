/**
 * seo-smoke.mjs — 线上 HTTP smoke test（真实 GET，读 dist 构建产物作为预期）
 *
 * 用法:
 *   node scripts/seo-smoke.mjs \
 *     --base-url https://laoliu.me \            # 访问地址（可指向预览/本地）
 *     --canonical-origin https://laoliu.me \    # 预期 canonical 站点（默认生产域）
 *     --env production|preview|local \          # 目标环境，决定 noindex 预期
 *     --out docs/reports/smoke-<ts>.md
 *
 * 退出码: 0=全部必需检查通过；1=确定的断言失败；2=未验证/证据不足。
 * 本文件同时导出 runSmoke，供反例测试（scripts/test-negative.mjs）复用。
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROD = 'https://laoliu.me';
const DIST = join(root, 'dist');

/** 发起 GET，返回 { status, headers, body, finalUrl, chain, error, errorKind } */
export async function get(url, maxRedirect = 6) {
  const chain = [];
  let current = url;
  for (let i = 0; i <= maxRedirect; i++) {
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
      current = new URL(loc, current).href;
      continue;
    }
    const body = await resp.text().catch(() => '');
    return { status: resp.status, headers: h, body, chain, finalUrl: current };
  }
  return { error: '重定向次数超限（疑似循环）', errorKind: 'protocol', chain };
}

const normalize = (s) => (s || '').replace(/\s+/g, '');
const hasNoindexHtml = (html) =>
  /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) ||
  /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
const hasNoindexHeader = (headers) => /noindex/i.test(headers['x-robots-tag'] || '');

/**
 * runSmoke({ baseUrl, canonicalOrigin, env, slugs, getArticle })
 * - slugs: 预期可索引文章 slug 列表
 * - getArticle(slug): 返回 { title, fp, ogImage } | null（从 dist 提取）
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
    else if (!/<title>佬刘AI/.test(r.body)) record('首页', '失败', '200 但未含预期标题（可能挑战页/错误模板）');
    else if (env === 'production' && hasNoindexHtml(r.body)) record('首页', '失败', '生产首页误带 noindex');
    else if (env === 'production' && hasNoindexHeader(r.headers)) record('首页', '失败', '生产首页响应头带 noindex');
    else if (expectedCommit && !r.body.includes(`name="build-commit" content="${expectedCommit}"`))
      record('部署提交核验', '失败', `线上 build-commit 与预期 ${expectedCommit} 不一致（可能未部署对应提交）`);
    else if (!r.body.includes('https://wzyp.cn/shop/liu')) record('首页', '失败', '缺少 AI会员代充入口链接');
    else if (expectedCommit) {
      record('首页', '已通过', '200 + 标题 + 无 noindex + 业务入口在');
      record('部署提交核验', '已通过', `线上 build-commit = ${expectedCommit}`);
    }
    else record('首页', '已通过', '200 + 预期标题 + 无 noindex + 业务入口在');
  }

  // 全部正式文章
  for (const slug of slugs) {
    const exp = getArticle(slug);
    const r = await get(`${BASE}/${slug}/`);
    if (r.error) record(`文章 /${slug}/`, '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record(`文章 /${slug}/`, '失败', `HTTP ${r.status}`);
    else if (!exp) record(`文章 /${slug}/`, '失败', 'dist 缺少预期产物');
    else {
      const liveTitle = (r.body.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim();
      const prose = (r.body.match(/<div class="prose">([\s\S]*?)<\/article>/) || [])[1] || '';
      const proseText = normalize(prose.replace(/<[^>]+>/g, ''));
      if (liveTitle !== exp.title) record(`文章 /${slug}/`, '失败', `标题不符（期望 ${exp.title}，实际 ${liveTitle}）`);
      else if (!r.body.includes(`rel="canonical" href="${ORIGIN}/${slug}/"`))
        record(`文章 /${slug}/`, '失败', `canonical 不是 ${ORIGIN}/${slug}/`);
      else if (env === 'production' && hasNoindexHtml(r.body))
        record(`文章 /${slug}/`, '失败', '正式文章误带 noindex（HTML）');
      else if (env === 'production' && hasNoindexHeader(r.headers))
        record(`文章 /${slug}/`, '失败', '正式文章响应头带 noindex');
      else if (!proseText || proseText.length < 100)
        record(`文章 /${slug}/`, '失败', '正文缺失或过短（可能只剩侧栏/模板）');
      else if (exp.fp && !proseText.includes(exp.fp))
        record(`文章 /${slug}/`, '失败', '正文与构建产物不一致（指纹不匹配）');
      else record(`文章 /${slug}/`, '已通过', '200 + 标题/canonical/正文一致');
    }
  }

  // 非规范入口
  for (const slug of slugs.slice(0, 3)) {
    const r = await get(`${BASE}/${slug}`);
    if (r.error) {
      record(`非规范入口 /${slug}`, r.errorKind === 'protocol' ? '失败' : '未验证', r.error);
      continue;
    }
    const first = r.chain[0];
    const final = r.chain[r.chain.length - 1];
    if (![301, 308].includes(first.status)) record(`非规范入口 /${slug}`, '失败', `首跳 ${first.status}（期望 301/308）`);
    else if (final.status !== 200) record(`非规范入口 /${slug}`, '失败', `终点 HTTP ${final.status}`);
    else if (!final.url.endsWith(`/${slug}/`)) record(`非规范入口 /${slug}`, '失败', `终点异常 ${final.url}`);
    else record(`非规范入口 /${slug}`, '已通过', `永久跳转(${first.status})，${r.chain.length - 1} 跳后 200`);
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

  // robots / sitemap / rss
  {
    const r = await get(BASE + '/robots.txt');
    if (r.error) record('robots.txt', '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record('robots.txt', '失败', `HTTP ${r.status}`);
    else {
      const hasSitemap = /Sitemap:\s*https:\/\/laoliu\.me\/sitemap\.xml/i.test(r.body);
      const wildcardBlocked = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/\s*$/m.test(r.body.split(/User-agent:/i).slice(0, 2).join('User-agent:'));
      if (wildcardBlocked) record('robots.txt', '失败', '通配全站 Disallow');
      else if (!hasSitemap) record('robots.txt', '失败', '缺少 Sitemap 声明');
      else record('robots.txt', '已通过', '200 + Sitemap 声明');
    }
  }
  {
    const r = await get(BASE + '/sitemap.xml');
    if (r.error) record('sitemap.xml', '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record('sitemap.xml', '失败', `HTTP ${r.status}`);
    else {
      const valid = XMLValidator.validate(r.body);
      if (valid !== true) record('sitemap.xml', '失败', `XML 解析失败: ${String(valid.err?.msg ?? valid)}`);
      else record('sitemap.xml', '已通过', '200 + 合法 XML');
    }
  }
  {
    const r = await get(BASE + '/rss.xml');
    if (r.error) record('rss.xml', '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record('rss.xml', '失败', `HTTP ${r.status}`);
    else {
      const valid = XMLValidator.validate(r.body);
      if (valid !== true) record('rss.xml', '失败', `XML 解析失败: ${String(valid.err?.msg ?? valid)}`);
      else record('rss.xml', '已通过', '200 + 合法 XML');
    }
  }

  // 资源
  for (const [name, path] of [
    ['正文图片', '/images/codex-buy/image-1.png'],
    ['OG 分享图', '/og/default.png'],
    ['favicon', '/favicon.svg'],
  ]) {
    const r = await get(BASE + path);
    if (r.error) record(name, '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record(name, '失败', `HTTP ${r.status}`);
    else if (!r.headers['content-type'] || !r.headers['content-type'].startsWith('image'))
      record(name, '失败', `Content-Type 异常: ${r.headers['content-type']}`);
    else if (r.body.startsWith('<!DOCTYPE') || r.body.startsWith('<html'))
      record(name, '失败', '返回 HTML 而非图片');
    else record(name, '已通过', `200 + ${r.headers['content-type']}`);
  }

  // API
  {
    const r = await get(BASE + '/api/views/codex-buy');
    if (r.error) record('阅读量 API(GET)', '未验证', `网络错误: ${r.error}`);
    else if (r.status !== 200) record('阅读量 API(GET)', '失败', `HTTP ${r.status}`);
    else {
      try {
        const j = JSON.parse(r.body);
        if (typeof j.views !== 'number' && j.views !== null) record('阅读量 API(GET)', '失败', '缺 views 字段');
        else record('阅读量 API(GET)', '已通过', '200 + JSON 正常');
      } catch {
        record('阅读量 API(GET)', '失败', '非合法 JSON');
      }
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
    const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim();
    const prose = (html.match(/<div class="prose">([\s\S]*?)<\/article>/) || [])[1] || '';
    const text = normalize(prose.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ''));
    const fp = text.length > 80 ? text.slice(Math.floor(text.length / 3), Math.floor(text.length / 3) + 30) : text;
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
  const baseUrl = (args['base-url'] ?? PROD).replace(/\/$/, '');
  const canonicalOrigin = (args['canonical-origin'] ?? PROD).replace(/\/$/, '');
  const env = args.env ?? 'production';
  const expectedCommit = args['expected-commit'] ?? '';
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
  lines.push(`- 命令: node scripts/seo-smoke.mjs --base-url ${baseUrl} --canonical-origin ${canonicalOrigin} --env ${env}`);
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
