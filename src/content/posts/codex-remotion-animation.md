---
title: "Codex做视频教程：从0开始，手把手教你用Remotion生成动画！（附通用提示词）"
description: "从安装 Remotion 到在 Codex 中制作、修改和导出动画，附项目命令、可复用的提示词，以及教程实际导出的 15 秒 MP4。"
date: "2026-10-12"
slug: "codex-remotion-animation"
published: true
---

大家好，我是佬刘。

最近有小伙伴找到我问我，怎么codex剪辑视频，当时我没有了解过，后边看某因好多地方都在宣传opus 自动生成视频，顿时来了兴趣！

![Codex 生成动画的需求示例](/images/codex-remotion-animation/step-01.png)

以前提到 AI 生成视频，很多人想到的都是可灵、即梦这类工具。输入一段文字，或者上传一张图片，让 AI 生成对应的视频。

最近用 Codex 这样的 AI 编程工具，配合 Remotion，直接用代码来制作动画视频的方式火了！

![使用代码生成的视频效果示例](/images/codex-remotion-animation/step-02.png)

比如最近很火的 vibe 知识大赏

对于没有视频素材、不会用 AE 的普通用户来说，这条路线值得试试。

整个过程可以通过自然语言完成。我们负责告诉 AI 想要什么画面、什么动画效果，Codex 负责生成代码，Remotion 负责预览和渲染。

当然，想要把视频做得好看，提示词和修改过程也很重要。

## 一、先看看能做出什么效果

