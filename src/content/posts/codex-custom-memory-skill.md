---
title: "Codex 自定义 Skill 教程：从 0 做一个长期记忆 Skill（从开发到 GitHub 开源上线）"
description: "从 0 做一个长期记忆 Skill：从开发到 GitHub 开源上线的完整过程。"
date: 2026-08-30
slug: "codex-custom-memory-skill"
published: true
---

大家好，我是佬刘。

先把这篇文章最重要的东西放前面。

我把上一期讲的 Codex 长期记忆系统，真的做成了一个 Skill。

如果还没看过上一期，想知道是什么的，可以先看一下上一期内容

[Codex长期记忆怎么做？我用31轮实验，搭了一套跨对话、跨模型的项目记忆系统](https://mp.weixin.qq.com/s/lji3zWDmPp8ClY49PLGgfA)

GitHub 开源地址：

```Plain Text
https://github.com/crash-you/Project-Memory.git
```

它主要解决一个问题：

> **复杂项目换了 Codex 对话以后，怎么不重新解释一遍背景，直接接着做？**
> 
> 

先说怎么用，再去写怎么自定义skill，我与codex是怎么进行交互。

文章比较长，建议打开codex，一步一步跟着操作！

## 一、先用起来：Project Memory 怎么安装

在 Codex 中调用 /skill installer：

![image\.png](/images/codex-custom-memory-skill/image-6.png)

然后告诉它：

```Plain Text
请从下面的 GitHub 仓库安装 project-memory Skill：

https://github.com/crash-you/Project-Memory.git

安装完成后，告诉我实际安装到了哪个目录，并确认 Codex 能够识别 $project-memory。
```

![image\.png](/images/codex-custom-memory-skill/image-7.png)

点击发送



安装好以后，第一次进入项目，输入：

```Plain Text
使用 $project-memory 初始化当前项目的长期记忆系统。

先执行 dry-run，只展示准备创建和修改的内容，不要直接覆盖任何已有文件。
```

换了一个全新对话以后，输入：

```Plain Text
使用 $project-memory 接手当前项目。

先检查项目记忆有没有过期，再用最小上下文告诉我：
当前做到哪里、现在要做什么、下一步是什么、有没有阻塞。
本轮先不要修改任何文件。
```

一轮任务完成以后，输入：

```Plain Text
使用 $project-memory 对本轮任务执行 Memory Checkpoint。

先验证真实结果，再提取需要长期保存的信息，更新当前状态、任务、决策、证据和交接文档。
未经我确认，不要创建 Git Commit。
```

基本就这三个动作：

```Plain Text
第一次进入项目：bootstrap

换新对话接手：resume

任务结束前写回：checkpoint
```

当然，完整版本还有：

```Plain Text
recall
查询历史决策和证据

retire
让已经过期的旧决策退出当前判断

audit
检查项目记忆与真实项目是否一致
```

不想看后面制作过程的，到这里已经可以直接拿去用了。

下面开始讲，我到底是怎么把它做出来的。





# 四、做 Skill 的第一步，不是写 SKILL\.md

我以前很容易一上来就对 Codex 说：

```Plain Text
帮我做一个长期记忆 Skill。
```

然后它哐哐哐生成一堆文件。看起来很完整。

但是到底能不能用，不知道。

什么时候触发，不知道。

换新对话以后能不能接手，不知道。

记忆过期以后会不会继续胡说，也不知道。

所以这次我先建立了一个空项目：

```Plain Text
codex 长期记忆skill
```

然后把上一篇公众号导出的 PDF 放到了：

```Plain Text
local-input/
```

PDF 只负责给 Codex 理解需求，不跟着 Skill 一起上传到 GitHub。

然后，我在 Codex 中进入 Plan 模式，发了第一条指令。

![image\.png](/images/codex-custom-memory-skill/image-5.png)

## 第一条指令

```Plain Text
你现在是一个开源 Codex Agent Skill 项目的架构师。

请先进入规划阶段。

本轮禁止：

- 创建或修改任何文件；
- 编写代码；
- 初始化 Skill；
- 运行具有修改性的命令；
- 创建 Git Commit。

项目目标：

我要把一篇关于 Codex 项目长期记忆的文章，做成一个可以公开开源、可以安装、可以测试的 Codex Skill。

源材料位于：

local-input/Codex长期记忆原文.pdf

local-input 只用于本地开发。

禁止把其中的真实项目路径、聊天截图、私人项目名称、个人信息或其他敏感内容复制到公开仓库。

原文的核心方法是：

1. 记：判断哪些信息值得长期保存；
2. 分：区分长期稳定记忆、当前工作记忆和历史记忆；
3. 写：任务完成前执行 Memory Checkpoint；
4. 读：按热记忆、温记忆、冷记忆逐层召回；
5. 忘：使用 ACTIVE、SUPERSEDED、REJECTED、ARCHIVED 管理记忆生命周期；
6. 真：真实结果、测试和 Git 的优先级高于 Markdown、聊天记录和 AI 自己的记忆。

请为 v0.1.0 设计完整方案。

v0.1.0 必须支持：

- bootstrap：为已有 Git 项目初始化记忆结构；
- resume：新对话接手项目之前，执行真实性检查和最小上下文读取；
- checkpoint：任务完成前，验证结果并写回状态、任务、决策、证据和交接；
- recall：按需检索历史决策、失败路线和证据；
- retire：让过期决策退出当前判断，同时保留历史追溯；
- audit：检查项目记忆是否过期、冲突或缺少证据。

安全边界：

- Skill 名称为 project-memory；
- GitHub 仓库名称暂定 codex-project-memory；
- Skill 放在 .agents/skills/project-memory；
- 优先使用 Python 标准库；
- 支持 Windows、macOS 和 Linux；
- 不引入数据库、向量检索、RAG、云同步或 GUI；
- 不覆盖任何已有文件；
- 不读取或保存 .env、Token、Cookie、密码或 API Key；
- 不允许未经用户授权自动创建 Commit、Push 或 Release；
- 任何写操作前必须展示计划；
- 任何检查结果必须明确输出 PASS、WARN、BLOCKED 或 ERROR；
- 不得因为 Markdown 写着 DONE 就认定任务完成。

请输出：

1. 六个原文原则与实际功能的映射；
2. 推荐目录结构；
3. SKILL.md、scripts、references、assets 各自职责；
4. 六种模式的输入、流程和输出；
5. v0.1.0 Definition of Done；
6. 至少 12 个测试场景；
7. 可能存在的逻辑矛盾、数据损坏风险和安全风险；
8. 第一版明确不做的功能；
9. 开发、测试、调优和发布的建议顺序。

只输出设计方案，不实施。
```

这一步非常重要。

因为一个 Skill 文件夹被生成出来，只能说明文件存在！

不能说明工作流真的成立。

所以我先让 Codex 回答：

> 到底怎么才算做完？
> 
> 

输入完成等待一段时间之后，就给了一堆的计划md文档

![image\.png](/images/codex-custom-memory-skill/image-2.png)

仓库目录

![image\.png](/images/codex-custom-memory-skill/image-1.png)

# 五、用 Skill Creator 生成第一版

方案确定以后，我才开始真正生成 Skill。

Codex 现在内置了 `skill-creator`。

我给 Codex 的第二条指令是：

![image\.png](/images/codex-custom-memory-skill/image-3.png)

即：

```Plain Text
现在按照刚才确认的设计，使用 /skill-creator 创建 project-memory v0.1.0 的第一版骨架。

创建位置：

.agents/skills/project-memory

本轮先创建 Skill 骨架和模板，不要创建 README、GitHub Actions、Release 或远程仓库。

目标结构：

.agents/
  skills/
    project-memory/
      SKILL.md
      agents/
        openai.yaml
      scripts/
        init_memory.py
        memory_check.py
      references/
        protocol.md
        schema.md
        security.md
      assets/
        templates/
          AGENTS.memory-snippet.md
          CURRENT_STATE.md
          CURRENT_TASK.md
          HANDOFF.md
          DECISION.md

要求：

一、SKILL.md

- 保持简洁；
- 不把全部协议和字段说明塞进 SKILL.md；
- 负责判断当前使用哪一种模式；
- 支持 bootstrap、resume、checkpoint、recall、retire、audit；
- 明确真实结果、测试和 Git 的优先级最高；
- 明确 archive 默认不读取；
- 明确任何写操作前必须展示准备修改的文件；
- 明确 Git Commit、Push 和 Release 必须得到用户授权；
- 明确遇到真实性冲突时必须停止，不得自己猜测；
- 明确隐式触发时默认只允许执行只读检查，不允许直接修改项目。

二、description

description 必须明确：

- 适用于长期项目；
- 适用于换新对话、上下文压缩、项目交接和 Agent 切换；
- 适用于项目状态写回、历史决策管理和真实性审计；
- 不适用于个人偏好；
- 不适用于一次性小任务；
- 不适用于保存任何密钥或隐私信息；
- 同时覆盖中文和英文常见触发表达。

三、agents/openai.yaml

- 设置清晰的 display_name 和 short_description；
- 第一版允许隐式识别；
- 但是任何写入和 Git 操作仍然必须遵守 SKILL.md 中的确认规则。

四、progressive disclosure

- SKILL.md 只保留核心调度逻辑；
- 完整工作流放入 references/protocol.md；
- 字段与文件格式放入 references/schema.md；
- 隐私、覆盖、Git 和敏感信息规则放入 references/security.md；
- 初始化模板放入 assets/templates。

五、脚本

本轮只生成接口、命令行参数、docstring 和待实现测试契约。

暂时不要把没有验证过的逻辑写成“已经通过”。

完成后输出：

1. 实际创建的文件；
2. 每个文件的职责；
3. SKILL.md 完整内容；
4. 尚未实现的部分；
5. 下一阶段实施顺序。
```

生成完成以后，第一版的目录大概是这样：

```Plain Text
codex-project-memory/
│
├─ .agents/
│  └─ skills/
│     └─ project-memory/
│        ├─ SKILL.md
│        ├─ agents/
│        │  └─ openai.yaml
│        ├─ scripts/
│        │  ├─ init_memory.py
│        │  └─ memory_check.py
│        ├─ references/
│        │  ├─ protocol.md
│        │  ├─ schema.md
│        │  └─ security.md
│        └─ assets/
│           └─ templates/
│              ├─ AGENTS.memory-snippet.md
│              ├─ CURRENT_STATE.md
│              ├─ CURRENT_TASK.md
│              ├─ HANDOFF.md
│              └─ DECISION.md
│
├─ local-input/
└─ .gitignore
```

![image\.png](/images/codex-custom-memory-skill/image.png)

这里面：

```Plain Text
SKILL.md
负责告诉 Codex 什么时候做什么。

protocol.md
负责完整的六步记忆流程。

schema.md
负责每个文件应该有哪些字段。

security.md
负责隐私、覆盖和 Git 安全。

init_memory.py
负责把记忆系统初始化到一个已有项目。

memory_check.py
负责检查 AI 有没有认真记。

templates
负责生成用户项目里的记忆文件。
```

这样做还有一个好处。

Codex 一开始只需要看到 Skill 的名称和描述。

真正使用 Skill 的时候，再读取完整的 `SKILL.md` 和相关资料。

![image\.png](/images/codex-custom-memory-skill/image-8.png)

不会为了一个可能用不到的工作流，每次都把全部内容塞进上下文。

# 六、真正重要的，不是 SKILL\.md，而是两个脚本

如果这个 Skill 只包含一份说明文档，那它最多只能算一套比较完整的提示词。

它还是有可能漏执行。

还是有可能看见`DONE`就相信已经完成。

还是有可能在记忆和真实项目冲突的时候继续往下猜。

所以原文里的最后一个字：真！

必须交给脚本。

我的设计是：

> AI 负责理解记忆，脚本负责检查 AI 有没有认真记。
> 
> 

接下来，我让 Codex 实现两个确定性脚本。

![image\.png](/images/codex-custom-memory-skill/image-4.png)

## 第三个指令：实现初始化和真实性检查

```Plain Text
现在实现 project-memory v0.1.0 的确定性部分。

请先读取：

- .agents/skills/project-memory/SKILL.md
- references/protocol.md
- references/schema.md
- references/security.md
- 所有模板文件

然后实现：

1. scripts/init_memory.py
2. scripts/memory_check.py
3. 对应的标准库 unittest

整体要求：

- Python 3.9+；
- 只使用 Python 标准库；
- Windows、macOS、Linux 路径兼容；
- 不访问网络；
- 不读取仓库之外的文件；
- 不读取 .env、凭据目录或用户主目录中的私密配置；
- 不自动初始化 Git；
- 不自动 Commit；
- 不自动 Push；
- 所有错误必须有可读说明；
- 没有实际执行的测试，不得写成通过。

init_memory.py 必须支持：

- 指定目标项目根目录；
- --dry-run；
- --apply；
- 重复运行时保持幂等；
- 默认不覆盖任何已有文件；
- 已有 AGENTS.md 时，只生成建议补丁；
- 未经明确参数，不直接修改已有 AGENTS.md；
- 创建 memory/；
- 创建 CURRENT_STATE.md；
- 创建 CURRENT_TASK.md；
- 创建 HANDOFF.md；
- 创建 decisions/；
- 创建 evidence/；
- 创建 archive/；
- 输出 CREATE、SKIP、CONFLICT 和 PROPOSED_PATCH；
- 如果发生冲突，返回非零退出码；
- 正式执行前再次展示准备创建的文件。

memory_check.py 必须检查：

1. 当前目录是否为 Git 仓库；
2. 必需的记忆文件是否存在；
3. 记忆文件的机器可读元数据是否符合 schema；
4. verified_against_commit 是否真实存在；
5. verified_against_commit 是否为当前 HEAD 的祖先；
6. verified_against_commit 以后是否出现未写回记忆的非 memory 文件变化；
7. 工作区是否存在未提交的非 memory 文件变化；
8. 状态文件中引用的证据是否真实存在；
9. 同一个 decision_key 是否存在两个 ACTIVE 决策；
10. SUPERSEDED 决策是否包含 superseded_by；
11. superseded_by 指向的决策是否真实存在；
12. HANDOFF 与 CURRENT_STATE 的 verified_against_commit 是否一致；
13. archive 是否被当前状态错误地当作有效事实；
14. 任务写着 DONE 时，是否存在对应的测试或证据。

输出格式：

- 人类可读模式；
- --json 结构化模式；
- 总状态必须为 PASS、WARN、BLOCKED 或 ERROR；
- 列出每一项检查结果；
- 列出阻塞原因；
- 列出建议修复动作；
- 不允许自动修复；
- ERROR 用于环境或格式错误；
- BLOCKED 用于项目事实与记忆冲突；
- WARN 不能被描述为完全通过。

测试要求：

- 使用 tempfile 创建隔离 Git 仓库；
- 每个测试不能污染真实项目；
- 测试有效项目；
- 测试缺失文件；
- 测试重复 ACTIVE；
- 测试缺失证据；
- 测试过期状态；
- 测试 memory-only 变化；
- 测试非 memory 代码变化；
- 测试 dirty worktree；
- 测试已有 AGENTS.md 不被覆盖；
- 测试 dry-run 不产生文件；
- 测试重复初始化不重复追加规则。

实现完成后实际运行：

1. Python 语法检查；
2. 全部 unittest；
3. init_memory.py --dry-run；
4. memory_check.py --help；
5. 有效 fixture；
6. 无效 fixture。

最后输出真实运行命令、退出码和结果。
```

【截图：Codex 实现两个脚本】

【截图：unittest 第一轮结果】
