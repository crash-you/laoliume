/**
 * rehype-seo.mjs — 构建期 AST 转换（不改正文源码，不会误伤代码块内容）
 *
 * 1) rehypeDemoteBodyHeadings
 *    正文（Markdown 渲染内容）出现一级标题时，将整篇标题层级下移一级：
 *    h1→h2、h2→h3、h3→h4，并加 rh1/rh2/rh3 类。
 *    配合 global.css 末尾的兼容规则，让字号、行距与降级前完全一致。
 *    文章页主标题在模板里（不属于 Markdown 内容树），不受影响。
 *    锚点 id 由标题文本生成，与层级无关，降级后保持不变。
 *
 * 2) rehypeImageMeta
 *    为正文图片补 width / height（读取 public/ 下真实固有尺寸）、
 *    decoding="async"，并对首图以外的图片加 loading="lazy"。
 *    .prose img 已有 max-width:100%; height:auto，属性只提供比例提示，
 *    不改变显示尺寸，可减少加载位移（CLS）。
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');

/**
 * 把站内 src（如 /images/x/%E4%B8%AD.png?query#frag）安全解析为 public/ 下的真实文件路径。
 * 返回 null 表示不是本地 public 资源（外链、协议相对、非法编码、越出 public）。
 *
 * 规则：
 * - 以 URL 解析，只取 pathname，只解码一次（避免双重解码把 %2520 变空格）。
 * - 查询串/片段不参与文件定位；无效百分号编码（如 %zz、截断的 %e4）返回 null。
 * - 解码后必须仍是站内绝对路径，且 resolve 后不能越出 public/（防 ../ 越界）。
 */
export function resolvePublicFile(src) {
  if (typeof src !== 'string' || !src.startsWith('/') || src.startsWith('//')) return null; // 外链/相对/协议相对
  let pathname;
  try {
    pathname = new URL(src, 'http://resolve.local').pathname;
  } catch {
    return null;
  }
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null; // 无效编码（URIError: malformed URI）
  }
  if (decoded.includes('\0')) return null;
  // 解码后必须仍是站内绝对路径（防 //host 或解码出协议前缀）
  if (!decoded.startsWith('/')) return null;
  // 解码后的路径段不能包含 . / ..（防 %2e%2e%2f 越界）
  const segments = decoded.split('/');
  if (segments.some((s) => s === '..' || s === '.')) return null;
  const filePath = normalize(join(PUBLIC_DIR, decoded));
  const publicRoot = normalize(PUBLIC_DIR) + sep;
  if (filePath !== normalize(PUBLIC_DIR) && !filePath.startsWith(publicRoot)) return null;
  return filePath;
}

/** 读取 PNG / JPEG 固有尺寸 */
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

export function rehypeDemoteBodyHeadings() {
  // 安全映射：h1→h2 … h5→h6；h6 保持 h6（HTML 无 h7）。
  // 只有被降级的层级才加 rh* 类，供 global.css 还原原视觉。
  const DEMOTE = { h1: 'h2', h2: 'h3', h3: 'h4', h4: 'h5', h5: 'h6', h6: 'h6' };
  const RH_CLASS = { h1: 'rh1', h2: 'rh2', h3: 'rh3', h4: 'rh4', h5: 'rh5' };
  return (tree) => {
    let hasH1 = false;
    walk(tree, (node) => {
      if (node.tagName === 'h1') hasH1 = true;
    });
    if (!hasH1) return; // 正文不含一级标题的文章保持原样
    // 单次遍历：每个节点只处理一次，不会连续降级同一节点
    walk(tree, (node) => {
      const from = node.tagName;
      if (!DEMOTE[from]) return; // 非标题节点
      node.tagName = DEMOTE[from];
      if (RH_CLASS[from]) {
        const cls = node.properties?.className ?? [];
        node.properties = node.properties ?? {};
        node.properties.className = [...cls, RH_CLASS[from]];
      }
    });
  };
}

export function rehypeImageMeta() {
  return (tree, file) => {
    let imgIndex = 0;
    const warnings = [];
    walk(tree, (node) => {
      if (node.tagName !== 'img' || !node.properties?.src) return;
      const src = String(node.properties.src);
      imgIndex++;
      // 只处理站内 public/ 图片；外链与协议相对 URL 不动
      if (!src.startsWith('/') || src.startsWith('//')) return;
      const filePath = resolvePublicFile(src);
      if (filePath && existsSync(filePath)) {
        if (/\.(png|jpe?g)$/i.test(src)) {
          try {
            const size = imageSize(filePath);
            if (size && !node.properties.width && !node.properties.height) {
              node.properties.width = size.width;
              node.properties.height = size.height;
            }
          } catch {
            warnings.push(`图片尺寸读取失败: ${src}`);
          }
        }
      } else {
        // 本地路径解析失败或文件缺失：构建期警告（产物断言在 seo-check 里兜底）
        warnings.push(`图片文件不存在: ${src}（${file.basename ?? 'unknown'}）`);
      }
      node.properties.decoding = 'async';
      // 首图保持 eager（可能是首屏/LCP），其余懒加载
      if (imgIndex > 1 && !node.properties.loading) {
        node.properties.loading = 'lazy';
      }
    });
    for (const w of warnings) console.warn('[rehype-image-meta]', w);
  };
}

function walk(node, visit) {
  if (!node || node.type !== 'element') {
    if (node?.children) node.children.forEach((c) => walk(c, visit));
    return;
  }
  visit(node);
  if (node.children) node.children.forEach((c) => walk(c, visit));
}
