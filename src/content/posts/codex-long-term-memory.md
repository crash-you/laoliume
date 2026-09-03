---
title: "Codex长期记忆怎么做？换个对话，复杂项目还能接着跑"
description: "换个对话，复杂项目还能接着跑：Codex 长期记忆的实践方法。"
date: 2026-08-29
slug: "codex-long-term-memory"
published: true
wechat_url: "https://mp.weixin.qq.com/s/lji3zWDmPp8ClY49PLGgfA"
---

大家好，我是佬刘。

最近，我正在接管导师 的一个复杂项目。

光项目资料就有六十多个G。

![4zSvdCZF\.png](/images/codex-long-term-memory/4zSvdCZF.png)

里面不仅有大量原始数据，还有不同阶段留下来的脚本、结果、说明文档，以及前面的人处理到一半的内容。

我一开始分别让 Codex 和 Claude 去理解这套项目。结果都不太理想。

后来我换了一套思路，真的把问题解决掉了。昨天我还专门在群里分享了一下这件事情。

![image\.png](/images/codex-long-term-memory/image-4.png)

当时我还感慨：

我去！模型真的越来越强了。

![image\.png](/images/codex-long-term-memory/image-11.png)

但是今天继续做的时候，我突然想到一个问题。

**更强的模型，只解决了这一次的问题。**

过几天再换一个对话呢？下一阶段换成 Claude Code 来做呢？

难道每一次，都要让一个模型重新读六十多个 G 的资料，把整个项目重新理解一遍？

明显不现实！！

然后我一下想到了之前做的 vibePaper（源自vibe coding，旨在全程AI解决）。

这个项目从Round 1一路跑到了 Round 31。

![image\.png](/images/codex-long-term-memory/image-3.png)

中间换过很多次对话，也做过大量实验。

为了不让新的 AI 每次都重新理解整个项目，我其实很早就开始往项目里写各种**记忆**。

规则、当前进度、历史决策、失败路线、任务交接……

当时我觉得这已经算是一套**长期记忆系统**了。

直到这次重新打开仓库，我才发现：项目都已经做到 Round 31 了。

我的交接文档还停在 Round 26。

![image\.png](/images/codex-long-term-memory/image-10.png)

![image\.png](/images/codex-long-term-memory/image-9.png)

我专门弄了一套东西防止 AI 失忆，结果这套记忆自己先失忆了。

也是到这里，我才重新想了一遍：**AI的长期记忆，到底应该怎么做？**

我想用6个字总结AI长期记忆：**记，分，写，读，忘，真！**

## 一、记：长期记忆第一步，记什么

一次对话里产生的信息太多了。

完整聊天、、中间结果、AI的各种分析……

这些东西如果全部进入长期记忆，项目做不了多久，记忆自己就先爆啦。

![image\.png](/images/codex-long-term-memory/image-2.png)

所以我现在判断一条信息值不值得留下，只问一个问题：

> **如果下一个AI不知道这件事，会不会导致它做错？**
> 
> 

比如：

这个路线已经验证失败，要记。

当前项目已经做到哪个阶段，要记。

某个文件绝对不能覆盖，要记。

这轮运行中临时报了一个错，修完以后再也不会影响项目，不用记。

完整日志继续留在项目里，需要的时候再查就行。

### 我现在的做法

我直接把记忆提取写进 AI 的项目规则。

每完成一次任务，AI必须自己检查：

```Plain Text
当前项目状态变了吗？
这轮产生了新的长期决策吗？
有以后不能再踩的坑吗？
有已经验证的新事实吗？
有旧记忆已经过期了吗？
如果现在换新对话，下一位AI最少需要知道什么？
```

六个问题全部回答完，再决定哪些信息写入长期记忆，这些规则存储在 agents\.md 里：

![image\.png](/images/codex-long-term-memory/image-7.png)

也就是

> **让AI自己判断什么值得记。**
> 
> 

## 二、分：不同的记忆，要分开

筛出来以后，还有一个问题：**这些东西放哪？**

我以前很容易全部往一个文件里追加。结果文件越来越长。

旧状态和新状态混在一起；重要规则和几十轮历史实验混在一起。

最后 AI 什么都能看到，但不知道哪个最重要。

所以现在我只把记忆分三层。

第一层，长期稳定记忆。

比如项目目标、固定规则、不能违反的约束。

第二层，当前工作记忆。

比如现在做到哪里、当前任务、下一步、阻塞问题。

第三层，历史记忆。

比如失败路线、旧实验、旧聊天、日志、历史交接。

### 我现在的做法

直接拆开存：

```Plain Text
AGENTS.md
↓
长期稳定规则

CURRENT_STATE.md
↓
现在做到哪里

decisions/
↓
历史决策和失败路线

archive/
↓
旧聊天、日志、历史交接
```

![image\.png](/images/codex-long-term-memory/image-6.png)

文件叫什么无所谓。

重点是：**稳定的信息不要和天天变化的信息放在一起。**

新对话默认读取稳定记忆和当前状态。

历史记忆需要的时候再查。

![image\.png](/images/codex-long-term-memory/image-8.png)

## 三、写：长期记忆最容易断的地方，写回

这个是我之前真正做错的地方。

vibePaper 不是没有记忆文件。

有。问题是项目继续往前跑的时候，有几轮没有同步更新。

