---
title: "ChatGPT 新功能教程：一句话生成计算器、交互图表，GPT-6 这次更新有点意思！"
description: "以 AA 账单计算器、交互图表和选择题为例，演示怎样在 ChatGPT 对话里生成可操作的小工具，修改输入并查看结果。"
date: "2026-10-09"
slug: "chatgpt-interactive-calculators-charts"
published: true
---

大家好，我是佬刘。

昨天，在GPT-6全面上架的当天，OpenAI 又给 ChatGPT 更新了一个新功能，叫做 **Intelligent UI（智能界面）**。

我刚刚试了一下，给 ChatGPT 发了一段话，让它帮我生成一个 AA 制账单计算器。

![在 ChatGPT 对话中使用 AA 账单计算器](/images/chatgpt-interactive-calculators-charts/step-01.png)

结果，它直接在聊天界面里生成了一个可以操作的计算器。

整个过程不需要编程，也不需要安装什么插件，输入一句话就能使用。

GPT又又再抢小程序的市场！

而且这次更新的功能还挺多，除了计算器，还可以生成交互式图表、知识讲解、小游戏等等。

今天就带大家深度体验一下，看看怎么使用。

## 一、Intelligent UI 是什么？

先说一下这个新功能。

2026 年 10 月 7 日，正式发布了 GPT-6 的 Intelligent UI 功能。

![Intelligent UI 功能的发布说明](/images/chatgpt-interactive-calculators-charts/step-02.png)

以前我们和 ChatGPT 聊天，看到的主要是文字、图片、表格以及部分图表。

这次更新后，ChatGPT 可以根据你的问题，组合文字、图表、按钮、输入框等界面元素。

比如，你想计算几个人聚餐应该怎么 AA，它可以生成一个账单计算器。

你想了解某个数学知识，它可以生成图表，让你调整参数，观察图像变化。

甚至可以让它生成小游戏，直接在聊天过程中操作。

![可在聊天中操作的界面示例](/images/chatgpt-interactive-calculators-charts/step-03.png)

**整个过程都在 ChatGPT 的聊天界面里完成。**

让普通用户通过自然语言，也能使用一些原本需要专门软件才能实现的交互工具。

## 二、Intelligent UI 怎么使用？

目前，这个功能已经开始分批推送。

使用方法也很简单。

**第一步，打开 ChatGPT 官方网站。**

