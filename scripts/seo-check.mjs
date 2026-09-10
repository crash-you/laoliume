/**
 * seo-check.mjs — 构建产物 SEO 校验（读真实 HTML / XML，不搜索源码关键字）
 *
 * 用法: node scripts/seo-check.mjs [--dist dist]
 * 退出码: 有硬错误 -> 1；仅警告 -> 0
 *
 * 硬错误（阻断 CI）：
 *   - 发布集合 / slug 唯一性 / 保留路由冲突 / 日期异常
 *   - 规范页面缺 title、description、canonical
 *   - title / description 重复或为空
 *   - 每页主 H1 数量不等于 1（首页除外，其 H1 为站点名）
 *   - 正文未出现在原始 HTML
 *   - JSON-LD 无法 JSON.parse / 缺主要字段 / URL 与 canonical 冲突
 *   - 内部链接、图片路径、锚点、规范地址无效
 *   - sitemap 含草稿 / noindex，或与页面集合不一致
 *   - RSS / sitemap 非法 XML
 *   - 公共 HTML 含 localhost / 磁盘路径 / 开发域名
 *   - 代充链接、公众号原文链接丢失
 * 警告（不阻断）：描述长度、alt 过短等编辑判断
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

/* ---------- 1. 发布集合（源） ---------- */
function parseFrontmatter(text) {
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

const posts = readdirSync(SRC_POSTS)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const fm = parseFrontmatter(readFileSync(join(SRC_POSTS, f), 'utf-8'));
    return {
      file: f,
      slug: fm.slug || f.replace(/\.md$/, ''),
      title: fm.title || '',
      description: fm.description || '',
      seoTitle: fm.seoTitle || '',
      seoDescription: fm.seoDescription || '',
      date: fm.date || '',
      updated: fm.updated || '',
      published: fm.published !== 'false',
      noindex: fm.noindex === 'true',
      wechat: fm.wechat_url || '',
    };
  });

const published = posts.filter((p) => p.published);
const drafts = posts.filter((p) => !p.published);
const indexable = published.filter((p) => !p.noindex);

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
if (errors.length === 0) pass(`slug 校验：${posts.length} 篇，唯一且无保留路由冲突`);

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
  const dir = join(DIST, d.slug);
  if (existsSync(join(dir, 'index.html'))) fail(`草稿生成了公开路由: /${d.slug}/（${d.file}）`);
}
if (drafts.length) pass(`草稿检查：${drafts.length} 篇草稿均无公开产物`);
else pass('草稿检查：当前无草稿');

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

