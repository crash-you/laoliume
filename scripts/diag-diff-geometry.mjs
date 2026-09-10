/**
 * diag-diff-geometry.mjs — 对比基线站与当前站同一页面的逐元素几何，定位差异来源
 * 用法: node scripts/diag-diff-geometry.mjs <path> <viewportWidth> <basePort> <afterPort>
 */
import { chromium } from 'playwright-core';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

function findChrome() {
  const roots = [join(homedir(), 'AppData/Local/ms-playwright'), join(homedir(), '.cache/ms-playwright')];
  const cands = [];
  for (const r of roots) {
    if (!existsSync(r)) continue;
    for (const d of readdirSync(r)) {
      if (!d.startsWith('chromium-')) continue;
      const p = join(r, d, 'chrome-win64/chrome.exe');
      if (existsSync(p)) cands.push([Number(d.split('-')[1]) || 0, p]);
    }
  }
  cands.sort((a, b) => b[0] - a[0]);
  return cands[0]?.[1];
}

const path = process.argv[2] ?? '/from-0-to-1-chatgpt/';
const width = Number(process.argv[3] ?? 390);
const portA = process.argv[4] ?? '8789';
const portB = process.argv[5] ?? '8788';

const browser = await chromium.launch({ executablePath: findChrome() });

async function collect(port) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 } });
  await ctx.route('**/api/views/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ views: 42 }) })
  );
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${port}${path}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => {
    const s = Math.max(400, innerHeight);
    for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    scrollTo(0, 0);
  });
  await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 90000 });
  const data = await page.evaluate(() => {
    const nodes = document.querySelectorAll('.prose > *, .prose p, .prose h1,.prose h2,.prose h3,.prose h4, .prose img');
    return {
      docH: document.documentElement.scrollHeight,
      items: Array.from(nodes).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          cls: el.className || '',
          text: (el.textContent || '').trim().slice(0, 24),
          top: Math.round(r.top + window.scrollY),
          h: Math.round(r.height),
          w: Math.round(r.width),
        };
      }),
    };
  });
  await ctx.close();
  return data;
}

const A = await collect(portA);
const B = await collect(portB);
console.log(`docHeight  baseline=${A.docH}  after=${B.docH}  delta=${B.docH - A.docH}`);
console.log(`元素数  baseline=${A.items.length}  after=${B.items.length}`);

const n = Math.min(A.items.length, B.items.length);
let reported = 0;
for (let i = 0; i < n && reported < 12; i++) {
  const a = A.items[i];
  const b = B.items[i];
  if (a.top !== b.top || a.h !== b.h || a.w !== b.w) {
    console.log(
      `#${i} <${a.tag}${a.cls ? '.' + String(a.cls).split(' ').join('.') : ''}> "${a.text}"  ` +
        `baseline(top=${a.top},h=${a.h},w=${a.w}) after(top=${b.top},h=${b.h},w=${b.w})`
    );
    reported++;
  }
}
if (!reported) console.log('几何完全一致');
await browser.close();
