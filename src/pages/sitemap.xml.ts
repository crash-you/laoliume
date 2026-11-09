import type { APIRoute } from 'astro';
import { getPublishedPosts, postSlug, isoDate } from '../lib/posts';
import { postPath, absoluteUrl } from '../lib/url';
import { SITEMAP_STATIC_PATHS } from '../lib/sitemap-pages.mjs';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  // noindex 文章不进 sitemap（本站发布策略：不希望被索引的页面也不主动分发）
  const indexable = posts.filter((p) => !p.data.noindex);

  const urls = [
    // 目录、导航和补录会单独变更，只给有可靠内容日期的文章填写 lastmod。
    ...['/', ...SITEMAP_STATIC_PATHS].map((path) => ({ loc: absoluteUrl(path), lastmod: undefined })),
    ...indexable.map((p) => ({
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
