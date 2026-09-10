# Cloudflare 实测记录（2026-09-10，只读核验）

## 1. 跳转链（真实响应）

| 请求 | 响应链 |
|---|---|
| `https://laoliu.me/` | 301 → `https://www.laoliu.me/` → 200 |
| `https://www.laoliu.me/` | 200 |
| `https://laoliu.me/codex-buy` | 301 → `https://www.laoliu.me/codex-buy` → 307 → `/codex-buy/` → 200 |

**结论（关键）**：线上主域实际是 `www.laoliu.me`，`laoliu.me` 被 Cloudflare 301 到 www。
而代码 `site: 'https://laoliu.me'`、canonical、sitemap、OG 全部指向不带 www 的 `laoliu.me`。
这导致 **canonical 指向一个会被 301 的地址**，属上线前必须解决的域级不一致（站长决策，见 SEO_OWNER_ACTIONS.md）。
`_redirects` 只能消除第二跳（非规范入口 307→308），无法消除第一跳（apex→www）。

## 2. robots.txt（完整原始响应已存 docs/reports/robots-live.txt）

- 状态 200，`content-type: text/plain; charset=utf-8`，由 `server: cloudflare` 返回。
- 响应体是 Cloudflare「Managed Content / 内容信号」生成的版本，含 `# BEGIN Cloudflare Managed content`：
  - `User-agent: *` + `Content-Signal: search=yes,ai-train=no,use=reference` + `Allow: /`
  - 对 Amazonbot / Applebot-Extended / Bytespider / CCBot / ClaudeBot / CloudflareBrowserRenderingCrawler / Google-Extended / GPTBot / meta-externalagent 全站 `Disallow: /`
- **仓库 `public/robots.txt` 的内容（含 `Sitemap: https://laoliu.me/sitemap.xml`）未出现在线上响应中** —— 有证据表明被 Cloudflare 托管内容覆盖（非臆测）。
- 搜索抓取层面：`Googlebot`、`Bingbot` 不在 Disallow 列表内（搜索引擎收录不受阻）；被禁的是 AI 训练/扩展类爬虫（Google-Extended、GPTBot、ClaudeBot 等）。
- 这是「搜索抓取 vs AI 训练」两类策略的区分，不是全站屏蔽。是否放开 AI 爬虫是站长商业决策，不应由 Agent 擅自关闭防护。

## 3. noindex 核验

- 生产首页与文章页 HTML 均无 `noindex`（早前 smoke 已逐页确认，本次重测同样无 noindex）。
- 预览域（`*.workers.dev`）无 Cloudflare API 凭据，无法枚举，标记「未验证」。wrangler.jsonc 未配置 `routes`/`custom_domains`，预览走 workers.dev 默认子域。

## 4. 环境说明

- 本机无法读取 Cloudflare 控制台；以上仅为对公开 HTTP 响应的只读观测。DNS/TLS/WAF 规则后台状态未验证。
