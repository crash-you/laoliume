---
title: "文献检索怎么做？我给Codex装了一个科研Skill"
description: "AI 找论文最怕编造参考文献。我做了一个 literature-search 科研 Skill 并开源：自动翻译检索式、多源搜索、去重，还能双源核验论文真实性，一眼看出哪些论文信息对过。"
seoTitle: "文献检索怎么做？给 Codex 装一个科研 Skill（已开源）"
seoDescription: "自研 Codex 科研 Skill「literature-search」：英文检索式自动生成、多学术数据源搜索、论文去重、DOI 与作者双源核验，GitHub 开源可直接安装使用。"
image: "/og/literature-search-skill.png"
imageAlt: "佬刘AI 文章分享图：文献检索科研 Skill，给 Codex 装上"
date: 2026-09-13
slug: "literature-search-skill"
published: true
wechat_url: "https://mp.weixin.qq.com/s/v6gqmLi7n21jBisV_8RCPA"
---

大家好，我是佬刘。

无论是做科研，还是了解最新动态，都绕不开文献检索。

AI时代，当然要用AI这个工具来检索，但是有一个麻烦的问题。

**AI 给你找出来的论文，到底是真的还是假的？**

我之前也用过 ChatGPT、Claude 直接找论文。

能找是能找，但只要涉及具体标题、作者、DOI，我都会再去查一遍。

因为 AI 编参考文献，真的太常见了！

所以这次我换了一个思路，我给 Codex 做了一个专门用于**文献检索**的科研 Skill。

我把它叫做：`literature-search`

现在已经整理成一个完整项目，直接放到 GitHub 开源。

开源地址：github.com/crash-you/literature-search

## 01 先看效果

比如我现在想了解一个方向：

**机器学习在时间序列预测中的应用。**

Skill 装好以后，我直接跟 Codex 说：

> **帮我找近5年机器学习做时间序列预测的论文。**
> 
> 

就这一句。

![在 Codex 中输入文献检索需求](/images/literature-search-skill/image-1.png)

我不用告诉它该搜哪个渠道，也不用自己写英文关键词。

更不用补一句：

> 帮我去重、检查 DOI、核验论文真实性……
> 
> 

这些东西我已经写进 Skill 里了。

Codex 会自己开始干。

它先把我的研究问题转换成适合检索的英文表达，再扩展相关关键词。

![literature-search 生成英文检索式并扩展关键词](/images/literature-search-skill/image-2.png)

然后它会继续搜索学术数据源，把不同检索式得到的结果合并起来。

我只需要等结果。

![literature-search 汇总多个学术数据源的检索结果](/images/literature-search-skill/image-3.png)

## 02 先把Skill装上

安装也没搞那么复杂。

打开我的 GitHub：

**github.com/crash-you/literature-search**

在codex中安装

```Plain Text
/skill-installer
帮我安装下面这个PPT Skill：
github.com/crash-you/literature-search
安装到当前Codex 项目可以识别的Skills目录。
安装完成以后，检查这个Skill需要的依赖。
缺少依赖的话帮我处理。
最后告诉我安装是否完成，以及我应该怎么调用它。
```

![literature-search Skill 安装完成的提示](/images/literature-search-skill/image-4.png)

下载项目以后，codex还贴心的告诉你，怎么使用

![Codex 说明 literature-search Skill 的调用方式](/images/literature-search-skill/image-5.png)

## 03 然后直接说人话

退出然后重新打开 Codex 以后，就可以开始用了。

还是拿机器学习举例。

我输入：

> **帮我找近5年机器学习做时间序列预测的论文。**
> 
> 

Codex 识别到这是文献检索任务以后，会调用 `literature-search`。

然后开始自己跑检索流程。

![Codex 调用 literature-search 开始检索文献](/images/literature-search-skill/image-6.png)

它会自动处理几件事。

先理解我要研究什么，再生成适合学术检索的关键词，接着搜索多个学术数据源。

拿到结果以后，再把重复论文合并掉，把明显不相关的结果筛出去，最后才返回结果给我。

所以最后看到的不是一堆乱七八糟的搜索记录，而是一张整理好的文献表。

