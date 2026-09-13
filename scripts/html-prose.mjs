/**
 * html-prose.mjs — 共享的 HTML 正文解析（seo-check 与 seo-smoke 使用同一 DOM 正文定义）
 *
 * 提供不依赖属性顺序/引号风格的轻量解析：
 * - extractProse(html): 返回 .prose 子树的纯文本（排除 script/style/post-end 模板）
 * - extractProseParts(html): 返回 { head, middle, tail } 三段指纹，用于线上/本地一致性比较
 * - metaTag(html, name|property): 读取 meta 标签 content（双引号/单引号/属性顺序均可）
 * - linkRel(html, rel): 读取 link 标签 href
 *
 * 解析策略：用简单的标签扫描器找到 <div class="prose"> 的匹配闭合 </div>，
 * 不用「.prose 到 </article>」的正则（会把 post-end 模板混进正文）。
 */

/** 找到 startIdx 处开始的开标签对应的闭合标签位置（处理嵌套同名标签） */
function findMatchingClose(html, startIdx, openTag, closeTag) {
  const openRe = new RegExp('<' + openTag + '(?=[\\s>])', 'gi');
  const closeRe = new RegExp('</' + closeTag + '\\s*>', 'gi');
  let depth = 0;
  openRe.lastIndex = startIdx;
  closeRe.lastIndex = startIdx;
  // 先消耗起始开标签本身
  openRe.exec(html);
  depth = 1;
  while (depth > 0) {
    const nextOpen = openRe.exec(html);
    const nextClose = closeRe.exec(html);
    if (!nextClose) return -1; // 未闭合
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
    } else {
      depth--;
      if (depth === 0) return nextClose.index + nextClose[0].length;
    }
  }
  return -1;
}

/** 提取 .prose div 的原始 HTML（不含 post-end）。找不到返回 null。 */
export function extractProseHtml(html) {
  // 匹配 <div class="prose"> 或 class 含 prose 的 div（class 属性值恰好为 prose 或以空格分隔含 prose）
  const m = html.match(/<div\s[^>]*class\s*=\s*["'][^"']*\bprose\b[^"']*["'][^>]*>/i);
  if (!m) return null;
  const openEnd = m.index + m[0].length;
  const closeEnd = findMatchingClose(html, m.index, 'div', 'div');
  if (closeEnd < 0) return null;
  return html.slice(openEnd, closeEnd);
}

/** 从 HTML 片段提取纯文本（去标签，保留代码块文字，排除 script/style） */
export function htmlToText(fragment) {
  return fragment
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

/** 归一化空白后的正文纯文本 */
export function extractProse(html) {
  const prose = extractProseHtml(html);
  if (prose === null) return null;
  return htmlToText(prose).replace(/\s+/g, '');
}

/**
 * 三段指纹（头/中/尾），用于线上与本地构建产物的一致性比较。
 * 比单点 30 字符指纹更稳：覆盖开头、中间、结尾，正文被截断或中段丢失都能发现。
 */
export function extractProseParts(html) {
  const text = extractProse(html);
  if (text === null || text.length === 0) return null;
  const n = text.length;
  const seg = (start, len) => text.slice(start, Math.min(start + len, n));
  return {
    length: n,
    head: seg(0, 40),
    middle: seg(Math.floor(n / 2), 40),
    tail: seg(Math.max(0, n - 40), 40),
  };
}

/** 读取 <meta> 的 content：支持 name= 或 property=，属性顺序无关，单双引号均可 */
export function metaTag(html, key) {
  const patterns = [
    // name/property 在前，content 在后
    new RegExp('<meta\\s[^>]*?(?:name|property)\\s*=\\s*["\']' + escapeRe(key) + '["\'][^>]*?content\\s*=\\s*["\']([^"\']*)["\']', 'i'),
    // content 在前，name/property 在后
    new RegExp('<meta\\s[^>]*?content\\s*=\\s*["\']([^"\']*)["\'][^>]*?(?:name|property)\\s*=\\s*["\']' + escapeRe(key) + '["\']', 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

/** 读取 <link rel="..."> 的 href */
export function linkRel(html, rel) {
  const patterns = [
    new RegExp('<link\\s[^>]*?rel\\s*=\\s*["\']' + escapeRe(rel) + '["\'][^>]*?href\\s*=\\s*["\']([^"\']*)["\']', 'i'),
    new RegExp('<link\\s[^>]*?href\\s*=\\s*["\']([^"\']*)["\'][^>]*?rel\\s*=\\s*["\']' + escapeRe(rel) + '["\']', 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

/** 读取 <title> 文本 */
export function titleTag(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : null;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}