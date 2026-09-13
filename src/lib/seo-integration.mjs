/**
 * seo-integration.mjs — 构建期 SEO 集成
 * - 在 astro:build:done 按「真实构建产物」自动生成 dist/_redirects 的 308 规则：
 *   扫描 dist/ 下每个 <slug>/index.html 目录，给 /<slug> -> /<slug>/ 规范化重定向。
 *   草稿（未生成页面）自然被排除；显式 noindex 文章仍生成页面，因此也会得到规则。
 * - 人工迁移规则放在项目根目录 redirects-extra.txt（每次构建原样保留，不覆盖）。
 */
import { writeFileSync, readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RESERVED = new Set(['_astro', '_worker.js', 'og', 'api', 'images', '404']);

/** 扫描 dist 下真实生成的 <slug>/index.html，返回 slug 列表 */
function collectSlugs(outDir) {
  const slugs = [];
  for (const name of readdirSync(outDir)) {
    if (RESERVED.has(name)) continue;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) continue;
    const index = join(outDir, name, 'index.html');
    if (existsSync(index) && statSync(index).isFile()) slugs.push(name);
  }
  return slugs.sort();
}

function buildRedirects(slugs, extraRules) {
  const header = `# 由构建期自动生成：为全部已发布文章提供 /<slug> -> /<slug>/ 的 308 永久重定向。
# 新增/删除文章后重新构建即可，无需手工维护。
# 人工迁移规则（旧地址 -> 新地址）请写到项目根目录 redirects-extra.txt。
# 注意：不要用「/. / 308」通配形式——对文章路由无效，且会导致 / 自我循环。`;
  const extra = extraRules.trim() ? extraRules.trim() : '';
  const auto = slugs.map((s) => `/${s} /${s}/ 308`).join('\n');
  return [header, extra, auto].filter(Boolean).join('\n') + '\n';
}

export function seoIntegration() {
  return {
    name: 'laoliume-seo',
    hooks: {
      'astro:build:done'({ dir, logger }) {
        const outDir = dir instanceof URL ? fileURLToPath(dir) : dir?.pathname ?? dir;
        const extraPath = join(process.cwd(), 'redirects-extra.txt');
        const extra = existsSync(extraPath) ? readFileSync(extraPath, 'utf-8') : '';
        const slugs = collectSlugs(outDir);
        writeFileSync(join(outDir, '_redirects'), buildRedirects(slugs, extra));
        logger.info(`seo: 生成 dist/_redirects（${slugs.length} 篇已发布文章 + 人工迁移规则）`);
      },
    },
  };
}
