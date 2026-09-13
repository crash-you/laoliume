// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { execSync } from 'node:child_process';
import { rehypeDemoteBodyHeadings, rehypeImageMeta } from './src/lib/rehype-seo.mjs';
import { seoIntegration } from './src/lib/seo-integration.mjs';

// 构建提交标记：用于部署后验收确认「线上产物对应哪个提交」。
//
// 优先级（与 .github/workflows/seo-deploy-verify.yml 的约定一致）：
//   1. BUILD_COMMIT —— 显式指定，必须与实际工作树的 git rev-parse HEAD 完全相等，
//      否则构建失败（防止「工作流触发 ref」冒充「实际构建版本」）。
//   2. GITHUB_SHA   —— GitHub Actions 环境；checkout inputs.commit 后 GITHUB_SHA
//      即为被验收提交（actions/checkout 会把 GITHUB_SHA 重写为实际 checkout 的 SHA）。
//   3. git rev-parse HEAD —— 本地构建回退。
//
// 关键不变式：标记必须反映【实际构建的工作树版本】。
// workflow_dispatch 触发时 GITHUB_SHA 是默认分支的 SHA，不是 inputs.commit 的 SHA——
// 因此工作流里必须先 checkout inputs.commit 再构建（checkout 动作会更新 GITHUB_SHA），
// 并用 BUILD_COMMIT 交叉核验（见 seo-deploy-verify.yml 的核验步骤）。
function resolveBuildCommit() {
  const explicit = process.env.BUILD_COMMIT;
  let actual = 'unknown';
  try {
    actual = execSync('git rev-parse HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    /* git 不可用时保持 unknown */
  }
  if (explicit) {
    if (!/^[0-9a-f]{7,40}$/i.test(explicit)) {
      throw new Error(`BUILD_COMMIT 不是合法 SHA: ${explicit}`);
    }
    // 显式指定的 BUILD_COMMIT 必须与实际 HEAD 一致（允许短 SHA 前缀匹配）
    if (actual !== 'unknown' && !actual.startsWith(explicit.toLowerCase()) && !explicit.toLowerCase().startsWith(actual)) {
      throw new Error(
        `BUILD_COMMIT(${explicit}) 与实际工作树 HEAD(${actual}) 不一致。` +
          '工作流上下文 SHA 与被验收 SHA 不同：请确认已 checkout 到目标提交再构建。'
      );
    }
    return explicit;
  }
  return process.env.GITHUB_SHA || actual;
}

let buildCommit;
try {
  buildCommit = resolveBuildCommit();
} catch (e) {
  // 构建期硬失败：标记与实际版本不符时不能带错误标记继续
  console.error(`[build-commit] ${e.message}`);
  process.exit(1);
}

// https://astro.build/config
export default defineConfig({
  site: 'https://laoliu.me',
  adapter: cloudflare(),
  // 构建期 SEO 集成：自动生成 _redirects（见 src/lib/seo-integration.mjs）
  integrations: [seoIntegration()],
  security: {
    // 阅读量接口是公开的计数器（GET/POST /api/views/:slug），不做 Origin 校验
    checkOrigin: false,
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: false,
    },
    // 构建期 AST 转换：正文标题降级（保视觉）+ 图片尺寸/懒加载（见 src/lib/rehype-seo.mjs）
    rehypePlugins: [rehypeDemoteBodyHeadings, rehypeImageMeta],
  },
  vite: {
    define: {
      __BUILD_COMMIT__: JSON.stringify(buildCommit),
    },
  },
});
