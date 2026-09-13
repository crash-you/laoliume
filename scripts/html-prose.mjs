/**
 * html-prose.mjs — 共享的 HTML 正文解析（seo-check 与 seo-smoke 使用同一 DOM 正文定义）
 *
 * 提供基于真实 HTML 树解析（parse5）的正文与元数据读取：
 * - extractProse(html): 返回 .prose 子树的纯文本（排除 script/style/post-end 模板）
 * - extractProseParts(html): 返回 { head, middle, tail } 三段指纹，用于线上/本地一致性比较
 * - metaTag(html, name|property): 读取 meta 标签 content（双引号/单引号/属性顺序均可）
 * - linkRel(html, rel): 读取 link 标签 href
 * - titleTag(html): 读取 <title> 文本
 *
 * 正文定义：用 parse5 解析完整 HTML 树，按 class token 精确匹配第一个 class 含
 * "prose" 的元素，提取其子树内容。树解析天然处理嵌套/兄弟元素、单双引号、属性
 * 顺序、注释与转义代码示例（代码块里的 &lt;div&gt; 是文本节点，不会被当成标签），
 * 不会把 .prose 之后的 post-end 模板算进正文，也不用「.prose 到 </article>」的正则。
 *
 * 依赖 parse5（package.json 显式声明 devDependencies），不依赖未声明的传递依赖。
 */
import { parse, parseFragment, serializeOuter } from 'parse5';

/** 判断元素的 class 属性是否含有 token `prose`（精确 token 匹配，prose-other 不算） */
function hasProseClass(node) {
  const cls = node.attrs?.find((a) => a.name === 'class');
  if (!cls) return false;
  // HTML class 以空白分隔（空格、制表符、换行等）
  return cls.value
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .includes('prose');
}

/** 深度优先查找第一个 class token 含 prose 的元素 */
function findProseElement(node) {
  if (!node || !node.childNodes) return null;
  for (const child of node.childNodes) {
    if (child.tagName && hasProseClass(child)) return child;
    const found = findProseElement(child);
    if (found) return found;
  }
  return null;
}

/** 提取 .prose 元素子树的原始 HTML 片段（不含 .prose 标签本身）。找不到返回 null。
 *  返回片段是 .prose 元素的内部序列化——post-end 等后续模板天然不在其中。 */
export function extractProseHtml(html) {
  const doc = parse(html);
  const prose = findProseElement(doc);
  if (!prose) return null;
  // serializeOuter() 输出节点整体（含自身标签）；逐子节点序列化即得内部内容，
  // 标签原样保留，script/style 后续在 nodeText 里按节点类型排除
  return (prose.childNodes || []).map((child) => serializeOuter(child)).join('');
}

/** 从 HTML 片段提取纯文本（树解析：去标签、保留代码块文字、排除 script/style） */
export function htmlToText(fragment) {
  const doc = parseFragment(fragment);
  return nodeText(doc).replace(/\s+/g, ' ').trim();
}

/** 递归收集文本节点（跳过 script/style；实体如 &lt; 已由解析器解码为原字符） */
function nodeText(node) {
  if (!node) return '';
  if (node.nodeName === '#text') return node.value || '';
  if (node.nodeName === 'script' || node.nodeName === 'style') return '';
  if (!node.childNodes) return '';
  return node.childNodes.map((c) => nodeText(c)).join('');
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
 * 注意：这是头/中/尾三段指纹比较，不是完整文本逐字比较。
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
  const doc = parse(html);
  for (const tag of collectTags(doc, 'meta')) {
    const name = tag.attrs?.find((a) => a.name === 'name' || a.name === 'property')?.value ?? '';
    if (name.toLowerCase() === key.toLowerCase()) {
      return tag.attrs?.find((a) => a.name === 'content')?.value ?? null;
    }
  }
  return null;
}

/** 读取 <link rel="..."> 的 href（rel 可含多个 token，如 "canonical noopener"） */
export function linkRel(html, rel) {
  const doc = parse(html);
  for (const tag of collectTags(doc, 'link')) {
    const r = tag.attrs?.find((a) => a.name === 'rel')?.value ?? '';
    if (r.toLowerCase().split(/\s+/).includes(rel.toLowerCase())) {
      return tag.attrs?.find((a) => a.name === 'href')?.value ?? null;
    }
  }
  return null;
}

/** 读取 <title> 文本 */
export function titleTag(html) {
  const doc = parse(html);
  const title = collectTags(doc, 'title')[0];
  if (!title) return null;
  const text = nodeText(title).replace(/\s+/g, ' ').trim();
  return text || null;
}

/** 深度优先收集指定标签名的全部元素 */
function collectTags(node, tagName, out = []) {
  if (!node) return out;
  if (node.tagName === tagName) out.push(node);
  for (const child of node.childNodes || []) collectTags(child, tagName, out);
  return out;
}
