---
title: "Jev模型怎么用？我申请到内测后，终于看懂它是干什么的（附申请模板提示词）"
description: "Jev 内测实用记录：认识 Noul、Choice、Score 三种判断方式，在 Playground 里测试，并接入 Codex，附内测申请模板提示词。"
date: "2026-09-20"
slug: "jev-model-tutorial"
published: true
---

大家好，我是佬刘。

最近TypeSafe AI发布了一个很有意思的新模型，叫做 **Jev**。

我昨天申请了一下，今天发现已经通过了。

![Jev模型怎么用？我申请到内测后，终于看懂它是干什么的（附申请模板提示词），原文配图 1](/images/jev-model-tutorial/image-1.png)

所以我直接进去实际玩了一遍。

先说结论。

**Jev 和我们平时用的 ChatGPT、Claude，思路完全不一样。**

不要把它单纯理解成一个新的聊天模型，更像是专门塞进软件、Agent 和自动化流程里的一个if判断。

你把一段信息给它，再提前告诉它自己想判断什么，直接返回概率、分类和评分。

TypeSafe 把 Jev 称为第一款公开的 **System One Model**，核心就是快速完成结构化判断，然后把结果直接交给程序使用。官方目前仍处于 Early Access 阶段。

![Jev模型怎么用？我申请到内测后，终于看懂它是干什么的（附申请模板提示词），原文配图 2](/images/jev-model-tutorial/image-2.png)

## 一、Jev到底是干什么的？

我一开始看官方介绍的时候，其实也有点懵。

System One、Noul、Choice、Score，一堆新名词。

真正打开 Playground 跑了一遍以后，我发现其实特别好理解。

Jev 的整个工作流程，基本就是：

**给它一段信息 → 告诉它你想判断什么 → Jev 返回结果。**

比如用户发来这样一句话：

> 我的 ChatGPT Plus 昨天刚续费，今天怎么又扣了我一笔钱？我现在急着用，麻烦赶紧帮我处理一下，如果是重复扣款就给我退掉。
> 
> 

对于 ChatGPT 来说，我们一般会问：这个用户想干什么？帮我分析一下。

然后 ChatGPT 给你写一段：该用户可能遇到了重复扣款问题，目前情绪较为着急，建议联系账单部门……

（当然现在的chatGPT而言，很可能再稀里糊涂的扯一大堆）

Jev 则不走这个路线。

我在playground里让它同时判断三件事情。

![一、Jev到底是干什么的？，原文配图 3](/images/jev-model-tutorial/image-3.png)

第一件事情，用户到底有没有退款意图；第二件事情，这个问题应该交给哪个部门；第三件事情，用户现在到底有多着急。

然后我点了一下 Run Request。

结果出来了。

![一、Jev到底是干什么的？，原文配图 4](/images/jev-model-tutorial/image-4.png)

退款意图是 **97% true**。

应该交给 **billing **部门，概率直接到了 100%。

用户当前的急迫程度是 **2\.92 / 4**，Confidence 79%。

整个过程中，Jev 没有给我生成一大堆解释，它直接把程序真正需要的判断结果扔了回来。

这时候我一下子就明白这个模型是干什么的了。

假设这是一个真正的客服系统，我完全可以继续在后台写：

退款意图超过 80%，进入退款流程，如果分类是 billing，自动转到账单客服，急迫程度超过 3，提高工单优先级。

到这里，Jev 就从一个AI模型变成了程序里面的一部分。

这也是 TypeSafe 对它的定位。

**Jev 输出的是预先约束好的结构化判断，程序可以直接比较、设阈值、排序或者进入下一段逻辑。**

## 二、Noul、Choice、Score分别是什么？

打开 Jev 的 Playground，最先需要搞懂的就是这三个东西。

看着有点陌生，实际非常简单。

![二、Noul、Choice、Score分别是什么？，原文配图 5](/images/jev-model-tutorial/image-5.png)

### 1\.Noul，判断一件事情到底有多可能成立

比如刚才我问：

> 用户是否明确提出了退款要求？
> 
> 

Jev 返回：**97% true**

这就是 Noul，可以把它理解成一个带概率的是或者否。

普通代码可能只有：

```Plain Text
true
false
```

Jev 给你的则是：

```Plain Text
0.97
```

![1.Noul，判断一件事情到底有多可能成立，原文配图 6](/images/jev-model-tutorial/image-6.png)

这样程序就有操作空间了。

例如你可以自己规定，0\.8 以上自动处理，0\.5 到 0\.8 交给人工继续确认，低于 0\.5 就不进入这个流程。

它返回 0 到 1 之间的概率，越接近 1 越倾向于成立，越接近 0 越倾向于不成立，0\.5 左右说明模型本身也不确定。

