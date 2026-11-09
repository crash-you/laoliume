import type { APIRoute } from 'astro';
import { readViews, viewsJson } from '../../../lib/article-views';
import { MAX_VIEW_LIST_LENGTH, MAX_VIEW_SLUGS } from '../../../lib/view-batches';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const list = url.searchParams.get('slugs') ?? '';
  if (!list || list.length > MAX_VIEW_LIST_LENGTH) return viewsJson({ views: null }, 400);
  const slugs = list.split(',');
  if (slugs.length > MAX_VIEW_SLUGS || slugs.some((slug) => !/^[a-z0-9][a-z0-9-]*$/.test(slug))) {
    return viewsJson({ views: null }, 400);
  }
  try {
    return viewsJson({ views: await readViews(locals, [...new Set(slugs)]) });
  } catch {
    return viewsJson({ views: null }, 503);
  }
};
