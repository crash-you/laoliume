/**
 * seo-redirects.mjs — 根据发布集合自动生成 _redirects 的 308 规范化规则
 *
 * 目的：以后只新增 Markdown 即可发布，无需手工维护 public/_redirects。
 * - 自动为每篇「已发布」文章生成 /<slug> -> /<slug>/ 的 308 永久重定向。
 * - 人工迁移规则（如旧地址搬到新地址）放在项目根目录 redirects-extra.txt，
 *   会被原样保留在自动规则之前。
 * - 草稿（published: false）不生成任何规则，也不生成公开路由。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** 解析 Markdown frontmatter 为键值对象（字符串值） */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^".*"$/.test(v)) v = v.slice(1, -1);
    fm[kv[1]] = v;
  }
  return fm;
}

/** 读取发布集合：返回已发布文章的 slug 列表（按文件名序） */
export function readPublishedSlugs(postsDir) {
  return readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const fm = parseFrontmatter(readFileSync(join(postsDir, f), 'utf-8'));
      const slug = fm.slug || f.replace(/\.md$/, '');
      return { file: f, slug, published: fm.published !== 'false' };
    })
    .filter((p) => p.published)
    .map((p) => p.slug);
}

/** 生成 _redirects 文件内容 */
export function buildRedirectsFile(slugs, extraRules = '') {
  const header = `# 由构建期自动生成：为全部已发布文章提供 /<slug> -> /<slug>/ 的 308 永久重定向。
# 新增/删除文章后重新构建即可，无需手工维护本文件。
# 人工迁移规则（旧地址 -> 新地址）请写到项目根目录 redirects-extra.txt。
# 注意：不要用「/. / 308」通配形式——对文章路由无效，且会导致 / 自我循环。\n`;
  const extra = extraRules.trim() ? `${extraRules.trim()}\n` : '';
  const auto = slugs.map((s) => `/${s} /${s}/ 308`).join('\n');
  return `${header}${extra}${auto}\n`;
}
