# 站长待办（必须由站长完成的操作）

> **2026-09-13 更新**：新增 5 篇文章（共 17 篇）并已推送 main（`109a33d`）、线上已部署
> （实测线上 `build-commit` = `109a33d`，Cloudflare Git 自动部署已生效）。
> 部署后重跑线上 smoke：**43 项中 37 项失败，全部归于第 0 条（apex→www 301）与第 1 条
> （robots 被托管覆盖）两个根因**——17 篇文章 × 2 类检查 + 首页 + 正文图片取样 + robots。
> 失败项数量随文章数增长属正常，不是新增问题；`sitemap.xml` / `rss.xml` / `OG 分享图` /
> `favicon` / `阅读量 API` / `随机 404` 均已通过。
> 结论：**第 0 条（apex→www）与第 1 条（robots 被托管覆盖）仍未解决，是当前唯一阻塞项。**

以下事项需要站长账号 / DNS / Cloudflare 后台权限，Agent 无法执行。每项附验收方式。完成一项勾一项。

## 0. 主域冲突：laoliu.me 被 301 到 www.laoliu.me（上线前必须解决，优先级最高）

**现状（2026-09-13 重新实测，非历史结论）**：
```
https://laoliu.me/                     -> 301 -> https://www.laoliu.me/                     -> 200
https://laoliu.me/images/codex-buy/image-1.png -> 301（text/html）-> www 上才是真实 PNG
https://www.laoliu.me/                 -> 200
```
**这个 301 的来源是站长在 Cloudflare 配置的 root → www 重定向规则**
（见本站文章《个人博客网站怎么搭建》第十节「C：root → www 重定向」）。
而代码 `site: 'https://laoliu.me'`、canonical、sitemap、OG 全部指向**不带 www 的 laoliu.me**。
结果：**canonical 指向一个会被 301 到 www 的地址**，搜索引擎会看到规范地址自相矛盾，
是当前最影响收录一致性的问题。`_redirects` 只能消除第二跳（非规范入口 307→308），
无法消除第一跳（apex→www）——`_redirects` 只作用于静态资源响应，不是域级跳转的替代。

**操作（二选一，站长决策）**：
1. **方案 A（推荐，改动最小）**：Cloudflare → Rules → Redirect Rules，删除/停用
   `root → www` 那条 301 规则；再确认 Workers & Pages → `laoliu-blog` → Settings →
   Domains & Routes 里 **`laoliu.me` 和 `www.laoliu.me` 都已绑定**该 Worker。
   让 `https://laoliu.me` 直接 200，成为唯一规范域，与代码一致。
2. **方案 B**：若坚持用 www 为主域，则需改代码 `site`/canonical/sitemap/OG 全部换成
   `https://www.laoliu.me`（需要一轮代码改动，Agent 可协助）。

**验收**：`curl -sI https://laoliu.me/` 返回 200（不再 301 到 www），或代码 canonical 与线上主域完全一致。

## 1. Cloudflare：robots.txt 被托管内容覆盖（Content-Signal 功能）

**现状（2026-09-13 重新实测）**：
`https://laoliu.me/robots.txt` 返回 Cloudflare「Managed Content / 内容信号」生成版本（含
`# BEGIN Cloudflare Managed content`），仓库 `public/robots.txt` 的内容未出现在响应中：
- **丢失 `Sitemap: https://laoliu.me/sitemap.xml` 声明**（2026-09-13 实测：响应中无 `sitemap:` 行）；
- 含 `Content-Signal: search=yes,ai-train=no,use=reference`（允许搜索，禁止 AI 训练）；
- 对 Amazonbot / Applebot-Extended / Bytespider / CCBot / ClaudeBot /
  CloudflareBrowserRenderingCrawler / Google-Extended / GPTBot / meta-externalagent 全站 Disallow。

**关键区分**：`Googlebot`、`Bingbot` 不在 Disallow 列表内，**搜索引擎收录不受阻**；
被禁的是 AI 训练/扩展类爬虫。这是「搜索抓取 vs AI 训练」两类策略，不是全站屏蔽。

**操作**（站长决策）：
1. 是否放开 AI 爬虫是商业决策，Agent 不擅自关闭防护。**不要为了 SEO 关闭 WAF 或 AI 防护。**
2. **Sitemap 声明建议恢复**：在 Cloudflare 托管 robots 配置里加回 Sitemap 行，或关闭该
   Content-Signal 托管让仓库 robots.txt 生效。
3. 注意：不应「同时在 robots 里阻止抓取、又指望爬虫去读页面 noindex」——二者冲突。

**验收**：`curl -s https://laoliu.me/robots.txt | grep -i sitemap` 有输出。

## 2. 部署本分支（审阅后）— ✅ 已完成（2026-09-13）

**状态**：`seo-round1` 已通过 PR #1 合并进 main（合并提交 `30a484e`）；main 已推进到 `109a33d`
（新增 5 篇文章），并已部署。**实测线上 `build-commit` = `109a33d`，Cloudflare 的
Git→Worker 自动部署已生效（push 即上线）**，无需再手动 `npm run deploy`。

**验收**（部署后，用手动工作流 `SEO Deploy Verify`，输入部署的**完整 40 位**提交 SHA；或本地）：
```bash
node scripts/seo-smoke.mjs --base-url https://laoliu.me --canonical-origin https://laoliu.me \
  --env production --expected-commit <40位SHA> --out docs/reports/smoke-deploy-verify.md
```
> 2026-09-13 实测：`build-commit` 标记一致性 ✅；`sitemap.xml`/`rss.xml`/`OG`/`favicon`/API ✅；
> 其余失败项全部来自第 0、1 条，非部署问题。
重点确认：线上 `build-commit` 标记 == 部署的完整 SHA；robots Sitemap 行恢复；非规范入口 308；
正文头/中/尾三段指纹与本地构建一致（三段指纹比较，非完整文本逐字比较）；`/og/*` 与新增编号分享图返回 200。

