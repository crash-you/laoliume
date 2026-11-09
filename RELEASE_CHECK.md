# RELEASE_CHECK · 上线前验收报告

- **项目**：佬刘AI 个人博客（laoliu.me）
- **验收时间**：2026-09-03 20:28 ~ 20:55
- **验收环境**：Windows · wrangler dev 本地 Worker 环境（真实 Cloudflare runtime 模拟）· Chrome 152 无头浏览器
- **验收方式**：curl 接口级测试 + 真实浏览器多视口自动化测试
- **代码版本**：`2b4796f`（桌面端 UI 布局重构）

## 结论：✅ 可以上线

未发现任何 Blocker。所有验收项通过。唯一的待办是部署侧操作（D1 创建、Cloudflare 连接、域名绑定），不属于代码问题。

---

## 逐项验收结果

### 1. 构建与基础页面

| 检查项 | 结果 | 说明 |
| --- | --- | --- |
| `npm run build` | ✅ 通过 | 无错误，3 篇文章全部静态预渲染 |
| 首页 `/` | ✅ 200 | 双栏布局正常 |
| 3 篇文章页 | ✅ 全部 200 | `/codex-buy/` `/codex-third-party-api/` `/ai-command-codex-product/` |
| 404 页 | ✅ | 未知路径返回 404 状态码 + 定制 404 页面 |

### 2. 响应式（真实浏览器实测）

| 视口 | 首页 | 文章页 | 横向溢出 | 布局切换 |
| --- | --- | --- | --- | --- |
| 390×844 Mobile | ✅ | ✅ | 无 | 单栏，sidebar 隐藏 ✅ |
| 768×1024 Tablet | ✅ | ✅ | 无 | 单栏，sidebar 隐藏 ✅ |
| 1024×768 Tablet | ✅ | ✅ | 无 | 单栏，sidebar 隐藏 ✅ |
| 1366×900 Desktop | ✅ | ✅ | 无 | 双栏，sidebar 显示 ✅ |
| 1728×900 Desktop | ✅ | ✅ | 无 | 双栏，sidebar 显示 ✅ |

断点行为与设计一致：≥1100px 双栏，768~1099px 单栏 760px，<768px 移动端。

### 3. Markdown 渲染（3 篇文章实测）

| 元素 | 结果 |
| --- | --- |
| h2 / h3 标题 | ✅ 正确渲染为 HTML 标签，无 `#` 符号残留 |
| 图片 | ✅ 加载成功（naturalWidth > 0），居中自适应 |
| 表格 | ✅ 渲染正常，窄屏横向滚动 |
| 引用 blockquote | ✅ 3 篇均有 |
| 代码块 pre | ✅ 5 处，横向滚动正常 |
| 有序/无序列表 | ✅ 正常 |
| 分割线 hr | ✅ 正常 |
| 加粗 / 行内代码 / 链接 | ✅ 正常 |

### 4. SEO 全套

| 检查项 | 首页 | 文章页 |
| --- | --- | --- |
| `<title>` | ✅ `佬刘AI - AI、Codex 与 Vibe Coding 实操` | ✅ `文章标题 - 佬刘AI` |
| meta description | ✅ 与规格一致 | ✅ 取自 frontmatter |
| canonical | ✅ `https://laoliu.me/` | ✅ `https://laoliu.me/codex-buy/`（与实际 URL 一致，无跳转链） |
| Open Graph | ✅ og:title / og:description / og:url | ✅ og:type=article |
| Twitter Card | ✅ summary | ✅ summary |
| Article JSON-LD | — | ✅ headline / description / datePublished / dateModified / author(佬刘) / publisher(佬刘AI) / url 全部存在 |
| sitemap.xml | ✅ 4 条 URL，全部带尾斜杠，与 canonical 一致 | |
| robots.txt | ✅ 允许全部抓取 + 声明 sitemap | |
| rss.xml | ✅ 3 条 item，语言 zh-CN | |

### 5. 内容隔离与健壮性

| 检查项 | 结果 |
| --- | --- |
| unpublished 文章（draft-vibe-coding） | ✅ 页面 404；sitemap / RSS / 首页均无踪迹 |
| 阅读量接口 GET（正常 slug） | ✅ `{"slug":"codex-buy","views":11}` |
| 阅读量接口 GET（不存在的 slug） | ✅ 正常返回 `views:0`，不报错 |
| 阅读量接口（SQL 注入尝试） | ✅ 参数化查询，无异常 |
| 阅读量接口 POST | ✅ 计数正常 +1 |
| **接口异常不影响正文** | ✅ 正文为构建期纯静态 HTML（curl 无 JS 验证正文完整），阅读量为异步加载并 try/catch 降级显示「— 次阅读」 |
| 死链检查（全站内部链接爬取） | ✅ 0 死链（含页面、CSS、favicon、rss） |

### 6. 浏览器 Console

