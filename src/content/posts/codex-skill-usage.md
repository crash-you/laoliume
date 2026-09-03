---
title: "codex skill怎么用？安装、配置、调用到自定义 Skill 完整教程"
description: "Codex Skill 的安装、配置、调用到自定义 Skill 的完整教程。"
date: 2026-08-27
slug: "codex-skill-usage"
published: true
wechat_url: "https://mp.weixin.qq.com/s/LLv993B_6fuBXjTfAYNPiQ"
---

大家好，我是佬刘。

前边在写 Codex 使用指南的时候，其实已经提到过一次 Skill。但当时只是放在完整教程里讲了一下，没有单独展开。

这两天看到群里的小伙伴的问卷，对于codex skill的使用有所疑惑，于是我又重新把 Codex Skill 拎出来研究，才发现这个东西确实值得单独写一篇。

![tFV8F6ar\.png](/images/codex-skill-usage/tFV8F6ar.png)

因为 Skill 和普通提示词本来就不是一回事！

而且比较麻烦的是，**Codex Skill 最近几个月变化还挺快。**

我把OpenAI最新的官方文档、GitHub等近期的内容重新对了一遍，发现现在网上不少教程已经开始新旧混用了。

比如很多文章现在还在让你把 Skill 手动放到：

```Plain Text
~/.codex/skills
```

这个路径目前不是完全不能用。

但是在 Codex 最新源码里，`$CODEX_HOME/skills` 已经明确被标成了 **Deprecated user skills location，**翻译过来就是已弃用，也就是旧路径进入 维护模式，能用但别再用啦，赶快迁移到官方新推荐的位置。保留下来主要是为了兼容旧版本。

![image\.png](/images/codex-skill-usage/image-10.png)

官方现在给普通用户推荐的全局 Skill 路径已经变成：

```Plain Text
$HOME/.agents/skills
```

项目内部则统一使用：

```Plain Text
.agents/skills
```

更有意思的是，以前大家经常分享的 OpenAI 官方 `openai/skills` GitHub 仓库，现在 README 第一行就已经明确写上：

> This repository is deprecated\.
> 
> 

![image\.png](/images/codex-skill-usage/image-18.png)

目前新的 Codex Skill / Plugin 示例，已经开始迁移到 `openai/plugins`。

我去！

这才几个月。

所以这篇我尽可能全部按照最新官方文档来写。

如果后面 Codex 再改，我也会继续回来更新。

如果你的 Codex 还没有安装好，可以先看我前面写的完整教程。

下面直接开始！

## 一、Codex Skill 到底是什么？

首先，Skill 到底是干嘛的，还是得先讲清楚。

我觉得最简单的理解就是：

> **Skill = 给 Codex 装好的一套可重复使用的做事流程。**
> 
> 

也可以理解成AI版的SOP。

比如你每次让 Codex 帮你分析一篇论文，都要重新说：

先读全文；再提取研究问题；再整理研究方法；再总结数据来源；再分析创新点；最后按照固定格式输出。

一次两次还好。

但是如果这件事你每天都做，那每次重新输入一遍就很烦。

这时候就可以把整个流程做成一个 Skill。

以后你只需要告诉 Codex：

```Plain Text
使用 paper-reading-notes 分析这篇论文
```

剩下的规则，Codex 自己去读取。

所以 Skill 并不等于一条很长的提示词。

一个完整的 Skill 最简单可以只有：

```Plain Text
my-skill/
└── SKILL.md
```

也可以复杂到：

```Plain Text
my-skill/
├── SKILL.md
├── scripts/
├── references/
├── assets/
└── agents/
    └── openai.yaml
```

所以你完全可以把 Skill 理解成：

**提示词 \+ SOP \+ 知识 \+ 脚本 \+ 工具调用**

最后封装成了一个 Codex 能自己调用的能力包。

![image\.png](/images/codex-skill-usage/image-6.png)

## 二、先看自己的 Codex 有没有 Skill

理解了 skill 到底是什么，那么到codex里，怎么看呢？

如果你用的是 Codex CLI 或 IDE 插件，最快的方法是直接输入：

```Plain Text
/skills
```

Codex 会列出当前可以使用的 Skill。

![image\.png](/images/codex-skill-usage/image-2.png)

OpenAI 官方目前支持两种调用方式：

一种是你自己明确指定 Skill，比如图中，按键盘上下键可以自己选择某个skill

