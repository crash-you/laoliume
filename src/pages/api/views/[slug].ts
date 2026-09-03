import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * 阅读量接口（Cloudflare D1）
 * - GET  /api/views/:slug  读取阅读量
 * - POST /api/views/:slug  阅读量 +1
 * D1 未绑定或出错时返回 { views: null }，前端会显示 “— 次阅读”，不影响正文。
 */

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

function getDB(locals: unknown): any | null {
  try {
    const runtime = (locals as any)?.runtime;
    return runtime?.env?.DB ?? null;
  } catch {
    return null;
  }
}

async function ensureTable(db: any) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS article_views (
        slug TEXT PRIMARY KEY,
        views INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT
      )`
    )
    .run();
}

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = params.slug ?? '';
  const db = getDB(locals);
  if (!db) return json({ slug, views: null });

  try {
    await ensureTable(db);
    const row = await db
      .prepare('SELECT views FROM article_views WHERE slug = ?')
      .bind(slug)
      .first();
    return json({ slug, views: row?.views ?? 0 });
  } catch {
    return json({ slug, views: null });
  }
};

export const POST: APIRoute = async ({ params, locals }) => {
  const slug = params.slug ?? '';
  const db = getDB(locals);
  if (!db) return json({ slug, views: null });

  try {
    await ensureTable(db);
    const now = new Date().toISOString();
    await db
      .prepare(
        `INSERT INTO article_views (slug, views, updated_at)
         VALUES (?, 1, ?)
         ON CONFLICT(slug) DO UPDATE SET
           views = views + 1,
           updated_at = excluded.updated_at`
      )
      .bind(slug, now)
      .run();
    const row = await db
      .prepare('SELECT views FROM article_views WHERE slug = ?')
      .bind(slug)
      .first();
    return json({ slug, views: row?.views ?? null });
  } catch {
    return json({ slug, views: null });
  }
};
