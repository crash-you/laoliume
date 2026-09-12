/**
 * 全站基础配置 —— 所有未来可能修改的信息都集中在这里，不要散落在其他文件。
 */
export const SITE_CONFIG = {
  /** 网站名称（SEO / publisher / JSON-LD / RSS / og:site_name 用，保持「佬刘AI」不变） */
  name: '佬刘AI',
  /** 页面展示名（首页左栏、文章页侧栏等 UI 可见处） */
  displayName: '佬刘',
  /** 作者名（用于 SEO / JSON-LD / 版权） */
  author: '佬刘',
  /** 个人简介（首页左栏 / 文章末尾作者区） */
  description: '研究生在读，折腾 AI，也折腾怎么赚钱。',
  /** 目标宣言（首页左栏 / 文章末尾作者区） */
  goal: '努力赚到第一个100万！',
  /** 首页 SEO title */
  seoTitle: '佬刘AI - ChatGPT、Codex 使用教程与 AI 实操',
  /** 首页 SEO description */
  seoDescription:
    '佬刘的个人 AI 实操博客，记录 Codex、Vibe Coding、ChatGPT、AI 工具与实际使用过程。',
  /** 默认分享图（首页 / 404 等无文章配图页面的 OG 回退，1200x630） */
  ogImageDefault: '/og/default.png',
  /** 线上域名（不要带结尾斜杠），canonical / sitemap / RSS 都用它 */
  domain: 'https://laoliu.me',
  /** X (Twitter) 主页地址。占位地址，换成你自己的即可，全站自动生效 */
  xUrl: 'https://x.com/laoliuai',
  /** X 用户名（仅用于展示，例如 "@laoliuai"；留空则只显示 "X"） */
  xHandle: '@laoliuai',
  /** 微信公众号名称 */
  wechatName: '佬刘AI',
  /** Google Analytics 4 度量 ID（gtag.js）；留空则不加载统计脚本 */
  gaMeasurementId: 'G-4FRL9L21XL',
  /** AI 会员代充入口（首页左栏 / 文章末尾作者区，纯文字链接） */
  membership: {
    title: 'AI会员代充',
    subtitle: 'ChatGPT，Claude等',
    url: 'https://wzyp.cn/shop/liu',
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
