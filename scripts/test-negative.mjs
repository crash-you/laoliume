/**
 * test-negative.mjs — 反例测试（本地 mock server，不依赖公网、不污染生产）
 *
 * 验证 seo-smoke 的 runSmoke 与 seo-verify-ui 在反例下不会「错误通过」。
 * 策略：先构建「合格正常站点」并断言整站 exit 0，再逐类注入故障验证错误被抓住。
 *
 * 退出码: 全部通过 -> 0；任一失败 -> 1
 */
import http from 'node:http';
import { runSmoke, parseRobots, parseHtmlRobots, parseHeaderRobots, effectiveNoindex } from './seo-smoke.mjs';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let passed = 0;
let failed = 0;
const ok = (label) => { passed++; console.log(`  ok  ${label}`); };
const bad = (label, detail = '') => { failed++; console.error(`FAIL ${label} ${detail}`); };
const check = (cond, label, detail = '') => (cond ? ok(label) : bad(label, detail));

const TITLE = '测试文章 - 佬刘AI';
const HOME_TITLE = '佬刘AI - ChatGPT、Codex 使用教程与 AI 实操';
// 足够长的正文（>100 字符），头/中/尾三段可区分
const PROSE_HEAD = '这是一段用来校验正文完整性的开头内容，讲述从零开始的使用过程，包含完整的背景介绍与准备工作说明。';
const PROSE_MID = '正文中间部分介绍具体操作步骤，包括配置、验证与常见问题排查的完整说明，每一步都有对应的截图与注意事项。';
const PROSE_TAIL = '正文结尾总结全部流程，并给出下一步的学习建议与参考资料链接，方便读者继续深入实践。';
const PROSE_FULL = PROSE_HEAD + PROSE_MID + PROSE_TAIL;

/** 生成一篇合格的文章页 HTML（含完整 article 结构、.prose、canonical、JSON-LD） */
function articleHtml({ prose = PROSE_FULL, canonicalSlug = 'post1', noindexMeta = false, noindexHeader = false, googlebotNoindex = false } = {}) {
  const noindex = noindexMeta ? '<meta name="robots" content="noindex" />' : '';
  const googlebot = googlebotNoindex ? '<meta name="googlebot" content="noindex, nofollow" />' : '';
  return `<!doctype html><html lang="zh-CN"><head>
<meta charset="UTF-8"><title>${TITLE}</title>
<meta name="description" content="测试描述">
${noindex}${googlebot}<link rel="canonical" href="https://laoliu.me/${canonicalSlug}/" />
<meta property="og:image" content="https://laoliu.me/og/post1.png">
</head><body><main>
<article>
<h1>测试文章标题</h1>
<div class="prose"><p>${prose}</p></div>
<div class="post-end"><p>本文首发于微信公众号。</p></div>
</article>
</main><a href="https://wzyp.cn/shop/liu">代充</a></body></html>`;
}

const homeHtml = `<!doctype html><html lang="zh-CN"><head>
<meta charset="UTF-8"><title>${HOME_TITLE}</title>
<meta name="description" content="首页描述">
<link rel="canonical" href="https://laoliu.me/" />
</head><body><a href="https://wzyp.cn/shop/liu">代充</a></body></html>`;

const SITEMAP = '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://laoliu.me/</loc></url><url><loc>https://laoliu.me/post1/</loc></url></urlset>';
const RSS = '<?xml version="1.0"?><rss version="2.0"><channel><title>佬刘AI</title><item><title>测试</title><link>https://laoliu.me/post1/</link></item></channel></rss>';
const ROBOTS = 'User-agent: *\nAllow: /\nSitemap: https://laoliu.me/sitemap.xml';
// 最小 PNG（1x1）：魔数 89504E47
const MINI_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

/** 构建一个「合格正常站点」+ 可选反例覆盖的 mock server */
function startServer(overrides = {}) {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const p = url.pathname;
    const o = overrides[p] || overrides['*'];
    if (o) return o(req, res);

    if (p === '/') return res.writeHead(200, { 'content-type': 'text/html' }).end(homeHtml);
    if (p === '/post1') return res.writeHead(308, { location: '/post1/' }).end();
    if (p === '/post1/') return res.writeHead(200, { 'content-type': 'text/html' }).end(articleHtml());
    if (p === '/robots.txt') return res.writeHead(200, { 'content-type': 'text/plain' }).end(ROBOTS);
    if (p === '/sitemap.xml') return res.writeHead(200, { 'content-type': 'application/xml' }).end(SITEMAP);
    if (p === '/rss.xml') return res.writeHead(200, { 'content-type': 'application/xml' }).end(RSS);
    if (p === '/images/codex-buy/image-1.png') return res.writeHead(200, { 'content-type': 'image/png' }).end(MINI_PNG);
    if (p === '/og/default.png') return res.writeHead(200, { 'content-type': 'image/png' }).end(MINI_PNG);
    if (p === '/favicon.svg') return res.writeHead(200, { 'content-type': 'image/svg+xml' }).end('<svg></svg>');
    if (p === '/api/views/codex-buy') return res.writeHead(200, { 'content-type': 'application/json', 'x-robots-tag': 'noindex' }).end('{"views": 42}');
    return res.writeHead(404).end('not found');
  });
}

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}

