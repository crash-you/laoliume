# laoliu.me SEO 收尾修复报告（第三轮，2026-09-12）

任务书：`laoliume-workbuddy-next-round-2026-09-12.md`
仓库：`crash-you/laoliume`　站点：`https://laoliu.me`　分支：`seo-round1`（未合并、未部署）

---

## 1. 实际起始与结束状态

| 项 | 值 |
|---|---|
| 起始 SHA | `08ff144b35cdfec7f268fb3ed1f24b8283d9627d` |
| 审查锚点（seo-round1） | `08ff144b35cdfec7f268fb3ed1f24b8283d9627d` |
| 设计基线（main） | `6f0edda5459c668b72ba129839484d0a9eac3275` |
| 起始时 seo-round1 vs main | ahead 16 / behind 0 |
| 起始前新增提交 | 无（工作区仅未跟踪的任务书文档，已保留未动） |
| 结束 SHA | `b756de24de2aeaa16f6208b609342c5f84352b8e`（第 6 号提交；本轮 6 个提交见 §9） |
| 远端同步 | 与 `origin/seo-round1`：ahead 6、behind 0；未强推、未合并 main、未部署 |

**已存在并被验证后跳过的项**：h1–h6 降级越界（第二轮已修）、`_redirects` 自动生成（第二轮已修）、
`published:false/noindex` 策略（第二轮已修）、smoke 退出码 0/1/2（第二轮已修）。
本轮不再重复实现，仅在验证中确认仍生效。

---

## 2. 逐项修复：问题 → 修改文件 → 测试证据

### 2.1 图片路径解码（编码路径导致 width/height 缺失）

- **问题**：`rehypeImageMeta` 把 URL 编码后的 `src` 原样 `join` 到 `public/`，
  导致 2 张中文文件名图片找不到文件、拿不到尺寸：
  - `/codex-deepseek/`：`ChatGPT-Image-2026年8月28日-22_24_17.png`（实际 1922×818）
  - `/codex-long-term-memory/`：`05c-记忆状态与退役.png`（实际 1536×1024）
- **修改**：`src/lib/rehype-seo.mjs`
  - 新增导出 `resolvePublicFile(src)`：以 `new URL(src, base).pathname` 取路径 → `decodeURIComponent`
    **只解码一次** → 拒绝 `.`/`..` 路径段 → `normalize` 后校验不越出 `public/`。
  - 外链、协议相对（`//`）、相对路径、无效/截断编码（`%zz`、`%e4%b8`）均返回 `null`。
  - 保留原逻辑：已有 width/height 不覆盖、首图 eager、其余 lazy、`decoding="async"`。
- **测试证据**：
  - `node scripts/test-rehype-seo.mjs` → **31 通过 / 0 失败**（新增路径解码与边界用例）
  - 真实 dist 实测：**248/248** img 节点均有 `width`/`height`（修复前 246/248）
  - 两张目标图实测：`1922×818`、`1536×1024` ✅
  - DOM 渲染尺寸前后一致（350×149 / 350×233），无视觉变化

> **构建缓存提醒（踩坑记录）**：Astro/Vite 会缓存 markdown 模块的转换结果，
> **修改 rehype 插件后必须清 `.astro`、`node_modules/.vite`、`node_modules/.astro` 再构建**，
> 否则 dist 仍为旧结果、造成「已修复但产物未变」的假象。本轮已按此流程验证。

### 2.2 构建检查的正文与图片边界

- **问题**：`seo-check.mjs` 用 `<div class="prose">([\s\S]*?)<\/article>` 取正文，
  会把 `.post-end` 模板（作者区、代充模块、上一篇/下一篇）算进正文；构建门槛仅 80 字符，
  清空真正 `.prose` 后旧正则仍能得到 179 字符而通过。
