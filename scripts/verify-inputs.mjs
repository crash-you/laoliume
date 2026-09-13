/**
 * verify-inputs.mjs — SEO Deploy Verify 工作流的输入校验/归一化（单一实现源）
 *
 * .github/workflows/seo-deploy-verify.yml 的 Validate inputs 步骤直接运行本文件：
 *   node scripts/verify-inputs.mjs            # 读环境变量 CANONICAL_ORIGIN / COMMIT
 * 输出（stdout）两行归一化结果供 shell 捕获；非法输入 exit 1 并把原因写到 stderr。
 *
 * 测试（scripts/test-verify-inputs.mjs）从本仓库工作流文件解析出真实的
 * canonical-origin 默认值（https://laoliu.me），再调用本模块校验——
 * 保证「默认配置可通过」始终针对工作流当前真实默认值，不与工作流脱节。
 *
 * 约束（canonical-origin）：
 *   - https 协议；主机必须是 laoliu.me；无用户信息；无显式端口
 *   - 路径只能为空或 "/"（纯 origin）；无 query；无 fragment
 *   - https://laoliu.me 与 https://laoliu.me/ 均合法，统一归一化为 https://laoliu.me
 *
 * 约束（commit）：完整 40 位十六进制小写 SHA（短 SHA 无法与线上完整 build-commit 比较）。
 */

const EXPECTED_HOST = 'laoliu.me';

/**
 * 校验并归一化 canonical-origin。
 * 合法返回 { ok: true, origin: 'https://laoliu.me' }；
 * 非法返回 { ok: false, problems: string[] }。
 */
export function validateCanonicalOrigin(raw) {
  let u;
  try {
    u = new URL(String(raw));
  } catch {
    return { ok: false, problems: ['无法解析为 URL'] };
  }
  const problems = [];
  if (u.protocol !== 'https:') problems.push('协议必须是 https');
  if (u.hostname !== EXPECTED_HOST) problems.push(`主机必须是 ${EXPECTED_HOST}`);
  if (u.username || u.password) problems.push('不允许携带用户信息');
  if (u.port) problems.push(`不允许显式端口（${u.port}）`);
  if (u.pathname !== '/' && u.pathname !== '') problems.push(`必须是根路径 origin，不允许 ${u.pathname}`);
  if (u.search) problems.push(`不允许 query（${u.search}）`);
  if (u.hash) problems.push(`不允许 fragment（${u.hash}）`);
  if (problems.length) return { ok: false, problems };
  return { ok: true, origin: u.origin };
}

/**
 * 校验 commit 是否为完整 40 位十六进制 SHA（不区分大小写，归一化为小写）。
 */
export function validateCommit(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(s)) {
    return { ok: false, problems: ['必须是完整 40 位十六进制 SHA'] };
  }
  return { ok: true, commit: s };
}

/* ---------- CLI：供工作流 Validate inputs 步骤调用 ---------- */
const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replace(/\\/g, '/')}`).href;
if (isMain) {
  const commit = process.env.COMMIT ?? '';
  const originRaw = process.env.CANONICAL_ORIGIN ?? '';
  const commitRes = validateCommit(commit);
  if (!commitRes.ok) {
    console.error(`commit 输入不合法: ${commitRes.problems.join('; ')}（实际 ${commit}）`);
    process.exit(1);
  }
  const originRes = validateCanonicalOrigin(originRaw);
  if (!originRes.ok) {
    console.error(`canonical-origin 输入不合法: ${originRes.problems.join('; ')}（实际 ${originRaw}）`);
    process.exit(1);
  }
  // 归一化结果：供 shell 捕获（工作流里写入 GITHUB_ENV）
  console.log(`COMMIT=${commitRes.commit}`);
  console.log(`ORIGIN=${originRes.origin}`);
}
