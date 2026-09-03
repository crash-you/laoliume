# 佬刘AI · 个人博客

这是「佬刘AI」的个人主页 + 公众号文章存档站：**<https://laoliu.me>**

定位极简：白底、深灰正文、阅读优先。没有登录、评论、标签、搜索这些功能，唯一目标就是**稳定地展示文章**。

## 技术栈

| 部分 | 方案 |
| --- | --- |
| 框架 | [Astro](https://astro.build) + TypeScript（构建期生成静态 HTML，SEO 友好） |
| 文章源 | Markdown，放在 `src/content/posts/` |
| 源码管理 | GitHub |
| 部署 | Cloudflare Workers（静态资源 + 服务端接口） |
| 阅读量 | Cloudflare D1（serverless SQL 数据库） |

**不需要购买任何服务器。**

## 目录结构

```
blog/
├── src/
│   ├── site.config.ts          # ★ 全站配置：站名、域名、X 地址、公众号名……都改这里
│   ├── content.config.ts       # 文章字段定义（一般不用动）
│   ├── content/posts/          # ★ 所有文章（Markdown）放这里
│   ├── lib/posts.ts            # 文章读取/排序/日期工具（一般不用动）
│   ├── layouts/BaseLayout.astro# 全站 HTML 骨架 + SEO
│   ├── components/ViewsScript.astro  # 阅读量显示与计数
│   ├── styles/global.css       # ★ 全站样式
│   └── pages/
│       ├── index.astro         # 首页（文章列表）
│       ├── [slug].astro        # 文章详情页
│       ├── 404.astro           # 404 页
│       ├── rss.xml.ts          # RSS 订阅
│       ├── sitemap.xml.ts      # 站点地图
│       └── api/views/[slug].ts # 阅读量接口（GET / POST）
├── public/                     # 静态文件（图片、robots.txt、favicon）
│   └── images/                 # ★ 文章配图放这里
├── schema.sql                  # D1 数据表定义
├── wrangler.jsonc              # Cloudflare 配置（D1 绑定在这里）
├── astro.config.mjs            # Astro 配置
└── package.json
```

## 本地启动

需要 Node.js 20 或以上版本。

```bash
npm install     # 第一次运行
npm run dev     # 启动开发服务器，浏览器打开 http://localhost:4321
```

构建生产版本：

```bash
npm run build   # 输出到 dist/
```

## ★ 如何发布一篇新文章（长期工作流）

这是你唯一需要记住的流程：

```bash
# 1. 在 src/content/posts/ 里新建一个 .md 文件，比如 my-new-post.md
# 2. 写文章（格式见下一节）
# 3. 提交并推送
git add .
git commit -m "新文章：xxx"
git push
# 4. Cloudflare 自动构建上线，完成
```

**不需要改任何代码。**

### 文章模板

```markdown
---
title: "文章标题"
description: "一两句话摘要，会显示在首页和搜索结果里"
date: 2026-09-03
slug: "my-new-post"
wechat_url: "https://mp.weixin.qq.com/s/xxxxxx"
published: true
---

正文从这里开始，用 Markdown 写。

## 二级标题

正文……

![图片描述](/images/xxx.png)
```

### Frontmatter 字段说明

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `date` | 是 | 发布日期，格式 `YYYY-MM-DD`，首页按它倒序排列 |
| `description` | 否 | 摘要，显示在首页列表 + 用作 SEO description |
| `updated` | 否 | 更新日期。和 `date` 不同才会在文章页显示「更新于」 |
| `slug` | 否 | 文章 URL，如 `codex-buy` → `laoliu.me/codex-buy`。**不填则用文件名** |
| `wechat_url` | 否 | 微信公众号原文链接。填了文章末尾才显示「查看微信原文」 |
| `published` | 否 | 默认 `true`。设为 `false` 即为草稿：不生成页面、不进 sitemap/RSS |

### 修改 / 删除文章

- 改文章：直接编辑对应的 `.md` 文件，推送即可
- 删文章：删除对应的 `.md` 文件，推送即可（URL 会变成 404）

### 文章配图

把图片放进 `public/images/`，文章里这样引用：

```markdown
![描述](/images/my-image.png)
```

## 修改网站基础信息

所有可能变的东西都集中在 **`src/site.config.ts`** 一个文件里：

```ts
export const SITE_CONFIG = {
  name: '佬刘AI',           // 网站名称
  author: '佬刘',           // 作者名（SEO 用）
  description: '我用 AI 做过的东西，以及踩过的坑。',
  domain: 'https://laoliu.me',
  xUrl: 'https://x.com/laoliuai',   // ★ 换成你的 X 主页
  xHandle: '@laoliuai',             // ★ 换成你的 X 用户名
  wechatName: '佬刘AI',
  authorBio: '……',          // 文章末尾的自我介绍
}
```

改 X 地址只改 `xUrl` 和 `xHandle` 这两行，全站（首页右上角、文章页顶部、文章末尾）自动生效。

## Cloudflare 部署（一次性设置）

### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin git@github.com:你的用户名/laoliu-blog.git
git push -u origin main
```

### 2. 创建 D1 数据库

```bash
npx wrangler login                        # 浏览器授权登录 Cloudflare
npx wrangler d1 create laoliu-blog        # 创建数据库
```

命令会输出一串 `database_id`，把它填进 `wrangler.jsonc` 里的 `REPLACE_WITH_YOUR_D1_DATABASE_ID`，然后提交推送。

### 3. 初始化数据表

```bash
npx wrangler d1 execute laoliu-blog --remote --file=schema.sql
```

### 4. 连接 GitHub 自动部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers 和 Pages** → **创建** → 选 **Workers** → **从 Git 导入**
2. 授权并选择 `laoliu-blog` 仓库
3. 构建设置：
   - 构建命令：`npm run build`
   - 部署命令：`npx wrangler deploy`
4. 保存。之后每次 `git push` 都会自动构建上线。

### 5. 绑定域名 laoliu.me

前提：laoliu.me 的 DNS 已托管在 Cloudflare（域名购买处把 NS 服务器改成 Cloudflare 分配的两个地址，等待生效）。

1. Workers 里打开 `laoliu-blog` → **设置** → **域和路由**
2. **添加** → **自定义域** → 输入 `laoliu.me` 确认
3. Cloudflare 自动签证书，几分钟后 `https://laoliu.me` 即可访问

### 手动部署（备用，不经过 GitHub）

```bash
npm run deploy    # = astro build + wrangler deploy
```

## 常见问题

**Q: 本地开发时阅读量显示「— 次阅读」？**
正常。本地没有绑定 D1 时接口返回空，页面自动降级显示，不影响阅读。想看真实效果可以执行 `npx wrangler d1 execute laoliu-blog --local --file=schema.sql` 初始化本地库。

**Q: 阅读量会刷上去吗？**
同一浏览器 6 小时内重复打开同一篇文章只记一次（localStorage 实现）。统计的是 PV，不是严格 UV，对个人博客够用。

**Q: 文章页打不开会不会是阅读量接口挂了？**
不会。正文是构建期生成的纯静态 HTML，阅读量是页面打开后异步加载的，接口异常最多显示「— 次阅读」。

**Q: SEO 都做了什么？**
每篇文章：独立 title、meta description、canonical、Open Graph、Twitter Card、Article JSON-LD 结构化数据。全站：`/sitemap.xml`、`/robots.txt`、`/rss.xml`。文章正文构建期生成静态 HTML，搜索引擎不执行 JS 也能抓到全文。
