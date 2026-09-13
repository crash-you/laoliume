# laoliu.me SEO 审查报告（第一轮技术改造）

- 日期：2026-09-10
- 分支：`seo/no-ui-regression`（本地分支 `seo-round1`，同一分支，见文末说明）
- 基线：`6f0edda5459c668b72ba129839484d0a9eac3275`（main）
- 站点：https://laoliu.me
- 任务性质：技术 SEO 加固，非 UI 改版。视觉冻结已通过像素级回归验证。

## 1. 执行摘要

| 项目 | 状态 |
|---|---|
| 统一 URL 生成与 308 重定向 | 已通过 |
| SEO 元数据扩展 + 12 篇逐篇补全 | 已通过 |
| OG / Twitter 分享图 | 已通过（13 张，1200×630，不渲染进页面） |
| Article JSON-LD 增强 + 首页 WebSite/Person | 已通过 |
| 404 noindex + 真实 404 状态核验 | 已通过（本地）/ 线上已通过 |
| 标题语义降级（h1 唯一化） | 已通过（4 篇修复，锚点不变，像素零差异） |
| 224 张图片 alt / 尺寸 / 懒加载 | 已通过 |
| 自动检查（seo:check / seo:smoke / seo:verify-ui / CI） | 已通过 |
| UI 回归（3 视口 × 4 页面 × 像素对比） | 已通过（12/12 无差异） |
| 线上部署 | 未执行（默认不部署，交付可审阅分支） |
| 搜索平台后台（GSC/Bing/百度） | 未验证（无权限，见站长待办） |

## 2. 基线与证据

- 基线构建：成功（12 篇文章页 + 首页 + rss.xml + sitemap.xml）。既存问题：`node_modules` 缺 `@capsizecss/unpack` 等 5 个包导致首次构建失败，`npm install` 补齐后成功；该问题与本次改动无关。
- Wrangler 本地路由实测（`--local`）：
  - `/codex-buy` → 307 → `/codex-buy/`（Workers `html_handling` 默认行为，所有选项均为 307）
  - `/codex-buy/index.html`、`/codex-buy.html` → 307
  - 随机不存在地址 → 真实 404
  - 资源、API、robots、sitemap、RSS → 200，无斜杠干扰
- 内部信号不一致（基线问题）：首页/侧栏/前后篇/RSS 链接不带斜杠，canonical/sitemap 带斜杠。
- 线上实测（2026-09-10）：非规范入口 301 两跳到规范地址（Cloudflare 先接管一跳）；`/og/*` 404（未部署）；**robots.txt 被 Cloudflare 托管内容覆盖**（详见 §5）。

## 3. 已修复项

### 3.1 URL 统一（commit c766f10）
- 新增 `src/lib/url.ts`：`postPath()` / `absoluteUrl()` / `canonicalPostUrl()`，全站唯一 URL 出口。
- 首页、侧栏、上一篇/下一篇、RSS、sitemap、canonical、og:url、JSON-LD url/mainEntityOfPage/@id 全部改为 `https://laoliu.me/<slug>/`。
- sitemap：loc 绝对化 + XML 转义；首页 lastmod 取最新文章日期（不再用构建时间冒充）；无文章时省略。
- `public/_redirects`：12 条 `/<slug> /<slug>/ 308`。已实测：文章 308、无循环、`/` 200、资源/API/404 不受影响。注意：通配形式 `/. / 308` 实测对文章路由无效且导致 `/` 自循环，不要使用。

### 3.2 SEO 元数据（commit db6f6ba）
- `content.config.ts` 新增可选字段：`seoTitle` / `seoDescription` / `image` / `imageAlt` / `noindex`。旧文章零改动即可通过。
- 12 篇文章逐篇读取正文后补 `seoTitle`/`seoDescription`（正文支持什么写什么，未编造功能、版本、价格）。原 `title`/`description` 的页面展示行为不变。
- `<title>` = `seoTitle ?? title` + ` - 佬刘AI`；meta description 优先 `seoDescription`，回退 `description`。
- 首页 SEO 标题改为「佬刘AI - ChatGPT、Codex 使用教程与 AI 实操」（仅 head 元数据；左栏「佬刘」、简介、目标宣言未动）。

