import type { APIRoute } from 'astro';
import { getPublishedPosts, postSlug, isoDate } from '../lib/posts';
import { postPath, absoluteUrl } from '../lib/url';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  // 首页 lastmod 取最新一篇文章的发布/更新时间，反映首页列表的实际变化；
  // 没有文章时省略，不用构建时间冒充内容变化。
  const latest = posts.reduce<Date | null>((acc, p) => {
    const d = p.data.updated ?? p.data.date;
    return !acc || d > acc ? d : acc;
  }, null);

  const urls = [
    { loc: absoluteUrl('/'), lastmod: latest ? isoDate(latest) : undefined },
    ...posts.map((p) => ({
      loc: absoluteUrl(postPath(postSlug(p))),
      lastmod: isoDate(p.data.updated ?? p.data.date),
    })),
  ];

  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${esc(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
