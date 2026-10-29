(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  let report = null, version = 0, busy = false;
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function status(text, error = false) { $('status').textContent = text; $('status').className = `status${error ? ' error' : ''}`; }
  function setBusy(value) { busy = value; $('fileInput').disabled = value; document.querySelectorAll('.demo-button').forEach(b => b.disabled = value); $('dropzone').setAttribute('aria-busy', String(value)); }
  function clear() { version++; report = null; $('results').hidden = true; $('slideRows').replaceChildren(); $('summaryCards').replaceChildren(); $('fileInput').value = ''; status('本次检查结果已清除。'); }
  function cells(r) {
    return r.slides.map(s => `<tr><td>${s.page}${s.hiddenSlide ? '<br><small>隐藏页</small>' : ''}</td><td><span class="badge ${s.status}">${escape(s.label)}</span><p>最大单图覆盖约 ${s.maxPictureCoverage}%</p></td>${['text','shapes','pictures','tables','charts','connectors'].map(k => `<td>${s.counts[k]}</td>`).join('')}<td><details><summary>查看建议${s.notes.length ? ` · ${s.notes.length} 项提示` : ''}</summary><p>${escape(s.advice)}</p>${s.notes.length ? `<ul>${s.notes.map(n => `<li>${escape(n)}</li>`).join('')}</ul>` : ''}<p>组合 ${s.counts.groups} · 嵌入对象 ${s.counts.embedded} · 其他 ${s.counts.other} · 隐藏对象 ${s.counts.hidden}</p></details></td></tr>`).join('');
  }
  function show(r) {
    report = r; $('resultName').textContent = r.filename;
    $('resultMeta').textContent = `${r.slideCount} 页 · ${r.totals.text} 个含文字对象 · ${r.totals.pictures} 张图片 · 已在当前浏览器检查`;
    const labels = { raster: '图片页特征明显', mixed: '原生对象与图片并存', native: '发现原生对象', review: '需要人工确认' };
    $('summaryCards').innerHTML = Object.entries(labels).map(([key,label]) => `<div class="summary-card"><strong>${r.summary[key]}<small> 页</small></strong><span>${label}</span></div>`).join('');
    $('slideRows').innerHTML = cells(r); $('results').hidden = false;
    status(`检查完成。已读取 ${r.slideCount} 页文件结构，内容和排版仍需人工验收。`);
  }
  async function checkFile(file) {
    if (!file || busy) return;
    const current = ++version; report = null; $('results').hidden = true; setBusy(true); status('正在读取文件…');
    try {
      if (file.size > PPTAudit.LIMITS.file) throw new Error('文件超过 30 MB，请拆分后检查。');
      const buffer = await file.arrayBuffer();
      const result = await PPTAudit.inspect(buffer, file.name, (done,total) => { if (current === version) status(`正在检查第 ${done} / ${total} 页…`); });
      if (current === version) { show(result); $('results').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' }); }
    } catch (e) { if (current === version) status(e.message || '检查失败，请确认文件可以正常打开。', true); }
    finally { setBusy(false); $('fileInput').value = ''; }
  }
  $('fileInput').addEventListener('change', e => checkFile(e.target.files[0]));
  const drop = $('dropzone');
  ['dragenter','dragover'].forEach(event => drop.addEventListener(event, e => { e.preventDefault(); if (!busy) drop.classList.add('drag-over'); }));
  ['dragleave','drop'].forEach(event => drop.addEventListener(event, e => { e.preventDefault(); drop.classList.remove('drag-over'); }));
  drop.addEventListener('drop', e => { if (busy) return; if (e.dataTransfer.files.length !== 1) return status('每次请选择一个 PPTX 文件。', true); checkFile(e.dataTransfer.files[0]); });
  window.addEventListener('dragover', e => e.preventDefault()); window.addEventListener('drop', e => e.preventDefault());
  document.querySelectorAll('.demo-button').forEach(button => button.addEventListener('click', async () => {
    if (busy) return; setBusy(true); status('正在载入本站公开示例…');
    try { const response = await fetch(`samples/${button.dataset.file}`); if (!response.ok) throw new Error('示例文件暂时无法载入，请下载后手动选择。'); const data = await response.blob(); setBusy(false); await checkFile(new File([data], button.dataset.file)); }
    catch (e) { setBusy(false); status(e.message, true); }
  }));
  function download(blob, filename) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
  $('exportJSON').addEventListener('click', () => { if (report) download(new Blob([JSON.stringify(report,null,2)], {type:'application/json;charset=utf-8'}), 'ppt-structure-report.json'); });
  $('exportHTML').addEventListener('click', () => {
    if (!report) return;
    const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>PPT 结构检查报告</title><style>body{font:14px/1.8 system-ui,sans-serif;max-width:1100px;margin:35px auto;padding:20px;color:#202c24}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #ddd;padding:10px;vertical-align:top;text-align:left}th{background:#f3f5ef}details>summary{font-weight:bold}small,p,li{color:#53604f}.badge{font-weight:bold}@media print{details{display:block}details>*{display:block!important}}</style><h1>PPT 可编辑结构检查报告</h1><h2>${escape(report.filename)}</h2><p>${report.slideCount} 页 · 检查时间 ${escape(report.checkedAt)} · 工具版本 ${report.version}</p><p>原生对象数量不等于可编辑准确率。该报告仅检查文件结构，不能替代实际改字、改形状与图表数据验收。</p><table><thead><tr><th>页</th><th>结构线索</th><th>文字</th><th>形状</th><th>图片</th><th>表格</th><th>图表</th><th>连接线</th><th>提示</th></tr></thead><tbody>${cells(report).replaceAll('<details>', '<details open>')}</tbody></table><h2>已知限制</h2><ul>${report.limitations.map(l => `<li>${escape(l)}</li>`).join('')}</ul><p>由佬刘AI PPT 结构检查工具生成。文件内容未上传。</p></html>`;
    download(new Blob([html], {type:'text/html;charset=utf-8'}), 'ppt-structure-report.html');
  });
  $('clearResult').addEventListener('click', clear);
  $('briefForm').addEventListener('submit', e => {
    e.preventDefault(); const data = new FormData(e.target);
    $('briefText').value = `PPT 指定页修改需求\n\n页码：${data.get('pages').trim()}\n源文件：${data.get('source')}\n用途：${data.get('usage')}\n必须能修改的内容：${data.get('changes').trim()}\n\n请先评估一页试样，再确认报价、交付时间和修订次数。\n希望交付：可编辑 PPTX、逐页截图、不能编辑区域的说明。\n验收方式：实际改字、移动形状；有表格/图表时，另验单元格和数据。\n材料授权：我有权使用材料，发送前会脱敏。\n\n备注：这份清单由本地工具生成，尚未发送或形成订单。`;
    $('briefOutput').hidden = false; $('copyState').textContent = '';
  });
  $('copyBrief').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('briefText').value); $('copyState').textContent = '已复制'; } catch { $('briefText').focus(); $('briefText').select(); $('copyState').textContent = '请按 Ctrl+C 复制'; } });
})();