- **修改**：`scripts/seo-check.mjs` + **新增 `scripts/html-prose.mjs`**（seo-check 与 seo-smoke 共用同一 DOM 正文定义）
  - `extractProseHtml()`：标签扫描器找 `<div class~="prose">` 的**匹配闭合 `</div>`**（处理嵌套）。
  - `extractProse()`：返回 `.prose` 子树纯文本，排除 `script`/`style`，保留代码块文字。
  - `extractProseParts()`：返回 `{length, head, middle, tail}` 三段指纹。
  - `metaTag()` / `linkRel()` / `titleTag()`：不依赖属性顺序与引号风格。
  - seo-check 正文校验改为：容器缺失 / 过短（<80）/ 以「，：、（」结尾（疑似截断）分别报错。
- **测试证据**：反例注入（复制 dist 后修改单页）
  - 清空真正 `.prose`（保留作者/导航/代充）→ **exit 1**「正文 .prose 容器缺失或过短」✅
  - 正文丢尾段（截断，以「，」结尾）→ **exit 1**「正文疑似被截断」✅
  - 未修改基线 → **exit 0** ✅

### 2.3 OG 校验覆盖实际引用

- **问题**：`seo-check.mjs` 只在 `ogImage.startsWith('/')` 时校验，而实际 14 个页面
  全部输出**绝对 URL**；等于 OG 校验形同虚设（只查了默认图存在性）。
- **修改**：`scripts/seo-check.mjs`
  - 以每页实际 `og:image` / `twitter:image` 去重后的引用为依据，`new URL(ref, DOMAIN)`
    解析并核对域名；同站图映射到 `dist` 读真实尺寸与格式；尺寸声明与实际不符即失败。
  - JSON-LD `Article.image` 引用同样核对存在性。
- **测试证据**：
  - 反例：把 `og:image` 改为不存在的 `/og/not-exist.png` → **exit 1** ✅
  - 当前 13 张 OG 图全部通过（含每篇文章的独立分享图，非只查默认图）

### 2.4 canonical 全值比较

- **问题**：只校验 canonical 是否以 `https://laoliu.me/` 开头，指向别的页面也通过。
- **修改**：`scripts/seo-check.mjs` —— 与**本页期望 URL 全值**比较（首页 `/`、404 `/404`、
  其余 `page.url`），并校验无 query/fragment、无重复。
- **测试证据**：反例：把 `/codex-buy/` 的 canonical 改为 `/codex-skill-usage/`
  → **exit 1**「canonical 不是本页期望地址」✅

### 2.5 生产/预览 smoke 的漏检（`scripts/seo-smoke.mjs` 重写）

| 子项 | 修复内容 | 反例证据 |
|---|---|---|
| 重定向链 | 记录每条 Location、检测自指与循环、区分 301/308 vs 302/307、校验最终 URL 与 origin | 循环 `/loop↔/loop2` → 失败（「重定向循环」）；302 冒充永久 → 失败 |
| 索引指令 | HTML meta 与 HTTP 头**都**解析；含 Googlebot 专用；`none` 等价 `noindex`；`nofollow` 不误判 | 仅头 noindex / Googlebot 专用 noindex / `none` → 均失败；正常页通过 |
| robots | 按 User-agent 分组 + 最长匹配评估主流爬虫；不再用「文件里有 Allow:/」证明允许 | Googlebot 被单独分组禁抓 → 失败；AI 爬虫被禁但 Googlebot/Bingbot 正常 → 通过（仅记录） |
| sitemap/RSS | Content-Type、XML 根元素（拒绝合法 XHTML 错误页）、URL 集合与本地预期比对、去重 | 合法 XHTML 错误页 → 失败；根正确但集合错 → 失败；MIME 错 → 失败 |
| 资源 | 校验真实文件魔数（PNG `89504E47`、SVG），不只 `content-type` 字符串 | 返回 HTML 却声明 `image/png` → 失败 |
| 图片/正文 | 正文改用共享 `.prose` 三段指纹；线上与本地完整文本比较 | 丢中段 → 中段指纹不匹配；丢尾段 → 尾段不匹配 |
| 参数分离 | `--base-url` 与 `--canonical-origin` 独立；生产验收 origin 必须为生产域 | 无效 `--env`、非法 origin、非法 SHA、生产误用预览 origin → 均 exit 2 并报错 |
| 退出码 | 网络错误=未验证(2)、协议/断言错误=失败(1)，两者都不伪装 exit 0 | 断网 → exit 2 且 0 通过 |

