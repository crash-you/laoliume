/**
 * seo-verify-ui.mjs — UI 回归：对比两组截图（before / after）
 *
 * 用法:
 *   node scripts/seo-verify-ui.mjs --before <dir> --after <dir> [--diff-dir <dir>] [--threshold 0]
 *
 * 判定（避免错误通过）：
 * - 必须存在完整的 4 页面 × 3 视口 = 12 张同名 PNG（两侧都要）。
 * - 空目录、缺截图、数量不足、多余文件都返回非零。
 * - 逐张用 pixelmatch 对比像素（抗锯齿阈值 0.1）；阈值默认 0，任何像素差异即失败。
 * - 输出每张图的尺寸与差异像素明细；不做“复制 before 到 after / 提高阈值 / 屏蔽区域”。
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
if (!(threshold >= 0 && threshold <= 1)) {
  console.error('--threshold 必须在 0~1 之间');
  process.exit(2);
}

// 预期的完整截图集合：4 页面 × 3 视口
const PAGES = ['home', 'buy', 'register', 'long'];
const VIEWPORTS = ['desktop', 'tablet', 'mobile'];
const EXPECTED = PAGES.flatMap((p) => VIEWPORTS.map((v) => `${p}-${v}.png`));

const listPng = (dir) => {
  if (!existsSync(dir)) return null;
  return readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
};

let failed = 0;
const report = [];

const beforeFiles = listPng(beforeDir);
const afterFiles = listPng(afterDir);

for (const [label, files, dir] of [
  ['before', beforeFiles, beforeDir],
  ['after', afterFiles, afterDir],
]) {
  if (!files) {
    console.error(`FAIL: ${label} 目录不存在或不可读: ${dir}`);
    process.exit(2);
  }
  if (files.length === 0) {
    console.error(`FAIL: ${label} 目录为空（未执行截图）: ${dir}`);
    process.exit(2);
  }
  const missing = EXPECTED.filter((f) => !files.includes(f));
  const extra = files.filter((f) => !EXPECTED.includes(f));
  if (missing.length) {
    report.push(`FAIL ${label}: 缺少截图 ${missing.join(', ')}`);
    failed++;
  }
  if (extra.length) {
    report.push(`FAIL ${label}: 存在预期外的截图 ${extra.join(', ')}`);
    failed++;
  }
  if (files.length < EXPECTED.length) {
    report.push(`FAIL ${label}: 截图数量不足 ${files.length}/${EXPECTED.length}`);
    failed++;
  }
}

if (diffDir) mkdirSync(diffDir, { recursive: true });

// 只有两侧都完整时才逐张对比
if (!failed) {
  for (const name of EXPECTED) {
    const imgA = PNG.sync.read(readFileSync(join(beforeDir, name)));
    const imgB = PNG.sync.read(readFileSync(join(afterDir, name)));
    if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
      report.push(
        `FAIL ${name}: 尺寸变化 ${imgA.width}x${imgA.height} -> ${imgB.width}x${imgB.height}`
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
      report.push(`OK   ${name}: ${width}x${height}，${diffPixels} 个像素不同（0.0000%）`);
    }
  }
}

console.log(report.join('\n'));
if (failed) {
  console.error(`\nUI 回归失败：${failed} 项`);
  process.exit(1);
}
console.log(`\nUI 回归通过：${EXPECTED.length} 张截图全部一致`);
