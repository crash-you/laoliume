export const officeTopicPath = '/topics/ai-office/';
export const officeTopicName = 'AI 办公与文件处理';

export const officeRoutes = [
  {
    id: 'ppt',
    name: '制作与检查 PPT',
    intro: '先看手里的材料。文字资料可以从大纲起步，只有截图时则要先把文字和图形拆成能单独修改的对象。',
    articles: [
      {
        slug: 'chatgpt-ppt-powerpoint',
        label: '有资料或旧 PPT，在 PowerPoint 里起草和改页',
        detail: '用 ChatGPT 根据资料列大纲，或指定一页，说明哪些文字和数据需要更新。',
      },
      {
        slug: 'codex-ppt-skills',
        label: '要做组会或项目汇报，用 Codex 生成初稿',
        detail: '对照四种 Skill 做出来的页面，按汇报场合选一种，再调整内容和版式。',
      },
      {
        slug: 'codex-image-to-editable-ppt',
        label: '只有一张截图，把文字和图形重建成 PPT',
        detail: '挑一页清晰的截图，识别文字、重建文本框与连接线，再对照原图检查。',
      },
      {
        slug: 'ppt-editability-check',
        label: '已经拿到 PPTX，检查哪些地方真的能改',
        detail: '用三份对照文件试着改标题、移动节点，保存重开后再验收。',
      },
      {
        slug: 'software-tutorial-sample',
        label: '跟着 85 秒演示看懂逐页结构报告',
        detail: '对比整页图片、混合结构和原生对象在检查器中的结果。',
      },
    ],
    image: {
      src: '/images/ppt-editability-check/comparison.png',
      width: 1640,
      height: 1040,
      alt: '左侧为复盘页和流程图的原始截图，右侧为重建后的 PowerPoint 导出效果。',
      caption: '同一组页面可以有相近的外观。要判断能改哪里，打开样例，亲手改一次。',
    },
    resources: [
      { href: '/tools/ppt-check/', label: '打开 PPT 可编辑结构检查器' },
      { href: '/tools/ppt-check/samples/editable-demo-pack.zip', label: '下载 PPT 对照样例（ZIP）' },
    ],
  },
  {
    id: 'spreadsheets',
    name: '整理与核对表格',
    intro: '一张工作表先看列名、缺失值和异常行。两张表要关联，先弄清每一行代表什么，再选匹配字段。',
    articles: [
      {
        slug: 'chatgpt-excel-tutorial',
        label: '有一份工作簿，在 Excel 里检查、清理和汇总',
        detail: '让 ChatGPT 先列出异常，再复制工作表做清理，按部门汇总数据并生成图表。',
      },
      {
        slug: 'order-after-sale-matching',
        label: '订单与售后对不上，逐条找出一对多关系',
        detail: '用 7 条订单和 10 条售后练习，保留长订单号，分开检查未匹配和待复核记录。',
      },
    ],
    image: {
      src: '/images/order-after-sale-matching/01-source.png',
      width: 750,
      height: 719,
      alt: '示例订单 000001 对应两条不同的售后记录，金额栏分别为 10 元和 5 元。',
      caption: '如果只取第一次匹配，订单 000001 的第二条售后就会漏掉。',
    },
    resources: [
      { href: '/downloads/order-after-sale-demo.zip', label: '下载源 CSV 和核查报告（ZIP）' },
    ],
  },
];

export const officeArticleSlugs: ReadonlySet<string> = new Set(
  officeRoutes.flatMap((route) => route.articles.map((article) => article.slug)),
);
