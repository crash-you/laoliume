/**
 * apply-seo-frontmatter.mjs — 一次性脚本：为 12 篇文章补 seoTitle / seoDescription / image / imageAlt
 * 依据：逐篇读取正文后的真实内容（见 docs/SEO_CONTENT_MAP.md），不编造功能、版本、价格。
 * 用法: node scripts/apply-seo-frontmatter.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src', 'content', 'posts');

const DATA = {
  'blog-build-guide': {
    seoTitle: '个人博客网站怎么搭建？从买域名到 GitHub+Cloudflare 上线',
    seoDescription:
      '零成本个人博客实操：买域名、让 AI 生成网站、GitHub 托管、Cloudflare Workers 部署、D1 阅读量和公众号入口，全程记录。',
  },
  'codex-buy': {
    seoTitle: 'Codex 怎么购买？2026年9月版：套餐、付款方式与 Plus/Pro 选择',
    seoDescription:
      'Codex 包含在 ChatGPT 订阅里，不需要单独购买。2026 年 9 月实测：官方订阅流程、国内银行卡限制、手机端购买、Plus 和 Pro 怎么选。',
  },
  'codex-chinese-settings': {
    seoTitle: 'Codex 怎么设置中文？界面中文、中文回复与全局 AGENTS.md 配置',
    seoDescription:
      '三种 Codex 中文设置：当前对话中文回复、全局 AGENTS.md 让新对话默认中文、Codex App 界面切中文，附设置失败的排查点。',
  },
  'codex-custom-memory-skill': {
    seoTitle: 'Codex 自定义 Skill 教程：从 0 做一个长期记忆 Skill 并开源',
    seoDescription:
      '用 Skill Creator 从 0 做一个 Project Memory 长期记忆 Skill：三条指令、初始化与真实性检查脚本，到 GitHub 开源上线的完整过程。',
  },
  'codex-deepseek': {
    seoTitle: 'Codex 接入 DeepSeek 完整教程：V4 Flash、Pro 与 Vision 配置',
    seoDescription:
      'Codex 接入第三方模型 DeepSeek：Windows/macOS 配置、V4 Flash / V4 Pro / Vision 区别、费用估算、验证接入成功与恢复原配置。',
  },
  'codex-long-term-memory': {
    seoTitle: 'Codex 长期记忆怎么做？记、分、写、读、忘、真六步循环',
    seoDescription:
      '换对话后让 Codex 接着做复杂项目：长期记忆的记、分、写、读、忘、真六个环节与实操方法，避免记忆失真和上下文爆炸。',
  },
  'codex-skill-usage': {
    seoTitle: 'Codex Skill 怎么用？安装、配置、调用到自定义完整教程',
    seoDescription:
      '按最新官方文档整理的 Codex Skill 教程：.agents/skills 新路径、官方与 GitHub 安装、手动/自动调用、创建自定义 Skill 与不生效排查。',
  },
  'de-ai-flavor-prompts': {
    seoTitle: '去 AI 味提示词怎么写？直接复制可用的实测版本',
    seoDescription:
      '我现在在用的去 AI 味提示词：组会汇报、论文、公众号文章、网文四个场景的实测，加上一条「禁止乱用副词」规则。',
  },
  'from-0-to-1-chatgpt': {
    seoTitle: 'ChatGPT 注册与使用教程：从 0 到 1（含 Codex 下载登录）',
    seoDescription:
      'ChatGPT 注册、Codex 下载与登录全流程：谷歌账号注册、邮箱注册、接码版说明，以及 Plus/Pro 充值方法，适合完全新手。',
  },
  'gpt-download-install': {
    seoTitle: 'ChatGPT 怎么下载安装？Windows 与 macOS 官方安装教程',
    seoDescription:
      '官方桌面程序叫 ChatGPT。Windows 经 Microsoft Store 安装、macOS 从官网下载、安装后登录方法，以及常见安装问题解答。',
  },
  'gpt6-codex-context': {
    seoTitle: 'GPT-6 Codex 上下文机制：长期项目怎么接着做？',
    seoDescription:
      'GPT-6 Astra 发布，部分测试从 GPT-5.6 Sol 的 7.8% 提升到 99.9%。本篇解读 Codex 上下文机制更新：跨窗口 Notes、旧上下文可搜索。',
  },
  'vibe-coding-practice': {
    seoTitle: 'Vibe Coding 教程实战：ChatGPT Pro 当产品经理，Codex 当程序员',
    seoDescription:
      '一次完整 Vibe Coding 实战：先让 GPT Pro 追问需求、砍功能、写 PRD，再让 GPT Image V2 设计页面，最后 Codex 分段实现与审查。',
  },
};

let changed = 0;
for (const [slug, meta] of Object.entries(DATA)) {
  const file = join(dir, slug + '.md');
  let text = readFileSync(file, 'utf-8');
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    console.error(`SKIP ${slug}：未找到 frontmatter`);
    continue;
  }
  let fm = fmMatch[1];
  if (/^seoTitle:/m.test(fm)) {
    console.log(`SKIP ${slug}：已有 seoTitle`);
    continue;
  }
  const insert =
    `seoTitle: "${meta.seoTitle}"\n` +
    `seoDescription: "${meta.seoDescription}"\n` +
    `image: "/og/${slug}.png"\n` +
    `imageAlt: "佬刘AI 文章分享图：${meta.seoTitle}"\n`;
  // 插在 description 行之后
  fm = fm.replace(/^(description:.*)$/m, `$1\n${insert.trimEnd()}`);
  text = text.replace(fmMatch[1], fm);
  writeFileSync(file, text);
  console.log(`OK   ${slug}`);
  changed++;
}
console.log(`共更新 ${changed} 篇`);
