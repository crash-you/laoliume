# 本地 Wrangler 运行时冒烟（第三轮，2026-09-13 原始输出）

命令：

```bash
node node_modules/wrangler/bin/wrangler.js dev --port 8788 --local
node scripts/seo-smoke.mjs \
  --base-url http://127.0.0.1:8788 \
  --canonical-origin https://laoliu.me \
  --env local
```

- 运行环境：Node v22.22.2，wrangler 4.128.0（本地模式，绑定 `env.DB`(D1 local) + `env.ASSETS`）
- 数据来源产物：`dist/`（12 篇可索引文章）
- wrangler 启动日志：`✨ Parsed 12 valid redirect rules.` / `Ready on http://127.0.0.1:8788`
- **不使用静态文件存在性判断替代 HTTP 行为**：全部检查项都是对本地运行时发真实 HTTP 请求

| 检查项 | 结果 | 说明 |
|---|---|---|
| 首页 | 已通过 | 200 + 标题 + 索引指令 + 业务入口 + 规范地址 |
| 文章 /blog-build-guide/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /gpt-download-install/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /gpt6-codex-context/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /codex-buy/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /codex-deepseek/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /vibe-coding-practice/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /de-ai-flavor-prompts/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /codex-custom-memory-skill/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /codex-long-term-memory/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /codex-chinese-settings/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /codex-skill-usage/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 文章 /from-0-to-1-chatgpt/ | 已通过 | 200 + 标题/canonical/正文三段一致 |
| 非规范入口 /blog-build-guide | 已通过 | 永久跳转(308)，1 跳，链路: 308->/blog-build-guide/ |
| 非规范入口 /gpt-download-install | 已通过 | 永久跳转(308)，1 跳 |
| 非规范入口 /gpt6-codex-context | 已通过 | 永久跳转(308)，1 跳 |
| 非规范入口 /codex-buy | 已通过 | 永久跳转(308)，1 跳 |
| 非规范入口 /codex-deepseek | 已通过 | 永久跳转(308)，1 跳 |
| 非规范入口 /vibe-coding-practice | 已通过 | 永久跳转(308)，1 跳 |
| 非规范入口 /de-ai-flavor-prompts | 已通过 | 永久跳转(308)，1 跳 |
| 非规范入口 /codex-custom-memory-skill | 已通过 | 永久跳转(308)，1 跳 |
| 非规范入口 /codex-long-term-memory | 已通过 | 永久跳转(308)，1 跳 |
| 非规范入口 /codex-chinese-settings | 已通过 | 永久跳转(308)，1 跳 |
| 非规范入口 /codex-skill-usage | 已通过 | 永久跳转(308)，1 跳 |
| 非规范入口 /from-0-to-1-chatgpt | 已通过 | 永久跳转(308)，1 跳 |
| 随机 404 | 已通过 | 真实 404 |
| robots.txt | 已通过 | 200 + 搜索爬虫允许 + Sitemap 声明 |
| sitemap.xml | 已通过 | 200 + XML 合法 + URL 集合与本地预期一致 |
| rss.xml | 已通过 | 200 + XML 合法 + item 集合一致 |
| 正文图片 | 已通过 | 200 + image/png + 内容魔数正确 |
| OG 分享图 | 已通过 | 200 + image/png + 内容魔数正确 |
| favicon | 已通过 | 200 + image/svg+xml + 内容魔数正确 |
| 阅读量 API(GET) | 已通过 | 200 + JSON + X-Robots-Tag: noindex |

**统计：已通过 33 / 失败 0 / 未验证 0（共 33 项）**
**结果：全部必需检查通过　退出码：0**

> 说明：本地运行时验证的是**代码与构建产物的行为**（308 永久跳转、真实 404、正文三段指纹、
> 图片魔数、API 契约）。它**不能**代替生产域名级跳转（apex→www）的验收——那一层由
> Cloudflare 后台控制，仍属站长待办（见 `docs/SEO_OWNER_ACTIONS.md` 第 0 条）。