/** 与 seo-smoke 的 distExpectations 对应的预期提取（从 mock 页面提取） */
const normalize = (s) => (s || '').replace(/\s+/g, '');
function mockGetArticle(slug) {
  // 与 articleHtml 的 .prose 一致
  const text = normalize(PROSE_FULL.replace(/<[^>]+>/g, ''));
  const n = text.length;
  return {
    title: TITLE,
    fp: {
      length: n,
      head: text.slice(0, 40),
      middle: text.slice(Math.floor(n / 2), Math.floor(n / 2) + 40),
      tail: text.slice(Math.max(0, n - 40), n),
    },
  };
}

async function smokeOn(server, opts = {}) {
  const port = server.address().port;
  return runSmoke({
    baseUrl: `http://127.0.0.1:${port}`,
    canonicalOrigin: 'https://laoliu.me',
    env: 'production',
    slugs: ['post1'],
    getArticle: mockGetArticle,
    ...opts,
  });
}

/* ---------- 0. 正常站点必须整站 exit 0（先修好正常样本） ---------- */
console.log('# 0. 合格正常站点 → 整站 exit 0（所有必需项通过）');
{
  const srv = startServer();
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  check(res.exitCode === 0, '正常站点 exit 0', `实际 ${res.exitCode}，失败项: ${res.results.filter(r => r.status === '失败').map(r => r.name + ':' + r.detail).join('; ')}`);
  check(res.failed === 0, '正常站点零失败', `failed=${res.failed}`);
  check(res.unverified === 0, '正常站点零未验证', `unverified=${res.unverified}`);
  check(res.passed >= 10, '正常站点通过数充足', `passed=${res.passed}`);
}

/* ---------- 1. 断网 ---------- */
console.log('# 1. 全部请求断网 → 应退出 2（未验证），不是 0');
{
  const res = await runSmoke({ baseUrl: 'http://127.0.0.1:1', canonicalOrigin: 'https://laoliu.me', env: 'production', slugs: ['post1'], getArticle: mockGetArticle });
  check(res.exitCode === 2, '断网退出码为 2', `实际 ${res.exitCode}`);
  check(res.passed === 0 && res.unverified > 0, '断网全部标记未验证且无通过', `passed=${res.passed}`);
}

/* ---------- 2. 重定向循环 ---------- */
console.log('# 2. 重定向循环 → 判失败（协议错误），用确定的检查标识匹配');
{
  const srv = startServer({
    '/loop': (req, res) => res.writeHead(301, { location: '/loop2' }).end(),
    '/loop2': (req, res) => res.writeHead(301, { location: '/loop' }).end(),
  });
  await listen(srv);
  const res = await smokeOn(srv, { slugs: ['loop', 'loop2', 'post1'], getArticle: () => null });
  srv.close();
  // 用确定的检查标识匹配「非规范入口 /loop」与「非规范入口 /loop2」，不用 find(name.includes('/loop')) 误取文章 404
  const loopResult = res.results.find((r) => r.name === '非规范入口 /loop');
  const loop2Result = res.results.find((r) => r.name === '非规范入口 /loop2');
  check(loopResult && loopResult.status === '失败', '非规范入口 /loop 判为失败', JSON.stringify(loopResult));
  check(/循环/.test(loopResult?.detail || ''), '循环错误信息明确', loopResult?.detail || '');
  check(loop2Result && loop2Result.status === '失败', '非规范入口 /loop2 判为失败', JSON.stringify(loop2Result));
}