![image\.png](/images/codex-skill-usage/image-24.png)

另一种是 Codex 根据你的任务，**自动判断**要不要调用某个 Skill。

也就是说，以后你既可以写：

```Plain Text
$paper-reading-notes
帮我分析这篇论文
```

也可以直接写：

```Plain Text
帮我分析一下这篇论文，提取研究问题、方法、数据和结论。
```

这个自动判断，可以理解成，肌肉记忆。会自动触发。

如果你用的是 ChatGPT 的软件，那就更简单了

打开软件在页面输入 /skill ，就会看到skill列表！

![image\.png](/images/codex-skill-usage/image-19.png)

## 三、Codex Skill 怎么安装？

### 官方方法安装

先讲最简单，也是目前官方直接推荐的方法。

Codex 本身自带：

```Plain Text
$skill-installer
```

这个 Skill 就是专门用来安装其他 Skill 的。

官方文档给的示例是：

```Plain Text
$skill-installer linear
```

执行以后，Codex 会帮你安装 Linear Skill。

![image\.png](/images/codex-skill-usage/image-14.png)

然后等待一段时间，就安装成功了！

![image\.png](/images/codex-skill-usage/image-5.png)

### GitHub仓库安装

如果你在 GitHub 上找到一个自己想安装的 Skill，也不用非得自己：

下载 ZIP → 解压 → 找目录 → 复制。

可以直接把 GitHub 地址交给 Codex。

比如：

```Plain Text
使用 $skill-installer 安装这个 GitHub 仓库里的 Skill：

[这里粘贴 GitHub Skill 地址]
```

![image\.png](/images/codex-skill-usage/image-1.png)

比如我下载nature\-skill，给codex以GitHub仓库地址，让 Codex 自己处理。

等待一段时间后，skill安装成功！

![image\.png](/images/codex-skill-usage/image-22.png)

这也是我目前更建议小白使用的方法。

**能让 Codex 自己装，就尽量不要先手搓目录。**

但是有一点还是要注意营销号！！

第三方 Skill 可能不仅只有一个 `SKILL.md`，里面还可能带 Python、Shell、Node\.js 等脚本。

所以 GitHub 上看到一个 Skill，最好还是先看一下来源和代码（让codex看就行）

![image\.png](/images/codex-skill-usage/image-11.png)



```Plain Text
使用 $skill-installer 安装这个 GitHub 仓库里的 Skill：

[这里粘贴 GitHub Skill 地址]

在安装这个skill之前，看一眼有没有自带一些脚本，确认无风险之后再安装
```

别看到：

> “2026 最强 Skill！”
> 
> 

就一股脑全装！

## 四、Skill 到底安装在哪？

这一块我建议认真看一下。

因为这可能是现在网上教程最容易混乱的地方。

按照 OpenAI 当前官方文档，Codex 会从多个位置加载 Skill。

### 项目级 Skill

如果这个 Skill 只给当前项目使用，放：

```Plain Text
项目目录/.agents/skills/
```

例如：

```Plain Text
my-project/
├── .agents/
│   └── skills/
│       └── frontend-review/
│           └── SKILL.md
├── src/
└── package.json
```

这种 Skill 可以直接跟着 Git 仓库一起提交。

![image\.png](/images/codex-skill-usage/image-17.png)

也就是说，别人把你的项目 clone 下来以后，对应的 Skill 也一起有了。

### 用户级 Skill

如果你想让这个 Skill 在所有项目都能使用，放：

```Plain Text
$HOME/.agents/skills
```

Windows 对应通常就是：

```Plain Text
C:\Users\你的用户名\.agents\skills
```

比如：

```Plain Text
C:\Users\Liu\.agents\skills\paper-reading-notes\SKILL.md
```

这才是目前官方文档里的**用户级 Skill 推荐位置**。

![image\.png](/images/codex-skill-usage/image-3.png)

这里有一个很容易踩坑的地方。

OpenAI 最新文档里，用户自己创建的 Skill 推荐放在：

```Plain Text
$HOME/.agents/skills
```

但截至今天，我实际使用 Codex 自带的 `$skill-installer` 安装第三方 Skill 时，它默认仍然会安装到：

```Plain Text
~/.codex/skills
```

我一开始也以为是不是自己的 Codex 没更新，后来直接翻了 OpenAI 最新的 Codex 源码，发现安装器现在的默认目标目录确实还是 `$CODEX_HOME/skills`。

