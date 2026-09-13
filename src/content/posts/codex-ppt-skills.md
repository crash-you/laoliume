---
title: "Codex 生成PPT：4个Skill，做出4种风格的可编辑PPT"
description: "开学组会又要做PPT了。从 GitHub 找了 4 个风格差别很大的 PPT Skill：工作汇报、科研组会、杂志演讲风、产品发布会，提示词全部写好，直接扔给 Codex 就能用。"
seoTitle: "Codex 生成 PPT：4 个 Skill 做出 4 种风格的可编辑 PPT"
seoDescription: "4 个 Codex PPT Skill 实测：PPT Master 工作汇报、slide-maker 科研组会、presentation-skill 演讲风、PPT Design Skill 发布会风，附完整安装与生成提示词。"
image: "/og/codex-ppt-skills.png"
imageAlt: "佬刘AI 文章分享图：Codex 生成PPT，4个Skill做出4种风格的可编辑PPT"
date: 2026-09-08
slug: "codex-ppt-skills"
published: true
wechat_url: "https://mp.weixin.qq.com/s/8WRO9r7M6HU4SSNBX_3mAQ"
---

大家好，我是佬刘。

开学了，又要开组会，做PPT，做汇报了......

那我作为AI博主，能自己做嘛！当然不能，所以我去GitHub找啊找，找到了4个比较不错的，风格差别很大PPT skill 

喜欢哪种，就装哪种。

下面的提示词我也全部写好了，可以直接扔进Codex。

## 第一个：PPT Master

第一个叫：**PPT Master**

GitHub：`hugohe3/ppt-master`

如果让我给它找一个使用场景，我会先拿它做：**工作汇报、项目复盘、商务PPT。**

因为它不仅有一条完整的PPT生成流程，会先整理内容，再规划页面，然后生成PPT。还有一个我很在意的能力：

**可以生成PPT里的****原生元素****。**

这件事情非常非常重要！！！

因为有些所谓的AI生成PPT，本质上是：AI先生成6张图片，然后把这6张图片分别塞进PPT，看起来确实是PPT。

但是你点开一页：？？？

整页只有一张图，文字改不了，图表也改不了。

那我还要PPT干嘛。

PPT Master这条路线更适合后续还要继续改内容的人。

### 怎么安装？

直接把下面这段扔给Codex：

```Plain Text
/skill-installer

帮我安装下面这个PPT Skill：

https://github.com/hugohe3/ppt-master/tree/main/skills/ppt-master

安装到当前Codex 项目可以识别的Skills目录。

安装完成以后，检查这个Skill需要的依赖。
缺少依赖的话帮我处理。

最后告诉我安装是否完成，以及我应该怎么调用它。
```

![Codex 中执行 skill-installer 安装 ppt-master Skill](/images/codex-ppt-skills/image-1.png)

### 实测使用

装完以后，就可以开始做PPT了。

![ppt-master Skill 安装完成后的 Codex 界面](/images/codex-ppt-skills/image-2.png)

比如我准备拿它做一份：**让codex自己回顾我自己一周的经历复盘。**

我会这样说：

```Plain Text
使用 ppt-master 帮我制作一份PPT。

主题：
**让codex自己回顾我自己一周的经历复盘**

你需要自己回顾过往一周里，我使用你做了什么，做成了什么，失败了什么

这份PPT主要用于内部复盘，所以不要做成宣传海报。

我希望整体风格偏咨询公司汇报：

白色背景；深色文字；少量绿色作为强调色；数据页尽量使用图表；
每一页只讲一个核心结论。

大概控制在8页左右。

先帮我规划：每一页讲什么，每一页适合用什么版式。

先不要生成PPT。我确认结构以后，你再继续制作。
```

![在 Codex 中向 ppt-master 描述 PPT 制作需求](/images/codex-ppt-skills/image-3.png)

这里我很建议大家学我这个习惯，也是我写这么多篇公众号以来，一直的流程：

**不要第一句话就让Codex开干。**

先让它把页面结构给你，你先看这个故事讲得顺不顺。

![ppt-master 返回的 PPT 页面结构规划](/images/codex-ppt-skills/image-4.png)

结构没问题，再决定是否生成说：

```Plain Text
可以。

按照刚才确定的结构生成PPT。

所有标题和正文需要保持可编辑。

数据页面优先使用PowerPoint原生图表，
不要把整页内容生成成图片。

生成以后，把PPT保存到output文件夹，
同时生成每一页预览图给我查看。
```