function getMeta(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

const titles = new Map();
const descriptions = new Map();
const canonicalSet = new Set();

for (const page of htmlPages) {
  const html = readFileSync(page.file, 'utf-8');
  const is404 = page.url === '/404.html' || page.url === '/404/';
  const slug = page.url.replace(/^\//, '').replace(/\/$/, '');
  const isHome = page.url === '/';

  const title = getMeta(html, /<title>([\s\S]*?)<\/title>/);
  const desc = getMeta(html, /<meta name="description" content="([^"]*)"/);
  const canonical = getMeta(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = getMeta(html, /<meta name="robots" content="([^"]*)"/);

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
    if (!canonical.startsWith(DOMAIN + '/') && canonical !== DOMAIN) {
      fail(`${page.url}: canonical 不是生产绝对地址 -> ${canonical}`);
    }
    if (/[?#]/.test(canonical)) fail(`${page.url}: canonical 含 fragment 或查询参数 -> ${canonical}`);
    if (canonicalSet.has(canonical)) fail(`canonical 重复: ${canonical}`);
    canonicalSet.add(canonical);
  }

  if (robots && /noindex/.test(robots)) {
    if (!is404) fail(`${page.url}: 正式页面出现 noindex（生产站严禁误设）`);
  }

  // H1：首页 H1 为站点名，404 也有 H1，均要求恰好 1 个
  const h1s = (html.match(/<h1[ >]/g) || []).length;
  if (h1s !== 1) fail(`${page.url}: H1 数量为 ${h1s}，应为 1`);

  // 正文必须静态存在于原始 HTML（文章页）
  if (!isHome && !is404 && slug && published.some((p) => p.slug === slug)) {
    const rawText = html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, '');
    if (rawText.length < 800) fail(`${page.url}: 原始 HTML 正文过短（${rawText.length} 字符），可能依赖 JS`);
  }

  // JSON-LD 可解析（404 页面不需要结构化数据）
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!lds.length && !is404) fail(`${page.url}: 缺少 JSON-LD`);
  for (const [, raw] of lds) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      fail(`${page.url}: JSON-LD 无法解析 -> ${e.message.slice(0, 60)}`);
      continue;
    }
    const objs = Array.isArray(parsed) ? parsed : [parsed];
    for (const o of objs) {
      if (!o['@context']) fail(`${page.url}: JSON-LD 缺 @context`);
      if (!o['@type']) fail(`${page.url}: JSON-LD 缺 @type`);
      if (o.url && canonical && o.url !== canonical && !isHome) {
        fail(`${page.url}: JSON-LD url(${o.url}) 与 canonical(${canonical}) 不一致`);
      }
    }
  }

  // 站内链接 / 图片 / 锚点
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const href = m[1];
    // 资源路径可能包含中文等百分号编码字符，需解码后再查文件系统
    let decoded = href;
    try {
      decoded = decodeURIComponent(href);
    } catch {
      /* 保留原值 */
    }
    if (/\.(png|jpe?g|gif|svg|webp|ico|xml|txt|exe|mp4|webm|avif)$/i.test(decoded)) {
      if (!existsSync(join(DIST, decoded))) fail(`${page.url}: 资源不存在 -> ${href}`);
      continue;
    }
    if (href.startsWith('/api/')) continue;
    const rel = decoded.replace(/^\//, '');
    const cand = existsSync(join(DIST, rel, 'index.html')) || existsSync(join(DIST, rel));
    if (!cand) fail(`${page.url}: 站内链接指向不存在的路径 -> ${href}`);
  }

  // 锚点有效性（仅校验本页内锚点）
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(m[1])) fail(`${page.url}: 锚点 #${m[1]} 在本页不存在`);
  }

  // 业务与来源链接必须存在
  if (isHome || (!isHome && !is404)) {
    const isPost = published.some((p) => p.slug === slug);
    if (isHome || isPost) {
      if (!html.includes(MEMBERSHIP_URL)) fail(`${page.url}: 缺少 AI会员代充入口链接`);
    }
  }
  const post = published.find((p) => p.slug === slug);
  if (post?.wechat && !html.includes(post.wechat)) fail(`${page.url}: 缺少公众号原文链接`);
  if (post?.wechat && canonical && canonical === post.wechat) fail(`${page.url}: 微信原文地址被当成了 canonical`);

  // 开发痕迹：只在「正文之外」检查，避免教程正文里合法的 C:\Users 示例路径误报
  const nonProse = html
    .replace(/<div class="prose">[\s\S]*?<\/article>/, '')
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
  const d = getMeta(html, /<meta name="description" content="([^"]*)"/);
  if (d && (d.length < 40 || d.length > 170)) {
    warn(`${page.url}: description 长度 ${d.length}（建议 40-170）：编辑建议，不阻断构建`);
  }
}
pass(`title / description 唯一性检查完成（${titles.size} 个唯一 title）`);