### 2.6 测试对照重建（`scripts/test-negative.mjs` 重写）

- 先构建**合格正常站点**并断言：`exit 0`、失败 0、未验证 0、通过数 ≥10。
- 再逐类注入故障，测试名与断言一一对应检查项。覆盖：
  正常整站 exit 0 / 断网 exit 2 / 重定向循环（用**确定的检查标识** `非规范入口 /loop`，
  不再用 `find(name.includes('/loop'))` 误取文章 404）/ 错误页 / 空正文 / 丢中段 / 丢尾段 /
  OG 404 / 伪 PNG / canonical 域不一致 / 302 冒充永久 / 合法 XHTML 错误页 / sitemap 集合错 /
  MIME 错 / Googlebot 分组禁抓 / AI 爬虫策略 / 仅头 noindex / Googlebot 专用 noindex /
  `none` 等价 / 正确生产页通过 / 预览带 noindex 通过 / API 缺 X-Robots-Tag / 参数校验 /
  robots 解析器单元用例 / 空截图目录非零退出。
- **结果**：**43 通过 / 0 失败**。
- 未使用 `continue-on-error`、未吞异常、未跳过失败、未削弱阈值。

### 2.7 提交标记一致性

- **问题**：`astro.config.mjs` 优先 `GITHUB_SHA`；而 `workflow_dispatch` 触发时
  `GITHUB_SHA` 是**默认分支**的 SHA，不是 `inputs.commit`——存在 mark与工作树版本不符的场景。
- **修改**：
  - `astro.config.mjs`：新增 `resolveBuildCommit()`。优先级 `BUILD_COMMIT` → `GITHUB_SHA` → `git rev-parse HEAD`；
    **`BUILD_COMMIT` 与实际 HEAD 不一致时构建硬失败并给出明确错误**。校验 SHA 合法性。
  - `.github/workflows/seo-deploy-verify.yml`：输入通过 env 传入并先校验（不拼接未校验输入到 shell）；
    checkout 后核验 `git rev-parse HEAD == inputs.commit`；构建时传 `BUILD_COMMIT`；smoke 传 `--expected-commit`。
- **测试证据**：
  - `BUILD_COMMIT=<HEAD>` 构建 → **exit 0** ✅
  - `BUILD_COMMIT=1234567`（不等）→ **exit 1**，输出
    「BUILD_COMMIT(1234567) 与实际工作树 HEAD(08ff144…) 不一致。工作流上下文 SHA 与被验收 SHA 不同…」✅
  - 工作流中「上下文 SHA 与被验收 SHA 不同」的检测说明已写入工作流注释与错误信息。

### 2.8 GA4 预览隔离

- 未删除 GA4（`G-4FRL9L21XL` 保留）。
- 本轮截图已阻断外链统计请求，**未向生产 GA4 写数据**。
- 本地/预览是否向生产属性发数据：`BaseLayout` 无条件注入，**需要环境区分**，
  但无法核实 Cloudflare 环境变量与预览路由 → 记为**站长待办**（`docs/SEO_OWNER_ACTIONS.md` 第 3 条），
  **不注入会让生产默认丢统计或 noindex 的猜测配置**，不阻塞本轮。

### 2.9 夹具测试的合格样本缺陷（最终验收时才暴露）

- **问题**：`npm run test:fixture` 失败（`seo-check` exit 1）。定位为
  `scripts/test-fixture-publish.mjs` 里 noindex 夹具文章的**正文只有 58 字符**：
  ```
  [失败] /fixture-noindex-test/: .prose 正文过短（58 字符），可能只剩模板或被截断
  ```
  第二轮时正文提取是「`.prose` → `</article>`」，会把 `post-end` 模板（作者区/代充模块/上下篇）
  一并算进正文，58 字符的真实正文因此被模板文字凑过 80 字符门槛而蒙混过关；
  本轮改为只取真实 `.prose` 子树后，**夹具自身的样本缺陷被正确暴露**。
  同时 `seoDescription` 只有 29 字符，触发一条非阻断的 description 长度警告。
