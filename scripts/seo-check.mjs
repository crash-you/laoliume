/**
 * seo-check.mjs — 构建产物 SEO 校验（读真实 HTML / XML，不搜索源码关键字）
 *
 * 用法: node scripts/seo-check.mjs [--dist dist]
 * 退出码: 有硬错误 -> 1；仅警告 -> 0
 *
 * noindex 策略（与发布策略一致）：
 *   - published:false —— 无公开页面/列表/sitemap/RSS/分享卡（草稿，非隐私机制）
 *   - published:true + noindex:true —— 页面生成且带 noindex，排除 sitemap/RSS
 *   - 普通已发布文章 —— 应可索引，误带 noindex 才判失败
 *
 * 正文定义：只读取 .prose 子树（scripts/html-prose.mjs，与 seo-smoke 共用同一 DOM 定义），
 * 不用「.prose 到 </article>」正则（会混入 post-end 模板）。
 * OG 校验：以页面实际 og:image / twitter:image / JSON-LD image 引用为准（绝对 URL），
 * 同站图映射到 dist 读取真实尺寸与格式，不只检查默认图。
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { XMLValidator, XMLParser } from 'fast-xml-parser';
import { extractProse, extractProseHtml, metaTag, linkRel, titleTag } from './html-prose.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const distArg = args.includes('--dist') ? args[args.indexOf('--dist') + 1] : 'dist';
const DIST = join(root, distArg);
const SRC_POSTS = join(root, 'src', 'content', 'posts');

const DOMAIN = 'https://laoliu.me';
const MEMBERSHIP_URL = 'https://wzyp.cn/shop/liu';
const RESERVED = new Set(['api', 'images', 'og', '_astro', '_worker.js', '404']);

const errors = [];
const warnings = [];
const ok = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const pass = (m) => ok.push(m);

if (!existsSync(DIST)) {
  console.error(`构建产物不存在: ${DIST}（先运行 npm run build）`);
  process.exit(2);
}

/* ---------- 1. 发布集合（gray-matter 解析 frontmatter） ---------- */
/** 归一化 frontmatter 日期为 YYYY-MM-DD（js-yaml 会把 2026-09-03 解析成 Date） */
function fmtDate(v) {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return v ? String(v) : '';
}
const posts = readdirSync(SRC_POSTS)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { data } = matter(readFileSync(join(SRC_POSTS, f), 'utf-8'));
    return {
      file: f,
      slug: data.slug || f.replace(/\.md$/, ''),
      title: String(data.title ?? ''),
      description: String(data.description ?? ''),
      seoTitle: data.seoTitle ?? '',
      seoDescription: data.seoDescription ?? '',
      image: data.image ?? '',
      date: fmtDate(data.date),
      updated: fmtDate(data.updated),
      published: data.published !== false,
      noindex: data.noindex === true,
      wechat: String(data.wechat_url ?? ''),
    };
  });

const published = posts.filter((p) => p.published);
const drafts = posts.filter((p) => !p.published);
const indexable = published.filter((p) => !p.noindex);
const noindexPosts = published.filter((p) => p.noindex);
const noindexBySlug = new Set(noindexPosts.map((p) => p.slug));

/* ---------- 2. slug 唯一性与合法性 ---------- */
const seen = new Map();
for (const p of posts) {
  if (seen.has(p.slug)) fail(`slug 重复: "${p.slug}"（${p.file} 与 ${seen.get(p.slug)}）`);
  seen.set(p.slug, p.file);
  if (!p.slug || !/^[a-z0-9][a-z0-9-]*$/.test(p.slug)) {
    fail(`slug 非法: "${p.slug}"（${p.file}）应为小写字母/数字/连字符`);
  }
  if (RESERVED.has(p.slug)) fail(`slug 与保留路由冲突: "${p.slug}"（${p.file}）`);
}

/* ---------- 3. 日期异常 ---------- */
for (const p of published) {
  if (!p.date) { fail(`缺少 date: ${p.file}`); continue; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) fail(`date 格式非 YYYY-MM-DD: ${p.file} -> ${p.date}`);
  if (p.updated) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.updated)) fail(`updated 格式非 YYYY-MM-DD: ${p.file}`);
    else if (p.updated < p.date) fail(`updated 早于 date: ${p.file} (${p.updated} < ${p.date})`);
  }
}

