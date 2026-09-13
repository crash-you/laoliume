import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE_CONFIG } from '../site.config';
import { getPublishedPosts, postSlug } from '../lib/posts';
import { postPath } from '../lib/url';

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();
  // noindex 文章不进 RSS（与 sitemap 策略一致；RSS 是分发渠道而非索引控制机制）
  const feedPosts = posts.filter((p) => !p.data.noindex);

  return rss({
    title: SITE_CONFIG.seoTitle,
    description: SITE_CONFIG.seoDescription,
    site: context.site ?? SITE_CONFIG.domain,
    items: feedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postPath(postSlug(post)),
    })),
    customData: `<language>zh-CN</language>`,
  });
};