- **修改**：`scripts/test-fixture-publish.mjs`
  - noindex 夹具正文补足到与正常文章一致的篇幅（并在代码注释里写明为什么不能靠放宽阈值解决）；
  - 合法夹具的 `seoDescription` 补到建议长度（消除警告，使夹具成为真正的「合格正常样本」）。
- **关键判断**：这是**夹具样本不合格**，不是站点缺陷，也**不是检查过严**。
  修法是让夹具代表合格正常文章，**没有下调 80 字符门槛、没有削弱任何断言**。
- **测试证据**：
  - 修复前：`seo-check` exit 1（上引报错），夹具测试 14 通过 / 1 失败。
  - 修复后：`node scripts/test-fixture-publish.mjs` → **15 通过 / 0 失败，exit 0**
    （含「清理后 _redirects 无残留」「清理后无夹具页面产物」「清理后 seo-check 仍通过」）。
  - 独立复核：手工放入两篇夹具文章后 `astro build` + `seo-check` → **exit 0**（0 错误 0 警告）；
    移除后 `src/content/posts/` 恢复 12 篇，无夹具残留。

---

## 3. 命令与退出码（本轮实际执行）

| 命令 | 退出码 | 说明 |
|---|---|---|
| `node scripts/test-rehype-seo.mjs` | 0 | 31 通过 / 0 失败 |
| `node scripts/test-negative.mjs` | 0 | 43 通过 / 0 失败 |
| `node scripts/seo-check.mjs`（真实 dist） | 0 | 0 错误 0 警告 |
| `node scripts/seo-smoke.mjs --base-url http://127.0.0.1:8788 --canonical-origin https://laoliu.me --env local` | 0 | 33 通过 / 0 失败 / 0 未验证 |
| `node scripts/seo-verify-ui.mjs --before …round2-before --after …round2-after` | 1（预期） | 11/12 零差异；1 张为既有店铺 URL 文本变更（见 §6） |
| `npm test` | 见 §3.1 | 汇总 |
| `npm run seo:check` | 见 §3.1 | 构建 + 产物校验 |
| `npm run test:fixture` | 见 §3.1 | 隔离发布夹具 |
| `npm ci` | 见 §3.1 | 锁文件干净安装 |

### 3.1 最终验收套件（收尾执行，本机实跑）

| 命令 | 退出码 | 结果 |
|---|---|---|
| `npm ci` | 0 | 347 packages（环境限制见下，需 `--ignore-scripts`） |
| `npm test` | **0** | `test-rehype-seo` **31 通过 / 0 失败**；`test-negative` **43 通过 / 0 失败** |
| `npm run seo:check` | **0** | 14 页 / 12 文章；sitemap 13 loc、RSS 12 item、robots、`_redirects` 12 条 308 全通过，**0 警告** |
| `npm run test:fixture` | **0** | **15 通过 / 0 失败**（含 §2.9 的夹具修复） |
| 本地 Wrangler 运行时 smoke | **0** | **33 通过 / 0 失败 / 0 未验证**；原始输出 `docs/reports/smoke-local-round3.md` |

烟测覆盖面（均为对本地运行时发真实 HTTP 请求，非静态文件判断）：12 篇文章页 + 首页三件套、
12 条非规范入口均为**单跳 308**、随机路径**真实 404**、robots/sitemap/RSS、正文图片与 OG 图
内容魔数、favicon、`/api/views/:slug` 的 `X-Robots-Tag: noindex`。

**本机环境限制（诚实记录，不计为通过项）**

1. shell 环境注入了 `http_proxy/https_proxy=127.0.0.1:53643`。npm 会读取该变量并**无限挂起**
   （日志停在 `idealTree buildDeps`），而直连 registry 正常。所有 npm 命令均在
   `unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY` 后执行。
