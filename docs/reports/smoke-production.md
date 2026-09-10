# 线上 HTTP Smoke Test 报告

- 目标: https://laoliu.me
- 时间: 2026-09-10T08:18:31.278Z
- 环境: Node v22.22.2, 本机网络直连（无代理配置时）

| 检查项 | 结果 | 说明 |
|---|---|---|
| 首页 | 已通过 | 200 + 预期标题 |
| 文章 /blog-build-guide/ | 已通过 | 200 + canonical 一致 |
| 文章 /gpt-download-install/ | 已通过 | 200 + canonical 一致 |
| 文章 /gpt6-codex-context/ | 已通过 | 200 + canonical 一致 |
| 文章 /codex-buy/ | 已通过 | 200 + canonical 一致 |
| 文章 /codex-deepseek/ | 已通过 | 200 + canonical 一致 |
| 文章 /vibe-coding-practice/ | 已通过 | 200 + canonical 一致 |
| 文章 /de-ai-flavor-prompts/ | 已通过 | 200 + canonical 一致 |
| 文章 /codex-custom-memory-skill/ | 已通过 | 200 + canonical 一致 |
| 文章 /codex-long-term-memory/ | 已通过 | 200 + canonical 一致 |
| 文章 /codex-chinese-settings/ | 已通过 | 200 + canonical 一致 |
| 文章 /codex-skill-usage/ | 已通过 | 200 + canonical 一致 |
| 文章 /from-0-to-1-chatgpt/ | 已通过 | 200 + canonical 一致 |
| 非规范入口 /blog-build-guide | 已通过 | 永久跳转(301)，2 跳到 200 |
| 非规范入口 /gpt-download-install | 已通过 | 永久跳转(301)，2 跳到 200 |
| 非规范入口 /gpt6-codex-context | 已通过 | 永久跳转(301)，2 跳到 200 |
| 随机 404 | 已通过 | 真实 404 状态码 |
| robots.txt | 失败 | 缺少 Sitemap 声明（若被 Cloudflare 托管内容覆盖，见站长待办） |
| sitemap.xml | 已通过 | 200 + 内容合法 |
| rss.xml | 已通过 | 200 + 内容合法 |
| 正文图片 | 已通过 | 200 |
| OG 分享图 | 失败 | HTTP 404 |
| 默认 OG 图 | 失败 | HTTP 404 |
| favicon | 已通过 | 200 |
| 阅读量 API(GET) | 已通过 | 200 + JSON 正常 |

**统计**: 已通过 22 / 失败 3 / 未验证 0（共 25 项）