所以项目已经做到 Round 31

交接还停在 Round 26。

以前我的任务流程是：

```Plain Text
执行
↓
运行成功
↓
结束
```

现在不行了。

### 我现在的做法

每次任务完成以后，AI必须自动执行一次 `Memory Checkpoint`：

```Plain Text
执行任务
↓
验证结果
↓
提取值得长期保存的信息
↓
更新 CURRENT_STATE
↓
更新 decisions
↓
保存证据
↓
生成本轮交接
↓
提交 Git
↓
任务结束
```

我会直接在 `AGENTS.md` 里写：

```Plain Text
任何任务在宣布完成前，必须执行 Memory Checkpoint。

如果当前状态、长期决策、验证证据和下一步没有完成写回，
本任务不得标记为 DONE。
```

![image\.png](/images/codex-long-term-memory/image-12.png)

这样以后就不是AI想起来了就更新一下。

而是**不更新记忆，这轮任务就不算完成。**

这一步最好放在每个任务完成、准备切换阶段、准备压缩上下文的时候自动执行。

![image\.png](/images/codex-long-term-memory/image-5.png)

---

## 四、读：有了长期记忆，也不能每次全部读取

项目做得越久，记忆一定越多！

假设一个项目以后跑了 100 轮。

不可能每次开新对话，都从 Round 1 读到 Round 100。

所以长期记忆还需要一个**召回机制**。

我现在会把它简单分成：

```Plain Text
热记忆
当前状态、当前任务

温记忆
近期决策、相关实验

冷记忆
旧聊天、完整日志、历史实验
```

### 我现在的做法

每次新对话只按这个顺序读取：

```Plain Text
1. 项目规则
2. 当前状态
3. 当前任务
4. 与当前任务直接相关的决策
5. 对应结果和证据
```

![image\.png](/images/codex-long-term-memory/image-13.png)

如果这些已经够完成任务，就不继续往下读。

只有碰到为什么以前这么做？这个方案是不是以前试过？

才去搜索历史记忆。

这时候长期记忆和上下文管理就接起来了：

> **长期记忆负责留下。**
> 
> **上下文管理负责这一次拿哪些出来。**
> 
> 

![image\.png](/images/codex-long-term-memory/image-1.png)

---

## 五、忘：长期记忆，必须会忘

这个是我以前完全没重视的。

Round 26 的状态，在 Round 26 那一天没有错。

但项目跑到 Round 31以后，它就过期了。

所以长期记忆不能只会一直追加。

旧的东西必须有状态。

### 我现在的做法

所有会被替代的长期记忆，都增加一个状态：

```Plain Text
ACTIVE
当前有效

SUPERSEDED
已被新结论替代

REJECTED
已经验证失败

ARCHIVED
只保留历史，不参与当前判断
```

比如：

```Plain Text
方案A
status: ACTIVE
```

后来实验推翻了：

```Plain Text
方案A
status: SUPERSEDED

superseded_by: 方案B
```

旧东西不删除。还能追溯，但是新的 AI 不允许继续把它当当前事实。

`CURRENT_STATE.md` 也必须带：

```Plain Text
最后更新时间
最后验证时间
对应 Git Commit
当前状态
```

Git已经往前走了，但是当前状态还绑定旧 Commit。

先重新验证。

不要直接继续。

所以长期记忆不是：

> 永久保存。
> 
> 

而是：

> **该记的记，该退役的退役。**
> 
> 

![05c\-记忆状态与退役\.png](/images/codex-long-term-memory/05c-%E8%AE%B0%E5%BF%86%E7%8A%B6%E6%80%81%E4%B8%8E%E9%80%80%E5%BD%B9.png)

## 六、真：记忆不能比真实项目更可信

哪怕前面所有机制都有了。

AI还是可能漏更新。

所以不能因为某个 Markdown 写着已完成。

就真的认为完成了。

比如vibePaper：交接写着 Round 26，但是 Git 里已经更新到Round 31，那就不能信 Round 26。

### 我现在的做法

给整个项目固定一个事实优先级：

```Plain Text
真实结果 / 测试 / Git
↓
当前状态
↓
历史决策与交接
↓
AI自己的Memory
↓
聊天记录
```

新对话接手的时候，AI先做一次检查：

```Plain Text
CURRENT_STATE 里的 Commit
=
当前 Git HEAD 吗？

状态里引用的结果
=
真的存在吗？

任务写着 DONE
=
测试真的通过了吗？

HANDOFF
=
有没有落后于当前状态？
```

对不上就停止。不能自己猜。

写一个简单的：

```Plain Text
memory_check.py
```

自动检查：

```Plain Text
状态文件是否过期
引用文件是否存在
Git Commit是否一致
有没有两个冲突的ACTIVE状态
HANDOFF是否落后
```

AI负责理解记忆，脚本负责检查 AI 有没有认真记。

![image\.png](/images/codex-long-term-memory/image.png)

## 最后，整套长期记忆其实就是一个循环

我想用6个字总结AI长期记忆：

**记，分，写，读，忘，真。**

既然都是固定动作，为什么不直接把它做成一个 Skill？

所以，我准备直接动手，名字就叫，【项目不失忆 skill】

如果你还不知道什么是codex，那么推荐你阅读我这篇文章！



我是佬刘，下期见！