2. 不带 `--ignore-scripts` 的 `npm ci` 在本机卡在 `sharp@0.34.5` 的 postinstall（CPU 空转、
   debug 日志停更、目录冻结）。本轮以 `npm ci --ignore-scripts --no-audit --no-fund` 完成安装；
   sharp / esbuild / workerd 的平台二进制来自各自 optionalDependencies（`@img/sharp-win32-x64`、
   `@esbuild/win32-x64`、`@cloudflare/workerd-windows-64`），构建、测试与 Wrangler 全部正常，
   上表 4 项命令与烟测均通过。**这是环境限制，未削弱任何检查、未跳过任何断言。**
3. 连续构建之间偶发 Vite/Astro 陈旧缓存导致的构建卡死（表现为 CPU 空转、`dist` 不增长）。
   清 `.astro`、`node_modules/.vite`、`node_modules/.astro`、`dist` 后可稳定复现通过；
   本轮夹具测试与最终验收均按「先清缓存再构建」执行。

---

## 4. 本轮线上重新实测（2026-09-12，不沿用历史结论）

原始响应存 `docs/reports/cloudflare-live-round3.md`。

| 请求 | 实测链路 |
|---|---|
| `https://laoliu.me/` | **301 → `https://www.laoliu.me/` → 200** |
| `https://laoliu.me/codex-buy` | 301 → `www.laoliu.me/codex-buy` → 307 → `/codex-buy/` → 200 |
| `https://www.laoliu.me/` | 200 |
| `https://laoliu.me/robots.txt` | 200，**Cloudflare Managed content，无 `Sitemap:` 行** |

**结论**：2026-09-10 记录的两个问题（apex→www 冲突、robots 缺 Sitemap）在 2026-09-12
**仍未解决**，需要站长在 Cloudflare 后台处理（§7）。

**架构说明**：本站在 Cloudflare 上是 **Workers + Static Assets**（非 Pages）。
`_redirects` 只作用于静态资源响应，**不能当作域级跳转（apex→www）的替代方案**。

**本地 Wrangler 实测**（本轮 `wrangler dev --local`，非静态文件存在性判断）：
```
/codex-buy   -> 308 -> /codex-buy/ -> 200      （永久跳转，无 www 跳转，无链）
/codex-buy/  -> 200
/no-such-xyz -> 404                             （真实 404）
/robots.txt /sitemap.xml /rss.xml /api/views/codex-buy -> 200
```

---

## 5. 修改文件清单

| 文件 | 变更 |
|---|---|
| `src/lib/rehype-seo.mjs` | 新增 `resolvePublicFile`；图片路径按 URL pathname 解析、只解码一次、防越界 |
| `scripts/html-prose.mjs` | **新增**：共享 HTML 正文/元数据解析（.prose 子树、三段指纹、meta/link 读取） |
| `scripts/seo-check.mjs` | 正文只读 `.prose`；canonical 全值比较；OG 按实际引用核对；JSON-LD image；正文图片产物断言；截断检测；解析改用 html-prose |
| `scripts/seo-smoke.mjs` | 重写：重定向链/循环、索引指令（HTML+头+Googlebot+none）、robots 分组、sitemap/RSS 集合与 MIME、图片魔数、参数校验与分离、正文字段三段指纹 |
| `scripts/test-negative.mjs` | 重写：合格正常样本 + 整站 exit 0 断言 + 全类故障注入 |
| `scripts/test-rehype-seo.mjs` | 新增路径解码与边界用例（31 断言） |
| `scripts/test-fixture-publish.mjs` | 夹具 noindex 文章补足正常篇幅、合法夹具 description 补足长度（§2.9；**未放宽任何阈值**） |
| `astro.config.mjs` | `resolveBuildCommit()`：BUILD_COMMIT 与实际 HEAD 交叉核验，不一致即构建失败 |
| `.github/workflows/seo-deploy-verify.yml` | 输入校验、checkout SHA 核验、BUILD_COMMIT 传入 |
| `docs/SEO_CONTENT_MAP.md` | 标注旧店铺待办已完成；新增「原句内链补丁」与「图片减重测量报告（仅规划）」 |
| `docs/SEO_OWNER_ACTIONS.md` | 重新实测状态；新增 GA4 隔离待办；架构与部署验收说明 |
| `docs/SEO_AUDIT.md` | 追加第三轮执行摘要与时点声明 |
| `docs/reports/ui-regression.md` | 追加第四轮重测结果 |
| `docs/reports/cloudflare-live-round3.md` | **新增**：2026-09-12 线上原始响应 |
| `docs/reports/smoke-local-round3.md` | **新增**：2026-09-13 本地 Wrangler 烟的原始输出（33/33） |
| `docs/reports/seo-round3.md` | **新增**：本报告 |
| `docs/screenshots/round2-before|after|diff/` | **新增**：本轮真实截图（不覆盖历史基线） |

