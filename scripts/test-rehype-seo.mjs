/**
 * test-rehype-seo.mjs — rehype-seo 插件单元测试（合成输入，不只测现有文章）
 *
 * 用法: node scripts/test-rehype-seo.mjs
 * 退出码: 全部通过 -> 0；任一失败 -> 1
 */
import { rehypeDemoteBodyHeadings, rehypeImageMeta } from '../src/lib/rehype-seo.mjs';

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

console.log('');
console.log(`结果: ${passed} 通过, ${failures} 失败`);
process.exit(failures ? 1 : 0);