真实 Chrome 访问首页 + 文章页 + 404，5 档视口共 10 次页面加载：

- Console Error：**0 条**
- Page Error：**0 条**

---

## 未实现 / 已知限制（非 Blocker）

按需求冻结要求，以下功能**刻意未实现**（不属于缺陷）：登录、评论、点赞、分类、标签、搜索、暗色模式、分页、Newsletter、About 页面等。

已知限制：

1. `wrangler.jsonc` 中 `database_id` 为占位符，部署前必须替换为真实 D1 ID（否则线上阅读量接口会静默降级，正文不受影响）
2. `src/site.config.ts` 中 X 地址为占位值（`x.com/laoliuai`），上线前建议替换
3. 示例文章的 `wechat_url` 为示例链接

## 上线前待办（部署侧，非代码）

1. ~~创建 D1 数据库~~（本次验收后执行）
2. Cloudflare Dashboard 连接 GitHub 仓库自动部署
3. 绑定自定义域 laoliu.me
4. （建议）替换 X 占位地址

---

**最终结论：代码侧达到上线标准，无 Blocker。完成部署侧 3 项待办后即可公开上线。**

## 2026-11-09 公众号文章补录

用「佬刘AI」发表记录截图的原始日期核对知识库正文和博客已有文章。截图范围内确认 16 篇非重置消息的独立文章。10 月 11 日已划掉的视频稿与 10 月 12 日重发稿记为一篇。后台显示共发表 59 次，截图没有覆盖全部历史，一次发表也可能有多篇文章。

| 公众号发表日期 | 已补录到博客 | 正文配图 |
| --- | --- | ---: |
| 11 月 7 日 | [反重力地区错误，扫码以及其他登录问题焚决](https://www.laoliu.me/antigravity-login-troubleshooting/) | 46 处 |
| 10 月 28 日 | [DeepSeek 大肥鱼安装教程](https://www.laoliu.me/deepseek-harness-desktop-pet/) | 20 处 |
| 10 月 13 日 | [用 Codex 生成可交互的动态原理图](https://www.laoliu.me/codex-anatomy-interactive-diagrams/) | 14 处 |

反重力一篇使用账号原有的公众号排版稿。其余两篇沿用知识库正文，与公开发布版本逐段对照配图。大肥鱼的动作和聊天两组截图在发布版中各合为一张。三篇合计 80 处插图引用、72 个独立图片文件。截图未提供这三篇的微信原文地址，文章保留该字段为空。

以下 11 篇确认发过且博客缺少，知识库中能对应正文，但导出未包含完整图片文件，暂未上线。

| 公众号发表日期 | 文章 |
| --- | --- |
| 11 月 5 日 | 解决 Codex 的 Selected model is at capacity 问题 |
| 11 月 4 日 | 在 Google Antigravity 使用 Claude Opus 5.5 |
| 10 月 24 日 | 图片转可编辑 PPT，用 Codex 还原文字、图形和排版 |
| 10 月 20 日 | VS Code 安装 OpenAI 官方 Codex 插件 |
| 10 月 14 日 | Codex 连接 GitHub、谷歌验证器与仓库授权 |
| 10 月 12 日 | Codex 与 Remotion 生成动画视频（10 月 12 日重发版） |
| 10 月 9 日 | ChatGPT 生成计算器和交互图表 |
| 10 月 8 日 | ChatGPT 上传音频、录音转文字和会议纪要 |
| 10 月 7 日 | DeepSeek Harness 长期记忆 |
| 10 月 6 日 | Claude Code 接入 DeepSeek，Windows / Mac 配置 |
| 10 月 6 日 | ChatGPT Plus 自助充值教程 |

另有两篇已发表文章未能核准同一篇的完整图文，即 10 月 28 日的《GPT Plus怎么充值｜一篇文章带你搞懂！》及 10 月 10 日的《记录一下自己用AI做科研踩过的坑》。10 月 6 日的自助充值稿与 10 月 28 日的标题分别登记。

本地验收在项目内的隔离副本执行 `npm ci` 和 `npm run seo:check`。构建通过，38 篇正式文章，SEO 校验 0 个警告。另检查三个生成页面的标题、日期、站内图片、首页、RSS 和 sitemap，80 处图片引用均能解析到本地图片；暂缓文章未生成路由。

正式站于 2026-11-09 验收内容提交 `0b1571a9cfc08eded26c59bec3f369716c49ded6`。使用 `node scripts/seo-smoke.mjs --base-url https://www.laoliu.me --canonical-origin https://www.laoliu.me --env production --expected-commit 0b1571a9cfc08eded26c59bec3f369716c49ded6`，88 项全部通过。另逐篇比对正式站与本地构建的完整正文和图片顺序，并通过正常文章图片地址下载 72 个独立文件，与 Git 内容哈希全部一致。Cloudflare Workers 构建及 GitHub 的 build-and-test 均已通过。
