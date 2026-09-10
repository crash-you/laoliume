# 基线构建与路由测试记录

日期: 2026-09-10 09:24    
基线 commit: 6f0edda5459c668b72ba129839484d0a9eac3275 (main)
Node: v22.22.2, npm: 10.9.7

## 构建
- 首次 npm ci 被沙箱批量删除保护拦截（SAFE_DELETE_BULK_CONFIRM_REQUIRED，目标 node_modules/.bin）。
- 改用 npm install 后发现 node_modules 缺 @capsizecss/unpack 等 5 个包（既存问题：依赖目录不完整），补齐后构建成功。
- npm run build 成功：12 篇文章页 + 首页 + rss.xml + sitemap.xml，无构建期错误。

## Wrangler dev 路由实测（localhost:8788，--local 模式）
- /codex-buy -> 307 /codex-buy/
- /codex-buy/ -> 200
- /codex-buy/index.html -> 307 /codex-buy/
- /codex-buy.html -> 307 /codex-buy/
- /no-such-page-xyz123 -> 404（真实 404 状态）
- /api/views/codex-buy -> 200 JSON
- /robots.txt /sitemap.xml /rss.xml /images/* /favicon.svg -> 200

## 结论
- 非规范文章入口存在但跳转码为 307（临时），Cloudflare Workers html_handling 所有选项均为 307，需用 _redirects 提供 308。
- 内部链接（首页/侧栏/前后篇/RSS）不带末尾斜杠，canonical/sitemap 带斜杠，信号不一致，点击文章链接必经一次跳转。