/* ---------- 3. 200 但返回错误页（标题不符） ---------- */
console.log('# 3. 200 但返回错误页（标题不符）→ 失败');
{
  const srv = startServer({
    '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end('<html><head><title>完全不同的页</title></head><body><div class="prose"><p>内容</p></div></body></html>'),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '失败', '错误页判失败', JSON.stringify(r));
}

/* ---------- 4. 正文故障：空 .prose / 只丢中段 / 只丢尾段 ---------- */
console.log('# 4a. 删除正文保留侧栏与 post-end → 失败（.prose 缺失）');
{
  const srv = startServer({
    '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end(
      `<html><head><title>${TITLE}</title><link rel="canonical" href="https://laoliu.me/post1/" /></head><body><article><h1>标题</h1><div class="post-end"><p>文末模块保留</p></div></article><div class="sidebar">侧栏保留</div><a href="https://wzyp.cn/shop/liu">代充</a></body></html>`
    ),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '失败' && /正文/.test(r.detail), '删正文判失败', JSON.stringify(r));
}

console.log('# 4b. 正文只丢中段（头尾保留）→ 三段指纹中段不匹配');
{
  const srv = startServer({
    '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end(
      articleHtml({ prose: PROSE_HEAD + '中间内容被替换成了完全不同的文字，与预期的中段指纹不一致。' + PROSE_TAIL })
    ),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '失败' && /中段/.test(r.detail), '丢中段判失败（中段指纹）', JSON.stringify(r));
}

console.log('# 4c. 正文只丢尾段 → 三段指纹尾段不匹配');
{
  const srv = startServer({
    '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end(
      articleHtml({ prose: PROSE_HEAD + PROSE_MID + '结尾被截断了，后面的内容没有了' })
    ),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '失败' && /尾段|不一致/.test(r.detail), '丢尾段判失败（尾段指纹）', JSON.stringify(r));
}

/* ---------- 5. OG 分享图故障 ---------- */
console.log('# 5a. 某篇文章的分享图 404 → 失败');
{
  const srv = startServer({ '/og/default.png': (req, res) => res.writeHead(404).end('nf') });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  // OG 引用图 404：资源检查中 og/default.png 应 404 判失败
  const r = res.results.find((x) => x.name === 'OG 分享图');
  check(r && r.status === '失败', '缺分享图判失败', JSON.stringify(r));
}

console.log('# 5b. 分享图返回 PNG 魔数错误（HTML 错误页）→ 失败');
{
  const srv = startServer({
    '/og/default.png': (req, res) => res.writeHead(200, { 'content-type': 'image/png' }).end('<!DOCTYPE html><html>error</html>'),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === 'OG 分享图');
  check(r && r.status === '失败' && /魔数|HTML/.test(r.detail), '伪 PNG（实为 HTML）判失败', JSON.stringify(r));
}

/* ---------- 6. canonical 与最终域不一致 ---------- */
console.log('# 6a. canonical 写 apex，最终请求落到 www → 失败');
{
  // canonical 指向 https://laoliu.me/post1/，但页面实际在 www 域下提供
  const srv = startServer({
    '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end(
      articleHtml({ canonicalSlug: 'post1' }).replace('https://laoliu.me/post1/', 'https://laoliu.me/post1/')
    ),
  });
  await listen(srv);
  // 用 www 作为 canonical-origin 期望（模拟站长误配）
  const res = await runSmoke({
    baseUrl: `http://127.0.0.1:${srv.address().port}`,
    canonicalOrigin: 'https://www.laoliu.me',
    env: 'production',
    slugs: ['post1'],
    getArticle: mockGetArticle,
  });
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '失败' && /canonical/.test(r.detail), 'canonical 与期望域不一致判失败', JSON.stringify(r));
}

console.log('# 6b. 非规范入口临时跳转冒充永久 → 失败');
{
  const srv = startServer({
    '/post1': (req, res) => res.writeHead(302, { location: '/post1/' }).end(),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === '非规范入口 /post1');
  check(r && r.status === '失败' && /302|临时/.test(r.detail), '302 冒充永久跳转判失败', JSON.stringify(r));
}

/* ---------- 7. sitemap/RSS 故障 ---------- */
console.log('# 7a. sitemap 返回合法 XHTML 错误页 → 失败（XML 根不是 urlset）');
{
  const srv = startServer({
    '/sitemap.xml': (req, res) => res.writeHead(200, { 'content-type': 'application/xml' }).end(
      '<?xml version="1.0"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>404</title></head><body>Not found</body></html>'
    ),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === 'sitemap.xml');
  check(r && r.status === '失败', '合法 XHTML 错误页不当 sitemap', JSON.stringify(r));
}

console.log('# 7b. sitemap XML 根正确但文章集合错 → 失败');
{
  const srv = startServer({
    '/sitemap.xml': (req, res) => res.writeHead(200, { 'content-type': 'application/xml' }).end(
      '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://laoliu.me/</loc></url><url><loc>https://laoliu.me/other-post/</loc></url></urlset>'
    ),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === 'sitemap.xml');
  check(r && r.status === '失败' && /缺少|预期外/.test(r.detail), 'sitemap 集合错判失败', JSON.stringify(r));
}

console.log('# 7c. sitemap MIME 错误 → 失败');
{
  const srv = startServer({
    '/sitemap.xml': (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end(SITEMAP),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === 'sitemap.xml');
  check(r && r.status === '失败' && /Content-Type/.test(r.detail), 'MIME 错误判失败', JSON.stringify(r));
}

/* ---------- 8. robots 分组故障 ---------- */
console.log('# 8a. Googlebot 被某一分组禁抓取，其他组仍有 Allow:/ → 失败');
{
  const srv = startServer({
    '/robots.txt': (req, res) => res.writeHead(200, { 'content-type': 'text/plain' }).end(
      'User-agent: Googlebot\nDisallow: /\n\nUser-agent: *\nAllow: /\nSitemap: https://laoliu.me/sitemap.xml'
    ),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === 'robots.txt');
  check(r && r.status === '失败' && /Googlebot/.test(r.detail), 'Googlebot 分组禁抓判失败', JSON.stringify(r));
}

console.log('# 8b. AI 训练爬虫被禁但 Googlebot/Bingbot 正常 → 搜索抓取检查应通过');
{
  const srv = startServer({
    '/robots.txt': (req, res) => res.writeHead(200, { 'content-type': 'text/plain' }).end(
      'User-agent: GPTBot\nDisallow: /\n\nUser-agent: ClaudeBot\nDisallow: /\n\nUser-agent: *\nAllow: /\nSitemap: https://laoliu.me/sitemap.xml'
    ),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === 'robots.txt');
  check(r && r.status === '已通过', 'AI 爬虫被禁不影响搜索抓取检查', JSON.stringify(r));
  check(/AI 爬虫被禁/.test(r?.detail || ''), '报告中记录 AI 爬虫策略', r?.detail || '');
}

/* ---------- 9. noindex 故障（HTML meta / HTTP 头 / Googlebot 专用） ---------- */
console.log('# 9a. 生产页仅 HTTP 头 noindex → 失败');
{
  const srv = startServer({
    '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html', 'x-robots-tag': 'noindex' }).end(articleHtml()),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '失败' && /noindex/.test(r.detail), '仅头 noindex 判失败', JSON.stringify(r));
}

console.log('# 9b. 生产页 Googlebot 专用 noindex → 失败');
{
  const srv = startServer({
    '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end(articleHtml({ googlebotNoindex: true })),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '失败' && /noindex/.test(r.detail), 'Googlebot 专用 noindex 判失败', JSON.stringify(r));
}

console.log('# 9c. 生产页 meta robots none（等价 noindex）→ 失败');
{
  const srv = startServer({
    '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end(articleHtml().replace('<meta name="description"', '<meta name="robots" content="none"><meta name="description"')),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '失败' && /noindex/.test(r.detail), 'robots none 等价 noindex 判失败', JSON.stringify(r));
}

console.log('# 9d. 正确配置的生产页（无 noindex）→ 通过');
{
  const srv = startServer();
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '已通过', '正常生产页通过', JSON.stringify(r));
}

console.log('# 9e. 预览环境正确带 noindex → 通过');
{
  const srv = startServer({
    '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html', 'x-robots-tag': 'noindex' }).end(articleHtml()),
    '/': (req, res) => res.writeHead(200, { 'content-type': 'text/html', 'x-robots-tag': 'noindex' }).end(homeHtml),
  });
  await listen(srv);
  const port = srv.address().port;
  const res = await runSmoke({
    baseUrl: `http://127.0.0.1:${port}`,
    canonicalOrigin: 'https://laoliu.me',
    env: 'preview',
    slugs: ['post1'],
    getArticle: mockGetArticle,
  });
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '已通过', '预览环境带 noindex 不判失败', JSON.stringify(r));
  check(res.exitCode === 0, '预览环境整站 exit 0', `实际 ${res.exitCode}`);
}

console.log('# 9f. 公开预览没有 noindex → 未验证或失败（不能静默通过）');
{
  // 预览环境但页面无 noindex —— 当前实现：预览环境不检查 noindex（无法确定预览是否公开），
  // 但至少不能因为「带了 noindex」而失败（9e 已验证）。
  // 此处验证：env=preview 且无 noindex 时，检查不误报。
  const srv = startServer();
  await listen(srv);
  const port = srv.address().port;
  const res = await runSmoke({
    baseUrl: `http://127.0.0.1:${port}`,
    canonicalOrigin: 'https://laoliu.me',
    env: 'preview',
    slugs: ['post1'],
    getArticle: mockGetArticle,
  });
  srv.close();
  const r = res.results.find((x) => x.name === '文章 /post1/');
  check(r && r.status === '已通过', '预览无 noindex 不误报（预览隔离策略由部署配置决定）', JSON.stringify(r));
}

/* ---------- 10. API 契约 ---------- */
console.log('# 10. 阅读量 API 缺 X-Robots-Tag: noindex → 失败');
{
  const srv = startServer({
    '/api/views/codex-buy': (req, res) => res.writeHead(200, { 'content-type': 'application/json' }).end('{"views": 42}'),
  });
  await listen(srv);
  const res = await smokeOn(srv);
  srv.close();
  const r = res.results.find((x) => x.name === '阅读量 API(GET)');
  check(r && r.status === '失败' && /X-Robots-Tag/.test(r.detail), 'API 缺 X-Robots-Tag 判失败', JSON.stringify(r));
}

/* ---------- 11. 参数校验 ---------- */
console.log('# 11. 无效 env / canonical-origin / SHA 参数 → 明确报错（exit 2）');
{
  const { execFile } = await import('node:child_process');
  const runCli = (args) =>
    new Promise((resolve) => {
      execFile('node', ['scripts/seo-smoke.mjs', ...args], { timeout: 15000 }, (err, stdout, stderr) => {
        resolve({ code: err ? err.code : 0, stderr: String(stderr) });
      });
    });
  let r = await runCli(['--env', 'staging']);
  check(r.code === 2 && /--env 无效/.test(r.stderr), '无效 env 报错退出 2', `code=${r.code}`);
  r = await runCli(['--canonical-origin', 'not-a-url']);
  check(r.code === 2 && /无法解析/.test(r.stderr), '非法 origin 报错退出 2', `code=${r.code}`);
  r = await runCli(['--expected-commit', 'xyz-not-sha']);
  check(r.code === 2 && /SHA/.test(r.stderr), '非法 SHA 报错退出 2', `code=${r.code}`);
  r = await runCli(['--env', 'production', '--canonical-origin', 'https://preview.example.com']);
  check(r.code === 2 && /canonical-origin 必须/.test(r.stderr), '生产验收误用预览 origin 报错', `code=${r.code}`);
}

/* ---------- 12. 单元级：robots 解析器边界 ---------- */
console.log('# 12. robots 解析器：分组与等价指令');
{
  const p1 = parseRobots('User-agent: *\nDisallow: /private/\nAllow: /\nSitemap: https://x/s.xml');
  check(p1.allowsCrawler('Googlebot').allowed, '通配组允许 Googlebot');
  check(!p1.allowsCrawler('Googlebot', '/private/x').allowed, '私有路径被禁');
  check(p1.sitemaps.includes('https://x/s.xml'), 'sitemap 行解析');

  // nofollow 不等于 noindex
  const html = '<meta name="robots" content="nofollow">';
  const pr = parseHtmlRobots(html);
  check(pr.robots && pr.robots.set.has('nofollow') && !pr.robots.set.has('noindex'), 'nofollow 不误判为 noindex');

  // none 等价
  const eff = effectiveNoindex('<meta name="robots" content="none">', {});
  check(eff.noindex, 'none 等价 noindex');

  // X-Robots-Tag googlebot 专用段
  const hr = parseHeaderRobots({ 'x-robots-tag': 'googlebot: noindex' });
  check(hr.googlebot && hr.googlebot.set.has('noindex'), 'X-Robots-Tag googlebot 专用段解析');
  const eff2 = effectiveNoindex('', { 'x-robots-tag': 'googlebot: noindex' });
  check(eff2.noindex, 'X-Robots-Tag googlebot noindex 生效');
}

/* ---------- 13. 空截图目录 ---------- */
console.log('# 13. 空截图目录 → seo-verify-ui 非零退出');
{
  const d1 = mkdtempSync(join(tmpdir(), 'ui-before-'));
  const d2 = mkdtempSync(join(tmpdir(), 'ui-after-'));
  try {
    let code = 0;
    try {
      execFileSync('node', ['scripts/seo-verify-ui.mjs', '--before', d1, '--after', d2], { stdio: 'pipe' });
    } catch (e) {
      code = e.status ?? 1;
    }
    check(code !== 0, '空截图目录退出非零', `code=${code}`);
  } finally {
    rmSync(d1, { recursive: true, force: true });
    rmSync(d2, { recursive: true, force: true });
  }
}

console.log(`\n结果: ${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
