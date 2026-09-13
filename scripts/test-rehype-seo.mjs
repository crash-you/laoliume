/**
 * test-rehype-seo.mjs — rehype-seo 插件单元测试（合成输入，不只测现有文章）
 *
 * 用法: node scripts/test-rehype-seo.mjs
 * 退出码: 全部通过 -> 0；任一失败 -> 1
 */
import { rehypeDemoteBodyHeadings, rehypeImageMeta, resolvePublicFile } from '../src/lib/rehype-seo.mjs';
import { join } from 'node:path';

let failures = 0;
let passed = 0;

function assertEq(actual, expected, label) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    passed++;
    console.log(`  ok  ${label}`);
  } else {
    failures++;
    console.error(`FAIL ${label}\n     期望: ${b}\n     实际: ${a}`);
  }
}
function assert(cond, label, detail = '') {
  if (cond) {
    passed++;
    console.log(`  ok  ${label}`);
  } else {
    failures++;
    console.error(`FAIL ${label} ${detail}`);
  }
}

const text = (value) => ({ type: 'text', value });
const h = (tag, props, children) => ({
  type: 'element',
  tagName: tag,
  properties: props ?? {},
  children: children ?? [],
});
const root = (children) => ({ type: 'root', children });

function collectHeadings(node, out = []) {
  if (!node) return out;
  if (node.type === 'element' && /^h[1-6]$/.test(node.tagName)) out.push(node);
  if (node.children) node.children.forEach((c) => collectHeadings(c, out));
  return out;
}

console.log('# 1. 标题降级：h1-h6 全覆盖，无 undefined / h7');
{
  const tree = root([
    h('h1', { id: 'a' }, [text('一级')]),
    h('h2', { id: 'b' }, [text('二级')]),
    h('h3', { id: 'c' }, [text('三级')]),
    h('h4', { id: 'd' }, [text('四级')]),
    h('h5', { id: 'e' }, [text('五级')]),
    h('h6', { id: 'f' }, [text('六级')]),
  ]);
  rehypeDemoteBodyHeadings()(tree);
  const hs = collectHeadings(tree);
  assertEq(
    hs.map((x) => [x.tagName, x.properties.id, x.properties.className]),
    [
      ['h2', 'a', ['rh1']],
      ['h3', 'b', ['rh2']],
      ['h4', 'c', ['rh3']],
      ['h5', 'd', ['rh4']],
      ['h6', 'e', ['rh5']],
      ['h6', 'f', undefined], // h6 不降级、不加类
    ],
    'h1-h6 降级映射与 rh* 类'
  );
  assert(hs.every((x) => x.tagName && x.tagName !== 'h7'), '无 undefined 且无 h7');
}

console.log('# 2. 正文不含 h1 时保持原样');
{
  const tree = root([h('h2', { id: 'b' }, [text('二级')]), h('h3', { id: 'c' }, [text('三级')])]);
  rehypeDemoteBodyHeadings()(tree);
  const hs = collectHeadings(tree);
  assertEq(
    hs.map((x) => [x.tagName, x.properties.id]),
    [
      ['h2', 'b'],
      ['h3', 'c'],
    ],
    '无 h1 不降级'
  );
}

console.log('# 3. 代码块内容不被误改成标题');
{
  const tree = root([
    h('h1', { id: 'a' }, [text('一级')]),
    h('pre', {}, [
      h('code', {}, [text('# 这不是标题\n## 这也不是标题\n# 注释')]),
    ]),
  ]);
  rehypeDemoteBodyHeadings()(tree);
  const code = tree.children[1].children[0];
  assertEq(code.tagName, 'code', 'code 节点仍是 code');
  assertEq(code.children[0].value, '# 这不是标题\n## 这也不是标题\n# 注释', '代码文本原样保留');
}

console.log('# 4. 锚点 id 与文字保留');
{
  const tree = root([h('h1', { id: '一-google版' }, [text('一 Google版')])]);
  rehypeDemoteBodyHeadings()(tree);
  const node = tree.children[0];
  assertEq(node.tagName, 'h2', 'h1 -> h2');
  assertEq(node.properties.id, '一-google版', '锚点 id 不变');
  assertEq(node.children[0].value, '一 Google版', '文字不变');
}

console.log('# 5. 已有 className 保留（不覆盖）');
{
  const tree = root([h('h1', { className: ['custom'] }, [text('x')])]);
  rehypeDemoteBodyHeadings()(tree);
  assertEq(tree.children[0].properties.className, ['custom', 'rh1'], 'className 追加 rh1');
}