/* ---------- 4. 草稿不得有公开产物 ---------- */
for (const d of drafts) {
  if (existsSync(join(DIST, d.slug, 'index.html'))) fail(`草稿生成了公开路由: /${d.slug}/（${d.file}）`);
}

/* ---------- 5. 逐页 HTML 校验 ---------- */
const htmlPages = [];
function collectPages(dir, rel = '') {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === '_astro' || name === '_worker.js' || name === 'og') continue;
      collectPages(full, rel + '/' + name);
    } else if (name.endsWith('.html')) {
      htmlPages.push({ file: full, url: rel + '/' + (name === 'index.html' ? '' : name) });
    }
  }
}
collectPages(DIST);

const byUrl = new Map(htmlPages.map((p) => [p.url, p]));
const getMeta = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};
const hasNoindex = (html) =>
  /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) ||
  /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);

const titles = new Map();
const descriptions = new Map();
const canonicalSet = new Set();

/** 读取 PNG / JPEG 固有尺寸（校验 og:image 声明真实） */
function imageSize(file) {
  const buf = readFileSync(file);
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2;
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) { off++; continue; }
      const marker = buf[off + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) };
      }
      off += 2 + buf.readUInt16BE(off + 2);
    }
  }
  return null;
}

for (const page of htmlPages) {
  const html = readFileSync(page.file, 'utf-8');
  const is404 = page.url === '/404.html' || page.url === '/404/';
  const slug = page.url.replace(/^\//, '').replace(/\/$/, '');
  const isHome = page.url === '/';

  const title = titleTag(html);
  const desc = metaTag(html, 'description');
  const canonical = linkRel(html, 'canonical');
  const ogImage = metaTag(html, 'og:image');
  const ogW = metaTag(html, 'og:image:width');
  const ogH = metaTag(html, 'og:image:height');
  const twitterImage = metaTag(html, 'twitter:image');
  const robotsNoindex = hasNoindex(html);

  if (!title) fail(`${page.url}: 缺少 <title>`);
  if (!desc) fail(`${page.url}: 缺少 meta description`);
  if (!canonical) fail(`${page.url}: 缺少 canonical`);

  if (title) {
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(page.url);
  }
  if (desc) {
    if (!descriptions.has(desc)) descriptions.set(desc, []);
    descriptions.get(desc).push(page.url);
  }

  if (canonical) {
    // canonical 必须与该页面的实际期望 URL 全值一致（不只看域名开头）
    // 404 页特殊：期望地址为 /404（无 .html 后缀，与线上一致）
    let expected;
    if (is404) expected = DOMAIN + '/404';
    else if (isHome) expected = DOMAIN + '/';
    else expected = DOMAIN + page.url;
    const expectedNoSlash = expected.replace(/\/$/, '');
    if (canonical !== expected && canonical !== expectedNoSlash && !(isHome && canonical === DOMAIN)) {
      fail(`${page.url}: canonical 不是本页期望地址（期望 ${expected}，实际 ${canonical}）`);
    }
    if (/[?#]/.test(canonical)) fail(`${page.url}: canonical 含 fragment 或查询参数 -> ${canonical}`);
    if (canonicalSet.has(canonical)) fail(`canonical 重复: ${canonical}`);
    canonicalSet.add(canonical);
  }

  // noindex 策略：只有「显式 noindex 文章」或 404 允许 noindex；普通文章误带即失败
  if (robotsNoindex) {
    const isNoindexPost = !isHome && !is404 && noindexBySlug.has(slug);
    if (!isNoindexPost && !is404) {
      fail(`${page.url}: 普通页面误带 noindex（显式 noindex 文章或 404 除外）`);
    }
  } else if (noindexBySlug.has(slug)) {
    fail(`${page.url}: 声明 noindex 的文章页面缺少 noindex 元数据`);
  }

  // H1 恰好 1 个
  const h1s = (html.match(/<h1[ >]/g) || []).length;
  if (h1s !== 1) fail(`${page.url}: H1 数量为 ${h1s}，应为 1`);

  // 文章页正文：读取真实 .prose 子树（排除 post-end/脚本/样式），检测空正文/只剩模板/主体截断
  const isPost = published.some((p) => p.slug === slug);
  if (isPost) {
    const proseText = extractProse(html);
    if (proseText === null) {
      fail(`${page.url}: 正文 .prose 容器缺失（可能依赖 JS 或模板损坏）`);
    } else if (proseText.length < 80) {
      fail(`${page.url}: .prose 正文过短（${proseText.length} 字符），可能只剩模板或被截断`);
    } else {
      // 主体截断检测：正文以句号/问号/感叹号/引号等自然结尾更稳；
      // 若以逗号、冒号或半个括号结尾，大概率被截断
      const last = proseText[proseText.length - 1];
      if (/[，：、（]$/.test(last)) {
        fail(`${page.url}: 正文疑似被截断（以「${last}」结尾）`);
      }
    }
  }

  // og:image / twitter:image / JSON-LD image：以每页实际引用为准（支持绝对与相对 URL），
  // 同站图映射到 dist 读取真实尺寸与格式，核对声明一致性
  const ogRefs = [...new Set([ogImage, twitterImage].filter(Boolean))];
  for (const ref of ogRefs) {
    let distPath = null;
    try {
      const u = new URL(ref, DOMAIN);
      if (u.origin === DOMAIN) distPath = u.pathname; // 同站图映射到 dist
      else continue; // 外站图（本站不应出现，但校验器不误报）
    } catch {
      fail(`${page.url}: og/twitter image URL 非法 -> ${ref}`);
      continue;
    }
    const fp = join(DIST, decodeURIComponent(distPath));
    if (!existsSync(fp)) {
      fail(`${page.url}: 引用的分享图不存在 -> ${ref}`);
      continue;
    }
    const size = imageSize(fp);
    if (!size) {
      fail(`${page.url}: 引用的分享图不是可识别的 PNG/JPEG -> ${ref}`);
      continue;
    }
    if (ogW && ogH && (String(size.width) !== ogW || String(size.height) !== ogH)) {
      fail(`${page.url}: og:image 尺寸声明不真实（声明 ${ogW}x${ogH}，实际 ${size.width}x${size.height}）`);
    }
  }

  // JSON-LD 可解析（404 不需要）；Article image 与页面实际引用一致
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!lds.length && !is404) fail(`${page.url}: 缺少 JSON-LD`);
  for (const [, raw] of lds) {
    try {
      const objs = JSON.parse(raw);
      for (const o of Array.isArray(objs) ? objs : [objs]) {
        if (!o['@context']) fail(`${page.url}: JSON-LD 缺 @context`);
        if (!o['@type']) fail(`${page.url}: JSON-LD 缺 @type`);
        if (o.url && canonical && o.url !== canonical && !isHome) {
          fail(`${page.url}: JSON-LD url(${o.url}) 与 canonical(${canonical}) 不一致`);
        }
        // Article 的 image 引用必须真实存在（同 og:image 校验规则）
        if (o['@type'] === 'Article' && Array.isArray(o.image)) {
          for (const imgRef of o.image) {
            try {
              const u = new URL(String(imgRef), DOMAIN);
              if (u.origin !== DOMAIN) continue;
              if (!existsSync(join(DIST, decodeURIComponent(u.pathname)))) {
                fail(`${page.url}: JSON-LD image 不存在 -> ${imgRef}`);
              }
            } catch {
              fail(`${page.url}: JSON-LD image URL 非法 -> ${imgRef}`);
            }
          }
        }
      }
    } catch (e) {
      fail(`${page.url}: JSON-LD 无法解析 -> ${e.message.slice(0, 60)}`);
    }
  }

  // 站内链接 / 图片 / 锚点
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const href = m[1];
    let decoded = href;
    try { decoded = decodeURIComponent(href); } catch { /* keep */ }
    if (/\.(png|jpe?g|gif|svg|webp|ico|xml|txt|exe|mp4|webm|avif)$/i.test(decoded)) {
      if (!existsSync(join(DIST, decoded))) fail(`${page.url}: 资源不存在 -> ${href}`);
      continue;
    }
    if (href.startsWith('/api/')) continue;
    const rel = decoded.replace(/^\//, '');
    if (!existsSync(join(DIST, rel, 'index.html')) && !existsSync(join(DIST, rel))) {
      fail(`${page.url}: 站内链接指向不存在的路径 -> ${href}`);
    }
  }

  // 正文信息性图片产物断言：文件存在 + 尺寸/比例有效 + 必要 alt
  // （自动扫描实际文章集合，不硬编码图片数量；装饰图空 alt 不机械判错）
  if (isPost) {
    for (const m of html.matchAll(/<img\s[^>]*>/g)) {
      const tag = m[0];
      const src = (tag.match(/\ssrc\s*=\s*["']([^"']+)["']/) || [])[1];
      if (!src || !src.startsWith('/') || src.startsWith('//')) continue; // 外链不查
      let decoded;
      try { decoded = decodeURIComponent(new URL(src, 'http://x').pathname); } catch { decoded = null; }
      if (!decoded) { fail(`${page.url}: 图片 src 无法解码 -> ${src}`); continue; }
      const fp = join(DIST, decoded.replace(/^\//, ''));
      if (!existsSync(fp)) { fail(`${page.url}: 正文图片产物缺失 -> ${src}`); continue; }
      if (/\.(png|jpe?g)$/i.test(decoded)) {
        const size = imageSize(fp);
        if (!size) fail(`${page.url}: 正文图片无法解析尺寸 -> ${src}`);
        else if (size.width <= 0 || size.height <= 0 || size.width > 20000 || size.height > 20000) {
          fail(`${page.url}: 正文图片尺寸异常（${size.width}x${size.height}）-> ${src}`);
        }
      }
      // alt：信息性图片应有非空 alt；文件名式 alt（如 image.png）视为缺失
      const alt = (tag.match(/\salt\s*=\s*["']([^"']*)["']/) || [])[1];
      if (alt === undefined) {
        fail(`${page.url}: 图片缺少 alt 属性 -> ${src}`);
      } else if (alt.trim() && /^(image|img|screenshot|screen ?shot|图片|截图)[-.\d ]*\.(png|jpe?g|gif|webp)?$/i.test(alt.trim())) {
        fail(`${page.url}: 图片 alt 是文件名占位（${alt}）-> ${src}`);
      }
    }
  }

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(m[1])) fail(`${page.url}: 锚点 #${m[1]} 在本页不存在`);
  }

  if (isHome || isPost) {
    if (!html.includes(MEMBERSHIP_URL)) fail(`${page.url}: 缺少 AI会员代充入口链接`);
  }
  const post = published.find((p) => p.slug === slug);
  if (post?.wechat && !html.includes(post.wechat)) fail(`${page.url}: 缺少公众号原文链接`);
  if (post?.wechat && canonical === post.wechat) fail(`${page.url}: 微信原文地址被当成了 canonical`);

  // 开发痕迹（正文之外）：移除 .prose 子树后再检查
  const proseRaw = extractProseHtml(html) ?? '';
  const nonProse = html
    .replace(proseRaw, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  if (/localhost|127\.0\.0\.1|file:\/\/\/|[A-Za-z]:\\/.test(nonProse)) {
    fail(`${page.url}: 公共 HTML（正文之外）含本地地址或磁盘路径`);
  }
  if (/workers\.dev/.test(canonical || '')) fail(`${page.url}: canonical 指向 workers.dev 预览域名`);
}

/* ---------- 6. title / description 重复与长度 ---------- */
for (const [t, urls] of titles) if (urls.length > 1) fail(`title 重复: "${t}" 出现在 ${urls.join(', ')}`);
for (const [d, urls] of descriptions) if (urls.length > 1) fail(`description 重复出现在 ${urls.join(', ')}`);
for (const page of htmlPages) {
  if (page.url === '/404.html') continue;
  const html = readFileSync(page.file, 'utf-8');
  const d = metaTag(html, 'description');
  if (d && (d.length < 40 || d.length > 170)) {
    warn(`${page.url}: description 长度 ${d.length}（建议 40-170）：编辑建议，不阻断构建`);
  }
}

/* ---------- 7. sitemap（真实 XML 解析） ---------- */
const sitemapPath = join(DIST, 'sitemap.xml');
if (!existsSync(sitemapPath)) fail('缺少 sitemap.xml');
else {
  const xml = readFileSync(sitemapPath, 'utf-8');
  const valid = XMLValidator.validate(xml);
  if (valid !== true) fail(`sitemap.xml 非法 XML: ${String(valid.err?.msg ?? valid)}`);
  else {
    const parsed = new XMLParser().parse(xml);
    const urls = Array.isArray(parsed.urlset?.url) ? parsed.urlset.url : [parsed.urlset?.url];
    const locs = urls.map((u) => u?.loc).filter(Boolean);
    if (!locs.length) fail('sitemap 无 <loc>');
    for (const loc of locs) {
      if (!loc.startsWith(DOMAIN + '/')) fail(`sitemap loc 非生产绝对地址: ${loc}`);
      if (!canonicalSet.has(loc)) fail(`sitemap loc 与任何 canonical 不一致: ${loc}`);
    }
    for (const d of drafts) if (locs.some((l) => l.endsWith(`/${d.slug}/`))) fail(`sitemap 含草稿: ${d.slug}`);
    for (const n of noindexPosts) if (locs.some((l) => l.endsWith(`/${n.slug}/`))) fail(`sitemap 含 noindex 文章: ${n.slug}`);
    for (const p of indexable) {
      if (!locs.includes(`${DOMAIN}/${p.slug}/`)) fail(`sitemap 缺少正式文章: /${p.slug}/`);
    }
    for (const loc of locs) {
      const u = loc.replace(DOMAIN, '');
      if (!byUrl.has(u.replace(/\/$/, '')) && !byUrl.has(u)) fail(`sitemap 有 URL 但无对应页面: ${loc}`);
    }
    pass(`sitemap：${locs.length} 个 loc，XML 合法且与页面集合一致`);
  }
}

/* ---------- 8. RSS（真实 XML 解析） ---------- */
const rssPath = join(DIST, 'rss.xml');
if (!existsSync(rssPath)) fail('缺少 rss.xml');
else {
  const xml = readFileSync(rssPath, 'utf-8');
  const valid = XMLValidator.validate(xml);
  if (valid !== true) fail(`rss.xml 非法 XML: ${String(valid.err?.msg ?? valid)}`);
  else {
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    if (!items.length) fail('RSS 无 item');
    const links = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]);
    for (const l of links) if (!l.startsWith(DOMAIN)) fail(`RSS link 非生产绝对地址: ${l}`);
    for (const d of drafts) if (links.some((l) => l.includes(`/${d.slug}/`))) fail(`RSS 含草稿: ${d.slug}`);
    for (const n of noindexPosts) if (links.some((l) => l.includes(`/${n.slug}/`))) fail(`RSS 含 noindex 文章: ${n.slug}`);
    pass(`RSS：${items.length} 个 item，XML 合法且链接均为规范地址`);
  }
}

/* ---------- 9. robots.txt ---------- */
const robotsPath = join(DIST, 'robots.txt');
if (!existsSync(robotsPath)) fail('缺少 robots.txt');
else {
  const t = readFileSync(robotsPath, 'utf-8');
  if (/Disallow:\s*\/\s*$/m.test(t) && !/Allow:\s*\//.test(t)) fail('robots.txt 疑似全站禁止抓取');
  if (!t.includes(`${DOMAIN}/sitemap.xml`)) fail('robots.txt 未声明正确 sitemap 地址');
  pass('robots.txt：允许抓取且 sitemap 地址正确');
}

/* ---------- 10. _redirects 覆盖（自动生成） ---------- */
const rdPath = join(DIST, '_redirects');
const expectRedirects = published.map((p) => `/${p.slug} /${p.slug}/`);
if (!existsSync(rdPath)) fail('缺少 dist/_redirects（构建期自动生成未生效）');
else {
  const rd = readFileSync(rdPath, 'utf-8');
  for (const line of expectRedirects) {
    if (!rd.includes(line + ' 308')) fail(`_redirects 缺少规则: ${line} 308`);
  }
  if (/\bwww\./.test(rd)) fail('_redirects 出现未确认的 www 规则');
  pass(`_redirects：${expectRedirects.length} 条 308 规则覆盖全部正式文章`);
}

/* ---------- 11. 默认分享图 ---------- */
const ogDefault = join(DIST, 'og', 'default.png');
if (!existsSync(ogDefault)) fail('缺少默认分享图 og/default.png');

/* ---------- 输出 ---------- */
console.log('\n=== SEO 构建产物校验 ===\n');
console.log(`页面数: ${htmlPages.length}，文章: ${posts.length}（正式 ${published.length}，草稿 ${drafts.length}，noindex ${noindexPosts.length}）\n`);
if (ok.length) { console.log('通过:'); ok.forEach((m) => console.log('  [通过] ' + m)); }
if (warnings.length) { console.log('\n警告（不阻断）:'); warnings.forEach((m) => console.log('  [警告] ' + m)); }
if (errors.length) {
  console.log('\n错误:');
  errors.forEach((m) => console.log('  [失败] ' + m));
  console.log(`\n结果: 失败（${errors.length} 个错误，${warnings.length} 个警告）`);
  process.exit(1);
}
console.log(`\n结果: 已通过（${warnings.length} 个警告）`);
