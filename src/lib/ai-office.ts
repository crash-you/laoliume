export const officeTopicPath = '/topics/ai-office/';
export const officeTopicName = 'PPT 和 Excel 教程';

export const officeRoutes = [
  {
    id: 'ppt',
    name: 'PPT',
    articles: [
      { slug: 'codex-image-to-editable-ppt', label: '把截图转成可编辑的 PPT' },
      { slug: 'chatgpt-ppt-powerpoint', label: '把文字资料写成 PPT 初稿（ChatGPT）' },
      { slug: 'codex-ppt-skills', label: '为组会或工作汇报选 PPT 风格（Codex）' },
      { slug: 'ppt-editability-check', label: '检查 PPT 里的文字和图形能不能改' },
      { slug: 'software-tutorial-sample', label: '看 PPT 检查器的操作演示（85 秒）' },
    ],
  },
  {
    id: 'spreadsheets',
    name: 'Excel',
    articles: [
      { slug: 'chatgpt-excel-tutorial', label: '用 ChatGPT 清理、汇总一张 Excel 表' },
      { slug: 'order-after-sale-matching', label: '按订单号核对订单表和售后表' },
    ],
  },
];

export const officeResources = [
  { href: '/tools/ppt-check/', label: '打开 PPT 可编辑性检查器' },
  { href: '/tools/ppt-check/samples/editable-demo-pack.zip', label: '下载 PPT 对照样例（ZIP）' },
  { href: '/downloads/order-after-sale-demo.zip', label: '下载订单和售后样表（ZIP）' },
];

export const officeArticleSlugs: ReadonlySet<string> = new Set(
  officeRoutes.flatMap((route) => route.articles.map((article) => article.slug)),
);
