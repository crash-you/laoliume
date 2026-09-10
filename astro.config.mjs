// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { rehypeDemoteBodyHeadings, rehypeImageMeta } from './src/lib/rehype-seo.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://laoliu.me',
  adapter: cloudflare(),
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
});
