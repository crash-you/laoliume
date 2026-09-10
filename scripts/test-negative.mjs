/**
 * test-negative.mjs — 反例测试（本地 mock server，不依赖公网、不污染生产）
 *
 * 验证 seo-smoke 的 runSmoke 与 seo-verify-ui 在反例下不会「错误通过」。
 * 退出码: 全部通过 -> 0；任一失败 -> 1
 */
import http from 'node:http';
import { runSmoke } from './seo-smoke.mjs';
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
const FP = '这是一段用来校验正文完整性的指纹内容';

/** 构建一个「正常」站点 + 可选反例覆盖的 mock server */
function startServer(overrides = {}) {
  const html = (title, { prose = true, canonicalSlug = null, noindexMeta = false, noindexHeader = false } = {}) => {
    const noindex = noindexMeta ? '<meta name="robots" content="noindex" />' : '';
    const body = prose
      ? `<div class="prose"><p>${FP}，这是正文内容，长度足够让检查通过。</p></div>`
      : `<div class="sidebar">只有侧栏，正文被删了。</div>`;
    const canon = canonicalSlug ? `<link rel="canonical" href="https://laoliu.me/${canonicalSlug}/" />` : '';
    return `<!doctype html><html><head><title>${title}</title>${noindex}${canon}</head><body><main>${body}</main><a href="https://wzyp.cn/shop/liu">代充</a></body></html>`;
  };
  const sitemap = '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://laoliu.me/</loc></url><url><loc>https://laoliu.me/post1/</loc></url></urlset>';
  const rss = '<?xml version="1.0"?><rss version="2.0"><channel><title>佬刘AI</title></channel></rss>';

  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const p = url.pathname;
    const o = overrides[p] || overrides['*'];
    if (o) return o(req, res);

    if (p === '/') return res.writeHead(200, { 'content-type': 'text/html' }).end(html('佬刘AI - ChatGPT、Codex 使用教程与 AI 实操'));
    if (p === '/post1') return res.writeHead(301, { location: '/post1/' }).end();
    if (p === '/post1/') return res.writeHead(200, { 'content-type': 'text/html' }).end(html(TITLE, { canonicalSlug: 'post1' }));
    if (p === '/robots.txt') return res.writeHead(200, { 'content-type': 'text/plain' }).end('User-agent: *\nAllow: /\nSitemap: https://laoliu.me/sitemap.xml');
    if (p === '/sitemap.xml') return res.writeHead(200, { 'content-type': 'application/xml' }).end(sitemap);
    if (p === '/rss.xml') return res.writeHead(200, { 'content-type': 'application/xml' }).end(rss);
    if (p === '/images/codex-buy/image-1.png') return res.writeHead(200, { 'content-type': 'image/png' }).end('PNG');
    if (p === '/og/default.png') return res.writeHead(200, { 'content-type': 'image/png' }).end('PNG');
    if (p === '/favicon.svg') return res.writeHead(200, { 'content-type': 'image/svg+xml' }).end('<svg></svg>');
    if (p === '/api/views/codex-buy') return res.writeHead(200, { 'content-type': 'application/json' }).end('{"views": 42}');
    return res.writeHead(404).end('not found');
  });
}

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}
const baseSlug = () => ['post1'];
const article = (slug) => ({ title: TITLE, fp: FP });

console.log('# 反例 1：全部请求断网 → 应退出 2（未验证），不是 0');
{
  const res = await runSmoke({ baseUrl: 'http://127.0.0.1:1', canonicalOrigin: 'https://laoliu.me', env: 'production', slugs: baseSlug(), getArticle: article });
  check(res.exitCode === 2, '断网退出码为 2', `实际 ${res.exitCode}`);
  check(res.passed === 0 && res.unverified > 0, '断网全部标记未验证且无通过', `passed=${res.passed}`);
}