![确认结构后让 Codex 生成 PPT 的对话](/images/codex-ppt-skills/image-5.png)

这样出来的东西，才是一个可以继续修改的PPT。

![ppt-master 生成的咨询汇报风 PPT 页面预览](/images/codex-ppt-skills/image-6.png)

还启动了一个页面，可以在内部修改对应元素标签。

![PPT 元素编辑页面，可修改页面内元素标签](/images/codex-ppt-skills/image-7.png)

## 第二个：slide-maker

第二个，我觉得科研党可以重点看一下。

名字就叫：**slide-maker**

GitHub：`addsumtech/slides_maker`

我看到它的时候，第一个想到的就是**组会！**论文答辩等等

这种PPT和普通工作汇报还有点区别。

科研里面经常会有：technology 路线、method 方法、result 结果等等

所以我准备直接拿一份科研材料喂给它。

### 怎么安装？

还是一样：

```Plain Text
$skill-installer

帮我安装：

https://github.com/addsumtech/slides_maker/tree/main/skills/slide-maker

安装到当前Codex 项目可以识别的Skills目录。
安装完成以后检查依赖。

我使用Windows，
如果某些命令只适用于Linux或者macOS，
请自动换成Windows可以执行的方式。

完成以后告诉我如何调用这个Skill。
```

![在 Codex 中安装 slide-maker Skill](/images/codex-ppt-skills/image-8.png)

### 实测使用

然后把你的论文、实验记录或者Markdown文档丢进项目文件夹。

提示词可以这样写：

```Plain Text
使用 slide-maker。

读取当前项目中的科研材料，帮我制作一份研究生组会PPT。

技术路线尽量使用流程图表达。

实验结果优先用图表，不要把一堆数字直接写在页面上。

控制在10页以内。

先给我PPT大纲，
我确认以后再生成。
```

等待计划：

![slide-maker 返回的科研组会 PPT 大纲](/images/codex-ppt-skills/image-9.png)

然后确认：

```Plain Text
按照这个结构生成。

生成PPTX以后同时渲染预览图，
我还要继续修改其中几页。
```

![确认结构并让 slide-maker 生成 PPTX 与预览图](/images/codex-ppt-skills/image-10.png)

![slide-maker 生成的科研组会 PPT 预览，含数据图表](/images/codex-ppt-skills/image-11.png)

是不是效果还不错，还有数据图！

## 第三个：presentation-skill

第三个开始，画风要变了。

叫：**presentation-skill**

GitHub：`siril9/presentation-skill`

这个我为什么会选？

因为我一直觉得AI做PPT有一个毛病：**特别喜欢把PPT做成信息面板。**

每一页四个框，下一页又四个框，下一页继续四个框，我都不知道为什么AI这么爱卡片哈哈哈。

但是有一类PPT我很喜欢。

就是那种一整页只有一句大标题，下一页可能是一张很大的图，再下一页是左右排版，看起来像杂志、发布会或者演讲稿。这个Skill里面就有Editorial这一类视觉方向。

### 怎么安装？

```Plain Text
/skill installer 帮我安装： https://github.com/siril9/presentation-skill
安装到当前Codex 项目可以识别的Skills目录。
安装完成以后检查依赖。
我使用Windows，
如果某些命令只适用于Linux或者macOS，
请自动换成Windows可以执行的方式。
完成以后告诉我如何调用这个Skill。
```

![在 Codex 中安装 presentation-skill](/images/codex-ppt-skills/image-12.png)

### 实测使用

这次我准备拿：**一篇公众号文章**直接让它帮我改成一份分享型PPT。

我之前写了一篇个人博客网站搭建，我会这样说：

```Plain Text
使用 presentation-skill。

读取当前文件夹中的 @个人博客网站.zip 。

我要把这篇公众号文章，改成一份线下分享使用的PPT。

不要把文章内容原封不动复制到PPT里。

重新理解文章，把它变成适合演讲的页面。

整体采用Editorial / Magazine类型的设计。

我希望看到：

大标题；大留白；左右错落排版；少量重点文字；
页面之间有明显节奏变化。

不要连续出现相同的卡片布局。不要蓝紫渐变科技风。不要为了填满页面塞很多文字。

控制在8页左右。

先规划整份PPT的叙事顺序和每一页内容，
我确认以后再制作。
```