> 注意：不要把「部署前旧站的 smoke 结果」当作新版本验收。新 OG 图与 `_redirects`
> 需要部署后才生效，**不应要求它们在生产先返回 200 才准许合并**。

## 3. GA4 预览/本地隔离（本轮新增待办，非阻塞）

**现状**：`src/layouts/BaseLayout.astro` 会无条件注入 GA4（`G-4FRL9L21XL`）。
本地 `wrangler dev` 与任何公开预览部署都会向**生产 GA4 属性**发数据，污染统计。

**本轮已做**：截图脚本 `scripts/seo-screenshot.mjs` 在截图时阻断外链统计请求，且不触碰生产阅读量
（`/api/views/*` 走本地 mock），因此**本轮验收没有向生产 GA4 写数据**。

**未做（需站长确认后定方案，本轮不注入猜测配置）**：
- 若预览/本地需要彻底隔离，建议在部署配置（Cloudflare 环境变量 + 构建期 `gaMeasurementId`）
  中区分环境：预览构建置空或使用独立属性 ID。
- Agent 无法核实 Cloudflare 生产环境变量与预览路由配置，**不擅自改动**，以免生产默认丢失统计。

**验收**：预览域页面无 `googletagmanager` 请求，或使用独立 GA4 属性；生产首页仍有正确 `G-4FRL9L21XL`。

## 4. Google Search Console

**操作**：
1. https://search.google.com/search-console 用「网域」资源方式验证 `laoliu.me`（后台会给 TXT 记录，去 DNS 服务商添加）。
2. 提交 `https://laoliu.me/sitemap.xml`。
3. 对首页和 `/codex-buy/` 做 URL 检查，记录「用户声明的 canonical」vs「Google 选择的 canonical」、抓取与索引状态。

**验收**：GSC「网页索引编制」报告能看到提交的 URL；无「重复网页（用户未指定规范）」类问题。
未完成前记录「未验证」。**不要求所有 URL 在固定天数内被索引。**

## 5. Bing Webmaster Tools

**操作**：https://www.bing.com/webmasters 手工验证，或从已验证的 GSC 导入；提交/核对 sitemap。

**验收**：Bing 后台 sitemap 状态为「成功」，URL 检查能抓取首页。

## 6. 百度搜索资源平台

**操作**：
1. https://ziyuan.baidu.com 完成站点验证（文件验证 key 会需要放进 `public/`，下次构建带上；或 HTML 标签验证可临时手动加）。
2. 提交普通收录 sitemap：`https://laoliu.me/sitemap.xml`。
3. 用「抓取诊断」确认百度蜘蛛能抓到正文（重点验证中国大陆访问与 Workers 链路）。

**注意**：普通收录的 sitemap/API 配额与账号等级相关，以后台实际显示为准。同时人工测一下中国大陆访问 laoliu.me 的速度（不要从「Cloudflare」这个名字推断快慢）。

**验收**：抓取诊断返回正文内容；sitemap 显示已抓取。

## 7. Cloudflare 防护与爬虫放行检查（按日志）

**操作**：Cloudflare → Security → Events，按 User-Agent 过滤 `Googlebot` / `Bingbot`，看是否有被 Challenge/Block 的记录。若有，用「已验证的机器人」规则放行（Cloudflare 有验证 Googlebot 真伪的能力）。**不要全局关 WAF，也不要仅凭 UA 字符串放行。**

**验收**：安全事件里无主流搜索引擎爬虫被拦的记录；GSC 抓取统计正常。

## 8. 域名与跳转核对

**操作**：确认 `www.laoliu.me` 的处理（本项与第 0 条是同一件事的两面）。

**验收**：`curl -sI https://www.laoliu.me` 要么 NXDOMAIN/无解析，要么 301 到 `https://laoliu.me`，不能 200 提供重复站点。

## 9. IndexNow（非阻塞增强项，可在收录稳定后再做）

**说明**：IndexNow 是通知 Bing 等参与引擎 URL 变化的机制，不是 Google 收录接口，也不是排名保证。历史内容靠 sitemap 发现即可，不做批量追溯提交。

**操作（若实施）**：
1. 生成一个 key（UUID 即可），放 `public/<key>.txt`。
2. 只在「部署成功且新页面 200」后提交新增/更新 URL；删除要真实删除状态。
3. 保存去重与重试记录；不在每次构建全站推送。

**验收**：IndexNow API 返回 200；Bing 后台 URL 提交记录可见。

## 不需要站长做的（已由代码解决 / 本轮已验证）

- canonical / sitemap / RSS 统一规范地址（✅ seo:check 每次构建自动校验，并已改为与本页期望 URL 全值比较）
- 404 noindex 与真实 404 状态（✅ 本地 Wrangler 实测随机路径为真实 404）
- OG/Twitter 分享图（✅ 13 张已入库，部署即生效；校验器已改为核对**实际引用**而非默认图）
- 标题语义、图片 alt/尺寸/懒加载（✅ 像素级回归通过；两张中文编码路径图片已恢复 width/height）
- 新增 5 篇文章（2026-09-13）的 88 张正文图 alt 已逐张看图补全，5 张 OG 分享图已生成（✅ `seo:check` 通过）
- 正文完整性检测（✅ 改为真实 `.prose` 子树 + 头/中/尾三段指纹，不再被 post-end 模板凑字数）
- 提交标记一致性（✅ `BUILD_COMMIT` 与实际 HEAD 不符时构建硬失败）