更有意思的是，Codex 当前 Loader 同时支持这两个目录：`$CODEX_HOME/skills` 被源码标记成旧版兼容位置，而 `$HOME/.agents/skills` 是当前文档推荐的用户级位置。

所以现在记一个最简单的规则：

**自己创建 → ****`.agents/skills`**

**`$skill-installer`**** 安装 → 默认装到 ****`.codex/skills`**** **

**项目专属 Skill → 项目里的 ****`.agents/skills`**

## 五、Codex Skill 怎么调用？

安装只是第一步。

真正使用 Skill，目前主要有两种方式。

### 第一种：手动调用

最直接，直接输入： /skill

![image\.png](/images/codex-skill-usage/image-21.png)

然后选择对应 Skill。

这样就属于明确告诉 Codex：这次任务，你给我按这个 Skill 来。

![image\.png](/images/codex-skill-usage/image-23.png)

### 第二种：自动调用

这个反而是我觉得 Skill 真正方便的地方。

你可以完全不写 Skill 名字。

比如你有一个专门处理论文的 Skill。

直接说：

```Plain Text
帮我阅读一下当前目录里的这篇论文，
整理研究问题、研究方法、数据来源、主要结论和局限。
```

如果这个任务符合 Skill 的 `description`（创建skill时的描述），Codex 就可以自动决定调用。

所以：

**Skill 里面的 description 不是写给人看的简介那么简单。**

它直接参与Codex判断：

> 这次到底要不要用这个 Skill。
> 
> 

官方甚至专门建议，description 要尽可能把**使用场景、范围和触发关键词**放在前面。

这个点后面自己开发 Skill 的时候非常重要。

## 六、Codex 为什么不用每次都读取所有 Skill？

这一块我之前也挺好奇。

但是仔细想想，如果我以后装 20 个、50 个甚至 100 个 Skill：

Codex 每次启动都把所有 `SKILL.md` 完完整整塞进上下文？

那 Token 不直接炸了吗！！

所以 Codex 现在用的是一种 **渐进式加载**。

启动的时候，它主要先读取每个 Skill 的：

```Plain Text
name
description
file path
```

先知道：

> 我现在有哪些能力。（skill）
> 
> 

只有任务真的匹配到某个 Skill 以后，它才继续打开那个 Skill 完整的 `SKILL.md`。

Codex 官方甚至给初始 Skill 列表设置了上下文预算：最多占模型上下文的约 2%，在无法确定窗口长度时上限是 8000 字符。Skill 太多时会先缩短 description，特别多甚至可能省略部分 Skill。

这其实也解释了为什么 Skill 可以做得比较复杂。

你完全可以把大段资料放到：

```Plain Text
references/
```

把固定程序放到：

```Plain Text
scripts/
```

不用全部塞在 `SKILL.md` 里。

等真正需要的时候再加载。

## 七、自己怎么创建一个 Codex Skill？

到这里，其实才到了我觉得最好玩的部分。

前面我们安装的都是别人做好的 Skill。

但是 Skill 真正有价值的地方，是：

**把你自己反复做的事情封装下来！！！**这就是让AI提效的根本，让AI去做那些重复性劳动！

而且现在创建一个 Skill 已经非常简单了。

Codex 自带：

```Plain Text
$skill-creator
```

官方目前推荐，如果你已经知道自己想做什么，直接调用它。Skill Creator 会继续询问：

这个 Skill 是干嘛的；什么时候触发；是否只使用指令；还是需要加入脚本。

比如我们现在现场做一个最简单的：

```Markdown
$skill-creator

帮我创建一个 paper-reading-notes Skill。

用途：
当我让 Codex 阅读论文、分析论文、整理文献时使用。

固定输出：
1. 研究问题
2. 数据来源
3. 研究方法
4. 主要结果
5. 创新点
6. 局限
7. 对我当前研究可以复用的思路

目前先做纯指令型 Skill，不需要额外脚本。
```

![image\.png](/images/codex-skill-usage/image-12.png)

接下来跟着它继续配置。

完成以后，你会得到类似：

```Plain Text
paper-reading-notes/
└── SKILL.md
```

![image\.png](/images/codex-skill-usage/image-16.png)

打开 `SKILL.md`。

![image\.png](/images/codex-skill-usage/image-15.png)

最基础的结构其实很简单

就这样。

一个最简单的 Skill 已经能用了。

## 八、再测试一次：到底有没有真的生效？

