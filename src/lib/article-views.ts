import type { D1Database } from '@cloudflare/workers-types';

export function viewsJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

async function withViewsTable<T>(locals: App.Locals, operation: (db: D1Database) => Promise<T>) {
  const db = locals.runtime?.env?.DB;
  if (!db) return null;
  try {
    return await operation(db);
  } catch (error) {
    // 只有数据库明确报告缺表才重试；写入的其他故障可能发生在提交之后。
    const detail = error instanceof Error ? error.message + ' ' + String(error.cause ?? '') : String(error);
    if (!/no such table:\s*(?:main\.)?article_views\b/i.test(detail)) throw error;
    await db.prepare(`CREATE TABLE IF NOT EXISTS article_views (
      slug TEXT PRIMARY KEY, views INTEGER NOT NULL DEFAULT 0, updated_at TEXT
    )`).run();
    return await operation(db);
  }
}

export function readViews(locals: App.Locals, slugs: string[]) {
  return withViewsTable(locals, async (db) => {
    const params = slugs.map(() => '?').join(',');
    const { results } = await db.prepare(`SELECT slug, views FROM article_views WHERE slug IN (${params})`)
      .bind(...slugs).all<{ slug: string; views: number }>();
    const counts: Record<string, number> = Object.fromEntries(slugs.map((slug) => [slug, 0]));
    for (const row of results) counts[row.slug] = row.views;
    return counts;
  });
}

export function incrementViews(locals: App.Locals, slug: string) {
  return withViewsTable(locals, (db) =>
    db.prepare(`INSERT INTO article_views (slug, views, updated_at) VALUES (?, 1, ?)
      ON CONFLICT(slug) DO UPDATE SET views = views + 1, updated_at = excluded.updated_at
      RETURNING views`).bind(slug, new Date().toISOString()).first<number>('views')
  );
}
