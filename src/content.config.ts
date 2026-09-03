import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    /** 文章标题 */
    title: z.string(),
    /** 摘要（首页展示 + SEO description），可选 */
    description: z.string().default(''),
    /** 发布时间 */
    date: z.coerce.date(),
    /** 更新时间，可选；与发布日期不同才展示 */
    updated: z.coerce.date().optional(),
    /** 自定义 URL slug，可选；不填则用文件名 */
    slug: z.string().optional(),
    /** 微信公众号原文链接，可选；填了才会在文章末尾显示「查看微信原文」 */
    wechat_url: z.string().optional(),
    /** false 时构建期不生成页面、不进 sitemap / RSS */
    published: z.boolean().default(true),
  }),
});

export const collections = { posts };
