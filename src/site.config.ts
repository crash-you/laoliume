/**
 * 全站基础配置 —— 所有未来可能修改的信息都集中在这里，不要散落在其他文件。
 */
export const SITE_CONFIG = {
  /** 网站名称 */
  name: '佬刘AI',
  /** 作者名（用于 SEO / JSON-LD / 版权） */
  author: '佬刘',
  /** 网站一句话介绍 */
  description: '我用 AI 做过的东西，以及踩过的坑。',
  /** 首页 SEO title */
  seoTitle: '佬刘AI - AI、Codex 与 Vibe Coding 实操',
  /** 首页 SEO description */
  seoDescription:
    '佬刘的个人 AI 实操博客，记录 Codex、Vibe Coding、ChatGPT、AI 工具与实际使用过程。',
  /** 线上域名（不要带结尾斜杠），canonical / sitemap / RSS 都用它 */
  domain: 'https://laoliu.me',
  /** X (Twitter) 主页地址。占位地址，换成你自己的即可，全站自动生效 */
  xUrl: 'https://x.com/laoliuai',
  /** X 用户名（仅用于展示，例如 "@laoliuai"；留空则只显示 "X"） */
  xHandle: '@laoliuai',
  /** 微信公众号名称 */
  wechatName: '佬刘AI',
  /** 文章末尾的自我介绍 */
  authorBio:
    '我是佬刘，主要分享 AI、Codex、Vibe Coding 和我的实际折腾过程。',
} as const;

export type SiteConfig = typeof SITE_CONFIG;
