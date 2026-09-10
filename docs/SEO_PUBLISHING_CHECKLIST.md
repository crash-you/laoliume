# 发布检查清单（每篇新文章的最短流程）

日期：2026-09-10。适用：以后每次新增/修改文章。

## 1. 写文章（frontmatter 模板）

```yaml
---
title: "可见标题（H1，与正文主题一致）"
description: "首页列表展示的摘要，也是 description 的回退"
seoTitle: "搜索结果标题（可选；与 title 同主题，可更精简）"
seoDescription: "搜索结果摘要（可选；准确概括解决的问题，40-170 字）"
image: "/og/<slug>.png"       # 可选；分享图，不填用全站默认图
imageAlt: "分享图描述"
noindex: false                # 默认 false；true 时页面生成但不出现在 sitemap/RSS
date: 2026-09-10              # YYYY-MM-DD
updated: 2026-09-15           # 可选；内容真实修订时才改，不要每次构建刷
slug: "my-new-post"           # 小写字母/数字/连字符；定稿后不要再改
published: true               # false = 草稿，不生成路由
wechat_url: "https://mp.weixin.qq.com/s/..."   # 可选
---
```

## 2. 新文章上线前必做（顺序执行）

```bash
# 1) 生成本篇 + 默认分享图（新增文章后跑一次；已有图会跳过）
npm run og:image

# 2) 构建 + 全量 SEO 校验（title/description/canonical/H1/sitemap/RSS/_redirects/OG 图等）
npm run seo:check
```

**seo:check 失败的常见原因**：
- 忘了跑 `npm run og:image`（缺 `/og/<slug>.png`）；
- 忘了在 `public/_redirects` 加 `/<slug> /<slug>/ 308` 一行（校验器会报缺规则）；
- slug 与保留路由冲突（api/images/og/_astro/404）；
- date/updated 格式错误或 updated 早于 date。

## 3. 视觉回归（改了模板/样式时）

```bash
# 终端 1：本地预览（接近生产路由行为）
npm run preview -- --port 8788 --local

# 终端 2：采「修改后」截图并与基线对比
node scripts/seo-screenshot.mjs --base-url http://localhost:8788 --out-dir docs/screenshots/after
npm run seo:verify-ui
```

对比通过标准：0 像素差异。若有意改版（非本清单场景），先更新 `docs/screenshots/before/` 基线并在提交说明里写明。

## 4. 部署后 smoke test

```bash
node scripts/seo-smoke.mjs --base-url https://laoliu.me --out docs/reports/smoke-<日期>.md
```

全绿才算发布完成。任何「未验证」项（网络问题）当天补测，不能留过夜。

## 5. 快速自查口诀

- **一个 slug 一条 308**：`public/_redirects` 与文章同步。
- **一张图一次生成**：`npm run og:image` 幂等，新增文章后跑一次即可。
- **改的是内容还是模板？** 内容 → 只跑 seo:check；模板/样式 → 加跑视觉回归。
- **updated 字段**：只有正文/信息真实修订才改；排版微调不算。
- **草稿**：`published: false` 即可，不需要删文件；校验器会确保它不进 sitemap/RSS/路由。
- **noindex**：`noindex: true` 的文章自动从 sitemap/RSS 排除，页面仍在（适合「公开但不想被收录」的页面）。

## 6. 每季度（低频）

- 核对时效性文章的价格/版本类表述（codex-buy、codex-deepseek、gpt6-codex-context），更新 `updated` 字段。
- 线上 robots.txt 是否又被 Cloudflare 托管内容覆盖（`curl -s https://laoliu.me/robots.txt | grep Sitemap`）。
- GSC 后台看查询词/曝光/点击与 canonical 争抢情况（见 SEO_OWNER_ACTIONS.md）。
