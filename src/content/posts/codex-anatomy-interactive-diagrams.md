---
title: "Codex Skill画图教程：一句话生成可交互的动态原理图（附安装方法）"
description: "给 Codex 安装 Anatomy Skill，用咖啡机演示怎样把水流、部件和操作按钮画成能在浏览器里交互的动态原理图。"
date: "2026-10-13"
slug: "codex-anatomy-interactive-diagrams"
published: true
---

大家好，我是佬刘。

之前给大家分享过 Codex 生成图片的教程，今天再来分享一个新的玩法。

用 Codex 生成可交互的动态原理图！

比如，我们想了解一台咖啡机是怎么工作的。

静态的原理图只能通过文字和箭头来展示内部结构等等，都要自己对着图片理解。

但如果把这张图做成动态的呢？

点击开始按钮，就能看到水从水箱出发，经过加热器，再到咖啡出口。鼠标放到不同部件上，还能查看对应的名称和作用。

而且生成的图形具有立体效果，可以在浏览器中直接操作。

最近 GitHub 上开源了一个叫 **Anatomy** 的 Skill，配合 Codex 就可以制作这样的动态原理图。

先给大家看看这个项目的效果。

![Anatomy 的发动机原理图和独立部件示意](/images/codex-anatomy-interactive-diagrams/step-01.webp)
![发动机部件及其交互控制](/images/codex-anatomy-interactive-diagrams/step-02.webp)

这张火箭发动机原理图，可以通过交互展示不同组件，还有喷焰动画。

![Anatomy 作品库里的机械和电子设备模型](/images/codex-anatomy-interactive-diagrams/step-03.webp)

除了发动机，开发者还制作了计算机、机械仪表、旋转拨盘等案例，部分作品还能进行旋转、拆解等操作。

效果还挺有意思的。

下面就来看看，怎么在 Codex 中使用它。

## 一、安装 Anatomy Skill

Anatomy 是一个开源的 Skill，支持 Codex、Claude Code 等 AI 编程工具。

项目地址：[https://github.com/wheresryan22/anatomy](https://github.com/wheresryan22/anatomy)

今天我们就用 Codex 演示。

安装之前，需要确保电脑已经有 Node.js 环境。

不知道有没有安装的朋友，可以打开终端，输入：

```text
node -v
```

![终端中运行 node -v 查看版本](/images/codex-anatomy-interactive-diagrams/step-04.webp)

如果能够正常显示版本号，说明已经安装。使用下面的安装命令，建议 Node.js 版本在 22.20 及以上。

没有安装的朋友，可以前往 [https://nodejs.org/](https://nodejs.org/) 下载。

接下来，复制下面这条命令到终端中执行。

```text
npx skills add wheresryan22/anatomy -g -a codex
```

这条命令会把 Anatomy 安装到 Codex 的 Skill 目录中。

如果不想自己麻烦，也可以直接和codex说

```text
帮我安装部署这个GitHub项目到我的项目文件夹中。

https://github.com/wheresryan22/anatomy
```

![在 Codex 会话中提交 Anatomy 安装请求](/images/codex-anatomy-interactive-diagrams/step-05.webp)

安装完成后，

![Codex 显示技能已安装](/images/codex-anatomy-interactive-diagrams/step-06.webp)

在输入框中输入 `/skills`，查看是否有 Anatomy。

![在技能列表中找到 Anatomy](/images/codex-anatomy-interactive-diagrams/step-07.webp)

看到 Anatomy 之后，就可以开始使用了。

## 二、让 Codex 生成动态原理图

安装完 Skill，接下来就是生成原理图。

我们拿咖啡机来举例。

我想要的效果是，页面中有一台咖啡机，能够看到内部的结构。

打开 Codex，新建一个空文件夹，然后直接输入下面这段提示词。

**提示词：**

```text
@anatomy 

帮我制作一个可交互的咖啡机工作原理图。

你来帮我补要求。

先完成 SVG 动态原理图，无须使用真 3D 模式。
```

![生成咖啡机交互演示的提示词](/images/codex-anatomy-interactive-diagrams/step-08.webp)

这里我建议如果不知道内部原理是什么，就让codex帮你补就行。

把提示词发送给 Codex 之后，它就会按照 Anatomy 的工作流程开始制作。

这个 Skill 会先设计需要的部件和结构，再绘制图形、添加动画，并通过相关脚本检查生成结果。

复杂的原理图需要一定的生成时间，等待 Codex 完成就行。

![Codex 制作 SVG 动态原理图的过程](/images/codex-anatomy-interactive-diagrams/step-09.webp)

## 三、查看生成的原理图

等 Codex 生成完成之后，在对应的文件夹中找到输出的 HTML 文件。

直接使用浏览器打开，就能查看页面。

![浏览器中的咖啡机原理图和参数控件](/images/codex-anatomy-interactive-diagrams/step-10.webp)

接下来，我们可以点击开始按钮，看看水流动画有没有按照预期运行。

![启动交互后观察咖啡机的水流路径](/images/codex-anatomy-interactive-diagrams/step-11.webp)

如果觉得哪个地方不够好，还可以让 Codex 继续修改。

比如，我希望咖啡机的整体结构更清晰，动画能够慢一点，方便用户理解整个工作流程。

可以继续输入：

```text
继续优化刚才生成的咖啡机原理图。

1. 增大咖啡机的展示区域，让内部组件更清晰。
2. 放慢水流动画，让用户能够看到水经过每个部件的过程。
3. 当前运行到哪个部件，就突出显示对应部件。
4. 添加暂停和重新播放按钮。
5. 保留已有的页面样式和交互功能。

修改后重新检查页面，并更新 HTML 文件。
```

![要求 Codex 调整页面和动画节奏](/images/codex-anatomy-interactive-diagrams/step-12.webp)

这样就能在原有作品上继续修改。

如果你对某个部件的结构有要求，也可以告诉 Codex，让它按照你的要求调整。

## 四、生成的原理图还能怎么用？

Anatomy 有一个我比较喜欢的地方，就是能够输出 HTML 文件。

![输出文件夹中的 HTML 原理图文件](/images/codex-anatomy-interactive-diagrams/step-13.webp)

这意味着做好的原理图可以直接在浏览器中打开，里面的动画、按钮和交互效果也可以保留下来。

如果想分享给其他人，可以将 HTML 页面部署到网站，生成一个访问链接。

**如果本身就在开发网站，还可以让 Codex 将图形制作成 SVG 或 React 组件，再集成到已有的项目中。**

另外，Anatomy 还支持结合 WebGL 制作火焰、水流、光照等效果，甚至可以制作带真实旋转效果的 3D 组件。

![Codex 生成的交互图预览](/images/codex-anatomy-interactive-diagrams/step-14.webp)

不过对于普通原理图，我建议先从 SVG 动画开始。

完成一个能打开、能交互、能讲清楚原理的作品，再考虑添加复杂的视觉效果。

## 五、最后

之前分享 Codex 生图的时候，我们更多是在让 AI 生成一张静态的图片。

这次使用 Anatomy，可以让 Codex 把静态的原理图变成能够操作的动态页面。

而且整个过程，我们只需要描述想展示的内容、交互方式和输出要求，具体的绘制、代码和动画都可以交给 Codex 完成。

最后附上项目地址，方便大家获取 Skill。

**Anatomy GitHub：**[https://github.com/wheresryan22/anatomy](https://github.com/wheresryan22/anatomy)

**Anatomy 在线作品展示：**[https://skills.wheresryan.sh/anatomy](https://skills.wheresryan.sh/anatomy)
