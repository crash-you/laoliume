import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    /** 文章标题（页面 H1 与可见标题） */
    title: z.string(),
    /** 摘要（首页展示 + description 回退），可选 */
    description: z.string().default(''),
    /** 搜索结果标题：不传则回退 title；与 H1 必须表达相同主题 */
    seoTitle: z.string().optional(),
    /** 搜索结果摘要：不传则回退 description */
    seoDescription: z.string().optional(),
    /** 分享图 / JSON-LD 代表图路径（/og/<slug>.png，站内绝对路径，不渲染进正文） */
    image: z.string().optional(),
    /** 分享图替代文本，与图片实际内容一致 */
    imageAlt: z.string().optional(),
    /** true 时页面仍生成但加 noindex，并从 sitemap / RSS 排除 */
    noindex: z.boolean().default(false),
    /** 发布时间 */
    date: z.coerce.date(),
    /** 更新时间，可选；与发布日期不同才展示 */
    updated: z.coerce.date().optional(),
    /** 自定义 URL slug，可选；不填则用文件名 */
    slug: z.string().optional(),
    /** 微信公众号原文链接，可选；填了才会在文章末尾显示「查看微信原文」；不参与 canonical */
    wechat_url: z.string().optional(),
    /** false 时构建期不生成页面、不进 sitemap / RSS */
    published: z.boolean().default(true),
  }),
});

export const collections = { posts };
