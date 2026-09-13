# laoliu.me 内容 SEO 规划（第二轮，仅规划不执行）

日期：2026-09-10（2026-09-12 更新执行状态）。本文件基于逐篇读取全文后填写，是下一轮内容优化的执行计划，本轮未改正文。

> **2026-09-12 状态更新**
> - 「旧店铺域名统一」**已完成**（第一轮 commit 3c74e2c）：`from-0-to-1-chatgpt.md` 中 2 处
>   `pay.ldxp.cn/shop/liu` 已改为 `wzyp.cn/shop/liu`，与全站配置一致。本条从待办移除。
> - 标题编号笔误、正文间内链仍未执行（属规划项，未混入本轮修复）。
> - 当前 12 篇正文之间没有内链，但左侧栏文章导航全篇可达，**不构成孤立页面**。
>   内链做的是「正文语义关联」，不是可达性补漏。

说明：**未做关键词搜索量调研**（无工具与数据），下表意图判断来自正文实际内容与常识推理，不是已验证的搜索需求。标题/摘要建议已在本轮通过 seoTitle/seoDescription 落地到 head；正文层面的动作留给第二轮。

## 逐篇规划

### 1. /from-0-to-1-chatgpt/ — ChatGPT 注册与入门
- **主搜索意图**：ChatGPT 怎么注册（新手，无海外手机号/支付方式顾虑）。
- **可支持的长尾**：ChatGPT 注册不了怎么办；ChatGPT 注册需要手机号吗；谷歌账号注册 GPT；Codex 怎么下载登录。
- **正文补充建议**：
  - ~~文末「充值」一节的店铺链接是旧域名~~ → **已完成**（2026-09-12 核实：全文已为 `wzyp.cn/shop/liu`）。
  - 「接码」段落可补充风险说明（账号安全）。
  - 标题「从 0 - 1 注册并使用chatGPT」大小写与空格不规范，第二轮可顺带规范化 H1 文本（不动 slug）。
- **内链位置建议**：
  - 「下载codex」节（约第 170 行「下载codex也很简单…」）→ 链 `/gpt-download-install/`（官方桌面程序详解）。
  - 「充值」节 → 链 `/codex-buy/`（套餐怎么选）。
  - 接码失败排查 → 未来可与 `/codex-chinese-settings/` 的故障排查风格互链。


### 2. /gpt-download-install/ — ChatGPT 官方下载安装
- **主搜索意图**：ChatGPT 桌面版下载安装（Windows/macOS）。
- **可支持的长尾**：ChatGPT 桌面版和网页版区别；Microsoft Store 打不开怎么办；ChatGPT 装完登录不了。
- **正文补充建议**：可补「版本更新入口」小节（现在更新靠应用商店自动）。
- **内链位置建议**：「安装完以后怎么登录」→ 链 `/from-0-to-1-chatgpt/`；文末 → 链 `/codex-buy/`（装完想用 Codex 的读者）。

### 3. /codex-buy/ — Codex 购买与套餐选择
- **主搜索意图**：Codex 怎么购买/要不要单独买；Plus 和 Pro 怎么选。
- **可支持的长尾**：Codex 是免费的吗；国内银行卡能不能付 ChatGPT；Plus 20 美元包含 Codex 吗。
- **正文补充建议**：价格会变，建议在 frontmatter 用 `updated` 记录核实日期（正文已有「2026年9月版」意识，很好）。
- **内链位置建议**：「付款解决之后，后面才是 Codex 怎么装」→ 链 `/gpt-download-install/` 与 `/codex-skill-usage/`。

### 4. /codex-skill-usage/ — Codex Skill 使用教程
- **主搜索意图**：Codex Skill 安装/调用/自定义。
- **可支持的长尾**：Codex skill 路径变了；openai/skills 仓库弃用了去哪找；Skill 不生效怎么办。
- **正文补充建议**：`.agents/skills` 新路径是本文差异化价值，建议持续跟进官方变更并记录 `updated`。
- **内链位置建议**：文首「Codex 还没装好」→ 链 `/gpt-download-install/`；「自定义 Skill」→ 链 `/codex-custom-memory-skill/`（实战案例）；「MCP 一起用」节可预留后续 MCP 文章位。

