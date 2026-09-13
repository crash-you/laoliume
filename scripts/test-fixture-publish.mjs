/**
 * test-fixture-publish.mjs — 隔离发布夹具测试
 *
 * 验证「只新增 Markdown 即可发布」：
 * 1) 新增一篇合法文章（不手改 _redirects、不手动生成分享图）
 * 2) 新增一篇 noindex:true 文章（显式 noindex 策略不误判）
 * 3) 构建后断言：自动生成重定向、分享图回退默认、进入 sitemap/RSS、noindex 文章排除
 * 4) 运行 seo-check 应通过
 * 5) 清理夹具文件并重新做一次干净构建，确认无残留
 *
 * 用法: node scripts/test-fixture-publish.mjs
 * 注意: 会临时在 src/content/posts/ 下增删夹具文件，结束后自愈。
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = join(root, 'src', 'content', 'posts');
const FIX_VALID = 'fixture-publish-test';
const FIX_NOINDEX = 'fixture-noindex-test';

let passed = 0;
let failed = 0;
const ok = (l) => { passed++; console.log('  ok  ' + l); };
const bad = (l, d = '') => { failed++; console.error('FAIL ' + l + ' ' + d); };
const check = (c, l, d = '') => (c ? ok(l) : bad(l, d));

const validPost = `---
title: "夹具发布测试文章"
description: "隔离验证：只新增 Markdown 即可发布，分享图回退默认、重定向自动生成。"
seoTitle: "夹具发布测试文章"
seoDescription: "隔离验证新增文章即可发布、分享图回退默认图、重定向自动生成，且显式 noindex 策略不被误判。"
date: 2026-09-10
slug: "${FIX_VALID}"
published: true
---

这是夹具正文，用于验证新增 Markdown 后构建、SEO 校验与路由检查仍能通过。

## 一个小节

正文内容足够长，确保 .prose 检查通过。包含足够多的文字来验证正文完整性校验不会误判短文。
`;

// 注意：noindex 夹具正文必须是一篇「正常长度的文章」。
// seo-check 在第三轮改为只提取真实 .prose 子树后，正文门槛（80 字符）开始对
// 真实正文生效——过短的夹具会被正确判为「正文过短」，从而让夹具测试失败。
// 夹具代表的是「合格正常站点」，因此这里给足正常篇幅，而不是放宽检查阈值。
const noindexPost = `---
title: "夹具 noindex 文章"
description: "验证显式 noindex 文章正常生成、不进 sitemap/RSS、不误判构建失败。"
date: 2026-09-10
slug: "${FIX_NOINDEX}"
published: true
noindex: true
---

这是 noindex 夹具正文，用于验证显式 noindex 策略：页面正常生成、输出 noindex 指令、
同时被排除在 sitemap 与 RSS 之外，并且不会因为 noindex 而被 SEO 校验误判为失败。

正文长度与正常文章一致，确保 .prose 正文完整性检查（空正文 / 只剩模板 / 主体截断）
不会把一篇合法的短文章误报为错误。
`;

function build() {
  execSync('npm run build', { cwd: root, stdio: 'pipe' });
}

function runSeoCheck() {
  try {
    execSync('node scripts/seo-check.mjs', { cwd: root, stdio: 'pipe' });
    return 0;
  } catch (e) {
    return e.status ?? 1;
  }
}

function readDist(rel) {
  const p = join(root, 'dist', rel);
  return existsSync(p) ? readFileSync(p, 'utf-8') : '';
}

console.log('# 夹具：新增合法文章 + noindex 文章');
writeFileSync(join(postsDir, FIX_VALID + '.md'), validPost);
writeFileSync(join(postsDir, FIX_NOINDEX + '.md'), noindexPost);

try {
  build();

  // 1. 自动生成重定向（含新文章）
  const rd = readDist('_redirects');
  check(rd.includes(`/${FIX_VALID} /${FIX_VALID}/ 308`), '新文章自动进入 _redirects');
  check(rd.includes(`/${FIX_NOINDEX} /${FIX_NOINDEX}/ 308`), 'noindex 文章也有重定向（页面仍公开）');

  // 2. 分享图回退默认（新文章未手动生图）
  const html = readDist(`${FIX_VALID}/index.html`);
  check(html.includes('property="og:image" content="https://laoliu.me/og/default.png"'), '新文章 og:image 回退默认图');
  check(html.includes(`rel="canonical" href="https://laoliu.me/${FIX_VALID}/"`), '新文章 canonical 正确');

  // 3. 进入 sitemap 与 RSS（合法文章）；noindex 排除
  const sitemap = readDist('sitemap.xml');
  const rss = readDist('rss.xml');
  check(sitemap.includes(`https://laoliu.me/${FIX_VALID}/`), '新文章进入 sitemap');
  check(!sitemap.includes(`https://laoliu.me/${FIX_NOINDEX}/`), 'noindex 文章不进 sitemap');
  check(rss.includes(`https://laoliu.me/${FIX_VALID}/`), '新文章进入 RSS');
  check(!rss.includes(`https://laoliu.me/${FIX_NOINDEX}/`), 'noindex 文章不进 RSS');

  // 4. noindex 文章页面存在且带 noindex meta
  const noindexHtml = readDist(`${FIX_NOINDEX}/index.html`);
  check(/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(noindexHtml), 'noindex 文章带 noindex meta');
  check(noindexHtml.includes('<div class="prose">'), 'noindex 文章有正文');

  // 5. seo-check 通过（显式 noindex 不误判失败）
  const code = runSeoCheck();
  check(code === 0, 'seo-check 通过（含显式 noindex 文章）', `exit=${code}`);
} finally {
  // 清理夹具
  if (existsSync(join(postsDir, FIX_VALID + '.md'))) unlinkSync(join(postsDir, FIX_VALID + '.md'));
  if (existsSync(join(postsDir, FIX_NOINDEX + '.md'))) unlinkSync(join(postsDir, FIX_NOINDEX + '.md'));
}

console.log('# 清理后干净重建，确认无残留');
build();
const rd2 = readDist('_redirects');
check(!rd2.includes(FIX_VALID) && !rd2.includes(FIX_NOINDEX), '清理后 _redirects 无残留');
check(!existsSync(join(root, 'dist', FIX_VALID, 'index.html')), '清理后无夹具页面产物');
check(!existsSync(join(root, 'dist', FIX_NOINDEX, 'index.html')), '清理后无 noindex 夹具页面产物');
const code2 = runSeoCheck();
check(code2 === 0, '清理后 seo-check 仍通过', `exit=${code2}`);

console.log(`\n结果: ${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
