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
      for (const sub of ['chrome-win64/chrome.exe', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
        const p = join(r, d, sub);
        if (existsSync(p)) cands.push([Number(d.split('-')[1]) || 0, p]);
      }
    }
  }
  cands.sort((a, b) => b[0] - a[0]);
  return cands[0]?.[1];
}

const slug = process.argv[2] ?? 'from-0-to-1-chatgpt';
const width = Number(process.argv[3] ?? 390);
const b = await chromium.launch({ executablePath: findChrome() });
const p = await b.newPage({ viewport: { width, height: 844 } });
await p.goto('http://localhost:8788/' + slug + '/', { waitUntil: 'networkidle' });
await p.evaluate(async () => {
  const s = Math.max(400, innerHeight);
  for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
  scrollTo(0, 0);
});
await p.waitForFunction(() => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 60000 });

const info = await p.evaluate(() => {
  const bad = [];
  const h = [];
  document.querySelectorAll('.prose img').forEach((img) => {
    const w = Number(img.getAttribute('width'));
    const ht = Number(img.getAttribute('height'));
    const rw = img.naturalWidth;
    const rh = img.naturalHeight;
    if (!w || !ht) { bad.push({ src: img.getAttribute('src'), attr: 'missing' }); return; }
    if (Math.abs(w / ht - rw / rh) > 0.01) {
      bad.push({ src: img.getAttribute('src'), attr: `${w}x${ht}`, real: `${rw}x${rh}`, arDiff: +(w / ht - rw / rh).toFixed(4) });
    }
  });
  document.querySelectorAll('.prose h1,.prose h2,.prose h3,.prose h4').forEach((el) => {
    const cs = getComputedStyle(el);
    h.push({ tag: el.tagName, cls: el.className, fs: cs.fontSize, mt: cs.marginTop, mb: cs.marginBottom, lh: cs.lineHeight });
  });
  return { bad, headings: h, docH: document.documentElement.scrollHeight };
});
console.log(slug, 'width=' + width, 'docHeight=' + info.docH);
console.log('宽高比不符/缺失:', info.bad.length);
info.bad.forEach((x) => console.log('  ', JSON.stringify(x)));
console.log('标题计算样式(前6):');
info.headings.slice(0, 6).forEach((x) => console.log('  ', JSON.stringify(x)));
await b.close();
