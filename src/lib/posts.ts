import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** 文章最终 slug：优先 frontmatter 的 slug，否则用文件名 */
export function postSlug(post: Post): string {
  return post.data.slug ?? post.id;
}

/** 所有已发布文章，按发布时间倒序 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => data.published);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** 格式化为 2026.09.03 */
export function formatDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

/** 格式化为 ISO 日期 2026-09-03（用于 SEO / JSON-LD） */
export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 更新时间与发布时间是否为同一天 */
export function isSameDay(a: Date, b: Date): boolean {
  return isoDate(a) === isoDate(b);
}