### 2\.Choice，从几个固定答案里选一个

还是刚才那个例子。

我提前告诉 Jev：

这个用户的问题只能属于三个类别。

```Plain Text
billing
支付、扣款、订阅和退款

technical
产品Bug、无法使用、功能异常

sales
购买咨询、价格和套餐
```

Jev 最后判断：

```Plain Text
billing      100%
technical      0%
sales          0%
```

![2.Choice，从几个固定答案里选一个，原文配图 7](/images/jev-model-tutorial/image-7.png)

这就是 Choice。

它特别适合做各种分类和路由。

比如一个 AI Agent 收到任务之后，可以先让 Jev 判断：

```Plain Text
coding
research
writing
image
data_analysis
```

如果是 coding，就交给 GPT。

如果需要查最新资料，就交给联网 Agent。

如果是图片，就交给图片模型。

![2.Choice，从几个固定答案里选一个，原文配图 8](/images/jev-model-tutorial/image-8.png)

Jev 自己不用把后面的活全部干完，它负责先把任务送到正确的位置。

### 3\.Score，判断程度

Score 就更好理解了。

例如我给用户急迫程度设置五档。

```Plain Text
0 完全不着急

1 有一点着急

2 明显希望尽快解决

3 非常着急，已经影响正常使用

4 极其紧急，并且出现强烈催促
```

Jev 最后返回了：

**2\.95 / 4**

![3.Score，判断程度，原文配图 9](/images/jev-model-tutorial/image-9.png)

它甚至不一定给你整数。

这意味着它认为这个人的状态已经非常接近第 3 档。

Score 很适合用来判断 Bug 严重程度、客户情绪、内容质量、风险等级、任务复杂度这一类连续变化的问题。官方文档也明确说明，Score 返回的是在你定义的等级之间的位置，因此结果可以落在两个等级中间。

这样看就简单多了。

**Noul 判断“是不是”。**

**Choice 判断“是哪一个”。**

**Score 判断“程度有多高”。**

![3.Score，判断程度，原文配图 10](/images/jev-model-tutorial/image-10.png)

## 三、我觉得Jev真正有意思的地方，在这里

如果 Jev 只是一个分类模型，那顶多就是 LangChain 我感觉其实没什么值得专门写一篇文章的。

真正让我觉得有意思的是，它可以围绕同一份信息，同时问很多问题。

比如还是刚才那个用户。

我完全可以一次性问：

有没有退款意图？

是不是非常着急？

![三、我觉得Jev真正有意思的地方，在这里，原文配图 11](/images/jev-model-tutorial/image-11.png)

这些问题都使用同一个 State，也就是用户刚才发来的那段话。

Jev 会并行处理。

TypeSafe 官方文档也建议，**同一个 State 下能够提前提出的问题尽量放在同一次请求中。**每个问题独立判断，不需要像普通聊天一样问完一个，再等它回答，再问下一个。

这就特别适合自动化了。

比如以后做一个自动回复系统：客户进来咨询以后，Jev 可以同时判断重要程度、类型、是否需要回复、是不是广告、是否涉及付款、是否来自重要客户，然后程序自己按照结果分类。

做 Agent 也是一样。

一个任务进来，先判断任务类型、难度、是否需要联网、是否需要调用工具、有没有风险。

最后再决定把任务交给谁。

我感觉到这里，Jev 的定位就已经很清楚了。

**它很适合负责 AI 系统里的“判断”。**

![三、我觉得Jev真正有意思的地方，在这里，原文配图 12](/images/jev-model-tutorial/image-12.png)

## 四、Playground怎么玩？

申请通过以后，进入 TypeSafe 后台。

左边直接有一个 Playground。

![四、Playground怎么玩？，原文配图 13](/images/jev-model-tutorial/image-13.png)

最上面的 State，就是 Jev 做判断之前拿到的信息。

例如：

```Plain Text
{
  "user_message": "我的 ChatGPT Plus 昨天刚续费，今天怎么又扣了我一笔钱？"
}
```

下面的 Questions，就是你想让它判断的问题。

![四、Playground怎么玩？，原文配图 14](/images/jev-model-tutorial/image-14.png)

这里可以直接选择 Noul、Choice 和 Score。

![四、Playground怎么玩？，原文配图 15](/images/jev-model-tutorial/image-15.png)

全部设置好以后，右下角点击 Run Request 就可以。

![四、Playground怎么玩？，原文配图 16](/images/jev-model-tutorial/image-16.png)

如果你只是想体验 Jev，其实到这里已经够用了。

完全不用写代码。

而且我这次特意直接用了中文去测，目前这组测试是能够正常理解的。

