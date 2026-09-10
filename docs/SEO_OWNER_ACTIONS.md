# 站长待办（必须由站长完成的操作）

以下事项需要站长账号 / DNS / Cloudflare 后台权限，本轮 Agent 无法执行。每项附验收方式。完成一项勾一项。

## 1. Cloudflare：robots.txt 被托管内容覆盖（优先级高）

**现状**（2026-09-10 实测）：`https://laoliu.me/robots.txt` 返回的是 Cloudflare 注入的版本：
- 丢失了仓库文件里的 `Sitemap: https://laoliu.me/sitemap.xml` 声明；
- 对 GPTBot、ClaudeBot、Google-Extended、CCBot、Bytespider、Amazonbot、Applebot-Extended、meta-externalagent、CloudflareBrowserRenderingCrawler 共 9 个 AI 爬虫全站 Disallow。

**操作**：
1. Cloudflare Dashboard → laoliu.me → 检查「Crawlers / 内容信号 / AI bot 拦截」类开关（不同套餐名称不同，常见于 Security 或 Bots 设置）。
2. 决策：是否允许 AI 爬虫（这是商业决策：允许→内容可被 AI 搜索引用；禁止→防抓取但损失 AI 渠道曝光）。**无论如何，Sitemap 声明必须恢复**——要么关闭 robots 托管让仓库文件生效，要么在 Cloudflare 自定义 robots 配置里加回 Sitemap 行。

**验收**：`curl -s https://laoliu.me/robots.txt | grep Sitemap` 输出 `Sitemap: https://laoliu.me/sitemap.xml`。

## 2. 部署本分支（审阅后）

**操作**：审阅 `seo-round1` 分支的 6 个提交，确认无误后合并 main 并执行既有部署流程 `npm run deploy`（或你的 GitHub→Cloudflare 流水线）。

**验收**（部署后运行，预期全绿）：
```bash
npm run seo:smoke -- --base-url https://laoliu.me
```
重点确认：`/og/codex-buy.png` 与 `/og/default.png` 变 200；robots Sitemap 行恢复；非规范入口为 308 一跳。

## 3. Google Search Console

**操作**：
1. https://search.google.com/search-console 用「网域」资源方式验证 `laoliu.me`（后台会给 TXT 记录，去 DNS 服务商添加）。
2. 提交 `https://laoliu.me/sitemap.xml`。
3. 对首页和 `/codex-buy/` 做 URL 检查，记录「用户声明的 canonical」vs「Google 选择的 canonical」、抓取与索引状态。

**验收**：GSC「网页索引编制」报告能看到提交的 13 个 URL；无「重复网页（用户未指定规范）」类问题。未完成前记录「未验证」。

## 4. Bing Webmaster Tools

**操作**：https://www.bing.com/webmasters 手工验证，或从已验证的 GSC 导入；提交/核对 sitemap。

**验收**：Bing 后台 sitemap 状态为「成功」，URL 检查能抓取首页。

## 5. 百度搜索资源平台

**操作**：
1. https://ziyuan.baidu.com 完成站点验证（文件验证 key 会需要放进 `public/`，下次构建带上；或 HTML 标签验证可临时手动加）。
2. 提交普通收录 sitemap：`https://laoliu.me/sitemap.xml`。
3. 用「抓取诊断」确认百度蜘蛛能抓到正文（重点验证中国大陆访问与 Workers 链路）。

**注意**：普通收录的 sitemap/API 配额与账号等级相关，以后台实际显示为准。同时人工测一下中国大陆访问 laoliu.me 的速度（不要从「Cloudflare」这个名字推断快慢）。

**验收**：抓取诊断返回正文内容；sitemap 显示已抓取。

## 6. Cloudflare 防护与爬虫放行检查（按日志）

**操作**：Cloudflare → Security → Events，按 User-Agent 过滤 `Googlebot` / `Bingbot`，看是否有被 Challenge/Block 的记录。若有，用「已验证的机器人」规则放行（Cloudflare 有验证 Googlebot 真伪的能力）。不要全局关 WAF，也不要仅凭 UA 字符串放行。

**验收**：安全事件里无主流搜索引擎爬虫被拦的记录；GSC 抓取统计正常。

## 7. 域名与跳转核对（可选但建议）

**操作**：确认 `www.laoliu.me` 的处理（若 DNS 无 www 记录则无需处理；若有，建议 301 到主域）。当前实测主域 https 正常。

**验收**：`curl -sI https://www.laoliu.me` 要么 NXDOMAIN/无解析，要么 301 到 `https://laoliu.me`，不能 200 提供重复站点。

## 8. IndexNow（非阻塞增强项，可在收录稳定后再做）

**说明**：IndexNow 是通知 Bing 等参与引擎 URL 变化的机制，不是 Google 收录接口，也不是排名保证。历史内容靠 sitemap 发现即可，不做批量追溯提交。

**操作（若实施）**：
1. 生成一个 key（UUID 即可），放 `public/<key>.txt`。
2. 只在「部署成功且新页面 200」后提交新增/更新 URL；删除要真实删除状态。
3. 保存去重与重试记录；不在每次构建全站推送。

**验收**：IndexNow API 返回 200；Bing 后台 URL 提交记录可见。

## 不需要站长做的（已由代码解决）

- canonical / sitemap / RSS 统一规范地址（✅ seo:check 每次构建自动校验）
- 404 noindex 与真实 404 状态（✅）
- OG/Twitter 分享图（✅ 13 张已入库，部署即生效）
- 标题语义、图片 alt/尺寸/懒加载（✅ 像素级回归通过）
