import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE_CONFIG } from '../site.config';
import { getPublishedPosts, postSlug } from '../lib/posts';

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();

  return rss({
    title: SITE_CONFIG.seoTitle,
    description: SITE_CONFIG.seoDescription,
    site: context.site ?? SITE_CONFIG.domain,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: '/' + postSlug(post),
    })),
    customData: `<language>zh-CN</language>`,
  });
};