不过官方目前把 System One 任务定义得很明确，它更适合这种快速、聚焦的判断。

像分析一下这个问题然后给出最佳解决方案这种需要多步推理的问题，建议拆成多个小判断，再通过程序组合结果。

## 五、真正想拿来做项目，可以直接接Codex

这个也是我觉得很爽的地方。

TypeSafe 官方已经直接提供了一个 Agent Skill。

而且文档里面明确写了，支持 **Claude Code、Codex 和其他 Agent 环境**。

所以如果你用 Codex，连官方文档都不用自己一页一页啃。

首先选择一个文件夹项目，打开codex终端

![五、真正想拿来做项目，可以直接接Codex，原文配图 17](/images/jev-model-tutorial/image-17.png)

在项目终端运行：

```Plain Text
npx skills@latest add typesafe-ai/skills --skill typesafe-ai --agent codex --yes
```

![五、真正想拿来做项目，可以直接接Codex，原文配图 18](/images/jev-model-tutorial/image-18.png)

默认会安装到当前项目，如果想全局安装，可以加 `-g`。

接下来去 TypeSafe 左侧的 API Keys 创建一个 API Key。

![五、真正想拿来做项目，可以直接接Codex，原文配图 19](/images/jev-model-tutorial/image-19.png)

API Key 不要直接写进代码，更不要上传到 GitHub。

然后就可以直接让 Codex 帮你开发。

比如我如果想把前面的测试真的做成一个小工具，可以直接给 Codex：

```Plain Text
使用 TypeSafe Skill，帮我开发一个简单的客服消息判断工具。

用户输入一段客服消息后，调用 Jev 完成以下判断。

1. 判断用户是否存在退款意图，使用 Noul。

2. 判断问题类型，使用 Choice。
可选项为：
billing
technical
sales

3. 判断用户当前的急迫程度，使用 Score。
等级从 0 到 4，并给每一级写清楚标准。

把三个问题放在同一次 Jev 请求中。

最后在网页中展示：

用户原始消息
退款意图概率
问题分类及各选项概率
急迫程度
Confidence
本次请求耗时

API Key 为：【填写你的API KEY】

先阅读已经安装的 TypeSafe Skill，再开始开发，不要自行猜测 API 字段。
```

![五、真正想拿来做项目，可以直接接Codex，原文配图 20](/images/jev-model-tutorial/image-20.png)

剩下的事情，就让 Codex 自己去做。

![五、真正想拿来做项目，可以直接接Codex，原文配图 21](/images/jev-model-tutorial/image-21.png)

TypeSafe 官方这个 Skill 本身已经包含了三种问题类型、API 使用方式以及如何设计判断流程，而且官方还特别建议把问题和阈值这些常量集中管理，方便后面自己调整。

![五、真正想拿来做项目，可以直接接Codex，原文配图 22](/images/jev-model-tutorial/image-22.png)

## 六、Jev适合拿来做什么？

玩到这里以后，我感觉这个模型最大的价值，其实不在普通聊天。

我如果现在问帮我写一篇公众号文章，那我肯定不会找 Jev，这明显还是 ChatGPT、Claude 这一类生成模型擅长的事情。

但如果我的公众号后台每天进来 1000 条评论，我想判断哪些需要回复、哪些是广告、哪些是咨询、哪些人购买意愿比较强，这时候 Jev 就有意思了。

这些地方才是 Jev 比较适合进入的位置。

就是给普通程序加入模糊判断能力，让代码可以分类、路由、评分和决定下一步分支。

## 七、最后

Jev 现在还很早。

TypeSafe 在 9 月 15 日才正式公开 Jev，目前还是 Early Access。

所以我暂时不会说它会替代什么模型。

我反而觉得它提供了一个挺有意思的新思路。

以前我们提到 AI，第一个想到的是：

**让 AI 帮我生成什么。**

Jev 更像是在问：

**有哪些原本很难写成 if/else 的判断，可以交给 AI？**

这可能才是 Jev 最值得玩的地方。

我已经申请下来并实际跑了一轮，后面如果找到更适合的真实项目，我再继续拿它折腾。

## 申请提示词

下面提示词，直接复制喂给AI，然后打开 typesafe\.ai ，一步一步申请吧！

