---
title: "ChatGPT做PPT教程：接入PowerPoint，生成可编辑PPT（附提示词）"
description: "ChatGPT for PowerPoint 上手：在 PowerPoint 加载项里直接生成和修改幻灯片，附资料转 PPT、指定单页局部修改、截图重建可编辑页的完整提示词。"
seoTitle: "ChatGPT 做 PPT 教程：接入 PowerPoint 生成可编辑 PPT"
seoDescription: "ChatGPT for PowerPoint 安装与使用：加载项安装、把论文资料做成汇报 PPT、指定页面局部修改、用截图重建成可编辑幻灯片，附可直接复制的提示词和常见问题。"
image: "/og/chatgpt-ppt-powerpoint.png"
imageAlt: "佬刘AI 文章分享图：ChatGPT 接入 PowerPoint 生成可编辑 PPT"
date: 2026-09-17
slug: "chatgpt-ppt-powerpoint"
published: true
wechat_url: "https://mp.weixin.qq.com/s/xTWQGB4o3rhUxhUxGQN-OQ"
---

大家好，我是佬刘。

我相信大家肯定都被PPT折磨过！在之前，我也写过如何用codex调用skill去做PPT

但是有一个问题，就是codex太重了，我怎么直接在pointpower里做呢？

**ChatGPT 做 PPT，现在可以直接在 PowerPoint 里面操作了。**

打开演示文稿，在旁边告诉它你要做什么，它就能根据资料创建幻灯片，也能继续修改已经做好的内容。这个功能叫 **ChatGPT for PowerPoint。**

我比较注重的是做出来之后，后面还能不能方便地改。毕竟做PPT的时候，改内容才是常态，总不能换一句话就重新生成整套 PPT。

今天就从安装开始，带大家走一遍。

## 01 把 ChatGPT 装进 PowerPoint

先打开 PowerPoint，新建一份空白演示文稿。

在上方找到 **开始 → 加载项**，英文界面对应 **Home → Add-ins**，然后搜索 **ChatGPT**。

![PowerPoint 开始选项卡中的加载项入口，红箭头标注操作步骤](/images/chatgpt-ppt-powerpoint/image-1.png)

这里注意认准发布者 **OpenAI, LLC**。微软商店里的应用名称就叫 ChatGPT，页面会同时介绍它在 Excel 和 PowerPoint 里的功能。

![PowerPoint 加载项商店搜索结果，显示 ChatGPT 及添加按钮](/images/chatgpt-ppt-powerpoint/image-2.png)

拿不准的，可以从官方页面进入安装：

`https://chatgpt.com/apps/powerpoint/`

添加完成后，点击 PowerPoint 上方功能区里的 ChatGPT，打开侧边栏，

![PowerPoint 右侧的 ChatGPT 侧边栏加载中](/images/chatgpt-ppt-powerpoint/image-3.png)

再登录自己的 ChatGPT 账号。



![ChatGPT 登录弹窗，可选择 Google 或 Apple 账号登录](/images/chatgpt-ppt-powerpoint/image-4.png)

登陆后，点击我明白了

![登录后侧边栏的提示内容与我明白了按钮](/images/chatgpt-ppt-powerpoint/image-5.png)

后面的指令就在这个侧边栏里输入。

最终界面

![ChatGPT 侧边栏的最终界面](/images/chatgpt-ppt-powerpoint/image-6.png)

## 02 把手头的资料做成 PPT

先拿一个常见需求举例。

我有一份文献，现在要把它变成一套结课作业 PPT。

我的建议是先确定每页讲什么，再开始排版。

在 ChatGPT 侧边栏上传资料，把下面这段发进去。

> 请根据我上传的论文文献，规划一份8页左右的中文结课作业汇报PPT，汇报时间约5分钟。
> 
> 重点讲清楚研究背景、研究问题、研究方法、关键结果、主要结论，以及论文的创新点和局限性。不要平均分配论文篇幅，也不要直接把大段原文搬到PPT里。
> 
> 先给出每页标题、核心内容和建议使用的论文图表，暂时不要生成幻灯片。
> 
> 所有内容必须以论文为依据，没有的数据不要编造，缺失但影响汇报的信息单独列出。
> 
> 

这里最重要的，是先把**汇报几页、讲多久、重点讲什么**说清楚。

![侧边栏中上传文献并输入汇报要求的提示词](/images/chatgpt-ppt-powerpoint/image-7.png)

ChatGPT 的演示文稿使用指南里也提到，受众、资料和需要保留的内容，最好在一开始就交代清楚。这样 ChatGPT 后面生成的 PPT，才不会变成单纯把论文压缩一遍。

![ChatGPT 返回的 PPT 逐页大纲结构](/images/chatgpt-ppt-powerpoint/image-8.png)

看完每页安排，觉得方向没问题，再让它开始制作。

