---
title: "图片转可编辑PPT | 用 Codex 还原文字、图形和排版"
description: "用一张中文测试页演示如何安装 image2ppt、配置 OCR，再让 Codex 把截图重建为 PowerPoint 文件，并检查文字和图形能否单独编辑。"
date: "2026-10-24"
slug: "codex-image-to-editable-ppt"
published: true
---

大家好，我是佬刘。

有时候看到一张很好看的图片，想拿过来修改一下文字。

但是手里只有一张截图，没办法去做修改。

直接把图片插入 PowerPoint，也能用，但是图片里面的文字改不了，图形也无法单独移动。想改个标题、调整一下布局，还得自己重新做一遍。

今天分享一个开源 Skill，叫做 **Image2PPT**。

它可以配合 Codex，把 PPT 截图、图片型 PDF 等文件，重新构建成可编辑的 `.pptx` 文件。

项目地址：[https://github.com/Paul-Jeo/Image2PPT](https://github.com/Paul-Jeo/Image2PPT)

下面开始操作。

## 一、准备好需要转换的图片

先在电脑上新建一个文件夹，比如 `image-to-ppt`。

![为图片转换新建项目目录](/images/codex-image-to-editable-ppt/step-01.png)

然后在里面再建一个 `input` 文件夹，把需要转换的图片放进去。

![将待转换的图片放入 input 目录](/images/codex-image-to-editable-ppt/step-02.png)

可以使用 PNG、JPG 图片，项目还支持扫描版 PDF 和图片型 PPT/PPTX。

第一次使用，我建议先拿一张文字清楚的截图尝试。

例如：

```text
image-to-ppt/
└── input/
    └── xx.png
```

![用于检验文字编辑效果的中文测试页](/images/codex-image-to-editable-ppt/step-03.png)

准备完成之后，打开 Codex，选择刚才创建的 `image-to-ppt` 文件夹作为工作目录。

## 二、给 Codex 安装 Image2PPT Skill

打开 Codex 的对话框，将下面这段提示词复制进去。

**安装提示词：**

```text
请帮我安装 Image2PPT Skill。

GitHub：
https://github.com/Paul-Jeo/Image2PPT

要求：

1. 阅读项目 README.md、SKILL.md 和安装说明。
2. 将完整项目安装到当前的项目文件夹里。

如果该skill有需要什么库，你自行补全。
```

![向 Codex 提交安装 image2ppt 的要求](/images/codex-image-to-editable-ppt/step-04.png)

Codex 会根据仓库里的说明执行安装和检查。

![Codex 完成 Skill 安装与检查](/images/codex-image-to-editable-ppt/step-05.png)

## 三、配置图片文字识别

Image2PPT 使用 PaddleOCR 来辅助识别图片中的文字。

如果不配置在线 OCR Token，项目会退回到内置的文字区域检测方式，这种方式只能判断文字大概位于哪里，无法识别具体字符。

所以，想还原 PPT 里的中文标题和正文，建议先完成 OCR 配置。

打开百度 AI Studio 的 Access Token 页面：

[https://aistudio.baidu.com/account/accessToken](https://aistudio.baidu.com/account/accessToken)

登录之后，按照页面提示创建并复制 Token。

![百度 AI Studio 的访问令牌管理入口](/images/codex-image-to-editable-ppt/step-06.png)

接下来打开项目中的配置文件：

```text
skills/image2ppt/config.yaml
```

![找到 image2ppt 的 config.yaml](/images/codex-image-to-editable-ppt/step-07.png)

找到或者添加下面这项：

```yaml
PADDLE_OCR_TOKEN: "你的Token"
```

![在配置文件中填写 OCR 令牌的位置](/images/codex-image-to-editable-ppt/step-08.png)

将自己的 Token 填进去并保存。

配置完成后，回到 Codex，输入：

```text
我已经在本地 config.yaml 中配置了 PaddleOCR Token。

请重新运行 Image2PPT 的 doctor --json，
检查 Python 依赖、OCR 配置和渲染环境。

确认环境通过之后，告诉我是否可以开始转换。
不要在回复中输出 Token 内容。
```

![请 Codex 验证 OCR 配置](/images/codex-image-to-editable-ppt/step-09.png)

项目的检查结果会包含配置来源、OCR 状态和运行环境信息。

如果出现依赖缺失，让 Codex 按照错误报告安装对应依赖，再重新检查即可。

## 四、开始把图片转换为可编辑 PPT

前面准备完成之后，就可以调用 Skill 了。

以 `input/xx.png` 为例，复制下面的提示词到 Codex。

**图片转可编辑 PPT 提示词：**

```text
请使用 $image2ppt Skill，将当前项目中的

input/page-01.png

转换为可编辑的 PowerPoint 文件。

具体要求：

1. 保留原图的文字内容，不擅自修改或补充文字。
2. 尽量按照原图还原页面比例、布局、配色和字体层级。
3. 文字使用 PowerPoint 原生文本框，允许直接修改。
4. 矩形、圆形、色块等基础图形使用 PowerPoint 原生形状。
5. 箭头和连接线尽量使用可单独选择和编辑的 PPT 对象。
6. 照片和无法准确重建的复杂图标，可以保留为独立图片对象。
7. 不要把整张原图直接铺成 PPT 背景来冒充可编辑效果。
8. 保留原始文件，不要覆盖。

严格按照 Skill 自带的工作流进行处理，
完成页面渲染对比、质量检查和最终 PPTX 生成。

如果检查失败，先修复对应问题，再交付。

最后告诉我：
- PPTX 文件的实际位置
- 质量检查是否通过
- 哪些元素已经转换为可编辑对象
- 哪些元素仍然是图片
```

![让 Codex 将截图转为分离的文字和图形](/images/codex-image-to-editable-ppt/step-10.png)

这段提示词里，我觉得最重要的要求就是：

**不要把整张图片当成 PPT 背景。**

因为我们要解决的是图片里面的内容无法修改的问题。

如果输出的 PPT 里只有一张铺满页面的图片，那么即便文件后缀是 `.pptx`，也没有达到我们的目的。

![检查幻灯片中的对象能否单独选择](/images/codex-image-to-editable-ppt/step-11.png)

Image2PPT 会按照自己的工作流处理输入、重建页面并进行检查。

等任务完成之后，找到 Codex 给出的 `.pptx` 文件，使用 PowerPoint 打开。

![在 PowerPoint 中打开生成的幻灯片](/images/codex-image-to-editable-ppt/step-12.png)

## 五、检查生成的 PPT 能不能编辑

文件生成之后，我建议至少检查以下几项。

首先，点击页面里的标题。

如果文字已经被还原成文本框，就可以像修改普通 PPT 一样，选中并输入新内容。

![选中文字框并修改文字的效果](/images/codex-image-to-editable-ppt/step-13.png)

**能不能修改文字、能不能移动图形、排版有没有明显错位，直接在 PowerPoint 里就能判断。**

如果其中某个地方没有还原好，可以回到 Codex 继续修改。

例如：

```text
请检查刚才生成的 PPT。

我需要修改以下内容：

1. 将第一页的标题重新识别并转换为可编辑文本框。
2. 检查所有箭头的方向和连接关系。
3. 修正文字超出色块边界的问题。
4. 保留其他已经正确的元素。

请对照原始图片检查修改结果，
重新生成 PPTX，并运行质量检查。

不要通过覆盖整页截图的方式修复问题。
```

## 六、多张 PPT 截图能一起转换吗？

可以。

Image2PPT 支持输入多张幻灯片图片，并按照指定顺序进行处理。

例如，手里有 5 张 PPT 截图，可以放在同一个文件夹里：

```text
input/
├── 01.png
├── 02.png
├── 03.png
├── 04.png
└── 05.png
```

然后告诉 Codex：

```text
请使用 $image2ppt Skill，
把 input 文件夹中的 5 张图片按照文件名顺序
还原成一份可编辑的 PPTX 文件。

每张图片对应一页幻灯片。

要求：
- 文字尽量转换为可编辑文本框
- 基础图形、箭头和连接线尽量原生化
- 保留每页原始布局与内容
- 不使用整页截图作为最终页面
- 逐页完成渲染对比和质量检查

输出一份完整 PPTX，
并列出每页仍然无法原生编辑的内容。
```

生成完成后，检查每张图片是否对应正确的幻灯片，以及页面顺序、文字和图形是否完整。

图片型 PDF、扫描版幻灯片也可以按照项目支持的输入流程处理。

## 七、几个需要注意的问题

1. **图片转 PPT 后，所有内容都能编辑吗？**

不能保证。

照片、复杂插画、特殊图标以及一些难以准确重建的视觉内容，可能保留为图片。

1. **为什么转换出来的文字有错误？**

先检查原始图片是否清晰，再检查 OCR Token 是否配置成功。

1. **为什么排版和原图有差异？**

可以先让 Codex 检查字体和对象位置，再针对有问题的页面修改。

## 最后

如果你手里有一张需要修改的 PPT 截图，可以先从一页开始，完成安装、转换、检查和修改这套流程。

等一页能够满足要求，再把同样的方法用到多张图片上。
