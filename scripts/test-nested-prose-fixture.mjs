/**
 * test-nested-prose-fixture.mjs — 嵌套正文负例夹具（任务书第 3 节验收要求）
 *
 * 对当前真实构建产物做「副本注入」验证：
 *   1. 复制 dist 到临时目录 dist-fixture-negative
 *   2. 把一篇文章页的 .prose 替换为「空嵌套元素」并保留 post-end/导航等模板
 *      （正是旧实现会误把 post-end 算进正文凑字数的场景）
 *   3. 运行 seo-check --dist dist-fixture-negative 必须失败（exit 1）
 *   4. 未注入的正常产物必须通过（exit 0）
 *
 * 不修改源文章、不修改 dist 本体；夹具目录测试后删除。
 * 退出码: 全部通过 -> 0；任一失败 -> 1
 */
import { execFileSync } from 'node:child_process';
import { cpSync, readFileSync, writeFileSync, existsSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIX = join(root, 'dist-fixture-negative');

let passed = 0;
let failed = 0;
const ok = (l) => { passed++; console.log('  ok  ' + l); };
const bad = (l, d = '') => { failed++; console.error('FAIL ' + l + ' ' + d); };
const check = (c, l, d = '') => (c ? ok(l) : bad(l, d));

function runSeoCheck(distDir) {
  try {
    execFileSync('node', ['scripts/seo-check.mjs', '--dist', distDir], { cwd: root, stdio: 'pipe', timeout: 120000 });
    return { code: 0, out: '' };
  } catch (e) {
    return { code: e.status ?? 1, out: String(e.stdout || '') + String(e.stderr || '') };
  }
}

try {
  // 准备夹具副本（真实产物 + 注入）。
  // 只复制校验需要的文本产物（HTML/XML/txt/_redirects），跳过 images/og/_astro/_worker.js
  // 与二进制文件——seo-check 对注入页的失败发生在正文检查，无需图片资产；
  // 这让夹具目录只有几十个文件，Windows 下复制/删除都是秒级。
  if (existsSync(FIX)) rmSync(FIX, { recursive: true, force: true });
  cpSync(join(root, 'dist'), FIX, {
    recursive: true,
    filter: (s) => {
      const rel = s.slice(join(root, 'dist').length).replace(/^[\\/]/, '');
      if (rel === '') return true;
      if (/^(images|og|_worker\.js|_astro)([\\/]|$)/.test(rel)) return false;
      if (/\.(png|jpe?g|exe|webp|gif|svg|ico)$/i.test(rel)) return false;
      return true;
    },
  });

  const target = join(FIX, 'codex-deepseek', 'index.html');
  if (!existsSync(target)) throw new Error('夹具目标页不存在（先构建 dist）');
  const html = readFileSync(target, 'utf-8');

  // 注入：.prose 内只留空嵌套元素；post-end/侧栏/导航保留在原处
  const openTag = html.match(/<div\s[^>]*class\s*=\s*["'][^"']*\bprose\b[^"']*["'][^>]*>/i);
  if (!openTag) throw new Error('目标页没有 .prose 容器');
  const start = openTag.index + openTag[0].length;
  // 找配对闭合（div 深度扫描）
  const tagRe = /<div\b[^>]*>|<\/div\s*>/gi;
  tagRe.lastIndex = openTag.index;
  let depth = 0;
  let end = -1;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[0].startsWith('</')) {
      depth--;
      if (depth === 0) { end = m.index + m[0].length; break; }
    } else depth++;
  }
  if (end < 0) throw new Error('目标页 .prose 未闭合');

  const injected =
    html.slice(0, openTag.index) +
    '<div class="prose"><div></div><div><span></span></div></div>' +
    html.slice(end);
  writeFileSync(target, injected);
  console.log('# 1. 注入「空嵌套正文 + post-end/导航保留」的负例');
  {
    const r = runSeoCheck('dist-fixture-negative');
    check(r.code === 1, 'seo-check 对注入夹具必须失败（exit 1）', `实际 exit=${r.code}`);
    check(/codex-deepseek.*正文过短|正文.*codex-deepseek/.test(r.out), '失败原因指向正文过短（不是把 post-end 当正文）', r.out.slice(-400));
  }

  console.log('# 2. 未注入的正常产物必须通过（用正式 dist 全量校验）');
  {
    const r = runSeoCheck('dist');
    check(r.code === 0, '正常产物 seo-check 通过（exit 0）', `实际 exit=${r.code}，输出末尾: ${r.out.slice(-300)}`);
  }
} finally {
  // 夹具清理（轻量目录，秒级；失败时改名降级，不阻塞）
  if (existsSync(FIX)) {
    try {
      rmSync(FIX, { recursive: true, force: true, maxRetries: 3 });
    } catch {
      renameSync(FIX, FIX + '-deleting');
    }
  }
}

console.log('# 3. 夹具已清理');
check(!existsSync(FIX), '夹具目录已删除');
check(existsSync(join(root, 'dist', 'index.html')), '正式 dist 仍存在');

console.log(`\n结果: ${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
