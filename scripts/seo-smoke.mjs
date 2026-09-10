/**
 * seo-smoke.mjs — 线上 HTTP smoke test（真实 GET，不只用 HEAD）
 *
 * 用法: node scripts/seo-smoke.mjs --base-url https://laoliu.me [--out docs/reports/smoke-<ts>.md]
 *
 * 检查（基于 dist/ 的发布集合）：
 *   - 首页与全部正式文章：200 + HTML 含预期标题
 *   - 非规范入口 /<slug>：永久跳转（301/308）到 /<slug>/，且跳转后 200，无循环
 *   - 随机不存在地址：真实 404（不是首页 200）
 *   - robots.txt / sitemap.xml / rss.xml：200 + 内容合法
 *   - 代表性图片 / OG 分享图：200
 *   - 页面 noindex / 挑战页 / 错误模板识别
 *
 * 网络不可用时标记「未验证 / 检测失败」，不写成通过。
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);
const BASE = (args['base-url'] ?? 'https://laoliu.me').replace(/\/$/, '');
const DIST = join(root, 'dist');

const results = [];
const record = (name, status, detail) => results.push({ name, status, detail });

/** 发起 GET 请求，返回 { status, location, body, finalUrl, chain } */
async function get(url, maxRedirect = 5) {
  const chain = [];
  let current = url;
  for (let i = 0; i <= maxRedirect; i++) {
    let resp;
    try {
      resp = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    } catch (e) {
      return { error: e.message, chain };
    }
    chain.push({ url: current, status: resp.status, location: resp.headers.get('location') });
    if ([301, 302, 303, 307, 308].includes(resp.status)) {
      const loc = resp.headers.get('location');
      if (!loc) return { status: resp.status, chain, error: 'redirect 无 location' };
      current = new URL(loc, current).href;
      continue;
    }
    const body = await resp.text().catch(() => '');
    return { status: resp.status, body, chain, finalUrl: current, headers: resp.headers };
  }
  return { error: '重定向次数超限（疑似循环）', chain };
}

/** 从 dist 的发布集合推导线上应存在的文章（与 sitemap 一致性由 seo:check 保证） */
function publishedSlugs() {
  const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf-8');
  return [...xml.matchAll(/<loc>https:\/\/laoliu\.me\/([^/]+)\/<\/loc>/g)].map((m) => m[1]);
}

const slugs = publishedSlugs();
if (!slugs.length) {
  console.error('dist/sitemap.xml 无文章 loc（先构建）');
  process.exit(2);
}

const startedAt = new Date();
console.log(`目标: ${BASE}，文章数: ${slugs.length}\n`);

// 1. 首页
{
  const r = await get(BASE + '/');
  if (r.error) record('首页', '未验证', `网络错误: ${r.error}`);
  else if (r.status !== 200) record('首页', '失败', `HTTP ${r.status}`);
  else if (!/<title>佬刘AI/.test(r.body)) record('首页', '失败', '200 但未含预期标题（可能是挑战页/错误模板）');
  else if (/name="robots" content="[^"]*noindex/.test(r.body)) record('首页', '失败', '出现 noindex');
  else record('首页', '已通过', '200 + 预期标题');
}

// 2. 全部正式文章
for (const slug of slugs) {
  const r = await get(`${BASE}/${slug}/`);
  if (r.error) record(`文章 /${slug}/`, '未验证', `网络错误: ${r.error}`);
  else if (r.status !== 200) record(`文章 /${slug}/`, '失败', `HTTP ${r.status}`);
  else {
    const hasTitle = new RegExp(`<title>[^<]*`).test(r.body);
    const noindex = /name="robots" content="[^"]*noindex/.test(r.body);
    const canonicalOk = r.body.includes(`rel="canonical" href="${BASE}/${slug}/"`);
    if (!hasTitle) record(`文章 /${slug}/`, '失败', '200 但无标题');
    else if (noindex) record(`文章 /${slug}/`, '失败', '正式文章出现 noindex');
    else if (!canonicalOk) record(`文章 /${slug}/`, '失败', 'canonical 与访问地址不一致');
    else record(`文章 /${slug}/`, '已通过', '200 + canonical 一致');
  }
}

// 3. 非规范入口 308/301
for (const slug of slugs.slice(0, 3)) {
  const r = await get(`${BASE}/${slug}`);
  if (r.error) record(`非规范入口 /${slug}`, '未验证', `网络错误: ${r.error}`);
  else {
    const first = r.chain[0];
    const final = r.chain[r.chain.length - 1];
    const hopCount = r.chain.length - 1;
    if (![301, 308].includes(first.status)) {
      record(`非规范入口 /${slug}`, '失败', `首跳为 ${first.status}（期望 301/308 永久跳转）`);
    } else if (r.error) {
      record(`非规范入口 /${slug}`, '失败', r.error);
    } else if (final.status !== 200) {
      record(`非规范入口 /${slug}`, '失败', `跳转终点 HTTP ${final.status}`);
    } else if (!final.url.endsWith(`/${slug}/`)) {
      record(`非规范入口 /${slug}`, '失败', `跳转终点异常: ${final.url}`);
    } else {
      record(`非规范入口 /${slug}`, '已通过', `永久跳转(${first.status})，${hopCount} 跳到 200`);
    }
  }
}

