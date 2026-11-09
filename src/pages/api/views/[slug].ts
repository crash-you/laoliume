import type { APIRoute } from 'astro';
import { incrementViews, readViews, viewsJson } from '../../../lib/article-views';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = params.slug ?? '';
  try {
    const counts = await readViews(locals, [slug]);
    return viewsJson({ slug, views: counts?.[slug] ?? null });
  } catch {
    return viewsJson({ slug, views: null });
  }
};

export const POST: APIRoute = async ({ params, locals }) => {
  const slug = params.slug ?? '';
  try {
    return viewsJson({ slug, views: await incrementViews(locals, slug) });
  } catch {
    return viewsJson({ slug, views: null });
  }
};