[https://chatgpt.com/](https://chatgpt.com/)

![ChatGPT 网页版入口](/images/chatgpt-interactive-calculators-charts/step-04.png)

进入普通聊天界面，使用 GPT-6。

![在普通对话中选择模型](/images/chatgpt-interactive-calculators-charts/step-05.png)

这里有一个需要注意的地方。

**如果你是 Pro 用户，不要选择 Pro 推理档位。**

Intelligent UI 支持 GPT-6 的 Instant 到 Extra High 思考档位，Pro 推理档位使用的 Astra 暂时不支持。

![可生成交互界面的模型选择](/images/chatgpt-interactive-calculators-charts/step-06.png)

**第二步，在输入框里描述你想要的工具。**

这里没有什么特殊命令，也不用去设置里面打开某个开关。

直接用自然语言告诉 ChatGPT，你需要什么功能就行。

下面我们用几个具体的案例演示。

## 三、一句话生成 AA 制账单计算器

先来一个生活中能够用到的场景。

假如今天你和几个朋友出去聚餐，有人付了饭钱，有人付了饮料钱，还有人付了打车费。

最后算账的时候，每个人应该出多少钱，又应该转给谁？

这种情况就可以交给 ChatGPT。

复制下面这段提示词。

**提示词：**

```text
帮我生成一个可以直接操作的 AA 制账单计算器，支持调整参与人数、添加每个人的付款金额，
并自动计算每个人应该承担多少钱，以及谁需要给谁转账。
要求直接在当前聊天界面生成交互式工具，支持修改数据和查看计算结果，不要只输出代码。
```

![向对话提交账单计算器的需求](/images/chatgpt-interactive-calculators-charts/step-07.png)

发送之后，ChatGPT 就会尝试生成对应的交互界面。

我自己刚刚也跑通了这个案例，ChatGPT 确实生成了可以操作的计算器。

我们可以直接使用生成的界面，输入人数和账单数据，查看计算结果。

![输入账单和人数后查看计算结果](/images/chatgpt-interactive-calculators-charts/step-08.png)

而且，如果你觉得功能不够，也可以继续和 ChatGPT 对话。

比如告诉它：

> 给这个计算器增加一个功能，支持某笔费用只由部分人平摊，同时保留其他已经输入的账单。

它就可以根据新要求尝试调整界面。

![按新要求调整后的计算器](/images/chatgpt-interactive-calculators-charts/step-09.png)

## 四、生成可以调整参数的交互图表

除了计算器，Intelligent UI 还有一个我觉得挺有意思的用途，就是交互式数据展示。

我们以前让 ChatGPT 生成图表，可能得到一张固定的图片，或者一个普通的数据图表。

现在可以进一步要求它把输入参数、图表和计算结果放在同一个界面里。

比如，你准备出去旅游，想看看不同预算方案的费用占比。

可以输入下面的提示词。

**提示词：**

```text
帮我生成一个可交互的旅行预算规划工具。
支持设置旅行人数、旅行天数、交通预算、住宿预算和每日餐饮预算。
使用滑块或输入框调整这些参数，并通过饼图展示各项费用占比，同时显示预计总费用。
所有操作都在当前 ChatGPT 聊天界面中完成，不要只输出代码。
```

![用提示词生成可交互的图表](/images/chatgpt-interactive-calculators-charts/step-10.png)

如果生成结果缺少某个控件，可以继续告诉 ChatGPT 增加对应功能。

对于需要对比多种方案的场景，这种交互形式会比一张固定的图片更方便。

![修改参数后对比图表中的方案](/images/chatgpt-interactive-calculators-charts/step-11.png)

## 五、让 ChatGPT 生成一个学习工具

再来看一个学习场景。

之前我也分享过不少使用 ChatGPT 辅助学习的方法，比如背单词、整理知识点、制定学习计划等等。

这次可以尝试把这些内容做成交互工具。

拿英语单词学习来说。

**提示词：**

```text
帮我生成一个可以在聊天界面操作的英语单词复习工具。
首先提供 10 个大学英语四级难度的单词。
每次展示一个英语单词，用户点击按钮后再显示中文释义和例句。
增加“认识”和“不认识”两个按钮，并统计本轮认识和不认识的单词数量。
完成一轮后，优先使用不认识的单词进行第二轮复习。
整个过程使用可点击的交互界面，不要只输出文字列表或代码。
```

![交互式问答的界面示例](/images/chatgpt-interactive-calculators-charts/step-12.png)

这个思路还可以用在其他学科。

需要记忆的知识可以做成卡片，需要理解的公式可以做成交互图表，需要练习的内容可以做成答题工具。

而且，生成之后还可以继续提出修改要求。

比如让它增加错题统计，或者调整每轮的题目数量。

需要注意的是，这类工具目前主要在对话中使用。

![对话里生成的小工具及其操作方式](/images/chatgpt-interactive-calculators-charts/step-13.png)

## 六、常见问题

1. **为什么我的 ChatGPT 没有生成交互界面？**

先确认当前使用的是 GPT-6，并且没有选择 Pro 推理档位。

Intelligent UI 正在分批推送，不同账号的开放时间可能存在差异。

如果需要，可以在提示词里说明，希望生成带有按钮、输入框的可交互界面。

1. **免费用户可以使用吗？**

可以。

1. **这个功能和 Codex 有什么区别？**

Intelligent UI 主要用于 ChatGPT 对话内的交互体验，你提出一个问题，它可以根据任务生成可操作的界面。

如果需要开发一个可以部署到服务器、分享给其他人长期使用的网站或小程序，则要选择codex

## 写在最后

这次 Intelligent UI 更新，我觉得一个非常重要的点在于，我们可以根据自己的需求，DIY 属于自己的小工具。

现在，我们可以把自己的需求告诉 ChatGPT，让它在聊天界面里生成一个能操作的小工具。需要什么功能，就让它生成什么功能。使用过程中发现哪里不合适，还可以继续提出要求，让它修改。

打开 ChatGPT，复制提示词，看看它给你生成什么。