未改：`src/pages/**`、`src/layouts/**`、`src/styles/global.css`、`src/site.config.ts`、
`src/content/posts/**` 正文、`public/robots.txt`——**布局/字体/间距/颜色/业务入口/文章正文零改动**。

---

## 6. UI 新旧差异

基线：原 main `6f0edda`（经逐文件比对确认与 `git show 6f0edda:` 一致）。详见 `docs/reports/ui-regression.md`。

- **11/12 页面像素零差异**；`register-mobile.png` 644 像素差异（0.0081%）。
- 该差异为页尾店铺 URL 文本 y15857–15872：`pay.ldxp.cn/shop/liu` → `wzyp.cn/shop/liu`，
  是**第一轮有意的内容变更**，与 2026-09-10 历史报告同一处，**不是本轮新增回归**。
- **本轮新增视觉变化：无。** 本轮改动均为非渲染路径。
- 两张修复图片：属性新增，渲染尺寸不变（350×149 / 350×233）。
- 截图之后本轮唯一的后续改动是 `scripts/test-fixture-publish.mjs`（**测试文件**，不进渲染路径）
  与 `docs/**` 文档，**没有任何 `src/**`、`public/**`、样式或配置改动**，
  因此上述像素结论仍然对应当前代码状态。
- 未复制 before 成 after、未提高阈值、未屏蔽区域、未把历史差异当本轮证据。

---

## 7. 站长待办（无权限事项，不伪装已验证）

1. **主域方向（最高优先级，上线前阻断）**：`laoliu.me` 现 301 到 `www.laoliu.me`，
   与代码 canonical（apex）冲突。需在 Cloudflare 统一（推荐关掉 apex→www）。
2. **robots.txt**：线上被 Cloudflare Managed content 覆盖，缺 `Sitemap:` 行。
   建议恢复 Sitemap 声明或关闭托管 robots。**不擅自放开 AI 爬虫政策。**
3. **GA4 预览隔离**：预览/本地会向生产属性发数据，需在部署配置中区分环境。
4. **GSC / Bing / 百度**：站点验证、sitemap 提交、抓取诊断——均需后台权限。
5. **Cloudflare 安全事件**：核查 Googlebot/Bingbot 是否被拦；**不全局关 WAF**。
6. **部署后验收**：用 `SEO Deploy Verify` 工作流输入实际部署 SHA 重跑 smoke。

---

## 8. 未验证事项（明确记录，不宣称通过）

- Cloudflare 后台/DNS/TLS/WAF/域级跳转/托管 robots/GA4 环境变量：**无凭据，未验证**。
- GSC / Bing / 百度后台状态：**无权限，未验证**。
- 线上 CrUX / Core Web Vitals：新站无数据，**未测量不写分数**。
- 生产部署后的 `/og/*`、308、`build-commit` 生效：**本轮未部署，属下一阶段**。
- 图片减重 41.0% / 27.7%：来自任务书独立样本，**本机未复现测量**（无 cwebp/sharp），
  **不是全站比例或加载速度承诺**。
- 中国大陆访问速度：**未测量**，不从部署平台推断。

---