// 4. 随机不存在地址
{
  const rnd = 'no-such-page-' + Date.now().toString(36);
  const r = await get(`${BASE}/${rnd}`);
  if (r.error) record('随机 404', '未验证', `网络错误: ${r.error}`);
  else if (r.status === 404) record('随机 404', '已通过', '真实 404 状态码');
  else if (r.status === 200) record('随机 404', '失败', '返回 200（软 404，可能渲染了首页）');
  else record('随机 404', '失败', `HTTP ${r.status}（期望 404）`);
}

// 5. robots / sitemap / rss
for (const [name, path, expect] of [
  // 注意：通配 User-agent 后跟特定 bot 的全站 Disallow 是 Cloudflare 托管内容形态，
  // 这里只检查「通配段未禁止全站」；特定 AI 爬虫策略由站长在 Cloudflare 决定。
  ['robots.txt', '/robots.txt', (b) => /User-agent:\s*\*[\s\S]*?Allow:\s*\//.test(b) && !/User-agent:\s*\*[\s\S]*?Disallow:\s*\/\s*$/m.test(b.split(/User-agent:/).slice(0, 2).join('User-agent:'))],
  ['sitemap.xml', '/sitemap.xml', (b) => b.includes('<urlset') && b.includes('https://laoliu.me/')],
  ['rss.xml', '/rss.xml', (b) => b.includes('<rss') && b.includes('佬刘AI')],
]) {
  const r = await get(BASE + path);
  if (r.error) record(name, '未验证', `网络错误: ${r.error}`);
  else if (r.status !== 200) record(name, '失败', `HTTP ${r.status}`);
  else if (!expect(r.body)) record(name, '失败', '200 但内容不符合预期');
  else if (name === 'robots.txt' && !r.body.includes('Sitemap: https://laoliu.me/sitemap.xml')) {
    record(name, '失败', '缺少 Sitemap 声明（若被 Cloudflare 托管内容覆盖，见站长待办）');
  }
  else record(name, '已通过', '200 + 内容合法');
}

// 6. 代表性图片 + OG 图
for (const [name, path] of [
  ['正文图片', '/images/codex-buy/image-1.png'],
  ['OG 分享图', '/og/codex-buy.png'],
  ['默认 OG 图', '/og/default.png'],
  ['favicon', '/favicon.svg'],
]) {
  const r = await get(BASE + path);
  if (r.error) record(name, '未验证', `网络错误: ${r.error}`);
  else if (r.status !== 200) record(name, '失败', `HTTP ${r.status}`);
  else record(name, '已通过', '200');
}

// 7. API（只读 GET，不 POST，避免污染计数）
{
  const r = await get(BASE + '/api/views/codex-buy');
  if (r.error) record('阅读量 API(GET)', '未验证', `网络错误: ${r.error}`);
  else if (r.status !== 200) record('阅读量 API(GET)', '失败', `HTTP ${r.status}`);
  else if (!r.body.includes('"views"')) record('阅读量 API(GET)', '失败', '响应无 views 字段');
  else record('阅读量 API(GET)', '已通过', '200 + JSON 正常');
}

/* ---------- 输出 ---------- */
const lines = [];
lines.push(`# 线上 HTTP Smoke Test 报告`);
lines.push('');
lines.push(`- 目标: ${BASE}`);
lines.push(`- 时间: ${startedAt.toISOString()}`);
lines.push(`- 环境: Node ${process.version}, 本机网络直连（无代理配置时）`);
lines.push('');
lines.push(`| 检查项 | 结果 | 说明 |`);
lines.push(`|---|---|---|`);
for (const r of results) lines.push(`| ${r.name} | ${r.status} | ${r.detail.replace(/\|/g, '/')} |`);
const passed = results.filter((r) => r.status === '已通过').length;
const failed = results.filter((r) => r.status === '失败').length;
const unverifiable = results.filter((r) => r.status === '未验证').length;
lines.push('');
lines.push(`**统计**: 已通过 ${passed} / 失败 ${failed} / 未验证 ${unverifiable}（共 ${results.length} 项）`);
lines.push('');
if (unverifiable) lines.push(`> 注意：${unverifiable} 项因网络问题未验证，不代表网站故障，也不算通过。`);

const report = lines.join('\n');
console.log(report);
console.log();

if (args.out) {
  mkdirSync(dirname(join(root, args.out)), { recursive: true });
  writeFileSync(join(root, args.out), report);
  console.log(`报告已写入: ${args.out}`);
}

process.exit(failed ? 1 : 0);
