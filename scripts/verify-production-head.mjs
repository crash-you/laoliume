import { execFileSync } from 'node:child_process';

// Cloudflare 的构建可晚于后续提交完成。上传生产资产前，直接读取 GitHub 当前的 main。
function verifyProductionHead() {
  const { WORKERS_CI, WORKERS_CI_BRANCH, WORKERS_CI_COMMIT_SHA } = process.env;
  if (WORKERS_CI !== '1') return;
  if (!WORKERS_CI_BRANCH) throw new Error('缺少 WORKERS_CI_BRANCH，无法确定部署分支。');
  if (WORKERS_CI_BRANCH !== 'main') return;

  if (!/^[0-9a-f]{40}$/.test(WORKERS_CI_COMMIT_SHA ?? '')) {
    throw new Error('缺少有效的 WORKERS_CI_COMMIT_SHA。');
  }
  const options = {
    encoding: 'utf8',
    timeout: 20_000,
    stdio: ['ignore', 'pipe', 'ignore'],
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  };
  const checkout = execFileSync('git', ['rev-parse', 'HEAD'], options).trim();
  if (checkout !== WORKERS_CI_COMMIT_SHA) {
    throw new Error(`实际检出的提交 ${checkout} 与本次构建提交 ${WORKERS_CI_COMMIT_SHA} 不一致。`);
  }
  const ref = 'refs/heads/main';
  const repository = 'https://github.com/crash-you/laoliume.git';
  const remote = execFileSync('git', ['ls-remote', '--exit-code', repository, ref], options).trim();
  if (remote !== `${checkout}\t${ref}`) {
    throw new Error(`本次提交 ${checkout} 已不是远端 main 的最新提交（${remote}）。`);
  }
  console.log(`[production] 确认发布当前 main 提交 ${checkout}。`);
}

try {
  verifyProductionHead();
} catch (error) {
  console.error(`[production] 中止上传：${error.message}`);
  process.exitCode = 1;
}