## 9. 提交与合并建议

本轮改动按「一个可独立审阅的主题一组」拆成 6 个提交（均为本地提交，**未合并 main、未部署生产、未强推**）：

| # | SHA | 提交 | 内容 | 独立可审阅点 |
|---|---|---|---|---|
| 1 | `3435053` | `fix(seo): 图片路径按 URL pathname 解析…` | `src/lib/rehype-seo.mjs`、`scripts/test-rehype-seo.mjs` | 只改图片元数据解析；渲染尺寸不变的证据见 §6 |
| 2 | `452f30c` | `fix(seo): 构建检查改读真实 .prose 子树…` | 新增 `scripts/html-prose.mjs`、`scripts/seo-check.mjs` | 只改**构建期校验器**，不改页面产物 |
| 3 | `bbf20fd` | `fix(seo): 重写部署后 smoke 与反例测试对照…` | `scripts/seo-smoke.mjs`、`scripts/test-negative.mjs` | 只改**验收脚本与反例** |
| 4 | `1314c9d` | `fix(seo): 夹具样本补足正常篇幅…` | `scripts/test-fixture-publish.mjs` | 只改**测试夹具**，未放宽阈值 |
| 5 | `27673fb` | `fix(ci): 构建提交标记与实际 HEAD 交叉核验…` | `astro.config.mjs`、`.github/workflows/seo-deploy-verify.yml` | 只改构建标记与工作流；**需重点审阅**（构建期硬失败逻辑） |
| 6 | `b756de2` | `docs(seo): 第三轮报告、线上实测原文…` | `docs/**`、`docs/screenshots/round2-*` | 纯文档与证据截图 |

**结束 SHA**：第 6 号提交 `b756de24de2aeaa16f6208b609342c5f84352b8e`（本报告所在提交；
其后追加的 §9 补充提交为同一 docs 主题的收尾）。分支 `seo-round1` 相对 `origin/seo-round1`：ahead 6、behind 0。

### 是否建议合并

**建议：可以合并，但需站长先处理第 0 条域名阻塞。**

- **代码侧**：四项验收命令 + 本地 Wrangler 运行时烟测全部通过（§3.1），UI 11/12 像素零差异
  且唯一差异是既有的店铺 URL 文本变更（§6）。所有改动都在**非渲染路径**：
  `src/pages/**`、`src/layouts/**`、样式、`src/site.config.ts`、`src/content/posts/**`、
  `public/robots.txt` **零改动**，品牌要素与商业入口位置未动，未新增任何 UI 模块。
- **合并前必须先解决**：`laoliu.me` 仍 301 到 `www.laoliu.me`，而代码 canonical 全部指向 apex
  （`docs/SEO_OWNER_ACTIONS.md` 第 0 条）。**不处理就上线，规范地址会自相矛盾**，
  这比本轮修掉的所有校验漏洞都更影响收录一致性。该事项需要 Cloudflare 后台权限，
  Agent 无凭据、未操作。
- **合并后**：用 `SEO Deploy Verify` 工作流输入实际部署 SHA 重跑 smoke；
  `/og/*`、308、`build-commit` 标记需要部署后才生效，**不应要求它们在生产先返回 200 才准许合并**。
- **不建议**为了「让检查更好看」而回退本轮任何校验；本轮所有收紧都配了反例证明。

### 本轮的定位

本轮是**收尾修复 + 补齐会漏检的验收逻辑**：把「看起来通过」变成「真的能判错」。
它不提升排名、不保证收录，也不改变页面外观。价值集中在
「以后改坏了能被 CI 拦住」，而不是「这一版 SEO 分数更高」。

---

## 10. 本轮范围声明

已完成本轮全部**本地可执行**修复与验收，按要求停止：
- 未合并 main、未部署生产、未操作生产 D1、未强推。
- 未追加非必要 SEO 功能（无 llms.txt、无虚构 FAQ、无目录体系、无内容集群页、
  无自动发文、无全站索引推送、无 srcset/全站压缩大改造）。
- 未给排名/收录保证。
