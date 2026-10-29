(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const form = byId('intakeForm');
  if (!form) return;

  const service = byId('service');
  const goal = byId('goal');
  const scale = byId('scale');
  const details = byId('details');
  const knownMatches = byId('knownMatches');
  const deadline = byId('deadline');
  const authorized = byId('authorized');
  const formStatus = byId('formStatus');
  const generatedPanel = byId('generatedPanel');
  const briefText = byId('briefText');
  const briefCopyStatus = byId('briefCopyStatus');
  const wechatName = byId('wechatName');
  const wechatCopyStatus = byId('wechatCopyStatus');

  const serviceNames = Object.freeze({ ppt: 'PPT指定页', data: '两表数据整理' });
  const sourceNames = Object.freeze({
    'ppt-check': 'PPT结构检查页',
    blog: '博客文章',
    direct: '服务说明页（直接访问）',
  });
  const query = new URLSearchParams(window.location.search);
  const requestedService = query.get('service');
  const requestedSource = query.get('source');
  const allowedService = value => Object.prototype.hasOwnProperty.call(serviceNames, value);
  const source = Object.prototype.hasOwnProperty.call(sourceNames, requestedSource) ? requestedSource : 'direct';
  service.value = allowedService(requestedService) ? requestedService : 'ppt';
  byId('sourceLabel').textContent = sourceNames[source];

  const hasVisibleText = value => /[^\s\u200B-\u200D\u2060\uFEFF]/u.test(String(value || ''));
  const valueOf = field => field.value.replace(/\r\n?/g, '\n').trim();
  const limits = new Map([[goal, 800], [scale, 160], [details, 1200], [knownMatches, 600], [deadline, 100]]);
  let hasGenerated = false;
  let generationVersion = 0;

  function invalidate() {
    generationVersion += 1;
    if (!hasGenerated) return;
    hasGenerated = false;
    generatedPanel.hidden = true;
    briefText.value = '';
    briefCopyStatus.textContent = '';
    formStatus.textContent = '内容已修改，请重新生成需求文字。';
  }

  function updateService() {
    if (!allowedService(service.value)) service.value = 'ppt';
    const isData = service.value === 'data';
    // Retain typed input, but never carry an old generated brief across a change.
    byId('detailsLabel').replaceChildren(
      document.createTextNode(isData ? '两表的行含义、关联列和范围 ' : '页码与需要修改的区域 '),
      Object.assign(document.createElement('span'), { textContent: '必填' }),
    );
    byId('detailsHint').textContent = isData
      ? '说明左、右表每行代表什么，用哪个编号关联，导出的日期与状态范围；不清楚的地方请注明。'
      : '说明哪些区域必须能编辑；没有图表底层数据时请写明。';
    goal.placeholder = isData ? '例如：把每条售后关联到原订单，并列出需要回查的记录' : '例如：让第2页的标题和流程节点可以分别修改';
    scale.placeholder = isData ? '例如：两份CSV，各约300条；先准备每份20条脱敏样本' : '例如：PPT截图，共3页；先评估第2页';
    details.placeholder = isData ? '例如：左表一行是订单，右表一行是售后申请；用order_id关联，两表日期范围相同。' : '例如：第2页，标题要能改字，四个流程框要能移动';
    byId('matchesField').hidden = !isData;
    knownMatches.disabled = !isData;
    invalidate();
  }

  function validate() {
    const required = [
      [goal, '请先说明希望拿到什么结果。'],
      [scale, '请填写材料类型与规模。'],
      [details, service.value === 'data' ? '请说明两表的行含义、关联列和范围。' : '请说明页码与需要修改的区域。'],
    ];
    for (const field of limits.keys()) field.removeAttribute('aria-invalid');
    authorized.removeAttribute('aria-invalid');
    for (const [field, message] of required) {
      if (!hasVisibleText(field.value)) {
        field.setAttribute('aria-invalid', 'true');
        formStatus.textContent = message;
        field.focus();
        return false;
      }
    }
    for (const [field, maximum] of limits) {
      if (!field.disabled && field.value.length > maximum) {
        field.setAttribute('aria-invalid', 'true');
        formStatus.textContent = `请把当前字段缩减到${maximum}字以内。`;
        field.focus();
        return false;
      }
    }
    return true;
  }

  function generate() {
    if (!allowedService(service.value)) service.value = 'ppt';
    invalidate();
    if (!validate()) return;
    const isData = service.value === 'data';
    const lines = [
      `来源：${sourceNames[source]}`,
      `想处理：${serviceNames[service.value]}`,
      `希望拿到的结果：${valueOf(goal)}`,
      `材料类型与规模：${valueOf(scale)}`,
      `${isData ? '两表的行含义、关联列和范围' : '页码与需要修改的区域'}：${valueOf(details)}`,
    ];
    if (isData) lines.push(`已知正确对应关系：${hasVisibleText(knownMatches.value) ? valueOf(knownMatches) : '待补充'}`);
    lines.push(
      `希望使用结果的时间：${hasVisibleText(deadline.value) ? valueOf(deadline) : '待沟通'}`,
      authorized.checked ? '材料提供权限：已确认；发送前会移除不必要的敏感信息。' : '材料提供权限：尚需确认，当前先咨询文字需求，暂不发送材料。',
      isData ? '样本准备：两份各约20条的脱敏CSV，保留表头、编号关系及重复关系。' : '样本准备：一页可读的脱敏预览，注明希望编辑的区域。',
      '首次先询问文字需求，样本提供方式待人工回复后确认。',
      '是否接收、范围、报价和时间，以单独回复并确认为准。',
    );
    // User text is only assigned to a textarea, never inserted as HTML or sent out.
    briefText.value = lines.join('\n');
    generatedPanel.hidden = false;
    hasGenerated = true;
    formStatus.textContent = '需求文字已在本页生成，请检查后自行复制。';
    briefCopyStatus.textContent = '';
    briefText.focus();
  }

  async function copy(field, status, successText, stillCurrent) {
    if (!hasVisibleText(field.value)) return;
    const text = field.value;
    const isCurrent = () => field.value === text && (!stillCurrent || stillCurrent());
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        if (isCurrent()) status.textContent = successText;
        return;
      } catch (_) { /* Browser permissions may require manual copying. */ }
    }
    if (!isCurrent()) return;
    field.focus();
    field.select();
    try { field.setSelectionRange(0, field.value.length); } catch (_) { /* Manual selection remains available. */ }
    status.textContent = '自动复制不可用，请在文字框内手动选择并复制。';
  }

  // Native form submission is prevented even if Enter is used. CSP is a second guard.
  form.addEventListener('submit', event => { event.preventDefault(); generate(); });
  form.addEventListener('input', () => { invalidate(); });
  form.addEventListener('change', () => { invalidate(); });
  service.addEventListener('change', updateService);
  byId('generateBrief').addEventListener('click', generate);
  byId('copyBrief').addEventListener('click', () => {
    if (!hasGenerated) return;
    const version = generationVersion;
    copy(briefText, briefCopyStatus, '需求文字已复制到剪贴板，请自行到公众号询问。', () => hasGenerated && generationVersion === version);
  });
  byId('copyWechat').addEventListener('click', () => copy(wechatName, wechatCopyStatus, '公众号名称已复制到剪贴板。'));

  updateService();
  form.hidden = false;
  byId('copyWechat').hidden = false;
})();