> 按照刚才确认的内容，在当前演示文稿中生成这8页PPT。
> 
> 使用16∶9比例，整体简洁，白底为主，只用一种强调色。每页突出一个核心信息，标题写出本页结论，避免整页堆满文字。
> 
> 文字尽量使用可编辑文本框，简单关系图使用可编辑形状，不要把整页做成一张图片。内容放不下时优先精简，不要靠缩小字号硬塞。
> 
> 完成后检查文字溢出、元素重叠和前后表述是否一致，并告诉我哪些地方还需要人工确认。
> 
> 

![侧边栏中继续生成 PPT 内容的对话](/images/chatgpt-ppt-powerpoint/image-9.png)

这里的颜色、页数和汇报对象，都可以换成自己的要求。我的建议是，第一次先做个大概，确认gpt理解你的意思，再做十几页的完整汇报。

有固定模板的，也可以直接从模板副本开始。它支持参考已有演示文稿的风格，但复杂模板不一定能完全合适。

点击始终允许

![询问是否允许访问当前演示文稿的弹窗](/images/chatgpt-ppt-powerpoint/image-10.png)

也可以随时查看任务进度

![侧边栏中的生成进度与幻灯片预览缩略图](/images/chatgpt-ppt-powerpoint/image-11.png)

所以，可以在提示词里补一句：

> 沿用当前演示文稿的配色和版式，保留现有Logo，不要自行更换整套风格。遇到无法适配的页面，先告诉我具体问题。
> 
> 

## 03 做好之后，直接指定哪一页要改

第一版出来以后，我建议先通读一遍，再指出具体问题。

![PowerPoint 中生成的完整幻灯片与数据图表页](/images/chatgpt-ppt-powerpoint/image-12.png)

比如，第4页文字太多，就明确让它只处理第4页；**把修改范围说清楚**

官方的使用建议里，也特别强调要说明修改位置、需要保留的内容，哪些地方不要动。

例如，可以这样发：

> 只修改第4页，其余页面保持不变。
> 
> 这一页目前文字太多，请保留原有结论和关键数据，将内容整理成三个有层次的信息区块。删掉重复解释，增大正文的可读性，继续沿用现有配色。
> 
> 不要新增未经资料支持的内容，完成后说明你删改了什么。
> 
> 

![ChatGPT 侧边栏返回的含柱状图与数据对比的内容](/images/chatgpt-ppt-powerpoint/image-13.png)

如果手头已经有一套旧 PPT，需要根据新资料更新，也可以这样做。

> 对照我新上传的资料，检查当前PPT中哪些内容需要更新。
> 
> 先列出对应页码、旧内容和建议修改的内容，不要立即改动文件。与新资料无关的页面保持原样，存在冲突的数据单独标出来，等我确认。
> 
> 

![ChatGPT 侧边栏生成的『时间确定性』主题内容](/images/chatgpt-ppt-powerpoint/image-14.png)

这种局部修改很有用。

## 04 只有一张截图，也能尝试重建成可编辑 PPT

再说一个我觉得很好玩的地方。

有时候手上只有一张 PPT 截图，原文件没了，但又要修改里面的文字。

那么这个gpt还可以**将截图转换成可编辑PPT**。

上传截图后，可以这样说：

> 根据我上传的截图，在当前演示文稿中重建一页可编辑幻灯片。
> 
> 尽量保留截图中的布局、文字层级和配色。文字使用独立文本框，简单图形和连接线尽量用PowerPoint形状重建，不要直接把截图铺满整页当作结果。
> 
> 看不清的文字标记为“待确认”，不要猜测。无法还原为可编辑对象的部分，请明确告诉我。
> 
> 

![按页列出修改建议的 ChatGPT 回复内容](/images/chatgpt-ppt-powerpoint/image-15.png)

生成以后，点一下标题，试着改几个字；再点一下中间的图形，看看能不能单独移动。这样才能确认它有没有满足这次的需求。

![由截图重建出的可编辑 PPT 页面，含手机与电脑图示](/images/chatgpt-ppt-powerpoint/image-16.png)

截图里的照片可以继续作为图片保留，但需要经常修改的文字，最好明确要求单独重建。第一次可以从文字清晰、结构简单的一页开始，不用上来就挑战一张挤满小字的复杂图表。

## 05 几个常见问题

### 一定要开通 ChatGPT Plus 才能用吗？

不一定。截至2026年9月17日，官方说明中，Free 和 Go 有有限用量；Plus、Pro 等套餐按相应的代理任务用量上限使用。

### 它会记得我在网页 ChatGPT 里说过的要求吗？

不要默认它记得。

官方商店说明，目前加载项里的对话与 ChatGPT 网页聊天记录独立，不同步聊天历史，也不提供记忆功能。因此，重要的风格要求和背景资料，要在这里重新交代。

### 生成的 PPT，所有元素都能编辑吗？

它会尽量保留可编辑结构，但复杂图表、动画等能力仍有限制，不可能每个元素都还原