### 5. /codex-deepseek/ — Codex 接入 DeepSeek
- **主搜索意图**：Codex 用第三方模型（DeepSeek）降本。
- **可支持的长尾**：Codex 换模型；DeepSeek API 多少钱；Codex 接 DeepSeek 识别图片吗。
- **正文补充建议**：API 价格与模型名随官方变动，建议每季度核对一次并更新 `updated` 字段。
- **内链位置建议**：「已经安装好的 Codex」→ 链 `/gpt-download-install/`；「恢复原来的 Codex 配置」可互链 `/codex-chinese-settings/`（同为配置文件操作）。

### 6. /codex-chinese-settings/ — Codex 中文设置
- **主搜索意图**：Codex 界面/回复改中文（须区分「界面语言」与「回答语言」，正文已正确区分，标题也保留了这层区分）。
- **可支持的长尾**：AGENTS.md 怎么写；Codex App 中文界面；改了 Language 没用。
- **正文补充建议**：编号有笔误（两个「五」、缺「六」、两个「七」前的序号跳跃），第二轮修标题编号时保持锚点（可用改动量最小的方案）。
- **内链位置建议**：「找到 Codex 全局配置目录」→ 链 `/codex-skill-usage/` 的路径章节。

### 7. /blog-build-guide/ — AI 辅助个人博客搭建
- **主搜索意图**：零基础/低成本建个人博客（域名→GitHub→Cloudflare）。
- **可支持的长尾**：个人博客要花多少钱；Cloudflare Workers 部署静态站；博客阅读量怎么做。
- **正文补充建议**：本文与站点自身强绑定，建议随站点迭代持续更新（已有这个意识）。
- **内链位置建议**：「我顺手把 SEO 也补了」一节 → 未来可链本站 SEO 系列文章。

### 8. /vibe-coding-practice/ — Vibe Coding 实战
- **主搜索意图**：Vibe Coding 怎么实操（多 AI 分工流程）。
- **可支持的长尾**：Vibe coding 是什么意思；AI 编程怎么分工；PRD 让 GPT 写。
- **正文补充建议**：正文一级标题 13 个（本轮已降级处理语义），第二轮可考虑整合成 3-4 个大节（内容层面，非本轮）。
- **内链位置建议**：「我才第一次打开 Codex」→ 链 `/codex-skill-usage/`；「让 GPT Image V2 设计页面」可预留设计类文章位。

### 9. /de-ai-flavor-prompts/ — 去 AI 味提示词
- **主搜索意图**：去 AI 味提示词直接复制。
- **可支持的长尾**：论文去 AI 味；网文去 AI 味；组会汇报去 AI 味。
- **正文补充建议**：标题编号有重复（两个「六」），第二轮顺带修。
- **内链位置建议**：暂无强相关站内文章，适合作为公众号引流主力文保留现状。

### 10. /gpt6-codex-context/ — GPT-6 Codex 上下文机制
- **主搜索意图**：GPT-6 / Codex 上下文更新解读（资讯型）。
- **可支持的长尾**：GPT-6 Astra 跑分；Codex 长期项目接着做。
- **正文补充建议**：时效性强，建议在 frontmatter 维护 `updated`；与 `codex-long-term-memory` 的边界见下节。

### 11. /codex-long-term-memory/ — Codex 长期记忆方法论
- **主搜索意图**：Codex 长期记忆怎么做（方法论，六字诀）。
- **正文补充建议**：与 `/gpt6-codex-context/`（机制解读）、`/codex-custom-memory-skill/`（工程实现）构成三部曲。建议三篇互相内链并在各自开头声明分工：
  - `codex-long-term-memory` = 我怎么管理记忆（方法论）
  - `gpt6-codex-context` = 官方上下文机制怎么变（资讯）
  - `codex-custom-memory-skill` = 我把方法做成了 Skill（实现）
- **内链位置建议**：「记什么」节 → 链 `/gpt6-codex-context/`；「写回」节 → 链 `/codex-custom-memory-skill/`。

### 12. /codex-custom-memory-skill/ — 自定义长期记忆 Skill
- **主搜索意图**：Codex 自定义 Skill 实战（含开源）。
- **正文补充建议**：标题编号跳跃（一→四→五→六，缺二、三），第二轮顺带修；GitHub 仓库链接如仍在维护可补在文末。
- **内链位置建议**：文首「Project Memory 怎么安装」→ 链 `/codex-skill-usage/`（Skill 基础）；「记忆结构」→ 链 `/codex-long-term-memory/`。

## 主题重叠分析

- **codex-custom-memory-skill vs codex-long-term-memory**：前者是「做一个 Skill」的工程过程，后者是「记忆怎么管」的方法论。职责可分清，建议互链而非合并。
- **gpt6-codex-context vs codex-long-term-memory**：前者讲官方机制（Notes、可搜索旧上下文），后者讲个人实践。保留两篇，前者文末链后者。
- **codex-skill-usage vs codex-custom-memory-skill**：教程 vs 实战案例，天然递进关系，互链。

