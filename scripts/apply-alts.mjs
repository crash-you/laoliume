/**
 * apply-alts.mjs — 把人工看图写好的 alts.json 回写到 markdown
 *
 * 用法: node scripts/apply-alts.mjs
 * 输入: docs/alt-sheets/index.json（图片清单）+ docs/alt-sheets/alts.json（编号 -> 新 alt）
 * 规则: 按 (slug, src) 精确替换 `![旧alt](src)` 的 alt 部分；新 alt 不含 markdown 特殊字符。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sheetsDir = join(root, 'docs', 'alt-sheets');
const items = JSON.parse(readFileSync(join(sheetsDir, 'index.json'), 'utf-8'));
const alts = JSON.parse(readFileSync(join(sheetsDir, 'alts.json'), 'utf-8'));

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let done = 0;
const missing = [];
for (let i = 0; i < items.length; i++) {
  const it = items[i];
  const newAlt = alts[String(i)];
  if (!newAlt) {
    missing.push(`#${i} ${it.slug}/${it.src}`);
    continue;
  }
  if (/[\[\]\(\)\n"]/.test(newAlt)) {
    missing.push(`#${i} alt 含非法字符: ${newAlt}`);
    continue;
  }
  const file = join(root, 'src', 'content', 'posts', it.slug + '.md');
  let text = readFileSync(file, 'utf-8');
  const pattern = new RegExp(`!\\[[^\\]]*\\]\\(${escapeRe(it.src)}\\)`);
  if (!pattern.test(text)) {
    missing.push(`#${i} 未匹配 ${it.slug} ${it.src}`);
    continue;
  }
  text = text.replace(pattern, `![${newAlt}](${it.src})`);
  writeFileSync(file, text);
  done++;
}
console.log(`已回写 ${done}/${items.length} 张图片的 alt`);
if (missing.length) {
  console.log('未处理:');
  missing.forEach((m) => console.log('  ' + m));
  process.exitCode = 1;
}
