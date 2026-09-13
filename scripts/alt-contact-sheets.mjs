/**
 * alt-contact-sheets.mjs — 为需要补 alt 的图片生成“看图标注表”
 *
 * 用法: node scripts/alt-contact-sheets.mjs
 * 输出: docs/alt-sheets/sheet-XX.png（每张 16 图，含文件名与上文语境）
 * 配套: 人工看图后写 docs/alt-sheets/alts.json，再跑 apply-alts.mjs 回写 markdown
 */
import { chromium } from 'playwright-core';
import { readdirSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = join(root, 'src', 'content', 'posts');
const publicDir = join(root, 'public');
const outDir = join(root, 'docs', 'alt-sheets');

/** 判断 alt 是否为“文件名式”无效描述 */
function isBadAlt(alt) {
  const a = alt.replace(/\\/g, '').trim();
  if (!a) return true;
  return (
    /^image(-\d+)?\.(png|jpe?g|gif|webp)$/i.test(a) ||
    /^image$/i.test(a) ||
    /^[0-9a-f]{10,}\.(png|jpe?g)$/i.test(a)
  );
}

/** 提取所有需要补 alt 的图片引用（带上文语境） */
function collect() {
  const items = [];
  for (const file of readdirSync(postsDir).filter((f) => f.endsWith('.md'))) {
    const slug = file.replace('.md', '');
    const lines = readFileSync(join(postsDir, file), 'utf-8').split('\n');
    let inFence = false;
    let lastText = '';
    let inFrontmatter = true;
    let dashCount = 0;
    lines.forEach((line, i) => {
      if (i < 60 && /^---$/.test(line)) {
        dashCount++;
        if (dashCount === 2) inFrontmatter = false;
        return;
      }
      if (inFrontmatter) return;
      if (/^```/.test(line)) { inFence = !inFence; return; }
      if (inFence) return;
      const m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/);
      if (m) {
        const [, alt, src] = m;
        if (isBadAlt(alt)) {
          items.push({
            slug,
            line: i + 1,
            alt,
            src,
            ctx: lastText.replace(/[*#>`\[\]()\\]/g, '').slice(0, 60),
          });
        }
      } else if (line.trim() && !line.startsWith('![')) {
        lastText = line.trim();
      }
    });
  }
  return items;
}

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const roots = [join(homedir(), 'AppData/Local/ms-playwright')];
  const candidates = [];
  for (const rootDir of roots) {
    if (!existsSync(rootDir)) continue;
    for (const dir of readdirSync(rootDir)) {
      if (!dir.startsWith('chromium-')) continue;
      const p = join(rootDir, dir, 'chrome-win64/chrome.exe');
      if (existsSync(p)) candidates.push([Number(dir.split('-')[1]) || 0, p]);
    }
  }
  candidates.sort((a, b) => b[0] - a[0]);
  return candidates[0]?.[1] ?? null;
}

const items = collect();
console.log(`需要补 alt 的图片: ${items.length} 张`);
mkdirSync(outDir, { recursive: true });

const PER_SHEET = 16;
const sheets = Math.ceil(items.length / PER_SHEET);
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: 1680, height: 1250 }, deviceScaleFactor: 1 });

for (let s = 0; s < sheets; s++) {
  const chunk = items.slice(s * PER_SHEET, (s + 1) * PER_SHEET);
  const cells = chunk
    .map((it) => {
      const fileUrl = (process.env.IMG_BASE_URL ?? 'http://localhost:8788') + it.src;
      return `<div class="cell">
        <div class="imgbox"><img src="${fileUrl}"></div>
        <div class="cap"><b>#${items.indexOf(it)} ${it.slug}/${it.src.split('/').pop()}</b><br>${it.ctx}</div>
      </div>`;
    })
    .join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:"Microsoft YaHei",sans-serif; background:#fff; padding:10px; }
    .grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
    .cell { border:1px solid #ccc; border-radius:6px; overflow:hidden; }
    .imgbox { height:250px; background:#f4f4f4; display:flex; align-items:center; justify-content:center; }
    .imgbox img { max-width:100%; max-height:250px; }
    .cap { font-size:14px; padding:6px 8px; line-height:1.4; color:#333; }
    .cap b { color:#000; }
  </style></head><body><div class="grid">${cells}</div></body></html>`;
  await page.setContent(html);
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(outDir, `sheet-${String(s + 1).padStart(2, '0')}.png`), fullPage: true });
  console.log(`OK sheet-${String(s + 1).padStart(2, '0')}.png (${chunk.length} 图)`);
}
await browser.close();

// 输出索引文件，便于回写
import { writeFileSync } from 'node:fs';
writeFileSync(join(outDir, 'index.json'), JSON.stringify(items, null, 2));
console.log(`索引: ${join(outDir, 'index.json')}`);