console.log('# 反例 2：重定向循环 → 应判失败（协议错误），不是未验证');
{
  const srv = startServer({ '/loop': (req, res) => res.writeHead(301, { location: '/loop2' }).end(), '/loop2': (req, res) => res.writeHead(301, { location: '/loop' }).end() });
  const port = await listen(srv);
  const res = await runSmoke({ baseUrl: `http://127.0.0.1:${port}`, canonicalOrigin: 'https://laoliu.me', env: 'production', slugs: ['loop', 'loop2', 'post1'], getArticle: () => ({ title: TITLE, fp: FP }) });
  srv.close();
  const loopResult = res.results.find((r) => r.name.includes('/loop'));
  check(loopResult && loopResult.status === '失败', '重定向循环判为失败', JSON.stringify(loopResult));
}

console.log('# 反例 3：200 但返回错误页（标题不符）→ 失败');
{
  const srv = startServer({ '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end('<html><head><title>完全不同的页</title></head><body><div class="prose">x</div></body></html>') });
  const port = await listen(srv);
  const res = await runSmoke({ baseUrl: `http://127.0.0.1:${port}`, canonicalOrigin: 'https://laoliu.me', env: 'production', slugs: baseSlug(), getArticle: article });
  srv.close();
  const r = res.results.find((x) => x.name.includes('/post1/'));
  check(r && r.status === '失败', '错误页判失败', JSON.stringify(r));
}

console.log('# 反例 4：删除正文保留侧栏 → 失败（.prose 缺失）');
{
  const srv = startServer({ '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end(`<html><head><title>${TITLE}</title><link rel="canonical" href="https://laoliu.me/post1/" /></head><body><div class="sidebar">只有侧栏</div></body></html>`) });
  const port = await listen(srv);
  const res = await runSmoke({ baseUrl: `http://127.0.0.1:${port}`, canonicalOrigin: 'https://laoliu.me', env: 'production', slugs: baseSlug(), getArticle: article });
  srv.close();
  const r = res.results.find((x) => x.name.includes('/post1/'));
  check(r && r.status === '失败' && /正文/.test(r.detail), '删正文判失败', JSON.stringify(r));
}

console.log('# 反例 5：仅 HTTP 头带 noindex → 生产环境失败');
{
  const srv = startServer({ '/post1/': (req, res) => res.writeHead(200, { 'content-type': 'text/html', 'x-robots-tag': 'noindex' }).end(`<html><head><title>${TITLE}</title><link rel="canonical" href="https://laoliu.me/post1/" /></head><body><div class="prose">${FP}正文</div></body></html>`) });
  const port = await listen(srv);
  const res = await runSmoke({ baseUrl: `http://127.0.0.1:${port}`, canonicalOrigin: 'https://laoliu.me', env: 'production', slugs: baseSlug(), getArticle: article });
  srv.close();
  const r = res.results.find((x) => x.name.includes('/post1/'));
  check(r && r.status === '失败' && /noindex/.test(r.detail), '仅头 noindex 判失败', JSON.stringify(r));
}

console.log('# 反例 6：损坏 XML → 失败');
{
  const srv = startServer({ '/sitemap.xml': (req, res) => res.writeHead(200, { 'content-type': 'application/xml' }).end('<urlset><url><loc>未闭合') });
  const port = await listen(srv);
  const res = await runSmoke({ baseUrl: `http://127.0.0.1:${port}`, canonicalOrigin: 'https://laoliu.me', env: 'production', slugs: baseSlug(), getArticle: article });
  srv.close();
  const r = res.results.find((x) => x.name === 'sitemap.xml');
  check(r && r.status === '失败', '坏 XML 判失败', JSON.stringify(r));
}

console.log('# 反例 7：缺分享图（404）→ 失败');
{
  const srv = startServer({ '/og/default.png': (req, res) => res.writeHead(404).end('nf') });
  const port = await listen(srv);
  const res = await runSmoke({ baseUrl: `http://127.0.0.1:${port}`, canonicalOrigin: 'https://laoliu.me', env: 'production', slugs: baseSlug(), getArticle: article });
  srv.close();
  const r = res.results.find((x) => x.name === 'OG 分享图');
  check(r && r.status === '失败', '缺分享图判失败', JSON.stringify(r));
}

console.log('# 反例 8：空截图目录 → seo-verify-ui 非零退出');
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
