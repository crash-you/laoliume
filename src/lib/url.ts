import { SITE_CONFIG } from '../site.config';

/**
 * URL 生成规则（全站唯一出口，禁止在模板里手写字符串拼接）：
 * - 首页：/
 * - 文章：/<slug>/（带末尾斜杠，与 canonical / sitemap / Workers 路由一致）
 * - 资源与 API 不加斜杠（/images/...、/api/views/...、robots.txt 等）
 */

/** 规范文章相对路径：/<slug>/ */
export function postPath(slug: string): string {
  return '/' + slug + '/';
}

/** 站内任意路径转绝对地址（domain 不带结尾斜杠，path 以 / 开头） */
export function absoluteUrl(path: string): string {
  return SITE_CONFIG.domain + path;
}

/** 规范文章绝对地址：https://laoliu.me/<slug>/（用于 canonical / og:url / JSON-LD / RSS / sitemap） */
export function canonicalPostUrl(slug: string): string {
  return absoluteUrl(postPath(slug));
}
