// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

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
  },
});