![literature-search 返回带 DOI 与链接的文献表](/images/literature-search-skill/image-7.png)

里面会带上论文标题、作者、年份、DOI、论文链接这些信息，还会告诉我为什么这篇论文和刚才的研究主题有关。

随便点击一个链接

![点击文献表中的链接打开论文详情页](/images/literature-search-skill/image-8.png)

## 04 我还加了论文核验

这个是我比较在意的地方。

AI 找论文最怕什么？

是**编一篇出来。**

标题看起来像真的，作者也像真的，甚至 DOI 都长得挺像。

然后你复制过去一搜，查无此文。

所以我在 Skill 里加了一步论文核验，对于筛出来的重要论文，Codex 会继续用其他学术来源核对论文信息。

主要检查：标题、作者、年份、DOI 能不能对应上。

如果多个来源都能对应，会标记成：

**双源核验：**只有一个可靠来源能确认：

**单源核验：**如果信息存在冲突或者缺失：

**待核验**

![文献核验结果，标注双源核验与待核验状态](/images/literature-search-skill/image-9.png)

这样至少我一眼就知道，哪些论文的信息已经对过，哪些还需要自己再确认一下。

对于科研来说，这个比给我多找20篇论文有用得多。

## 05 想缩小范围，继续说就行

第一次结果出来以后，也不用重新写一套提示词。

如果论文还是太多，我接着说：

> **只保留最近3年的，帮我挑最值得先读的5篇。**
> 
> 

它就继续筛。

![literature-search 筛选最近三年最值得读的 5 篇论文](/images/literature-search-skill/image-10.png)

如果我想先看综述：

> **先给我找3篇这个方向的综述论文。**
> 
> 

![literature-search 返回该方向的 3 篇综述论文](/images/literature-search-skill/image-11.png)

如果我只想看 Transformer：

> **只看 Transformer 做时间序列预测的研究。**
> 
> 

![literature-search 筛选仅 Transformer 相关的论文](/images/literature-search-skill/image-12.png)

都可以直接接着聊。

这也是我做成 Skill，而不是做一个“万能提示词”的原因。

正常人不会每次找论文之前，复制一段几百字的 Prompt。

我只想告诉 Codex**我要找什么。**

至于怎么找，是 Skill 的事情。

## 06 找到以后还能继续读

文献检索只是第一步。

如果结果里有一篇我感兴趣的论文，我还能直接接着说：

> **读一下第3篇，告诉我它用了什么数据、什么模型，实验结果怎么样。**
> 
> 

如果能拿到公开全文，Codex 可以继续往下读取。

![Codex 读取论文全文或摘要并总结内容](/images/literature-search-skill/image-13.png)

拿不到全文，也会直接告诉我。

这一点我也做了限制。

**没有拿到正文，就不能装作自己读过全文。**

最多根据已经拿到的题目、摘要和元数据判断。

这样至少不会出现，**明明只看了摘要，最后给你写得跟通读了整篇论文一样。**（我就是这样，之前被导师痛P了一顿）

## 07 当然，它也不是万能的

目前这一版主要针对国际学术文献。

像知网、万方、维普，现在还没有接进去。

另外，某个数据库这次没有搜到，也不能说明一篇论文一定不存在。

文献检索本来就跟关键词、数据库覆盖范围有关。

所以它更适合帮我完成第一轮检索和筛选。

找到核心论文以后，重要文献我还是建议自己再确认一下。

科研这个东西，AI 可以帮你省很多时间。

但最后的判断还是得自己做。

## 08 Skill已经开源

项目名字：`literature-search`

GitHub：

https://github.com/crash-you/literature-search

下载以后，把文件夹放进 Codex 的 Skills 目录，就可以直接用。

你甚至不用记什么复杂指令。

装完以后直接问：

> **帮我找近5年机器学习做时间序列预测的论文。**
> 
> 

就行。

后面我还准备继续往这个 Skill 里加一些东西。

比如引用追踪、BibTeX 导出、Zotero、文献矩阵。

至于这个 Skill 到底怎么做出来的，SKILL.md 怎么写，怎么让 Codex 自动判断什么时候调用……

这个我后面再单独写一篇。

这里是佬刘，一个研究生的实测笔记。