### 3.3 分享图与结构化数据（commit db6f6ba）
- `scripts/og-image.mjs` 生成 13 张 1200×630 分享卡（12 篇 + 默认图），存 `public/og/`，系统字体、品牌色 `#c9a227`，不渲染进任何页面。
- BaseLayout 补 `og:image`（含 width/height/alt）、`twitter:image`、`twitter:card=summary_large_image`、`twitter:site=@laoliuai`（已确认账号）。
- 文章 Article JSON-LD 补：`@id`、`author.url`（`/#author`）、`inLanguage: zh-CN`、`isPartOf`（`/#website`）、`image`（指向文章真实分享图）。
- 首页补 WebSite + Person JSON-LD（数组），`sameAs` 仅列已确认的 X 账号。
- JSON-LD 安全序列化：`<`/`>`/`&` 转义，输出全部可 `JSON.parse`（已验证）。
- 未添加：FAQ / Review / Product / 评分 / SearchAction / BreadcrumbList（正文没有对应内容，不堆 schema）。

### 3.4 索引控制（commit db6f6ba、96494a8）
- BaseLayout 增加 `noindex` 参数；404 页显式 `noindex`。本地实测随机地址为真实 404 状态码（非首页 200）。
- 阅读量、公众号首发行、文章末尾作者推广区加 `data-nosnippet`（均为 span/p/div，Google 支持）。
- `noindex: true` 的文章：页面仍生成，但排除出 sitemap 与 RSS（本站发布策略）。
- 阅读量 API 响应增加 `X-Robots-Tag: noindex`（JSON 非 HTML，用 HTTP 头而非 meta）。
- 生产站 HTML 无 noindex（seo:check 硬错误校验，正式页面出现 noindex 即失败）。

### 3.5 语义与图片（commit a5dc1c6）
- 新增 `src/lib/rehype-seo.mjs` 两个构建期 AST 插件（不碰 markdown 源码，代码块内容不受影响）：
  - **标题降级**：正文含 h1 的文章（4 篇：from-0-to-1-chatgpt、vibe-coding-practice、codex-custom-memory-skill、codex-chinese-settings 误报除外——其 h1 在代码块内，未处理）整篇 h1→h2、h2→h3、h3→h4，加 `rh1/rh2/rh3` 类。
  - **图片元数据**：读取 `public/` 真实固有尺寸补 `width`/`height`；全部 `decoding=async`；首图外 `loading=lazy`。
- `global.css` 末尾追加作用域受限兼容规则（`.prose h2.rh1` 等，含移动端断点镜像）——不改任何既有规则。经 computed style 与全页截图双重验证零视觉差异。
- 锚点兼容：Astro 的标题 id 由文本生成，与层级无关。已验证降级前后 id 逐个一致（如 `#一-google版`）。
- 224 张图片逐张看图（14 张标注表）后补准确 alt：`image.png` 类文件名描述全部替换；信息图、对话截图、界面截图分类描述，未猜图、未塞关键词。
- 未删除任何原图；未压缩图片（教程截图清晰度优先，压缩与 srcset 留待有测量数据后决策）；显示尺寸与排列未变（`.prose img` 原有 `max-width:100%;height:auto`，属性只提供比例信息减少 CLS）。

### 3.6 自动检查（commit 3ae9ea4）
- `npm run seo:check`：构建 + 真实产物校验（详见脚本头注释，约 40 项断言）。当前结果：已通过（0 警告）。
- `npm run seo:smoke -- --base-url https://laoliu.me`：线上真实 GET。当前结果：22 通过 / 3 失败（`/og/*` 404、robots 缺 Sitemap——均为待部署或站长待办）/ 0 未验证。
- `npm run seo:verify-ui`：像素级截图对比。当前结果：12/12 无差异。
- `.github/workflows/seo.yml`：push 时锁文件安装 + 构建 + seo:check；main 分支额外跑线上 smoke（网络失败标记未验证，不静默通过）。

## 4. 测试报告

| 测试 | 命令 | 结果 |
|---|---|---|
| 基线构建 | `npm run build`（6f0edda） | 已通过（先修复既存的依赖缺失） |
| 当前构建 | `npm run build` | 已通过 |
| 产物 SEO 校验 | `npm run seo:check` | 已通过（0 错误 0 警告） |
| 线上 smoke | `node scripts/seo-smoke.mjs --base-url https://laoliu.me` | 22 通过 / 3 失败（待部署/站长待办） |
| UI 回归 | `npm run seo:verify-ui` | 已通过（12/12 像素零差异） |
| 几何对比 | `node scripts/diag-diff-geometry.mjs`（390px） | docHeight 相等（20404=20404），217 元素几何一致 |
| H1 唯一性 | seo:check 内置 | 14 页每页恰好 1 个 h1 |
| 禁 JS 可读 | 产物文本抽取 | 通过（正文 3511+ 字符静态存在） |
| JSON-LD 解析 | seo:check 内置 | 全部可 parse，url 与 canonical 一致 |
| 308 重定向 | curl（wrangler dev） | 12 篇全部 308，无循环 |

