// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { execSync } from 'node:child_process';
import { rehypeDemoteBodyHeadings, rehypeImageMeta } from './src/lib/rehype-seo.mjs';
import { seoIntegration } from './src/lib/seo-integration.mjs';

// 构建提交标记：用于部署后验收确认「线上产物对应哪个提交」。
// CI 里优先用 GITHUB_SHA，本地回退 git rev-parse。
let buildCommit = 'unknown';
try {
  buildCommit =
    process.env.GITHUB_SHA ||
    execSync('git rev-parse HEAD', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
} catch {
  /* git 不可用时保持 unknown */
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