console.log('# 6. 图片元数据：补尺寸/decoding/lazy（首图 eager）');
{
  const tree = root([
    h('p', {}, [h('img', { src: '/og/default.png' }, [])]),
    h('p', {}, [h('img', { src: '/og/default.png' }, [])]),
    h('p', {}, [h('img', { src: 'https://example.com/x.png' }, [])]), // 外链不动
  ]);
  rehypeImageMeta()(tree, { basename: 'test.md' });
  const imgs = tree.children.map((p) => p.children[0]);
  assertEq([imgs[0].properties.width, imgs[0].properties.height], [1200, 630], '首图补真实尺寸');
  assertEq(imgs[0].properties.loading, undefined, '首图不 lazy');
  assertEq(imgs[0].properties.decoding, 'async', '首图 decoding=async');
  assertEq(imgs[1].properties.loading, 'lazy', '第二图 lazy');
  assertEq(imgs[2].properties.width, undefined, '外链图片不加尺寸');
}

console.log('# 7. 图片路径解码：中文/空格/百分号编码正确解析到 public 真实文件');
{
  // 真实存在的编码图片（仓库内）
  const zh = resolvePublicFile('/images/codex-deepseek/ChatGPT-Image-2026%E5%B9%B48%E6%9C%8828%E6%97%A5-22_24_17.png');
  assert(!!zh, '中文编码路径解析成功');
  assert(zh.includes('ChatGPT-Image-2026年8月28日-22_24_17.png'), '解码后为真实中文文件名');
  const zh2 = resolvePublicFile('/images/codex-long-term-memory/05c-%E8%AE%B0%E5%BF%86%E7%8A%B6%E6%80%81%E4%B8%8E%E9%80%80%E5%BD%B9.png');
  assert(!!zh2 && zh2.includes('05c-记忆状态与退役.png'), '第二张中文编码路径解析成功');
}

console.log('# 8. 图片路径边界：外链/协议相对/查询串/无效编码/越界');
{
  assertEq(resolvePublicFile('https://example.com/x.png'), null, '外链返回 null');
  assertEq(resolvePublicFile('//cdn.example.com/x.png'), null, '协议相对返回 null');
  assertEq(resolvePublicFile('images/x.png'), null, '相对路径返回 null');
  assertEq(resolvePublicFile('/x.png?v=2#frag'), resolvePublicFile('/x.png'), '查询串/片段不影响定位');
  assertEq(resolvePublicFile('/%zz-bad.png'), null, '无效百分号编码返回 null');
  assertEq(resolvePublicFile('/%e4%b8'), null, '截断的 UTF-8 编码返回 null');
  // URL 构造器会把 /../ 和 %2e%2e 都规范化为 /，所以这些输入实际落在 public/secret.txt —— 仍在 public 内，不越界
  const up = resolvePublicFile('/../secret.txt');
  assert(!!up && up.includes(join('public', 'secret.txt')), 'URL 规范化后 /.. 不会越出 public');
  const enc = resolvePublicFile('/images/%2e%2e/%2e%2e/secret.txt');
  assert(!!enc && enc.includes(join('public', 'secret.txt')), '编码的 %2e%2e 被 URL 规范化，不越出 public');
  // 解码后才出现 .. 的路径无法通过 URL 构造器构造（URL 已规范化），此分支防御性保留
  // 双重编码：只解码一次，%2520 -> "%20" 字面文件名（不存在但路径合法）
  const double = resolvePublicFile('/images/%2520x.png');
  assert(!!double && double.includes('%20x.png'), '双重编码只解一次（%2520 -> %20 字面名）');
}

console.log('# 9. rehypeImageMeta 用编码路径补尺寸（真实仓库图片）');
{
  const tree = root([
    h('p', {}, [h('img', { src: '/images/codex-long-term-memory/05c-%E8%AE%B0%E5%BF%86%E7%8A%B6%E6%80%81%E4%B8%8E%E9%80%80%E5%BD%B9.png' }, [])]),
    h('p', {}, [h('img', { src: '/images/codex-deepseek/ChatGPT-Image-2026%E5%B9%B48%E6%9C%8828%E6%97%A5-22_24_17.png' }, [])]),
    h('p', {}, [h('img', { src: '/missing/%e4%b8%ad.png' }, [])]),
  ]);
  rehypeImageMeta()(tree, { basename: 'test.md' });
  const imgs = tree.children.map((p) => p.children[0]);
  assertEq([imgs[0].properties.width, imgs[0].properties.height], [1536, 1024], '05c-记忆状态与退役.png 补 1536x1024');
  assertEq([imgs[1].properties.width, imgs[1].properties.height], [1922, 818], 'ChatGPT-Image 补 1922x818');
  assertEq(imgs[2].properties.width, undefined, '缺失文件不加尺寸');
  assertEq(imgs[0].properties.loading, undefined, '首图 eager');
  assertEq(imgs[1].properties.loading, 'lazy', '第二图 lazy');
}

console.log('');
console.log(`结果: ${passed} 通过, ${failures} 失败`);
process.exit(failures ? 1 : 0);