截图（前后各 12 张，3 视口 × 4 页面，mock 阅读量=42）：`docs/screenshots/before/`、`docs/screenshots/after/`。注：before 截图采集自基线 commit 的独立构建（`F:\xm\AI\blog-baseline`，端口 8789），与 after（当前分支，端口 8788）使用完全相同的截图脚本（含懒加载滚动触发），保证方法一致。

## 5. 发现的线上问题（站长决策）

1. **robots.txt 被 Cloudflare 托管内容覆盖**：线上 robots.txt 不再包含 `Sitemap: https://laoliu.me/sitemap.xml`，且对 GPTBot、ClaudeBot、Google-Extended、CCBot 等 9 个 AI 爬虫全站 Disallow。这是 Cloudflare 后台（可能是「内容信号/robots.txt 托管」类开关）的行为，不是仓库文件问题（仓库 `public/robots.txt` 正确）。是否放开 AI 爬虫是站长商业决策；但 **Sitemap 声明丢失建议修复**。详见 `docs/SEO_OWNER_ACTIONS.md`。
2. 线上非规范入口是 301 两跳（Cloudflare 先 301 到规范域，再由 Workers 跳斜杠）。部署 `_redirects` 后会变成一次 308。两跳非理想但可用；Cloudflare 域级跳转属站长配置。
3. `from-0-to-1-chatgpt.md` 正文含历史店铺链接 `https://pay.ldxp.cn/shop/liu`（当前配置为 `https://wzyp.cn/shop/liu`）。按任务书不改正文，已列入内容规划待站长确认。

## 6. 保留风险与未验证项

- **未验证**：Search Console / Bing / 百度后台状态（无权限）；线上 CrUX / Core Web Vitals 真实用户数据（新站无数据，未测量不写分数）；生产部署后的 `/og/*` 与 308 生效（未部署）。
- **保留风险**：Cloudflare 托管 robots 的爬虫策略可能影响 AI 引擎发现（站长决策）；`_redirects` 需随部署生效，若站长手动在 Cloudflare 配了跳转规则需避免叠加。
- 中国大陆访问表现：未测量，不从部署平台推断。

## 7. 分支与提交说明

工作分支为 `seo/no-ui-regression`。开发过程中发现本机环境的 git 会周期性删除 `refs/heads/seo/` 目录形式的分支引用（IDE git 集成干扰），因此同时以顶层引用 `seo-round1` 指向同一提交链。两个名字指向完全相同的提交历史：

```
3ae9ea4 feat(seo): 自动检查命令与 CI
a5dc1c6 fix(seo): 标题语义降级保视觉、224 张图片补真实 alt 与尺寸/懒加载
96494a8 feat(seo): 阅读量 API 增加 X-Robots-Tag: noindex
db6f6ba feat(seo): SEO 元数据、OG/Twitter 分享图、JSON-LD 与索引控制
c766f10 feat(seo): 统一 URL 生成与 308 永久重定向
f9730de chore(seo): 阶段A基线——URL 清单、构建与路由实测记录、修改前截图
6f0edda（main 基线）
```

推送时请使用 `seo-round1`（若 `seo/no-ui-regression` 在你的环境稳定存在，二者等价）。

---

## 第二轮：审查修复（2026-09-10，提交 bbcc250..c3c742f）

针对 `laoliume-workbuddy-review-fixes.md` 的修复，摘要：

| 项 | 内容 | 验证 |
|---|---|---|
| 标题转换越界 | rehype-seo 改用 h1-h6 安全映射，单次遍历，不生成 undefined/h7 | `npm run test:rehype` 14 断言通过 |
| 新增即发布 | _redirects 构建期按真实产物自动生成；分享图可选回退默认图；og-image 过滤草稿 | `npm run test:fixture` 15 断言通过 |
| 检查脚本 | smoke 退出码 0/1/2、base-url/canonical-origin/env 分离、X-Robots-Tag、.prose 正文指纹、真实 XML/JSON 解析；check 的 noindex 策略；verify-ui 校验完整 4×3 集合 | `npm run test:negative` 9 反例通过 |
| CI 拆分 | 构建/PR 测试真实失败；新增 workflow_dispatch 部署后验收（build-commit 标记核验） | 见 .github/workflows/ |
| UI 回归 | main vs 最终代码：11/12 页零差异，register-mobile 644 像素（店铺链接 URL 有意变更） | `docs/reports/ui-regression.md` |
| Cloudflare/业务 | 发现 www 301 冲突（上线前阻断项）、robots 被 Managed Content 覆盖、店铺链接统一 wzyp.cn | `docs/reports/cloudflare-verification.md` |

上线前必须处理（详见 docs/SEO_OWNER_ACTIONS.md 第 0 条）：**主域 laoliu.me 被 301 到
www.laoliu.me，与代码 canonical 冲突**，需站长在 Cloudflare 统一主域方向。

