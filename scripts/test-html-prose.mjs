/**
 * test-html-prose.mjs — html-prose 正文扫描器边界测试
 *
 * 背景：旧实现（双游标正则 findMatchingClose）在嵌套 div 下会漏算闭合标签，
 * 把 .prose 之后的 post-end 模板算进正文。本文件用真实 HTML 树解析（parse5）
 * 的实现覆盖以下边界（每类都断言具体文本与「不含 FOOTER」，不只断言返回字符串）：
 *
 *  1. 无嵌套正常正文
 *  2. 一层嵌套 div
 *  3. 多层嵌套 / 多个兄弟 div
 *  4. 只有空嵌套元素但长 footer（空正文 + post-end 不算正文）
 *  5. 合法嵌套且没有 footer
 *  6. 类名近似但不匹配（prose-other / myprose / prose-x 不算 prose）
 *  7. 正文内 script/style 被排除
 *  8. 代码块转义的 <div>（&lt;div&gt;）仍作为文字保留
 *  附加：单双引号与属性顺序、注释干扰、meta/link/title 读取回归。
 *
 * 退出码: 全部通过 -> 0；任一失败 -> 1
 */
import { extractProse, extractProseHtml, extractProseParts, htmlToText, metaTag, linkRel, titleTag } from './html-prose.mjs';

let passed = 0;
let failed = 0;
const ok = (l) => { passed++; console.log('  ok  ' + l); };
const bad = (l, d = '') => { failed++; console.error('FAIL ' + l + ' ' + d); };
const check = (c, l, d = '') => (c ? ok(l) : bad(l, d));

const FOOTER = 'FOOTER-本文首发于微信公众号，感谢阅读，欢迎关注转发收藏打赏一条龙服务。';