/* ---------- 7. sitemap ---------- */
const sitemapPath = join(DIST, 'sitemap.xml');
if (!existsSync(sitemapPath)) fail('缺少 sitemap.xml');
else {
  const xml = readFileSync(sitemapPath, 'utf-8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!locs.length) fail('sitemap 无 <loc>');
  for (const loc of locs) {
    if (!loc.startsWith(DOMAIN + '/')) fail(`sitemap loc 非生产绝对地址: ${loc}`);
    if (!canonicalSet.has(loc)) fail(`sitemap loc 与任何 canonical 不一致: ${loc}`);
    if (/&(?!(amp|lt|gt|quot|apos);)/.test(loc)) fail(`sitemap loc XML 转义不完整: ${loc}`);
  }
  for (const d of drafts) if (locs.some((l) => l.endsWith(`/${d.slug}/`))) fail(`sitemap 含草稿: ${d.slug}`);
  for (const n of published.filter((p) => p.noindex)) {
    if (locs.some((l) => l.endsWith(`/${n.slug}/`))) fail(`sitemap 含 noindex 文章: ${n.slug}`);
  }
  for (const p of indexable) {
    if (!locs.includes(`${DOMAIN}/${p.slug}/`)) fail(`sitemap 缺少正式文章: /${p.slug}/`);
  }
  // 页面集合 vs sitemap 一致性
  for (const loc of locs) {
    const u = loc.replace(DOMAIN, '');
    if (!byUrl.has(u === '/' ? '/' : u.replace(/\/$/, '')) && !byUrl.has(u)) {
      fail(`sitemap 有 URL 但无对应页面: ${loc}`);
    }
  }
  if (!/<\?xml/.test(xml)) fail('sitemap 缺少 XML 声明');
  pass(`sitemap：${locs.length} 个 loc，符号表与页面集合一致`);
}

/* ---------- 8. RSS ---------- */
const rssPath = join(DIST, 'rss.xml');
if (!existsSync(rssPath)) fail('缺少 rss.xml');
else {
  const xml = readFileSync(rssPath, 'utf-8');
  if (!/<\?xml/.test(xml)) fail('RSS 缺少 XML 声明');
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  if (!items.length) fail('RSS 无 item');
  const links = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]);
  for (const l of links) {
    if (!l.startsWith(DOMAIN)) fail(`RSS link 非生产绝对地址: ${l}`);
  }
  for (const d of drafts) if (links.some((l) => l.includes(`/${d.slug}/`))) fail(`RSS 含草稿: ${d.slug}`);
  for (const n of published.filter((p) => p.noindex)) {
    if (links.some((l) => l.includes(`/${n.slug}/`))) fail(`RSS 含 noindex 文章: ${n.slug}`);
  }
  if (!xml.includes('佬刘AI')) warn('RSS 未包含站点名');
  pass(`RSS：${items.length} 个 item，链接均为规范地址`);
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

/* ---------- 10. _redirects 覆盖完整性 ---------- */
const rdPath = join(DIST, '_redirects');
const expectRedirects = published.map((p) => `/${p.slug} /${p.slug}/`);
if (!existsSync(rdPath)) fail('缺少 _redirects（非规范文章入口无 308 永久重定向）');
else {
  const rd = readFileSync(rdPath, 'utf-8');
  for (const line of expectRedirects) {
    if (!rd.includes(line)) fail(`_redirects 缺少规则: ${line} 308`);
  }
  if (/\bwww\./.test(rd)) fail('_redirects 出现未确认的 www 规则');
  pass(`_redirects：${expectRedirects.length} 条 308 规则覆盖全部正式文章`);
}

/* ---------- 11. OG 分享图存在 ---------- */
const ogDir = join(DIST, 'og');
if (!existsSync(ogDir)) fail('缺少 og/ 分享图目录');
else {
  if (!existsSync(join(ogDir, 'default.png'))) fail('缺少默认分享图 og/default.png');
  for (const p of published) {
    const png = join(ogDir, `${p.slug}.png`);
    if (!existsSync(png)) fail(`缺少分享图 og/${p.slug}.png`);
  }
  pass(`OG 分享图：${published.length} 篇 + 默认图齐全`);
}

/* ---------- 输出 ---------- */
console.log('\n=== SEO 构建产物校验 ===\n');
console.log(`检查页面数: ${htmlPages.length}，源文章: ${posts.length}（正式 ${published.length}，草稿 ${drafts.length}）\n`);
if (ok.length) {
  console.log('通过:');
  ok.forEach((m) => console.log('  [通过] ' + m));
}
if (warnings.length) {
  console.log('\n警告（不阻断构建）:');
  warnings.forEach((m) => console.log('  [警告] ' + m));
}
if (errors.length) {
  console.log('\n错误:');
  errors.forEach((m) => console.log('  [失败] ' + m));
  console.log(`\n结果: 失败（${errors.length} 个错误，${warnings.length} 个警告）`);
  process.exit(1);
}
console.log(`\n结果: 已通过（${warnings.length} 个警告）`);