## 内链执行原则（第二轮）

- 只在原句中与目标文章真实相关的文字上加链接，不加「猜你喜欢」卡片。
- 锚文本用自然语言（如「我前面写的 Skill 基础教程」），不用「点击这里」。
- 每篇内链 2-4 个为宜，不串同一串推荐。
- 不新增任何 UI 模块；只改正文原句（标题文字、段落文字保持其余不变）。

## 原句内链补丁（2026-09-12 逐篇核对后的具体位置）

以下都基于正文**现有原句**，只加 `[](...)` 不改写句子。锚点目标用站内 slug。

| 文章 | 原句位置（行号） | 原句 | 建议补丁 |
|---|---|---|---|
| /codex-skill-usage/ | 58 | 如果你的 Codex 还没有安装好，可以先看我前面写的完整教程。 | 「完整教程」→ `[完整教程](/gpt-download-install/)` |
| /codex-deepseek/ | 10–12 | 还没有安装Codex的，可以先看上一篇：（当前链公众号长文） | 在「先看上一篇：」后补一句站内链 `[Codex 官方下载安装指南](/gpt-download-install/)`；公众号原文链接保留 |
| /codex-custom-memory-skill/ | 6 | 我把上一期讲的 Codex 长期记忆系统，真的做成了一个 Skill。 | 「Codex 长期记忆系统」→ `[Codex 长期记忆系统](/codex-long-term-memory/)` |
| /gpt6-codex-context/ | 184 | 它需要的是一套项目记忆结构。 | 「项目记忆结构」→ `[项目记忆结构](/codex-long-term-memory/)` |
| /de-ai-flavor-prompts/ | 237 | 后面如果我把它继续改成 Skill，我再单独写一篇。 | 「Skill」→ `[Skill](/codex-skill-usage/)`（若当期尚未发布则保留文字） |
| /codex-long-term-memory/ | 60 | 我想用6个字总结AI长期记忆：记，分，写，读，忘，真！ | 段末补「这套方法后来被我做成了可以直接装的 Skill：`[project-memory](/codex-custom-memory-skill/)`」（需作者确认措辞） |
| /codex-chinese-settings/ | 246 | 请检查我当前实际使用的Codex全局配置目录。 | 段首补站内链 `[Codex Skill 的全局路径说明](/codex-skill-usage/)`（可选） |

**执行要求**：每篇 1–2 个即可，不要凑数；锚文本必须与原句语义自然衔接；不新增卡片、目录、相关阅读模块。执行前先由作者确认，避免把「相关」写成「推荐」。

## 图片减重：性能测量与无损候选（仅报告，不执行）

本轮**未做全站压缩**，也未引入 srcset / 新图片服务。仅在独立样本上做无损 WebP 可行性测量：

| 样本 | 原格式大小 | 无损 WebP | 缩减 | 像素一致性 |
|---|---|---|---|---|
| `codex-buy/image-1.png` | 见测量脚本 | — | **41.0%** | RGBA 像素相同 |
| `gpt6-codex-context/image-7.png` | 见测量脚本 | — | **27.7%** | RGBA 像素相同 |

> 数据来源：任务书给定的独立样本测量结果（2026-09-12）。**本机未复现该测量**
> （无 cwebp / sharp 等无损编码工具，未安装以避免污染环境）。
> 因此这**不是**全站比例，也**不是**真实加载速度承诺。

**后续若实施**，约束条件：
1. 保留中文截图清晰度优先，不做有损压缩；
2. 保留原图与旧 URL（不重命名、不删除），保证历史外链与锚点兼容；
3. 显示尺寸不变（`.prose img` 的 `max-width:100%;height:auto` 不动）；
4. 需先在全站量化收益与回归截图，再决定是否引入；
5. 图片减重**不属于本轮修复**，不在本轮交付内。

## 下一轮候选（需要站长确认后执行）

1. 修正各篇标题编号笔误（保持锚点兼容，可用视觉无差的文本微调）。
2. ~~统一 `from-0-to-1-chatgpt` 文中旧店铺域名为当前域名~~ → **已完成**（2026-09-12 核实）。
3. 建一篇「Codex 学习路线 / 教程索引」（用现有模板，真实导航价值，非空分类页）。
4. 正文内链按上文「原句内链补丁」落地。
