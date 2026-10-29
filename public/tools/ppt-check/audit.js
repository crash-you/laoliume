/* PPT structure inspector. No uploads, network requests, or document execution. */
(function (root) {
  'use strict';
  const LIMITS = Object.freeze({ file: 30 * 1024 * 1024, entries: 6000, xml: 3 * 1024 * 1024, xmlTotal: 40 * 1024 * 1024, expanded: 250 * 1024 * 1024, slides: 300 });
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const local = n => n.localName || n.nodeName.split(':').pop();
  const kids = n => Array.from(n.children || n.childNodes || []).filter(x => x.nodeType === 1);
  const descendants = (n, name) => Array.from(n.getElementsByTagNameNS('*', name));
  const first = (n, name) => descendants(n, name)[0] || null;
  const attr = (n, name) => n ? n.getAttribute(name) : null;
  const num = (n, name, fallback = 0) => { const v = attr(n, name); return v === null || v === '' ? fallback : Number(v); };
  const truthy = value => value === '1' || value === 'true';
  const crcTable = Array.from({length: 256}, (_, n) => { for (let k = 0; k < 8; k++) n = (n & 1) ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
  function crc32(bytes) { let c = 0xffffffff; for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function fail(message) { throw new Error(message); }
  function normalizePart(base, target) {
    if (!target || /[\\?#\u0000-\u001f]/.test(target) || /^[a-z]+:/i.test(target)) fail('文件内部引用路径不受支持。');
    const segments = target.startsWith('/') ? [] : base.split('/').slice(0, -1);
    for (const p of target.split('/')) { if (!p || p === '.') continue; if (p === '..') { if (!segments.length) fail('文件内部引用超出包目录。'); segments.pop(); } else segments.push(p); }
    return segments.join('/');
  }
  function relPath(part) { const i = part.lastIndexOf('/'); return `${part.slice(0, i + 1)}_rels/${part.slice(i + 1)}.rels`; }
  function parseXML(text, name) {
    if (/<!DOCTYPE|<!ENTITY/i.test(text)) fail(`${name} 包含不支持的 XML 声明。`);
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length || local(doc.documentElement) === 'parsererror') fail(`${name} 的 XML 已损坏。`);
    return doc;
  }
  class Package {
    constructor(buffer) {
      if (buffer.byteLength > LIMITS.file) fail('文件超过 30 MB。请先在 PowerPoint 中拆分成较小文件。');
      this.bytes = new Uint8Array(buffer); this.view = new DataView(buffer); this.entries = new Map(); this.cache = new Map(); this.readTotal = 0;
      const n = this.bytes.length; if (n < 22) fail('这不是有效的 PPTX 文件。');
      let end = -1;
      for (let i = n - 22; i >= Math.max(0, n - 65557); i--) if (this.view.getUint32(i, true) === 0x06054b50 && i + 22 + this.view.getUint16(i + 20, true) === n) { end = i; break; }
      if (end < 0) fail('无法读取 PPTX 包。文件可能损坏、加密，或只是改了扩展名。');
      const v = this.view;
      if (v.getUint16(end + 4, true) || v.getUint16(end + 6, true)) fail('不支持分卷压缩包。');
      const count = v.getUint16(end + 10, true), size = v.getUint32(end + 12, true), offset = v.getUint32(end + 16, true);
      if (count === 65535 || size === 0xffffffff || offset === 0xffffffff) fail('不支持 ZIP64 文件，请拆分后重试。');
      if (count > LIMITS.entries || count !== v.getUint16(end + 8, true) || offset + size > end) fail('文件目录规模或结构异常，已停止检查。');
      let p = offset, expanded = 0;
      for (let i = 0; i < count; i++) {
        if (p + 46 > offset + size || v.getUint32(p, true) !== 0x02014b50) fail('PPTX 内部文件目录已损坏。');
        const flags = v.getUint16(p + 8, true), method = v.getUint16(p + 10, true), crc = v.getUint32(p + 16, true), compressed = v.getUint32(p + 20, true), original = v.getUint32(p + 24, true), nl = v.getUint16(p + 28, true), el = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), pos = v.getUint32(p + 42, true);
        if (p + 46 + nl + el + cl > offset + size) fail('PPTX 目录长度不正确。');
        let name; try { name = decoder.decode(this.bytes.subarray(p + 46, p + 46 + nl)); } catch { fail('文件内部名称编码不受支持。'); }
        if (/\\|\u0000|^\/|(^|\/)\.\.(\/|$)/.test(name) || this.entries.has(name)) fail('文件包含重复或异常内部路径。');
        if (flags & 1) fail('不能检查加密文件。请另存为未加密的 .pptx。');
        if (![0, 8].includes(method)) fail('PPTX 使用了不支持的压缩方式。');
        if (original === 0xffffffff || compressed === 0xffffffff || pos === 0xffffffff) fail('不支持 ZIP64 条目。');
        expanded += original; if (expanded > LIMITS.expanded) fail('文件解压后过大，请拆分后重试。');
        if (pos + 30 > offset || v.getUint32(pos, true) !== 0x04034b50) fail('PPTX 文件条目已损坏。');
        const ln = v.getUint16(pos + 26, true), le = v.getUint16(pos + 28, true), start = pos + 30 + ln + le;
        if (start + compressed > offset || v.getUint16(pos + 8, true) !== method || v.getUint16(pos + 6, true) !== flags) fail('压缩条目与目录不一致。');
        if (decoder.decode(this.bytes.subarray(pos + 30, pos + 30 + ln)) !== name) fail('文件条目名称与目录不一致。');
        this.entries.set(name, { name, start, compressed, original, method, crc });
        p += 46 + nl + el + cl;
      }
      if (p !== offset + size) fail('PPTX 文件目录边界不正确。');
      if (Array.from(this.entries.keys()).some(n => /vbaProject\.bin$/i.test(n))) fail('检测到宏内容。此工具仅接受普通 .pptx 文件。');
    }
    async xml(name, optional = false) {
      if (this.cache.has(name)) return this.cache.get(name);
      const entry = this.entries.get(name); if (!entry) { if (optional) return null; fail(`缺少必要文件：${name}`); }
      if (entry.original > LIMITS.xml || this.readTotal + entry.original > LIMITS.xmlTotal) fail('内部 XML 内容过大，已停止检查。');
      const compressed = this.bytes.subarray(entry.start, entry.start + entry.compressed); let bytes;
      if (entry.method === 0) bytes = compressed;
      else {
        if (typeof DecompressionStream === 'undefined') fail('浏览器不支持本地解压，请使用新版 Edge、Chrome 或 Firefox。');
        let stream; try { stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw')); } catch { fail('浏览器不支持所需解压格式，请更新浏览器。'); }
        const reader = stream.getReader(), chunks = []; let total = 0;
        try { for (;;) { const { value, done } = await reader.read(); if (done) break; total += value.length; if (total > LIMITS.xml || total > entry.original) { await reader.cancel(); fail('文件实际解压大小超出声明，已停止。'); } chunks.push(value); } }
        catch (e) { try { await reader.cancel(); } catch {} throw new Error(e.message || '解压失败，文件可能损坏。'); }
        bytes = new Uint8Array(total); let at = 0; for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.length; }
      }
      if (bytes.length !== entry.original || crc32(bytes) !== entry.crc) fail('文件校验失败，可能在传输中损坏。');
      this.readTotal += bytes.length;
      let text; try { text = decoder.decode(bytes); } catch { fail('XML 不是支持的 UTF-8 编码。请在 PowerPoint 中重新另存为 PPTX。'); }
      const doc = parseXML(text, name); this.cache.set(name, doc); return doc;
    }
    async relations(part) {
      const doc = await this.xml(part ? relPath(part) : '_rels/.rels', true), result = new Map();
      if (!doc) return result;
      for (const r of descendants(doc, 'Relationship')) {
        const external = attr(r, 'TargetMode') === 'External'; const target = attr(r, 'Target');
        result.set(attr(r, 'Id'), { type: attr(r, 'Type') || '', external, target: external ? null : normalizePart(part || '', target) });
      }
      return result;
    }
  }
  function texts(node) { return descendants(node, 't').map(n => n.textContent).join('').trim(); }
  function rid(node) { return Array.from(node.attributes || []).find(a => a.localName === 'id' && a.namespaceURI)?.value || attr(node, 'r:id'); }
  function emptyCounts() { return { text: 0, shapes: 0, pictures: 0, tables: 0, charts: 0, connectors: 0, groups: 0, embedded: 0, other: 0, hidden: 0 }; }
  function inspectTree(tree, width, height) {
    const counts = emptyCounts(), flags = new Set(), pictures = [], textValues = []; let textChars = 0;
    function walk(container, transform = { sx: 1, sy: 1, tx: 0, ty: 0 }, parentHidden = false) {
      for (const node of kids(container)) {
        const kind = local(node);
        if (kind === 'AlternateContent') { flags.add('兼容对象按备用表示检查，需在 PowerPoint 中复核。'); const variant = kids(node).find(n => local(n) === 'Fallback') || kids(node).find(n => local(n) === 'Choice'); if (variant) walk(variant, transform, parentHidden); continue; }
        if (!['sp', 'pic', 'cxnSp', 'grpSp', 'graphicFrame'].includes(kind)) continue;
        const hidden = parentHidden || truthy(attr(first(node, 'cNvPr'), 'hidden'));
        if (hidden) { counts.hidden++; flags.add('含隐藏对象，未计入可见内容统计。'); if (kind === 'grpSp') walk(node, transform, true); continue; }
        if (kind === 'grpSp') {
          counts.groups++; const gp = kids(node).find(n => local(n) === 'grpSpPr'), x = gp && first(gp, 'xfrm');
          let next = transform;
          if (x) {
            const off = first(x, 'off'), ext = first(x, 'ext'), chOff = first(x, 'chOff'), chExt = first(x, 'chExt');
            const sx = num(ext, 'cx') / (num(chExt, 'cx') || 1), sy = num(ext, 'cy') / (num(chExt, 'cy') || 1);
            next = { sx: transform.sx * sx, sy: transform.sy * sy, tx: transform.tx + transform.sx * (num(off, 'x') - num(chOff, 'x') * sx), ty: transform.ty + transform.sy * (num(off, 'y') - num(chOff, 'y') * sy) };
            if (num(x, 'rot') || truthy(attr(x, 'flipH')) || truthy(attr(x, 'flipV'))) flags.add('含旋转或翻转组合，图片覆盖范围仅作近似。');
          }
          walk(node, next, false); continue;
        }
        const x = first(node, 'xfrm'), off = x && first(x, 'off'), ext = x && first(x, 'ext');
        const rect = x && off && ext ? { x: transform.tx + num(off, 'x') * transform.sx, y: transform.ty + num(off, 'y') * transform.sy, w: num(ext, 'cx') * transform.sx, h: num(ext, 'cy') * transform.sy } : null;
        if (rect && (rect.x < -width * 0.01 || rect.y < -height * 0.01 || rect.x + rect.w > width * 1.01 || rect.y + rect.h > height * 1.01)) flags.add('有对象超出页面边缘，请检查是否为有意裁切。');
        if (x && num(x, 'rot')) flags.add('含旋转对象，图片覆盖范围仅作近似。');
        if (kind === 'pic') {
          counts.pictures++; if (rect) pictures.push(rect); else flags.add('部分图片未带独立位置，无法估算页面覆盖范围。');
        } else if (kind === 'cxnSp') counts.connectors++;
        else if (kind === 'sp') {
          const text = texts(node); if (text) { counts.text++; textChars += text.length; textValues.push(text); } else counts.shapes++;
          if (first(node, 'blipFill')) { flags.add('有形状使用图片填充，填充内容不能按文字对象编辑。'); if (rect) pictures.push(rect); }
        } else if (first(node, 'tbl')) counts.tables++;
        else if (first(node, 'chart')) counts.charts++;
        else if (first(node, 'oleObj')) { counts.embedded++; flags.add('含嵌入对象，需在 PowerPoint 中确认编辑能力。'); }
        else { counts.other++; flags.add('含 SmartArt 或其他复合对象，需要人工检查。'); }
      }
    }
    if (tree) walk(tree);
    const coverage = Math.max(0, ...pictures.map(r => Math.max(0, Math.min(width, r.x + r.w) - Math.max(0, r.x)) * Math.max(0, Math.min(height, r.y + r.h) - Math.max(0, r.y)) / (width * height)));
    return { counts, flags: Array.from(flags), maxPictureCoverage: Math.min(1, coverage), textChars, textValues, hasPictureFill: flags.has('有形状使用图片填充，填充内容不能按文字对象编辑。') };
  }
  async function inspect(buffer, filename = '演示文稿.pptx', onProgress = () => {}) {
    if (!/\.pptx$/i.test(filename)) fail('请选择 .pptx 文件。PDF、图片和旧版 .ppt 请先用 PowerPoint 另存为 PPTX。');
    const pkg = new Package(buffer), rootRels = await pkg.relations('');
    const main = Array.from(rootRels.values()).find(r => /\/officeDocument$/.test(r.type) && !r.external);
    if (!main) fail('文件不是受支持的 PowerPoint 演示文稿。');
    const presentation = await pkg.xml(main.target);
    if (local(presentation.documentElement) !== 'presentation') fail('文件不是有效的演示文稿。');
    const size = first(presentation, 'sldSz'), width = num(size, 'cx'), height = num(size, 'cy');
    if (!(width > 0 && height > 0 && Number.isFinite(width) && Number.isFinite(height))) fail('幻灯片尺寸无效。');
    const slideIds = descendants(presentation, 'sldId');
    if (!slideIds.length) fail('文件没有幻灯片。'); if (slideIds.length > LIMITS.slides) fail('最多检查 300 页，请拆分文件后重试。');
    const relationships = await pkg.relations(main.target), slides = [], total = emptyCounts();
    for (let i = 0; i < slideIds.length; i++) {
      const relationship = relationships.get(rid(slideIds[i]));
      if (!relationship || relationship.external || !/\/slide$/.test(relationship.type)) fail(`第 ${i + 1} 页引用无效。`);
      const doc = await pkg.xml(relationship.target);
      if (local(doc.documentElement) !== 'sld') fail(`第 ${i + 1} 页不是有效幻灯片。`);
      const result = inspectTree(first(doc, 'spTree'), width, height), notes = [...result.flags];
      const rels = await pkg.relations(relationship.target);
      const external = Array.from(rels.values()).filter(r => r.external).length;
      if (external) notes.push(`含 ${external} 个外部引用，工具没有访问这些链接。`);
      const layoutRef = Array.from(rels.values()).find(r => /\/slideLayout$/.test(r.type) && !r.external);
      let inheritedPictures = 0, inheritedText = 0, inheritedPictureFill = false, backgroundImage = !!first(first(doc, 'bg') || doc.createElement('empty'), 'blip');
      if (layoutRef) {
        const layout = await pkg.xml(layoutRef.target), layoutStats = inspectTree(first(layout, 'spTree'), width, height);
        inheritedPictures += layoutStats.counts.pictures; inheritedText += layoutStats.counts.text;
        inheritedPictureFill ||= layoutStats.hasPictureFill;
        backgroundImage ||= !!first(first(layout, 'bg') || layout.createElement('empty'), 'blip');
        const layoutRels = await pkg.relations(layoutRef.target), masterRef = Array.from(layoutRels.values()).find(r => /\/slideMaster$/.test(r.type) && !r.external);
        if (masterRef) { const master = await pkg.xml(masterRef.target), ms = inspectTree(first(master, 'spTree'), width, height); inheritedPictures += ms.counts.pictures; inheritedText += ms.counts.text; inheritedPictureFill ||= ms.hasPictureFill; backgroundImage ||= !!first(first(master, 'bg') || master.createElement('empty'), 'blip'); }
      }
      if (inheritedPictures || inheritedText) notes.push(`关联版式/母版含 ${inheritedPictures} 张图片、${inheritedText} 个文字对象；这些是潜在继承内容，不合并进当前页对象数。`);
      if (backgroundImage) notes.push('页面或关联版式/母版含图片背景，请人工确认实际显示内容。');
      if (inheritedPictureFill) notes.push('关联版式/母版中有形状使用图片填充，需人工确认实际显示范围。');
      const c = result.counts, native = c.text + c.shapes + c.tables + c.charts + c.connectors;
      let status, label, advice;
      if (!native && c.pictures && result.maxPictureCoverage >= .65) { status = 'raster'; label = '图片页特征明显'; advice = '主体很可能是一张图片。若要改字或流程，需要另行重建对应区域。'; }
      else if ((c.pictures || result.hasPictureFill || backgroundImage || inheritedPictures || inheritedPictureFill) && native) { status = 'mixed'; label = '原生对象与图片并存'; advice = '部分内容已有独立对象。请点选实际要改的区域，确认它属于文字、形状还是图片。'; }
      else if (native) { status = 'native'; label = '发现原生对象'; advice = '有文字、形状或表格等结构。仍需检查内容准确性、遮挡和修改后的排版。'; }
      else { status = 'review'; label = '需要人工确认'; advice = '本页对象不足以判断；内容可能来自母版、背景或特殊对象。'; }
      if (c.charts) notes.push('检测到图表对象；是否带可编辑数据须在 PowerPoint 中点击“编辑数据”验证。');
      if (c.tables) notes.push('检测到原生表格；合并单元格、数值和行列结构仍需复核。');
      for (const key of Object.keys(total)) total[key] += c[key];
      slides.push({ page: i + 1, hiddenSlide: ['0','false'].includes(attr(doc.documentElement, 'show')), status, label, advice, counts: c, textChars: result.textChars, maxPictureCoverage: Math.round(result.maxPictureCoverage * 100), inheritedPictures, inheritedText, inheritedPictureFill, backgroundImage, notes });
      onProgress(i + 1, slideIds.length);
    }
    return { version: '1.0.0', filename, checkedAt: new Date().toISOString(), slideCount: slides.length, size: { width, height }, totals: total, summary: Object.fromEntries(['raster','mixed','native','review'].map(s => [s, slides.filter(p => p.status === s).length])), slides, limitations: ['这是 OOXML 文件结构检查，不是视觉识别、内容校对或转换工具。','文字对象可能隐藏在图片下面，数量不代表文字准确率或可编辑面积比例。','母版与版式只报告可能继承的对象，未模拟 PowerPoint 的覆盖、隐藏与占位符继承规则。','图表数据、公式、字体、布局、动画、SmartArt 和复杂对象仍需在演示软件中人工验收。','文件只在当前浏览器处理；刷新页面会清除本次检查结果。'] };
  }
  root.PPTAudit = Object.freeze({ inspect, LIMITS, version: '1.0.0' });
})(globalThis);
