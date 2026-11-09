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

首轮核对时还有以下 11 篇确认发过且博客缺少。压缩包没有附带完整配图，首轮暂缓；后续处理见下方「飞书知识库图文补录」。

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


## 2026-11-09 飞书知识库图文补录

公众号发表记录用于确认是否发过及发表日期，作者公开的「佬刘AI」飞书知识库和本次 Markdown 导出用于核对正文、插图位置和视频。图集顺序与导出中的图片编号逐一核准，博客直接提供文件，不依赖飞书登录或临时图片地址。

| 原发表日期 | 博客文章 | 正文插图 |
| --- | --- | ---: |
| 2026-11-05 | [解决Codex的【Selected model is at capacity】问题](https://www.laoliu.me/codex-selected-model-at-capacity/) | 14 |
| 2026-11-04 | [Claude又封号？我在谷歌Antigravity里用上了Opus 5.5！附完整教程](https://www.laoliu.me/antigravity-claude-opus-setup/) | 45 |
| 2026-10-24 | [图片转可编辑PPT ｜ 用 Codex 还原文字、图形和排版](https://www.laoliu.me/codex-image-to-editable-ppt/) | 13 |
| 2026-10-20 | [VS Code 接入 ChatGPT 教程：安装 OpenAI 官方 Codex 插件，登录账号就能用](https://www.laoliu.me/vscode-chatgpt-codex-extension/) | 8 |
| 2026-10-14 | [Codex 怎么连接 GitHub？谷歌验证器、双重验证、仓库授权完整教程](https://www.laoliu.me/codex-connect-github-2fa/) | 15 |
| 2026-10-12 | [Codex做视频教程：从0开始，手把手教你用Remotion生成动画！（附通用提示词）](https://www.laoliu.me/codex-remotion-animation/) | 31 |
| 2026-10-09 | [ChatGPT 新功能教程：一句话生成计算器、交互图表，GPT-6 这次更新有点意思！](https://www.laoliu.me/chatgpt-interactive-calculators-charts/) | 13 |
| 2026-10-08 | [ChatGPT终于能直接上传音频了！录音转文字、会议纪要、访谈总结，一次搞定](https://www.laoliu.me/chatgpt-audio-upload-transcription/) | 11 |
| 2026-10-07 | [DeepSeek Harness 长期记忆教程｜让 AI 记住你的项目，不用每次重新解释](https://www.laoliu.me/deepseek-harness-project-memory/) | 13 |
| 2026-10-06 | [Claude Code 接入 DeepSeek 教程｜Windows / Mac 配置，直接使用 DeepSeek API](https://www.laoliu.me/claude-code-deepseek-setup/) | 15 |

共补录 10 篇、178 张原图。Remotion 教程还包含原稿中的 15 秒、1920 × 1080 演示视频；使用飞书附件下载的原文件，大小与导出记录一致（1,879,292 字节）。10 月 11 日已撤回的首发没有重复收录。正文来源为已确认对应的知识库文章；没有从公众号原文取得的微信链接留空。

10 月 6 日的《ChatGPT Plus 自助充值教程》按作者要求暂不上线，文章和图片均未加入仓库。10 月 28 日的《GPT Plus怎么充值｜一篇文章带你搞懂！》与 10 月 10 日的《记录一下自己用AI做科研踩过的坑》仅有已发表的记录，尚未找到能确认对应的完整稿。Codex 额度重置消息继续排除。两轮合计处理截图范围内的 16 篇：13 篇已补录、1 篇暂缓、2 篇待原稿。此次未取得完整 59 次发表记录。

本地验收：在隔离副本执行 `npm ci`、`npm run seo:check`，48 篇正式文章，0 个警告。逐篇核对标题、原发表日期、正文图片顺序、首页、RSS 和 sitemap；178 张图片均可解码，所有图片及 MP4 与源文件逐字节一致（合计 31,600,975 字节）。

正式站验收的内容提交为 `cad2c6d94f4f4e9e609e82876629fa067658a402`。运行 `node scripts/seo-smoke.mjs --base-url https://www.laoliu.me --canonical-origin https://www.laoliu.me --env production --expected-commit cad2c6d94f4f4e9e609e82876629fa067658a402`，108 项通过，0 项失败、0 项未验证。另从正式站读取 10 篇完整正文，核对原日期、首页、RSS、sitemap、图片顺序和视频控件，并下载全部 179 个媒体文件，与知识库来源逐字节比对通过。

## 2026-11-09 16:58（北京时间）搜索可达性复查

用 HTTPS GET 读取正式域名，将首页文章链接和 sitemap 的 `loc` 与本地 48 篇公开文章的 slug 对照，再逐个访问差集中的规范网址。响应头的 `CF-Ray` 后缀均为 `LAX`。

| 检查项 | 实测结果 |
| --- | --- |
| 首页、sitemap 和补录文章 | 此节点首页列出 38 篇，HTML 构建标记为 `86f3a22`。站点地图列出 41 个网址，含首页、工具、服务及 38 篇文章。比本地少的 10 篇逐一 GET 均为 404，响应头均为 `CF-Cache-Status: HIT`。此结果与上方同日新版验收记录有差异，原因待核。 |
| 爬虫规则 | GET `/robots.txt` 返回 200，包含正确的 Sitemap 声明。Cloudflare 托管区块为 `Baiduspider` 指定 `Disallow: /`。若以百度为目标渠道，这项检查未通过。 |
| 规范网址与错误状态 | 抽查 `https://laoliu.me/codex-deepseek/` 首跳为 301，目标是 www 同路径。`https://www.laoliu.me/codex-buy` 首跳为 308，补尾斜杠后为 200。随机不存在路径返回 404。 |

复查时可从两个不同网络运行 `curl -sSi https://www.laoliu.me/codex-selected-model-at-capacity/`，核对状态码、节点后缀和 HTML 的 `build-commit`，再读取 `/sitemap.xml` 核对公开网址。验收条件为此批 10 篇在两个网络均返回 200，首页和站点地图能找到全部 48 篇。搜索引擎实际收录情况需另查站长平台。

排查结果：GitHub 的 Cloudflare Workers Builds 记录（北京时间）显示，48 篇版本 `cad2c6d` 于 16:25 成功，后继提交 `4712253` 于 16:29 成功。只有 38 篇的旧提交 `86f3a22` 于 16:51 才完成一次构建，随后正式站 GET 返回的正是这个旧版本。GitHub 的 main 仍在 `4712253`，10 篇原稿与原路径完整。公开记录能核实版本发布次序倒置，未说明旧任务因何延迟。[旧提交的构建记录](https://api.github.com/repos/crash-you/laoliume/commits/86f3a22/check-runs?filter=all) · [新提交的构建记录](https://api.github.com/repos/crash-you/laoliume/commits/4712253/check-runs)

## 2026-11-09 文章恢复与办公专题验收

通过原 Git 发布流程重新部署 `7b19046`。洛杉矶节点核验全部 48 个原文章地址的 HTTP 200、规范网址与构建标记，首页恢复 48 个入口，站点地图恢复 51 个网址。另从德国 Falkenstein 发起独立 HTTPS GET，缺失的 10 篇全部返回 200 且带有 `7b19046` 构建标记。

在项目内隔离副本运行 `npm ci`、`npm test`、`npm run test:fixture`、`npm run seo:check`，全部通过，构建产物含 48 篇原文章及办公专题。用本地 Wrangler 和独立浏览器在 390px、1440px 两种宽度从首页进入专题，逐篇走通 7 篇教程及面包屑回链、截图重建到验收工具、Excel 到订单案例、两个 ZIP 下载及配图加载。专题无尾斜杠入口单跳 308。Wrangler 的生产上传前检查在隔离环境中对旧 main 提交退出 1，对当前 main 提交 dry-run 退出 0。

正式站版本 `d1a0e36948ea5f137cc40a747877fd625aa4fd48` 已在洛杉矶和德国节点返回办公专题。洛杉矶逐一核对 48 个文章原网址、HTTP 200、原规范地址和提交标记，全部通过。首页含专题入口，sitemap 共 52 个网址，德国另核对 PPT 重建和订单案例的版本一致。运行 `node scripts/seo-smoke.mjs --base-url https://www.laoliu.me --canonical-origin https://www.laoliu.me --env production --expected-commit d1a0e36948ea5f137cc40a747877fd625aa4fd48`。首次结果为 108 项通过、1 项未通过，唯一未通过项为 Cloudflare 前置的百度禁抓规则；来源文件中百度已允许。Googlebot、Bingbot 对公开页面的规则检查通过。

站长确认优先开放百度后，已关闭 laoliu.me 的 Cloudflare Bot Preference Sync。源站托管爬虫声明，保留 `ai-train=no` 与原先其余爬虫的限制；关闭同步会取消该功能对纯训练爬虫的自动边缘拦截。洛杉矶和德国节点重新 GET `/robots.txt`，均为 200，内容与源文件一致，只有一组 Baiduspider 规则，结果为 `Allow: /`。以同一参数重跑正式站 smoke，**109 项通过，0 项失败，0 项未验证**。

在独立浏览器会话读回 Cloudflare Worker `laoliume` 的生产部署命令为 `node scripts/verify-production-head.mjs && npx wrangler deploy`。旧提交缺少该脚本时也会停在上传之前。预览版本命令仍使用 `npx wrangler versions upload`。

## 2026-11-09 首页极简排版验收

在项目的隔离副本运行 `npm run seo:check`，通过，0 个警告。将构建产物与改版前正式站的 HTML 和 sitemap 逐项比较：48 个文章链接及其顺序完全相同，52 个 sitemap 地址也完全相同。

以本地 HTTP 服务提供构建产物，用 Chrome 在 1440×900、390×844、320×568 三种视口检查首页。桌面最新标题与作者名位于同一行；两种手机宽度的第一篇标题均完整出现在首屏。三个视口均无横向溢出，教程链接默认带下划线，Tab 键可聚焦且焦点可见。用桌面键盘和手机尺寸点击分别从首页进入专题，再进入 PPT 和 Excel 教程，均到达原规范网址。专题保留 7 篇教程。本轮本地验收无未通过项。

## 2026-11-09 PPT 和 Excel 教程目录

在项目隔离副本运行 `npm run seo:check`，通过，0 个警告。比较改版前正式站和构建产物：专题保留 7 个文章原址，首页 48 个文章入口及顺序相同，sitemap 的 52 个地址完全一致。逐篇确认原文章中保留指回专题的链接；专题上的检查器返回 200，两个样例下载均为 ZIP。

用 Chrome 通过本地 HTTP 服务检查 1440×900、390×844、320×568 三种视口。桌面两类教程并排，手机单栏，所有尺寸首屏内都能看到 PPT 和 Excel 的文章入口，无横向溢出。键盘焦点可见，从首页到专题、进入截图重建或订单核对文章、沿面包屑返回均通过。原有 `#ppt` 和 `#spreadsheets` 深链接均能定位对应章节。无未通过项。

## 2026-11-09 文章阅读、内链和首页请求

在项目隔离副本执行 `npm test`、`npm run seo:check`、`npm run test:fixture` 和 `tsc --noEmit`。均通过，构建校验 0 个警告。对比改版前的正式站，首页仍列出原 48 篇文章且顺序一致，sitemap 中的 52 个地址一致。47 篇有三个以上同级主章节的文章显示目录，桌面和手机共 692 条目录链接逐项对应真实标题。8 份旧文章 HTML 中的 85 个元素 ID 均保留。48 篇的作者链接能定位到首页简介，文章预览图及所标尺寸与实图一致。

以本地 Wrangler 和空白隔离 D1 启动构建产物。Chrome 在 1440×900、390×844、320×568 三种视口首次打开首页均只发一个计数请求，全部 48 项返回数值。首次读空库为零，并发三次计数返回连续值，同一浏览器六小时内重访未重复计数。走通首页、专题、文章目录、页尾上一篇以及 404 返回首页。订单与售后两张表的表头和正文列边界对齐。两张大首图选用无损 WebP，原 PNG 仍可访问，解码 RGB 逐字节相同，合计少传 1,314,645 字节。未发现未通过项。