```Markdown
你是 TypeSafe / Jev 候补申请填写助手。任务分两步：先向用户收集必要信息，再按官网表单逐题给出可粘贴的英文答案。

# 目标
让审核把申请人看成「马上要把 Jev 接进真实工作流的 builder」，不是游客、求职者或采购评估员。不承诺保过。

# Jev 是什么（写申请时必须对齐）
Jev 是 TypeSafe 的 System One 模型：输入 state + 带类型的问题，返回 Choice / Score / Noul 及概率、置信度。不聊天、不写文章、不写代码。适合路由、打分、是否判断、校验、门控。

# 审核口味
必须出现：我是谁、正在跑的真实 workflow、拿到权限后立刻做的实验。
实验优先写成 shadow mode：对照现有 LLM structured output，量 latency、cost、与标注一致性、置信度能否当自动/人工门控。
禁止：我很喜欢 AI、想体验新模型、Just curious、编造公司/GitHub/链接/数据、把「过检测/破解」当代表作、用打不开的链接。

# 官网流程
1. https://typesafe.ai → Join Waitlist
2. 必须点 Want in sooner? / Answer a few questions，不要只留邮箱
3. 表单用英文
4. 通过后 https://console.typesafe.ai 建 API Key
5. 等不及可用 Vercel AI Gateway：typesafe-ai/jev

# 先问用户（一次问完，缺什么再追问）
每次只收集事实，不要替用户编。问清楚再填表：

1. 英文称呼（名，或名+姓）
2. 常用邮箱是否已准备好（不用你填邮箱内容）
3. 身份：独立开发 / 公司员工 / 学生 / 研究 / 其他
4. 是否自己写代码接 API
5. 若有团队：公司名、大致人数
6. 第一周准备拿 Jev 做什么：输入是什么、要做的判断是什么（路由/打分/是否）、现在用什么模型、准备怎么对照测试
7. 最能代表你的已上线作品：做什么、难点、是否有 https 链接
8. GitHub：用户名/链接，或代码是否全私有
9. 其他可打开的 https：个人站、产品、X、博客
10. Discord：有没有账号、是否已加入 TypeSafe 官方服、用户名
11. 人是否在旧金山湾区、近期能否参加线下黑客松
12. 从哪里知道 TypeSafe / Jev
13. 是否有可公开的梗图/meme 链接；没有则留空

信息不足时：先给「可提交的最短安全版」，并标明哪几项是占位、需要用户改。

# 逐题默认策略（题目编号以页面为准）

What can we call you?
只用英文名或名+姓，不用网名、公司名、头衔。

What brings you to TypeSafe?（可多选）
默认只选 A. Building something myself。
仅当用户明确代表公司评估采购时才加 B。
不选 C Just curious、D 求职，除非用户坚持。

What would you try TypeSafe on first?
一两句英文。结构固定：
具体产品/流水线 + 输入物 + Choice/Score/Noul 判断 + 现在用生成式 LLM 再解析 JSON 的痛点 + 先 shadow test 再上线。
不要写成聊天机器人。

Will you be building with TypeSafe yourself?
自己写代码：A. Yes, myself
和小团队一起写：B. Yes, with a team
完全别人写：C
还在逛：不选 D，改写成自己会接 API，否则提醒用户信号弱。

What's your primary area of work?
会接 API / 写工作流：A. Software engineering, data/analytics, or machine learning
产品经理且不写代码：B
纯运营/销售：C 或 D，并提醒通过率可能较低
独立创始人但仍自己写代码：仍选 A，不要选 E（避免被当成采购负责人）

What company do you work at?
独立：Independent 或留空。
有公司：填真名，不编。

How many people work at your company?
独立：A. Just me。按实选，不虚报。

What's your GitHub profile?
有则贴 https://github.com/用户名 或用户名。
无私有说明：Most of my shipping code is private. Happy to describe the live products next.
禁止编造。

What's the coolest thing you've built?
一段英文：做什么、谁在用、技术难点、最好有链接。结尾点明希望用 Jev 做决策层而不是生成文本。不写未上线空想。

Any other links?
只列能打开的 https，每行一个，可加半句说明。
不贴微信 #小程序://、二维码、需要登录才能看的废链。

What's your Discord username?
先加入页面上的官方 Discord，再填完全一致的 Username。没有就说明可留空。

Would you be interested in an in-person hackathon in the SF Bay Area?
能去：Yes。不确定：Maybe。人在外地短期去不了：No。不要为了积极选 Yes。

How did you hear about TypeSafe?
一句英文实话，如 X/Twitter、朋友、Vercel、文档、Discord。

Got a favorite meme? Drop a link.
有可公开链接再贴；没有就留空 Submit。不要黄暴、不要编链接。

# 输出格式
用户还没提供档案时：先按上面清单提问，不要直接编完整申请。
用户给了截图或题干时：
1. 本题选什么 / 贴什么（可直接复制）
2. 一两句中文说明为什么
3. 若缺关键事实，用【待你改】标出
不要一次倾倒未出现的题目，除非用户要全流程答案。
全文申请答案用英文；解释用用户的语言。
```