Remotion 官方有一个 [https://www.remotion.dev/prompts](https://www.remotion.dev/prompts)，里面收录了开发者用 AI 编程工具制作的动画视频，还公开了部分原始提示词。

![Remotion 官方提示词作品页](/images/codex-remotion-animation/step-03.png)

其中有几类作品值得参考。

![可供参考的 Remotion 动画示例](/images/codex-remotion-animation/step-04.png)

我研究了一下，有一个值得注意的地方。

好的作品会对画面进行设计，明确每个镜头展示什么内容、持续多少秒、采用什么颜色以及元素怎么移动。

因此，我们使用 Codex 制作视频时，也可以把这些设计要求交给 AI，让它按照分镜制作。

## 二、Codex 做视频，背后用的是什么？

这次需要用到两个工具。

一个是 Codex，负责理解我们的要求、编写代码、修改动画。

![Codex 与 Remotion 的分工示例](/images/codex-remotion-animation/step-05.png)

另一个是 Remotion，它可以通过 React、SVG 等技术制作动画，再渲染成 MP4 视频。

官网地址：[https://www.remotion.dev/](https://www.remotion.dev/)

![Remotion 官网](/images/codex-remotion-animation/step-06.png)

在 Remotion 官方文档中，提供了一套专门给 AI 编程工具使用的 Agent Skills，支持 Codex、Claude Code、Cursor 等。

Skill 地址：[https://github.com/remotion-dev/skills](https://github.com/remotion-dev/skills) 

有了这套 Skill，Codex 可以按照 Remotion 的开发规范创建动画、控制时间轴、预览视频以及导出文件。

这里还要提一下制作思路。

我在 Reddit 上看到一位开发者用 Codex + Remotion 制作软件宣传片。

他在评论区解释，自己提供了产品的前端代码、Dashboard 代码以及一条参考视频，配音则提前通过文字转语音工具生成。

这也说明一个问题，给 AI 的参考越明确，生成结果就越容易贴近我们的预期。

如果手里没有任何素材，可以先从文字动效、抽象图形和卡片动画入手。所有画面都由代码绘制

## 三、安装 Remotion Skill

下面开始实操。

先确认电脑安装了 Node.js。如果之前使用过 Codex CLI 或者开发过前端项目，可以打开终端检查一下。

```text
node -v
npm -v
```

能看到版本号，就可以继续。

![终端检查 Node 和 npm 版本](/images/codex-remotion-animation/step-07.png)

没有安装的，可以从 [https://nodejs.org/](https://nodejs.org/) 下载。

接下来创建 Remotion 项目。打开 PowerShell 或终端，输入下面的命令。

```text
npx create-video@latest --yes --blank F:\null2\desktop\oldLiu\tools\video
```

这里的 `F:\null2\desktop\oldLiu\tools\video` 是项目文件夹名称，可以改成自己的文件夹名称。

输入y

![在终端确认初始化项目](/images/codex-remotion-animation/step-08.png)

然后它就会自动安装这个项目

![Remotion 项目的安装进度](/images/codex-remotion-animation/step-09.png)

成功界面

![项目创建完成的终端输出](/images/codex-remotion-animation/step-10.png)

创建完成后进入项目目录。

```text
cd F:\null2\desktop\oldLiu\tools\video
```

![进入新建的视频项目目录](/images/codex-remotion-animation/step-11.png)

然后安装 Remotion 官方 Skills。

```text
npx remotion skills add
```

最后启动 Remotion Studio。

依旧是输入Y（yes

![确认安装 Remotion Skill](/images/codex-remotion-animation/step-12.png)

安装完成

![Skill 安装完成的输出](/images/codex-remotion-animation/step-13.png)

最后启动 Remotion Studio。

```text
npm run dev
```

![在终端启动本地预览](/images/codex-remotion-animation/step-14.png)

启动成功后，终端会输出本地预览地址。在浏览器中打开，就能看到 Remotion Studio。

![浏览器里的 Remotion Studio](/images/codex-remotion-animation/step-15.png)

现在打开 Codex，选择刚才创建的 `F:\null2\desktop\oldLiu\tools\video` 项目文件夹。

![在 Codex 中选择视频项目文件夹](/images/codex-remotion-animation/step-16.png)

使用 Codex CLI 的，也可以在这个项目目录下启动 Codex。

![从项目目录启动 Codex 的示例](/images/codex-remotion-animation/step-17.png)

如果你使用的 Codex 客户端支持 Remotion 官方插件，还可以直接安装，就不用上面那些配置了。

![客户端中的 Remotion 插件入口](/images/codex-remotion-animation/step-18.png)

下面的流程使用本地项目和 Skill，无需依赖插件入口。

## 四、让 Codex 从零制作第一条动画

为了减少对外部素材的依赖，这次选择制作一条 15 秒的科技感文字动画。

主题就叫做【让想法动起来】。

整条视频通过大字体、几何图形、网格、光效和镜头运动来表达。先不加真人、配音和外部图片。

将下面的提示词复制到 Codex 中。

```text
请使用当前项目中安装的 Remotion Skills，制作一条 15 秒的高质量 Motion Graphics 动画视频。

视频主题：让想法动起来

一、视频规格
- 1920×1080 分辨率
- 30 FPS
- 总时长 15 秒
- 中文内容
- 最终输出 MP4
- 保留完整 Remotion 源码

二、视觉设计

采用高级科技产品发布会风格。

背景使用接近黑色的深灰色。
主要文字使用白色，以荧光绿作为唯一强调色。
使用大字号、克制的光效、几何元素、网格和空间层次。

避免常见的渐变背景、堆叠卡片和杂乱粒子。
每一秒都要有明确的视觉重点。

三、分镜设计

0—3 秒
画面中央出现「一个想法」。
文字从大比例缩放到正常大小，带有弹性缓动。
背景网格从中心展开。

3—6 秒
文字拆分、移动，组合成「可以动起来」。
加入空间透视和镜头推进效果。
要求过渡连续，避免生硬切换。

6—11 秒
依次出现「设计」「代码」「动画」三个关键词。
每个关键词配合不同的程序化几何动画。
使用快速转场、缩放、旋转和遮罩效果，形成作品集式的视觉节奏。

11—15 秒
前面的图形向中心汇聚。
出现最终标题「让创意成为作品」。
最后一秒保持画面稳定，方便观看。

四、开发要求

1. 不使用外部图片、视频和付费素材。
2. 图形由 React、SVG、CSS 布局等方式创建。
3. 根据 Remotion 官方规范实现逐帧动画。
4. 优先使用 spring、interpolate 等动画方式。
5. 中文文字必须完整显示，字体不能缺失。
6. 动画运动要连贯，避免元素突然消失。
7. 不要使用 CSS transition 代替 Remotion 的逐帧动画。
8. 使用可复现的动画逻辑，保证预览和最终渲染一致。

五、工作流程

先给出分镜方案、视觉规范和预期效果，等待我确认。

确认后创建 Remotion Composition，ID 设置为 MotionShowreel。

完成后检查关键帧，确保无文字溢出、重叠、闪烁和布局错误。

先在 Remotion Studio 预览。
收到我的确认后再导出最终 MP4。
```

刚好，马上重置，就用Astra max来跑

![为动画任务选择模型](/images/codex-remotion-animation/step-19.png)

这个提示词有两个关键地方。

首先，我们明确了每个场景的时间、文字、动画和转场方式，让 Codex 有具体的制作依据。

其次，我们要求它先给出分镜，再进入开发阶段。

首次使用，建议先用 Remotion 官方 Skill 跑通流程。等熟悉制作过程后，再考虑面向复杂宣传片的第三方 Skill。

![给 Codex 提交第一版动画需求](/images/codex-remotion-animation/step-20.png)

大致瞄一下，然后确认

![检查并确认生成计划](/images/codex-remotion-animation/step-21.png)

然后等待他制作完成！

![Codex 执行动画制作任务](/images/codex-remotion-animation/step-22.png)

## 五、视频生成之后，怎么修改？

Codex 创建动画组件后，我们可以回到 Remotion Studio 查看视频。

![在 Remotion Studio 预览生成的动画](/images/codex-remotion-animation/step-23.png)

播放动画，重点检查中文文字是否清晰、元素是否超出画面，以及不同场景之间的转场有没有问题。

（本人第一次用这个，真的震惊了！！！！不亚于我第一次看到cursor工作的震撼）

如果效果不够好，可以继续给 Codex 提修改要求。

比如第一次生成的视频节奏太慢、文字停留太久，可以这样修改：

```text
请优化当前 MotionShowreel 动画。

保留原来的文案和整体视觉风格。

目前重点修改三个问题：

1. 前 3 秒节奏太慢。缩短文字入场时间，增强第一秒的视觉冲击力。

2. 6—11 秒三个关键词之间缺少连续性。请使用形状变换、遮罩或空间运动连接场景，让转场更自然。

3. 最后的标题缺少视觉重点。增加一次克制的镜头推进，并让最终画面稳定停留至少 1 秒。

修改完成后，请提取各场景的关键帧进行检查。

不要重新生成整个项目。
不要删除已有的有效动画。
保留原来的 Composition ID。
```

![向 Codex 提出修改要求](/images/codex-remotion-animation/step-24.png)

这部分也是代码生成视频的一个优势。

![修改后重新预览动画的效果](/images/codex-remotion-animation/step-25.png)

因为动画对应的是代码，我们可以要求 Codex 修改某个文字、颜色、镜头运动或者持续时间。修改完成后，再渲染对应的视频。

当然，Remotion 也有适用范围。

对于文字动画、动态图表、界面动效等内容，它比较合适。如果需要复杂的真人表演、写实场景或者电影级三维角色，仅靠基础的 React/SVG 动画就很难达到同样的效果。

## 六、导出 MP4 视频

等到动画效果确认后，就可以导出视频了。

我们可以让 Codex 使用 Remotion 的渲染命令完成这件事，也可以打开项目终端执行

（你们可能会疑问，为什么codex可以直接完成，还要用终端呢，当然是省额度了！！）

先查看项目里已经注册的 Composition。

```text
npx remotion compositions
```

![列出项目里的 Composition](/images/codex-remotion-animation/step-26.png)

如果已经按照前面的提示词创建了 `MotionShowreel`，则执行：

```text
npx remotion render MotionShowreel out/video.mp4 --codec=h264
```

![终端执行 MP4 渲染命令](/images/codex-remotion-animation/step-27.png)

命令执行完成后，视频会保存在当前项目的 `out` 目录中。

![out 目录中生成的 video.mp4](/images/codex-remotion-animation/step-28.png)

原视频：

<video controls playsinline preload="metadata" aria-label="用 Remotion 制作的 15 秒动画演示" width="1920" height="1080" style="display:block;width:100%;height:auto">
  <source src="/videos/codex-remotion-animation/demo.mp4" type="video/mp4">
  <a href="/videos/codex-remotion-animation/demo.mp4">下载 MP4 演示视频</a>
</video>

如果还想调整分辨率、视频时长或者制作竖屏版本，可以修改 Remotion 项目参数，再进行渲染。

此外，Remotion 项目中的文字、颜色、动画时序和图形代码都可以保留，后续制作相似风格的作品时也能复用。

## 七、想做出更高级的动画，还可以试试这个 Skill

如果你准备长期使用 Codex 制作产品宣传片，可以看看 GitHub 上的

[https://github.com/Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft)。

安装方式也很简单，直接和codex说：

```text
帮我安装这个GitHub项目到本地，并告诉我怎么用

https://github.com/Vincentwei1021/video-shotcraft
```

![安装 video-shotcraft 的提示](/images/codex-remotion-animation/step-29.png)

这个项目专门围绕 Remotion 动效设计，提供 152 种镜头设计方案和 209 个动画预览，还包括 2.5D 运镜、音乐节奏同步转场以及音效设计。

![动效 Skill 的镜头和风格资源](/images/codex-remotion-animation/step-30.png)

它把一些成熟的动效形式整理成可以复用的镜头方案。用户可以挑选喜欢的视觉效果，再让 Codex 根据对应方案制作视频。

这种方式对于没有动效设计经验的人也有帮助。比起用文字描述一个自己都说不清楚的动画，有现成的运动效果作参考，会容易沟通一些。

不过，第三方 Skill 安装前需要检查代码和依赖。第一次制作视频，用 Remotion 官方提供的工具就够了。

## 八、通用提示词，让 Codex 自动补全视频创意

在实际使用的时候，我们可能只有一个简单的 idea，根本不知道应该采用什么视觉风格，也不知道镜头、转场、动画应该怎么设计。

这种情况下，可以把创意设计的工作也交给 Codex。

下面这段是通用提示词，只需要喂给AI，让它理解后，在输入我们的主题即可，其余内容让 Codex 根据主题自行补全。

### 通用提示词

```text
你是一名专业的动态视觉设计师、视频导演和 Remotion 开发工程师。
请使用当前项目中的 Remotion Skills，将我提供的主题制作成一条具有专业视觉效果的动画视频。
一、自动补全创意
我只提供视频主题，其余未明确的内容由你负责设计，包括：
根据主题判断视频类型、目标观众和适合的视觉风格。
自动撰写视频文案，设计开场、内容展示和结尾。
制定完整分镜，安排每个镜头的时长、构图、动画和转场。
设计配色、字体、图形元素、镜头运动与整体节奏。
根据主题选择适合的动效，例如文字变形、粒子运动、图形变换、空间透视、数据动画等。
不要将所有动画套用同一种模板。根据内容选择视觉表现形式。
二、视频制作标准
未指定时长时，默认制作 15 秒视频。
未指定比例时，默认使用 1920×1080、30 FPS；如果明确要求短视频平台竖屏内容，则使用 1080×1920。
优先使用 React、SVG 和程序化动画生成视觉素材。
没有提供外部素材时，使用原创文字、几何图形和程序绘制的元素完成作品。
画面排版需要有层次，文字清晰，转场流畅，避免大量无意义的特效。
不得编造真实数据、产品功能或用户评价。
三、自动执行和优化
请先检查当前 Remotion 项目结构和已安装的 Skills，遵循对应开发规范。
先输出简要的视频创意方案和分镜安排，随后直接开始制作，无需等待我逐项确认。
完成初版后，请检查关键帧，重点检查文字溢出、元素遮挡、转场不连贯、字体缺失和空白画面等问题，并修复发现的错误。
完成检查后，渲染 MP4 视频，保留完整可编辑的 Remotion 项目与源代码。
最终告诉我视频文件位置、项目位置、实际完成的检查，以及仍存在的问题。如果渲染失败，请说明原因，不要将未完成的任务描述为成功。
四、我的视频主题
【在这里输入你想制作的视频主题】

你如果理解，请回答：我已经理解，请给我主题。
```

![向 Codex 提交可复用的动画提示词](/images/codex-remotion-animation/step-31.png)

如果生成的效果不满意，也不需要重新开始。

直接告诉 Codex 哪个镜头不好看、哪里节奏太慢，或者把喜欢的参考视频发给它，让它分析其中的视觉效果，再修改当前项目。

我个人更建议大家先用通用提示词生成第一版，看到实际效果之后再调整。

毕竟很多时候，我们自己都不知道想要什么样的动画，看到成片之后，反而更容易提出具体的修改意见。

## 常见问题

### Codex 可以直接生成 MP4 视频吗？

可以配合 Remotion 等工具实现。Codex 负责创建和修改视频工程，Remotion 负责逐帧渲染，最终输出 MP4。需要在电脑上准备对应的运行环境。

### 没有任何图片和视频素材，可以制作吗？

可以制作文字动画、动态图形、数据可视化和抽象视觉效果。需要照片、真实产品界面或人物素材的内容，仍然需要相应素材来源。

### Remotion 是免费的吗？

个人用户以及不超过三人的团队符合免费许可条件，可以用于符合条款的商业用途。四人及以上组织通常需要公司许可。

## 最后

Codex 配合 Remotion，通过自然语言制作动画视频。

最后的效果居然还不错，对我的震撼太大了，我这个AI博主都不得不感慨，AI 的发展速度真的太快了。

以前制作这种动画，还得学习专业的剪辑和动效软件。现在只需要把想法告诉 Codex，就能一步步做出成品。

我已经能感受到，这背后意味着什么。

**AI 正在让越来越多的人拥有创造作品的能力。技术门槛在降低，想象力和行动力的价值却在上升。**

未来，真正值得思考的问题就会变成是：

当工具已经摆在面前，我们究竟能用它创造出什么？
