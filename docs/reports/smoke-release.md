# 线上 HTTP Smoke Test 报告

- 访问地址 base-url: https://www.laoliu.me
- 预期 canonical-origin: https://laoliu.me
- 目标环境: production
- 来源产物: dist/（12 篇可索引文章）
- 部署提交核验: 30a484e23b1456efb8e016daf5aa1a0c1063f8f8
- 命令: node scripts/seo-smoke.mjs --base-url https://www.laoliu.me --canonical-origin https://laoliu.me --env production --expected-commit 30a484e23b1456efb8e016daf5aa1a0c1063f8f8
- 时间: 2026-09-13T14:11:13.811Z
- 环境: Node v22.22.2

| 检查项 | 结果 | 说明 |
|---|---|---|
| 首页 | 已通过 | 200 + 标题 + 索引指令 + 业务入口 + 规范地址 |
| 部署提交核验 | 已通过 | 线上 build-commit = 30a484e23b1456efb8e016daf5aa1a0c1063f8f8 |
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
| 非规范入口 /gpt-download-install | 已通过 | 永久跳转(308)，1 跳，链路: 308->/gpt-download-install/ |
| 非规范入口 /gpt6-codex-context | 已通过 | 永久跳转(308)，1 跳，链路: 308->/gpt6-codex-context/ |
| 非规范入口 /codex-buy | 已通过 | 永久跳转(308)，1 跳，链路: 308->/codex-buy/ |
| 非规范入口 /codex-deepseek | 已通过 | 永久跳转(308)，1 跳，链路: 308->/codex-deepseek/ |
| 非规范入口 /vibe-coding-practice | 已通过 | 永久跳转(308)，1 跳，链路: 308->/vibe-coding-practice/ |
| 非规范入口 /de-ai-flavor-prompts | 已通过 | 永久跳转(308)，1 跳，链路: 308->/de-ai-flavor-prompts/ |
| 非规范入口 /codex-custom-memory-skill | 已通过 | 永久跳转(308)，1 跳，链路: 308->/codex-custom-memory-skill/ |
| 非规范入口 /codex-long-term-memory | 已通过 | 永久跳转(308)，1 跳，链路: 308->/codex-long-term-memory/ |
| 非规范入口 /codex-chinese-settings | 已通过 | 永久跳转(308)，1 跳，链路: 308->/codex-chinese-settings/ |
| 非规范入口 /codex-skill-usage | 已通过 | 永久跳转(308)，1 跳，链路: 308->/codex-skill-usage/ |
| 非规范入口 /from-0-to-1-chatgpt | 已通过 | 永久跳转(308)，1 跳，链路: 308->/from-0-to-1-chatgpt/ |
| 随机 404 | 已通过 | 真实 404 |
| robots.txt | 已通过 | 200 + 搜索爬虫允许 + Sitemap 声明；AI 爬虫被禁: GPTBot, ClaudeBot, CCBot（站长策略，不判失败） |
| sitemap.xml | 已通过 | 200 + XML 合法 + URL 集合与本地预期一致 |
| rss.xml | 已通过 | 200 + XML 合法 + item 集合一致 |
| 正文图片 | 已通过 | 200 + image/png + 内容魔数正确 |
| OG 分享图 | 已通过 | 200 + image/png + 内容魔数正确 |
| favicon | 已通过 | 200 + image/svg+xml + 内容魔数正确 |
| 阅读量 API(GET) | 已通过 | 200 + JSON + X-Robots-Tag: noindex |

**统计**: 已通过 34 / 失败 0 / 未验证 0（共 34 项）

**结果**: 全部必需检查通过
**退出码**: 0