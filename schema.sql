-- 佬刘AI 博客 · Cloudflare D1 数据表
-- 初始化命令（见 README）：
--   npx wrangler d1 execute laoliu-blog --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS article_views (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT
);
