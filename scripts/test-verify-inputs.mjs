/**
 * test-verify-inputs.mjs — 工作流输入校验边界测试
 *
 * 关键原则：测试不复制一份「可能与工作流脱节」的规则，而是：
 *   1. 从 .github/workflows/seo-deploy-verify.yml 解析真实的 canonical-origin 默认值，
 *      断言该默认值能通过校验（默认配置可通过——旧正则会拒绝自己的默认值）。
 *   2. 直接调用 scripts/verify-inputs.mjs 导出的校验函数（与工作流运行的是同一实现）。
 *   3. 用 CLI 子进程验证非法输入 exit 1（工作流里在网络访问前明确失败）。
 *
 * 覆盖：
 *   - 默认值（工作流文件里解析）与 https://laoliu.me/ 均合法且归一化为 https://laoliu.me
 *   - 非 HTTPS / 其他域名 / 用户信息 / 非根路径 / query / fragment / 异常端口 → 拒绝
 *   - commit：完整 40 位 SHA 合法（大小写归一）；短 SHA / 非 hex / 空 → 拒绝
 *
 * 退出码: 全部通过 -> 0；任一失败 -> 1
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { validateCanonicalOrigin, validateCommit } from './verify-inputs.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

let passed = 0;
let failed = 0;
const ok = (l) => { passed++; console.log('  ok  ' + l); };
const bad = (l, d = '') => { failed++; console.error('FAIL ' + l + ' ' + d); };
const check = (c, l, d = '') => (c ? ok(l) : bad(l, d));

/** 从工作流文件解析 canonical-origin 的真实默认值 */
function workflowDefaultOrigin() {
  const yml = readFileSync(join(root, '.github', 'workflows', 'seo-deploy-verify.yml'), 'utf-8');
  const m = yml.match(/canonical-origin:[\s\S]*?default:\s*['"]([^'"]+)['"]/);
  if (!m) throw new Error('工作流文件中找不到 canonical-origin 默认值');
  return m[1];
}

console.log('# 1. 工作流真实默认值必须能通过校验（回归旧 bug）');
{
  const def = workflowDefaultOrigin();
  console.log(`  （从工作流解析的默认值: ${def}）`);
  const res = validateCanonicalOrigin(def);
  check(res.ok, `工作流默认值 ${def} 通过校验`, `问题: ${res.problems?.join('; ')}`);
  check(res.ok && res.origin === 'https://laoliu.me', '归一化为 https://laoliu.me', `实际 ${res.origin}`);
}

console.log('# 2. 合法输入变体');
{
  const a = validateCanonicalOrigin('https://laoliu.me');
  const b = validateCanonicalOrigin('https://laoliu.me/');
  check(a.ok && a.origin === 'https://laoliu.me', '无尾斜杠 origin 合法');
  check(b.ok && b.origin === 'https://laoliu.me', '带尾斜杠 origin 合法且归一化');
  // 大写主机（URL 解析会归一化 hostname 为小写）
  const c = validateCanonicalOrigin('https://LAOLIU.ME');
  check(c.ok && c.origin === 'https://laoliu.me', '大写主机归一化后合法');
}

console.log('# 3. 非法输入必须拒绝（在网络访问前失败）');
{
  const cases = [
    ['http://laoliu.me', '非 HTTPS'],
    ['https://www.laoliu.me', '其他域名（www）'],
    ['https://example.com', '其他域名'],
    ['https://user:pass@laoliu.me', '用户信息'],
    ['https://laoliu.me/some/path/', '非根路径'],
    ['https://laoliu.me:8443', '显式端口'],
    ['https://laoliu.me/?q=1', 'query'],
    ['https://laoliu.me/#frag', 'fragment'],
    ['not-a-url', '非 URL'],
    ['', '空字符串'],
  ];
  for (const [input, label] of cases) {
    const res = validateCanonicalOrigin(input);
    check(!res.ok, `${label} 被拒绝（${input}）`, `意外通过，origin=${res.origin}`);
  }
}

console.log('# 4. commit 校验：完整 40 位 SHA');
{
  const full = '87cc8f8a6b71b5d44c99dbe61ea613b7374c5bd7';
  const res = validateCommit(full);
  check(res.ok && res.commit === full, '40 位小写 SHA 合法');
  const resUpper = validateCommit(full.toUpperCase());
  check(resUpper.ok && resUpper.commit === full, '大写 SHA 归一化为小写');
  const badCases = [
    ['87cc8f8', '7 位短 SHA'],
    ['87cc8f8a6b71b5d44c99dbe61ea613b7374c5bd', '39 位（长度不足）'],
    ['zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz', '非 hex 字符'],
    ['', '空'],
    ['xyz-not-sha', '非 SHA 字符串'],
  ];
  for (const [input, label] of badCases) {
    const res = validateCommit(input);
    check(!res.ok, `${label} 被拒绝`, `意外通过: ${res.commit}`);
  }
}

console.log('# 5. CLI 行为：合法 exit 0 输出归一化结果；非法 exit 1');
{
  const script = join(root, 'scripts', 'verify-inputs.mjs');
  const env = { ...process.env, COMMIT: '87cc8f8a6b71b5d44c99dbe61ea613b7374c5bd7', CANONICAL_ORIGIN: 'https://laoliu.me/' };
  // 合法：exit 0，输出两行 KEY=VALUE
  const out = execFileSync('node', [script], { env, encoding: 'utf-8' });
  check(out.includes('ORIGIN=https://laoliu.me'), 'CLI 输出归一化 ORIGIN', `实际 ${JSON.stringify(out)}`);
  check(out.includes('COMMIT=87cc8f8a6b71b5d44c99dbe61ea613b7374c5bd7'), 'CLI 输出 COMMIT');
  // 非法 origin：exit 1
  let code = 0;
  try {
    execFileSync('node', [script], { env: { ...env, CANONICAL_ORIGIN: 'https://laoliu.me/some/path/' }, encoding: 'utf-8', stdio: 'pipe' });
  } catch (e) {
    code = e.status ?? 1;
  }
  check(code === 1, '非根路径 origin → CLI exit 1', `code=${code}`);
  // 非法 commit（短 SHA）：exit 1
  let code2 = 0;
  try {
    execFileSync('node', [script], { env: { ...env, COMMIT: '87cc8f8' }, encoding: 'utf-8', stdio: 'pipe' });
  } catch (e) {
    code2 = e.status ?? 1;
  }
  check(code2 === 1, '短 SHA commit → CLI exit 1', `code=${code2}`);
}

console.log(`\n结果: ${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