我觉得这一部分一定不要省。

很多教程做到：

> 文件复制进去了。
> 
> 

然后就宣布：

> Skill 安装成功。
> 
> 

但是 文件存在 和 Codex 真用上了 ，不是一回事。

最简单的方法就是做两轮测试。

第一轮明确调用：

```Plain Text
$paper-reading-notes
分析当前目录里的论文。
```

![image\.png](/images/codex-skill-usage/image-9.png)

第二轮完全不写 Skill 名：

```Plain Text
帮我阅读当前目录里的论文，
整理研究问题、方法、数据、结论和局限。
```

![image\.png](/images/codex-skill-usage/image-7.png)

看看 Codex 会不会自动匹配这个 Skill。

如果自动调用不生效，大概率是description描写的太过模糊！

## 九、Skill 不生效怎么办？

Skill 明明安装了，为什么 `/skills` 找不到？

很多官方的教程，会给你一堆路径等等。

但是我们既然都有codex了，还要自己看路径干什么？
直接把问题发给codex，把绝对路径给codex，让codex自己修复！

![image\.png](/images/codex-skill-usage/image-13.png)

这才是AI时代的正确用法！**让AI自修复AI！**

## 十、Skill 怎么关闭？

有时候 Skill 装多了，但又不想直接删。

还是和codex直接说，把skill安装的绝对路径发给AI！

![image\.png](/images/codex-skill-usage/image-8.png)

AI时代，能省就省哈哈哈哈！

## 十一、现在去哪找 Codex Skill？

这一段我得专门说一下。

如果你现在去搜 Codex Skill，很多文章还会直接让你去：openai/skills

但是但是，我既然都去官网了，我还要你codex干什么？

AI时代，当然是问AI啦！

直接问codex：

![image\.png](/images/codex-skill-usage/image-4.png)

然后codex就会给一堆的skill，高星的，推荐理由，适合场景，判断等等都有！

## 十二、第三方 Skill 怎么找？

除了官方，现在社区里 Skill 生态其实已经挺大了。

这个怎么找呢，首先第一点还是，直接在codex中问AI。

然后就是我们在刷视频的时候，偶然间刷到某个看着很厉害的skill了，就可以复制作者的GitHub仓库，给codex说，

```Plain Text
帮我下载这个skill ，GitHub仓库地址：

【GitHub链接】

在下载之前，先核对一下该skill是否有注入脚本等风险。
```

不过我自己的建议还是：

刚开始不要装一堆，尤其别看到别人分享：

> “Codex 必装 50 个 Skill！”
> 
> 

然后真的把 50 个全部塞进去。

建议是**一个 Skill 尽量只负责一件事情。**

其实这和我前面说非职业人员怎么学 AI 是一样的。

如果一个提示词就能解决，就先用提示词。

如果这个事情你反反复复做了很多遍，每次都要执行相同的一套流程：

**这时候再把它变成 Skill。**

这样做出来的 Skill 才是真的有用。

而不是为了拥有 Skill 去安装 Skill。

![image\.png](/images/codex-skill-usage/image.png)

## 十三、Codex Skill 还能和 MCP 一起用

这个也是现在 Skill 往后发展很明显的一个方向。

Skill 不一定只是“提示词”。

在现在还可以声明工具依赖，包括 MCP。

也就是说以后完全可以：

> Skill 负责规定怎么干；
> 
> MCP 负责给它真正能调用的外部工具；
> 
> Scripts 再负责一些确定性的本地处理。
> 
> 

到这一步，它就已经不是单纯的提示词了。

这也是为什么我觉得 Skill 这个东西值得单独学一下。

![image\.png](/images/codex-skill-usage/image-20.png)

## 最后

前几天写 Codex 的时候，我其实一直在讲一个东西：

**配置好 Codex 只是第一步。**

模型再强，如果每一次工作都要从头告诉它：

我是谁；我要做什么；先干什么；后干什么；输出成什么；

那还是会有很多重复工作。

AGENTS\.md 解决的是项目里的长期规则。

MCP 给Codex接上外部工具。

而Skill做的，则是把一件你已经跑顺的事情，真正沉淀成一套可以反复调用的工作流。

后面我还会继续拿一些真正能用的 Skill 来实测，比如科研、文档、PPT、开发这些场景。

**怎么让codex真正接入我们的生活，提升效率，才是接下来最有意思的部分！**

这里是佬刘，一个研究生的AI实测笔记。