![presentation-skill 返回的分享型 PPT 叙事与页面规划](/images/codex-ppt-skills/image-13.png)

这个东西我感觉对于做自媒体的人很有意思。文章本身就可以成为PPT的原材料。

你都不用重新写一次，Codex去帮你拆。

比如原来公众号有2000字。

最后PPT可能只留下一句判断！

这才是PPT。

![presentation-skill 生成的杂志风 PPT 页面](/images/codex-ppt-skills/image-14.png)

然后如果其中一页你觉得很丑，也不用整份推翻。

继续说：

```Plain Text
第4页我不喜欢。

现在这一页信息太平均了。

重新设计这一页。

保留原来的核心内容，但是减少文字，让这一页只突出一个重点。

其他页面不要修改。

重新生成以后给我看第4页预览。
```

这也是我现在越来越喜欢Codex做PPT的原因。

你不需要重新抽卡。

**哪页不好看，改哪页。**

## 第四个：PPT Design Skill

最后一个：**PPT Design Skill**

GitHub：`sunchaokun/PPT-Design-Skill`

这一套我准备用来做：**产品介绍。**

比如我的网站，要给别人介绍它是干嘛的。

这种PPT不能只是一堆文字。

所以这一组我想试一个偏发布会的风格。

### 怎么安装？

```Plain Text
帮我安装这个PPT Skill：

https://github.com/sunchaokun/PPT-Design-Skill

先阅读仓库中的安装说明，安装到当前项目级skill里。

安装完成以后，
检查PPT生成和渲染需要的依赖。

最后告诉我如何调用ppt-design-skill。
```

![在 Codex 中安装 PPT Design Skill](/images/codex-ppt-skills/image-15.png)

### 实测使用

我准备用我自己的个人博客网站来做测试，把我的产品链接放进去。

```Plain Text
使用 ppt-design-skill。

读取物品的个人博客网站：laoliu.me。

帮我制作一份产品介绍PPT。

偏产品发布会风格。

整体使用深色背景，
白色大标题，
一个橙色作为强调色。

页面减少文字。

产品功能尽量通过：流程图、界面、数据示意、产品截图来表达。

不要蓝紫渐变。
不要科技光效。
不要连续使用卡片布局。

PPT控制在8页以内。

先规划页面，
不要生成。
```

然后它给你规划完。

![PPT Design Skill 返回的产品介绍 PPT 页面规划](/images/codex-ppt-skills/image-16.png)

确认：

```Plain Text
可以。

按照这个方向制作。

产品截图可以直接使用我提供的图片。

流程图、标题、正文使用PowerPoint原生元素，
方便我后续修改。

生成以后输出PPTX和预览图。
```

![PPT Design Skill 生成的深色发布会风产品介绍 PPT](/images/codex-ppt-skills/image-17.png)

如果你已经有自己公司的PPT模板，这个Skill还有一条玩法。

可以把模板直接扔给它：

```Plain Text
使用 ppt-design-skill。

参考当前文件夹里的 template.pptx，按照这个模板原来的字体、颜色和视觉语言，
重新制作我的产品介绍PPT。

不要复制模板里的原始内容。

先分析模板的视觉规律，
告诉我你准备怎么复用，
我确认之后再开始制作。
```

这个我感觉对于上班族会更实用，因为很多公司根本不允许你自由发挥。

一般都会有模板，这种情况下，让AI重新创造视觉反而没意义，

让它沿着公司模板做，才对行！

---

## 所以Codex做PPT，Skill到底有没有必要？

折腾完这几个之后，我现在对这件事的理解清楚了很多。

我当然可以什么Skill都不装，直接对Codex说：

> 我要汇报什么什么内容，帮我做一个PPT。
> 
> 

它也能做，但这样很多东西都需要你在提示词里重新描述。描述不精准，就是一言难尽。。

**而Skill做的一件事，就是把这些经验提前塞进Codex。**

所以同一句：

> 帮我做一个PPT。
> 
> 

背后走的流程可能完全不同。

我们又可以更深层次理解skill：**原来一个很麻烦的任务，现在可以换一种方式做。**

PPT只是其中一个。

总结一下：

工作汇报，可以先试PPT Master。

科研组会，可以看看slide-maker。

公众号文章改分享PPT，可以试presentation-skill。

产品介绍，可以玩PPT Design Skill。

如果你还不了解codex skill，可以看这篇文章：



**然后你会发现，Codex生成PPT这件事，开始有点意思了！ **