/** 标准文章骨架：.prose 内容可注入，post-end 模板固定在后 */
function page(proseInner, extra = '') {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>测试文章 - 佬刘AI</title></head><body><main><article><h1>测试文章标题</h1><div class="prose">${proseInner}</div><div class="post-end"><p>${FOOTER}</p></div>${extra}</article></main></body></html>`;
}

console.log('# 1. 无嵌套正常正文');
{
  const html = page('<p>甲段落内容。</p><p>乙段落内容。</p>');
  const text = extractProse(html);
  check(text !== null, '返回正文（非 null）', `实际 ${JSON.stringify(text)}`);
  check(text === '甲段落内容。乙段落内容。', '正文文本正确', `实际 ${JSON.stringify(text)}`);
  check(!text.includes('FOOTER'), '不含 FOOTER');
}

console.log('# 2. 一层嵌套 div（任务书最小复现）');
{
  const html = page('<p>A</p><div>B</div><p>C</p>');
  const text = extractProse(html);
  check(text === 'ABC', '正文为 A、B、C', `实际 ${JSON.stringify(text)}`);
  check(!text.includes('FOOTER'), '不含 FOOTER');
}

console.log('# 3. 多层嵌套与多个兄弟 div');
{
  // DOM 顺序（先序遍历）：外层 → 中层 → 内层 → 兄弟 → 另一个兄弟 → 再来一个
  const html = page('<div>外层<div>中层<div>内层</div>兄弟</div>另一个兄弟<div>再来一个</div></div>');
  const text = extractProse(html);
  check(text === '外层中层内层兄弟另一个兄弟再来一个', '多层/兄弟文本按先序全部提取', `实际 ${JSON.stringify(text)}`);
  check(!text.includes('FOOTER'), '不含 FOOTER');
}

console.log('# 4. 只有空嵌套元素但长 footer（post-end 不得算正文凑字数）');
{
  const html = page('<div></div>');
  const text = extractProse(html);
  check(text !== null, '空嵌套正文仍返回字符串（容器存在）', `实际 ${JSON.stringify(text)}`);
  check(text === '', '正文为空（不吞 footer）', `实际 ${JSON.stringify(text)}`);
  const parts = extractProseParts(html);
  // 空 .prose：三段指纹应为 null（长度 0），而不是把 FOOTER 当正文
  check(parts === null, '空正文的三段指纹为 null（不把 FOOTER 当正文）', `实际 ${JSON.stringify(parts)}`);
}

console.log('# 5. 合法嵌套且没有 footer');
{
  const html = `<!doctype html><html><body><article><h1>标题</h1><div class="prose"><div>嵌套内容</div><p>普通段落。</p></div></article><div class="sidebar">侧栏内容</div></body></html>`;
  const text = extractProse(html);
  check(text === '嵌套内容普通段落。', '无 footer 时嵌套正文正常', `实际 ${JSON.stringify(text)}`);
  check(!text.includes('侧栏内容'), '不含 .prose 之外的侧栏内容');
}

console.log('# 6. 类名近似但不匹配');
{
  const cases = [
    ['prose-other', '<div class="prose-other"><p>不应提取</p></div>'],
    ['myprose', '<div class="myprose"><p>不应提取</p></div>'],
    ['prose-2', '<div class="prose-2"><p>不应提取</p></div>'],
  ];
  for (const [name, inner] of cases) {
    const html = `<!doctype html><html><body><article>${inner}<div class="post-end"><p>${FOOTER}</p></div></article></body></html>`;
    const text = extractProse(html);
    check(text === null, `class="${name}" 不被当成 prose`, `实际 ${JSON.stringify(text)}`);
  }
  // 多 token class：prose 是其中一个 token 时应匹配
  const html2 = `<!doctype html><html><body><article><div class="content prose wide"><p>多token匹配</p></div><div class="post-end"><p>${FOOTER}</p></div></article></body></html>`;
  const text2 = extractProse(html2);
  check(text2 === '多token匹配', 'class 多 token 含 prose 时匹配', `实际 ${JSON.stringify(text2)}`);
  check(!text2.includes('FOOTER'), '多 token 场景不含 FOOTER');
}

console.log('# 7. 正文内 script/style 被排除');
{
  const html = page('<p>前段。</p><script>var x = "脚本内容";</script><style>.a{color:red}</style><p>后段。</p>');
  const text = extractProse(html);
  check(text === '前段。后段。', 'script/style 内容不进正文', `实际 ${JSON.stringify(text)}`);
  check(!text.includes('脚本内容') && !text.includes('color'), '脚本与样式文本被排除');
}

console.log('# 8. 代码块转义的 <div> 仍作为文字保留');
{
  const html = page('<p>示例：</p><pre><code>&lt;div class="prose"&gt;代码示例&lt;/div&gt;</code></pre>');
  const text = extractProse(html);
  // extractProse 归一化空白（与旧实现一致：标签间空格折叠），
  // 断言代码文字完整保留（含 class 属性文字），只是空白被折叠
  check(text.includes('代码示例') && text.includes('class="prose"'), '转义的 div 作为文字保留', `实际 ${JSON.stringify(text)}`);
  check(!text.includes('FOOTER'), '代码块场景不含 FOOTER');
  // 转义的标签不能被当成真实标签参与树结构
  const html2 = page('<p>正文。</p><pre><code>&lt;div&gt;&lt;/div&gt;&lt;/div&gt;&lt;div&gt;</code></pre>');
  const text2 = extractProse(html2);
  check(text2 === '正文。<div></div></div><div>', '多个转义 div 全部按文字保留', `实际 ${JSON.stringify(text2)}`);
  check(!text2.includes('FOOTER'), '转义标签不破坏边界（不含 FOOTER）');
  // htmlToText（未折叠空白）下属性空格保留
  const frag = extractProseHtml(html);
  const raw = htmlToText(frag);
  check(raw.includes('<div class="prose">代码示例</div>'), 'htmlToText 层面转义 div 空格保留', `实际 ${JSON.stringify(raw)}`);
}

console.log('# 9. 单双引号与属性顺序、注释干扰');
{
  // 单引号 + class 在后 + 注释里出现 div/prose 字样
  const html = `<!doctype html><html><body><article>
<!-- <div class="prose"><div>注释里的内容</div></div> -->
<div id='main' class='prose'><p>真实正文。</p></div>
<div class="post-end"><p>${FOOTER}</p></div>
</article></body></html>`;
  const text = extractProse(html);
  check(text === '真实正文。', '单引号/属性顺序/注释场景提取正确', `实际 ${JSON.stringify(text)}`);
  check(!text.includes('FOOTER') && !text.includes('注释里的内容'), '不含注释与 FOOTER');
}

console.log('# 10. extractProseHtml 返回内部片段');
{
  const html = page('<p>A</p><div>B</div>');
  const frag = extractProseHtml(html);
  check(frag !== null && frag.includes('<p>A</p>') && frag.includes('<div>B</div>'), '片段含内部节点');
  check(frag !== null && !frag.includes('post-end'), '片段不含 post-end 模板');
  // seo-check 的 nonProse 剥离逻辑依赖片段能从原文中定位
  check(html.includes(frag.trim()) || html.replace(/\s+/g, ' ').includes(frag.replace(/\s+/g, ' ').trim()), '片段可回原文定位（供 nonProse 剥离）');
}

console.log('# 11. metaTag / linkRel / titleTag 回归（树解析版）');
{
  const html = `<!doctype html><html><head>
<title>页面标题 - 佬刘AI</title>
<meta name="description" content="双引号描述">
<meta content='单引号倒序描述' name='og-desc-fallback'>
<meta property="og:image" content="https://laoliu.me/og/default.png">
<link rel="canonical" href="https://laoliu.me/post1/">
<link href="https://laoliu.me/rss.xml" rel="alternate" type="application/rss+xml">
</head><body></body></html>`;
  check(metaTag(html, 'description') === '双引号描述', 'metaTag 双引号正序');
  check(metaTag(html, 'og-desc-fallback') === '单引号倒序描述', 'metaTag 单引号倒序');
  check(metaTag(html, 'og:image') === 'https://laoliu.me/og/default.png', 'metaTag property 键');
  check(linkRel(html, 'canonical') === 'https://laoliu.me/post1/', 'linkRel canonical');
  check(linkRel(html, 'alternate') === 'https://laoliu.me/rss.xml', 'linkRel 属性倒序 + 多 token');
  check(titleTag(html) === '页面标题 - 佬刘AI', 'titleTag 读取');
  check(metaTag(html, 'not-exist') === null, 'metaTag 不存在返回 null');
}

console.log('# 12. htmlToText 实体解码');
{
  const text = htmlToText('<p>a &amp; b &lt; c &gt; d &quot;e&quot;</p>');
  check(text === 'a & b < c > d "e"', '常用实体解码', `实际 ${JSON.stringify(text)}`);
}

console.log(`\n结果: ${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
