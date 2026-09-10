/**
 * seo-screenshot.mjs — 基线 / 修改后截图采集
 *
 * 用法:
 *   node scripts/seo-screenshot.mjs --base-url http://localhost:8788 --out-dir docs/screenshots/before
 *
 * 说明:
 * - 使用 playwright-core + 本机已缓存的 Chromium（不额外下载浏览器）。
 * - 拦截 /api/views/* 并返回固定 {"views": 42}，避免动态阅读量造成假差异，
 *   也避免截图过程污染阅读量计数。
 * - 视口: 桌面 1440x900 / 平板 1024x768 / 手机 390x844（任务书规定尺寸）。
 */
import { chromium } from 'playwright-core';
import { mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);
const baseUrl = (args['base-url'] ?? 'http://localhost:8788').replace(/\/$/, '');
const outDir = args['out-dir'];
if (!outDir) {
  console.error('缺少 --out-dir');
  process.exit(2);
}

const PAGES = [
  ['home', '/'],
  ['buy', '/codex-buy/'],
  ['register', '/from-0-to-1-chatgpt/'],
  ['long', '/codex-deepseek/'],
];
const VIEWPORTS = [
  ['desktop', 1440, 900],
  ['tablet', 1024, 768],
  ['mobile', 390, 844],
];

/** 在本机常见缓存目录里找 Chromium / Chrome 可执行文件 */
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const roots = [
    join(homedir(), 'AppData/Local/ms-playwright'),
    join(homedir(), '.cache/ms-playwright'),
    join(homedir(), 'Library/Caches/ms-playwright'),
  ];
  const candidates = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const dir of readdirSync(root)) {
      if (!dir.startsWith('chromium-')) continue;
      for (const sub of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
        const p = join(root, dir, sub);
        if (existsSync(p)) candidates.push([Number(dir.split('-')[1]) || 0, p]);
      }
    }
  }
  candidates.sort((a, b) => b[0] - a[0]);
  return candidates[0]?.[1] ?? null;
}

const executablePath = findChrome();
if (!executablePath) {
  console.error('未找到本机 Chromium。可设置 CHROME_PATH 环境变量指定浏览器路径。');
  process.exit(2);
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath });
let failed = 0;

for (const [vpName, width, height] of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width, height } });
  // 固定阅读量，屏蔽动态数据
  await context.route('**/api/views/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ views: 42 }),
    })
  );
  const page = await context.newPage();
  for (const [pageName, path] of PAGES) {
    const url = baseUrl + path;
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      if (!resp || resp.status() !== 200) {
        console.error(`FAIL ${url} HTTP ${resp?.status()}`);
        failed++;
        continue;
      }
      await page.waitForTimeout(500); // 等阅读量 mock 渲染与字体稳定
      const file = join(outDir, `${pageName}-${vpName}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`OK   ${url} -> ${file}`);
    } catch (err) {
      console.error(`FAIL ${url} ${err.message}`);
      failed++;
    }
  }
  await context.close();
}

await browser.close();
if (failed) {
  console.error(`共 ${failed} 张截图失败`);
  process.exit(1);
}
console.log('全部截图完成');