---

## 第三轮：收尾修复（2026-09-12，独立审查后的有边界收尾）

> **时点声明**：本文件前述第一轮/第二轮的结论（224 张图片、12/12 零差异、22 通过/3 失败等）
> 记录的是 **2026-09-10 的实测结果**，保留作为历史证据，**不代表 2026-09-12 的当前状态**。
> 本轮已重新实测，当前结论见下方表格与本轮独立报告。

**本轮起点/终点**
- 起始：`08ff144b35cdfec7f268fb3ed1f24b8283d9627d`（seo-round1，审查锚点）
- 设计基线：`6f0edda5459c668b72ba129839484d0a9eac3275`（main）
- 起始时 seo-round1 相对 main：ahead 16 / behind 0；本轮开始前**无新增提交**，工作区仅有未跟踪的任务书文档。

**修复项摘要**

| # | 问题（独立审查确认） | 修改文件 | 验证 |
|---|---|---|---|
| 1 | 编码路径图片无 width/height（2 张） | `src/lib/rehype-seo.mjs` | 新增 `resolvePublicFile`（URL pathname 解析、只解码一次、防越界）；`test-rehype-seo` 31 断言；dist 实测 248/248 图片有尺寸，两张恢复 1922×818 / 1536×1024 |
| 2 | seo-check 正文用「.prose→</article>」正则，混入 post-end | `scripts/seo-check.mjs` + 新 `scripts/html-prose.mjs` | 改为真实 `.prose` 子树；空正文/截断/丢中尾段反例均判失败 |
| 3 | OG 校验只看 `ogImage.startsWith('/')`，实际全是绝对 URL | `scripts/seo-check.mjs` | 改为核对每页实际 `og:image`/`twitter:image`/JSON-LD image 引用；缺图/尺寸不符反例判失败 |
| 4 | canonical 只查域名前缀 | `scripts/seo-check.mjs` | 改为与本页期望 URL 全值比较；404 期望 `/404` |
| 5 | smoke 用固定脚本硬编码、漏重定向链/索引指令/robots 分组 | `scripts/seo-smoke.mjs` | 重写：完整跳转链+循环检测、HTML/HTTP 头索引指令（含 Googlebot 专用、none 等价）、robots 按 UA 分组评估、sitemap/RSS 集合与 MIME、图片魔数、参数分离与校验 |
| 6 | 反例测试的 normal 样本不合格、缺整站 exit 0 断言 | `scripts/test-negative.mjs` | 重写：先断言正常站点 exit 0，再逐类注入故障（新增中段/尾段、伪 PNG、Googlebot 专用 noindex、robots 分组、sitemap 集合、参数校验等）43 断言通过 |
| 7 | GITHUB_SHA 优先级与工作流 inputs.commit checkout 不一致 | `astro.config.mjs` + `.github/workflows/seo-deploy-verify.yml` | 以 `BUILD_COMMIT` 交叉核验实际 HEAD，不一致则构建硬失败；工作流加输入校验与 checkout 后 HEAD 核验 |
| 8 | GA4 无预览隔离 | `docs/SEO_OWNER_ACTIONS.md` 第 3 条 | 记录待办；本轮截图已阻断外链统计，未污染生产 GA4 |

**本轮线上重新实测（2026-09-12，不沿用历史结论）**
- `https://laoliu.me/` → **301 → `https://www.laoliu.me/` → 200**（apex→www **仍未解决**）
- `https://laoliu.me/codex-buy` → 301 → www → 307 → `/codex-buy/` → 200
- `https://laoliu.me/robots.txt` → 200，**仍为 Cloudflare Managed content，无 `Sitemap:` 行**
- 原始响应：`docs/reports/cloudflare-live-round3.md`

**UI 回归（本轮重测，基线为原 main 6f0edda）**
- 12 张截图（4 页面 × 3 视口）：**11/12 像素零差异**
- `register-mobile.png`：644 像素差异，位置 y15852（页尾店铺 URL 文本），
  内容为 `pay.ldxp.cn/shop/liu` → `wzyp.cn/shop/liu`——**第一轮有意的内容变更**，
  与 2026-09-10 历史报告同一处（历史记录 644 像素、同一 y 区间）。
  **不是本轮新增回归。**
- 两张修复图片：渲染尺寸前后完全一致（350×149 / 350×233），仅新增属性，无视觉变化。

**本轮未验证 / 待站长操作**（不伪装通过）
- Cloudflare 后台（DNS/TLS/WAF/域级跳转/托管 robots/GA4 环境变量）：无权限，未验证。
- GSC / Bing / 百度后台：无权限，未验证。
- 线上部署与部署后 smoke：本轮不部署，属下一阶段。

