/**
 * seo-verify-ui.mjs — UI 回归：对比两组截图（before / after）
 *
 * 用法:
 *   node scripts/seo-verify-ui.mjs --before docs/screenshots/before --after docs/screenshots/after [--diff-dir docs/screenshots/diff] [--threshold 0]
 *
 * 判定:
 * - 逐张同名 PNG 对比尺寸与像素（pixelmatch，抗锯齿阈值 0.1）。
 * - --threshold 为允许的“差异像素占比”上限（0~1），默认 0（任何像素差异都失败）。
 * - 缺图、尺寸变化、像素差异超限均为失败，输出明细，不写“通过”。
 */
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);
const beforeDir = args.before;
const afterDir = args.after;
const diffDir = args['diff-dir'];
const threshold = Number(args.threshold ?? 0);
if (!beforeDir || !afterDir) {
  console.error('缺少 --before / --after');
  process.exit(2);
}
if (diffDir) mkdirSync(diffDir, { recursive: true });

const beforeFiles = new Set(readdirSync(beforeDir).filter((f) => f.endsWith('.png')));
const afterFiles = new Set(readdirSync(afterDir).filter((f) => f.endsWith('.png')));

let failed = 0;
const report = [];

for (const name of [...beforeFiles].sort()) {
  if (!afterFiles.has(name)) {
    report.push(`FAIL ${name}: after 缺少截图`);
    failed++;
    continue;
  }
  const imgA = PNG.sync.read(readFileSync(join(beforeDir, name)));
  const imgB = PNG.sync.read(readFileSync(join(afterDir, name)));
  if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
    report.push(
      `FAIL ${name}: 尺寸变化 ${imgA.width}x${imgA.height} -> ${imgB.width}x${imgB.height}（布局高度发生变化）`
    );
    failed++;
    continue;
  }
  const { width, height } = imgA;
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(imgA.data, imgB.data, diff.data, width, height, {
    threshold: 0.1,
  });
  const ratio = diffPixels / (width * height);
  if (ratio > threshold) {
    report.push(
      `FAIL ${name}: ${diffPixels} 个像素不同（占比 ${(ratio * 100).toFixed(4)}%，阈值 ${(threshold * 100).toFixed(4)}%）`
    );
    failed++;
    if (diffDir) writeFileSync(join(diffDir, name), PNG.sync.write(diff));
  } else {
    report.push(`OK   ${name}: 无像素差异`);
  }
}
for (const name of afterFiles) {
  if (!beforeFiles.has(name)) {
    report.push(`FAIL ${name}: before 中没有对应截图（新增文件）`);
    failed++;
  }
}

console.log(report.join('\n'));
if (failed) {
  console.error(`\nUI 回归失败：${failed} 项`);
  process.exit(1);
}
console.log('\nUI 回归通过：所有截图一致');
