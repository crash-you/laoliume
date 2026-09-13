/**
 * og-image.mjs — 生成全站 OG / Twitter 分享图（1200x630）
 *
 * 用法: node scripts/og-image.mjs [--force]
 *
 * - public/og/default.png            全站默认分享图（首页 / 404 回退）
 * - public/og/<slug>.png             每篇「已发布」文章的分享卡
 * - 草稿（published: false）不生成任何分享卡，不进入公开 manifest
 * - 使用 playwright-core + 本机已缓存 Chromium，系统字体，不引入在线字体
 * - 幂等：默认文件已存在时跳过，--force 覆盖
 * - 本脚本是本地/开发者工具；构建与 CI 不依赖它（云端构建无需 Chromium）
 */
import { chromium } from 'playwright-core';
import { mkdirSync, readdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'og');
const postsDir = join(root, 'src', 'content', 'posts');
const force = process.argv.includes('--force');

const SITE = {
  name: '佬刘AI',
  domain: 'laoliu.me',
  author: '佬刘',
  accent: '#c9a227',
};

/** 在本机常见缓存目录里找 Chromium */
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const roots = [
    join(homedir(), 'AppData/Local/ms-playwright'),
    join(homedir(), '.cache/ms-playwright'),
    join(homedir(), 'Library/Caches/ms-playwright'),
  ];
  const candidates = [];
  for (const rootDir of roots) {
    if (!existsSync(rootDir)) continue;
    for (const dir of readdirSync(rootDir)) {
      if (!dir.startsWith('chromium-')) continue;
      for (const sub of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
        const p = join(rootDir, dir, sub);
        if (existsSync(p)) candidates.push([Number(dir.split('-')[1]) || 0, p]);
      }
    }
  }
  candidates.sort((a, b) => b[0] - a[0]);
  return candidates[0]?.[1] ?? null;
}

/** 读取「已发布」文章（gray-matter 解析，支持单/双引号与多行 YAML） */
function readPublishedPosts() {
  return readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data } = matter(readFileSync(join(postsDir, f), 'utf-8'));
      const slug = data.slug || f.replace(/\.md$/, '');
      const title = String(data.title ?? f.replace(/\.md$/, '')).trim();
      return { file: f, slug, title, published: data.published !== false };
    })
    .filter((p) => p.published && p.title);
}

function cardHtml({ title, name, domain, accent }) {
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    font-family: "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif;
    background: #fdfaf1;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 72px 80px;
  }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand-dot { width: 18px; height: 18px; background: ${accent}; border-radius: 4px; }
  .brand-name { font-size: 34px; font-weight: 700; color: #2a2a2a; }
  .title {
    font-size: 64px; font-weight: 700; line-height: 1.35; color: #1f1f1f;
    letter-spacing: 0.5px; max-width: 1020px;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  .footer { display: flex; justify-content: space-between; align-items: baseline; }
  .site { font-size: 30px; color: #8a8a8a; }
  .accent-line { width: 120px; height: 8px; background: ${accent}; border-radius: 4px; }
</style></head>
<body>
  <div class="brand"><div class="brand-dot"></div><div class="brand-name">${name}</div></div>
  <div class="title">${safeTitle}</div>
  <div class="footer">
    <div class="accent-line"></div>
    <div class="site">${domain}</div>
  </div>
</body></html>`;
}

const executablePath = findChrome();
if (!executablePath) {
  console.error('未找到本机 Chromium。可设置 CHROME_PATH 环境变量指定浏览器路径。');
  process.exit(2);
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

const targets = [
  { file: 'default.png', title: 'ChatGPT、Codex 使用教程与 AI 实操' },
  ...readPublishedPosts().map((p) => ({ file: p.slug + '.png', title: p.title })),
];

let made = 0;
for (const t of targets) {
  const out = join(outDir, t.file);
  if (existsSync(out) && !force) {
    console.log(`SKIP ${t.file}（已存在，--force 覆盖）`);
    continue;
  }
  await page.setContent(cardHtml({ title: t.title, name: SITE.name, domain: SITE.domain, accent: SITE.accent }));
  await page.waitForTimeout(200);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`OK   ${t.file}`);
  made++;
}

await browser.close();
console.log(`完成：${made} 张生成，${targets.length - made} 张跳过`);
