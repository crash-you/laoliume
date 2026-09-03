import type { APIRoute } from 'astro';
import { SITE_CONFIG } from '../site.config';
import { getPublishedPosts, postSlug, isoDate } from '../lib/posts';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const urls = [
    { loc: SITE_CONFIG.domain + '/', lastmod: isoDate(posts[0]?.data.date ?? new Date()) },
    ...posts.map((p) => ({
      loc: SITE_CONFIG.domain + '/' + postSlug(p) + '/',
      lastmod: isoDate(p.data.updated ?? p.data.date),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
