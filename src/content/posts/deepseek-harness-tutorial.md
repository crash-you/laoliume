---
title: "Harness 入门教程｜以 DeepSeek Harness 为例，从安装到跑通第一个任务"
description: "DeepSeek Harness 入门实操：下载安装、配置模型、添加工作区、认识权限与插件，再让 Agent 读取项目并跑通第一个任务。"
date: "2026-09-30"
slug: "deepseek-harness-tutorial"
published: true
---

> Harness 是什么？DeepSeek Harness 怎么安装、怎么配置模型、怎么添加工作区、怎么让 Agent 真正开始干活，这篇从基础用法开始。
> 
> 

大家好，我是佬刘。

DeepSeek Harness 官网预览版发布之后，我第一时间下载体验了一遍。

![Harness 入门教程｜以 DeepSeek Harness 为例，从安装到跑通第一个任务，原文配图 1](/images/deepseek-harness-tutorial/image-1.png)

如果你用过 Codex、Claude Code、OpenCode，这套东西不会陌生。

它能读取本地文件、修改项目、执行命令，也有插件、自动化任务、模型切换这些能力。

这篇从 Harness 这个概念开始，以 DeepSeek Harness 为例，把安装、配置、工作区和第一次任务跑通。

本文比较长，建议打开电脑一步一步跟着操作！

## 一、Harness 是什么？

先记住一个公式：

**Agent = Model \+ Harness**

Model 负责推理；Harness 负责给模型提供执行任务需要的环境。

文件系统、终端、工具调用、权限、上下文、Skills、插件、任务调度，这些东西都属于 Harness 能力的一部分。

所以一个 Agent 好不好用，不只看模型，还要看 Harness。

好比手机，芯片都是晓龙，但是操作系统不同，调教不同，导致最终的性能也不同。这里芯片就是模型，外部调教的部分就是harness。

ChatGPT、Claude、DeepSeek 这类产品，我们过去更关注模型本身。

Codex、Claude Code、DeepSeek Harness 这类产品，关注点开始往模型怎么干活移动。

DeepSeek Harness 就是 DeepSeek 给 Agent 搭的一套工作环境。

它有一个很核心的设计：

**Everything is a Plugin。**

一切皆插件。

![一、Harness 是什么？，原文配图 2](/images/deepseek-harness-tutorial/image-2.png)

# 二、下载安装 DeepSeek Harness

打开网址：

[**https://www\.deepseek\.com/harness/**](https://www.deepseek.com/harness/?utm_source=chatgpt.com)

页面里有 Windows 下载入口。

![二、下载安装 DeepSeek Harness，原文配图 3](/images/deepseek-harness-tutorial/image-3.png)

点击**下载 Windows 版**

我这里下载到的文件叫：

```Plain Text
dsh-latest-windows-x64.exe
```

![二、下载安装 DeepSeek Harness，原文配图 4](/images/deepseek-harness-tutorial/image-4.png)

打开安装包，选择安装位置，完成安装。

![二、下载安装 DeepSeek Harness，原文配图 5](/images/deepseek-harness-tutorial/image-5.png)

![二、下载安装 DeepSeek Harness，原文配图 6](/images/deepseek-harness-tutorial/image-6.png)

桌面版把运行环境一起打包进去了，正常使用不需要自己配置 Node\.js、pnpm 这些环境。

![二、下载安装 DeepSeek Harness，原文配图 7](/images/deepseek-harness-tutorial/image-7.png)

![二、下载安装 DeepSeek Harness，原文配图 8](/images/deepseek-harness-tutorial/image-8.png)

安装完成后打开 DeepSeek Harness。

![二、下载安装 DeepSeek Harness，原文配图 9](/images/deepseek-harness-tutorial/image-9.png)

到这里，安装结束。

随后就是登录自己的deepseek账号，这里需要注意，deepseek harness是消耗API Key的，需要有余额才行

![二、下载安装 DeepSeek Harness，原文配图 10](/images/deepseek-harness-tutorial/image-10.png)

选择对应设置之后，进入到主界面，deepseek 还贴心的赠送了6元的赠金

![二、下载安装 DeepSeek Harness，原文配图 11](/images/deepseek-harness-tutorial/image-11.png)

到这里，全部安装过程已经结束。

# 三、先认识一下界面

安装完成后，打开 DeepSeek Harness，主界面就是这样。

![三、先认识一下界面，原文配图 12](/images/deepseek-harness-tutorial/image-12.png)

整个界面不复杂，第一次用先看几个地方。

### 1、新会话

左上角是 **「新会话」**。

每次准备处理一个新的任务，都可以从这里单独开一条对话。

左侧下方会保留当前工作区里的历史会话，后面继续处理同一个项目时，可以直接接着聊。

![1、新会话，原文配图 13](/images/deepseek-harness-tutorial/image-13.png)

### 2、工作区

左侧的 **工作区** 是 Harness 里很重要的一部分。

默认会有一个默认工作区，右侧的文件夹加号可以继续添加新的本地工作区，以文件夹为单位。

![2、工作区，原文配图 14](/images/deepseek-harness-tutorial/image-14.png)

工作区可以理解成这次交给 Agent 使用的项目目录。

后面让它读取文件、修改代码、整理资料，都会围绕当前选择的工作区进行。

我自己的习惯还是一个项目（文件夹）对应一个工作区，后面找项目和管理对话会清楚很多。

### 3、运行模式

输入框上方可以看到：

**标准模式**

这里对应当前 Agent 的运行方式。

后面安装更多插件、工作流之后，Harness 的执行方式还可以继续扩展。

![3、运行模式，原文配图 15](/images/deepseek-harness-tutorial/image-15.png)

入门先保持标准模式即可。

### 4、权限

输入框左下角可以看到当前权限：

**工作区内修改**

这个设置决定 Agent 能对本地文件做到什么程度。

工作区内修改代表它可以读取并修改当前工作区里的内容。

![4、权限，原文配图 16](/images/deepseek-harness-tutorial/image-16.png)

如果选择，完全权限，会问你是否启用完全权限

![4、权限，原文配图 17](/images/deepseek-harness-tutorial/image-17.png)

第一次使用保持这个权限就够用了。

### 5、模型

输入框右下角就是当前使用的模型。

我这里默认显示的是 **DeepSeek\-V4\.1\-Flash High**

点击模型名称，可以查看和切换当前 Harness 使用的模型。

![5、模型，原文配图 18](/images/deepseek-harness-tutorial/image-18.png)

后面接入其他 Provider，也是在这里切换使用。

### 6、输入框

中间就是平时和 Harness 交互的位置。

从它给出的提示也能看出几个常用操作：

```Plain Text
直接输入自然语言任务

/ 调用指令

@ 引用文件或对话
```

![6、输入框，原文配图 19](/images/deepseek-harness-tutorial/image-19.png)

![6、输入框，原文配图 20](/images/deepseek-harness-tutorial/image-20.png)

左下角还有一个 **\+**，后面添加内容和调用相关能力时会用到。

所以整个主界面看下来，核心逻辑其实很清楚：

**选择工作区 → 确定模式和权限 → 选择模型 → 输入任务。**

接下来我们就开始配置自己的工作区，然后让 Harness 真正跑第一个任务。

# 四、配置模型

进入设置，找到 **Models**

这里用来配置 Harness 使用的模型。

![四、配置模型，原文配图 21](/images/deepseek-harness-tutorial/image-21.png)

它是默认使用你当前登录账号的deepseek的Key，可以自行创建API Key添加使用

![四、配置模型，原文配图 22](/images/deepseek-harness-tutorial/image-22.png)

Harness 和模型服务是两层东西。

Harness 负责执行环境，API 负责模型推理，所以使用模型时会产生对应的 API 消耗。

配置完成之后，回到会话页面，就可以选择对应模型。

# 五、DeepSeek Harness 可以换模型

这个地方值得单独说一下。

名字虽然叫 DeepSeek Harness，但模型没有写死。

在 Models 页面可以添加不同 Provider。

里面可以配置 OpenAI、Anthropic、Moonshot、Z\.AI 这些模型服务，也支持填写自己的 Base URL、API Key 和 Model。

![五、DeepSeek Harness 可以换模型，原文配图 23](/images/deepseek-harness-tutorial/image-23.png)

所以 Harness 可以理解成一个固定的工作环境。

模型可以根据任务换。

这也是 Harness 这个概念比单纯用了哪个模型更值得关注的地方。

# 六、添加工作区

接下来是 Harness 里最重要的基础概念之一：**Workspace。**

工作区就是交给 Agent 操作的本地目录。

比如电脑里有一个项目：

```Plain Text
F:\null2\desktop\oldLiu\MY_OS
```

把这个文件夹添加进工作区。

![六、添加工作区，原文配图 24](/images/deepseek-harness-tutorial/image-24.png)

添加之后，Harness 可以读取这个目录里的文件，这个项目里是我的日记。

![六、添加工作区，原文配图 25](/images/deepseek-harness-tutorial/image-25.png)

所以我更习惯一个项目对应一个工作区。

后面开新会话，Agent 一进入这个工作区，就能从项目文件开始理解任务。

# 七、跑通第一个任务

环境配置完成，开始测试。

我建议第一次别上来做复杂项目。

找一个现成工作区，让 Harness 完成一次完整的：

**读取 → 理解 → 执行 → 返回结果**

就够了。

比如打开一个代码项目，发送：

```Plain Text
读取当前工作区。

检查项目目录、README 和主要配置文件。

告诉我这个项目的用途、技术栈、目录结构和启动方式。

这次只读取文件，不修改内容。
```

![七、跑通第一个任务，原文配图 26](/images/deepseek-harness-tutorial/image-26.png)

Harness 会读取工作区里的文件，然后返回项目分析结果。

确认读取正常之后，再给它一个小任务。

```Plain Text
检查当前项目。

给我创建一个 HTML 页面来描述这个项目。

先给出方案，再进行创建。
```

![七、跑通第一个任务，原文配图 27](/images/deepseek-harness-tutorial/image-27.png)

这一轮跑通之后，就完成了一次标准 Harness 工作流：

```Plain Text
选择工作区
↓
发送任务
↓
读取上下文
↓
调用工具
↓
修改文件
↓
执行检查
↓
返回结果
```

最终执行后给我的HTML页面：

![七、跑通第一个任务，原文配图 28](/images/deepseek-harness-tutorial/image-28.png)

这才是 Agent 和普通聊天模型之间最明显的区别。

# 八、权限要看懂

Harness 能碰本地文件，权限这一块得弄明白。

一般可以理解成三种范围：

**只读：**Agent 可以读取文件，不能改。

**工作区可写：**Agent 可以操作当前 Workspace。

**完整访问：**Agent 可以获得更大的文件系统操作范围。

![八、权限要看懂，原文配图 29](/images/deepseek-harness-tutorial/image-29.png)

入门阶段用工作区权限就够。

项目在哪，就让 Agent 在哪个目录里工作。

# 九、它能处理的东西不止代码

DeepSeek Harness 的工作区本身就是本地文件环境。

所以代码只是其中一种任务。

Word、Excel、PDF、Markdown、网页项目、Python 脚本，都可以放进工作区。

![九、它能处理的东西不止代码，原文配图 30](/images/deepseek-harness-tutorial/image-30.png)

核心还是一样：**让模型进入真实工作环境。**

---

# 十、插件

左侧有一个很明显的入口：

**插件**

![十、插件，原文配图 31](/images/deepseek-harness-tutorial/image-31.png)

这里对应 DeepSeek Harness 的核心思路：**Everything is a Plugin。**

很多能力都可以通过插件扩展。

需要什么，就往里面增加什么。

更有意思的一点是，Harness 本身可以参与插件开发。

![十、插件，原文配图 32](/images/deepseek-harness-tutorial/image-32.png)

你描述一个需求，它可以读取插件开发相关 Skill，生成插件代码，再安装到当前 Harness 里。

这块我后面准备单独实测。

# 十一、自动化任务

左侧还有：

**自动化任务**

![十一、自动化任务，原文配图 33](/images/deepseek-harness-tutorial/image-33.png)

这个功能负责周期任务。

比如某个固定工作需要每周执行一次，可以创建对应自动化。

![十一、自动化任务，原文配图 34](/images/deepseek-harness-tutorial/image-34.png)

任务到时间之后，由 Harness 调用对应工作流执行。

当自动化和工作区、插件组合到一起之后，Harness 的用法就开始从一次对话变成持续执行。

---

# 十二、第一次使用，我建议这样配置

如果你刚装好 DeepSeek Harness，我建议按这个顺序来：

**第一步，配置一个模型。**

先让会话可以正常跑。

![十二、第一次使用，我建议这样配置，原文配图 35](/images/deepseek-harness-tutorial/image-35.png)

**第二步，添加一个真实工作区。**

别建一堆测试目录，拿一个自己平时会用的项目。

![十二、第一次使用，我建议这样配置，原文配图 36](/images/deepseek-harness-tutorial/image-36.png)

**第三步，让它读取项目。**

确认文件读取和工具调用正常。

![十二、第一次使用，我建议这样配置，原文配图 37](/images/deepseek-harness-tutorial/image-37.png)

**第四步，给一个小任务。**

完整跑一次修改、执行、检查。

![十二、第一次使用，我建议这样配置，原文配图 38](/images/deepseek-harness-tutorial/image-38.png)

**第五步，再看插件和自动化。**

这样玩一遍，Harness 的基础逻辑就掌握了。

![十二、第一次使用，我建议这样配置，原文配图 39](/images/deepseek-harness-tutorial/image-39.png)

# FAQ

### DeepSeek Harness 免费吗？

Harness 本身开源，调用 DeepSeek、Claude、OpenAI 等模型时，对应 API 会产生费用。

### DeepSeek Harness 只能用 DeepSeek 吗？

可以添加其他模型 Provider，也支持自定义 API。

### Windows 需要装 Node\.js 吗？

使用桌面版不需要。

通过 `npx @deepseek-ai/dsh web` 运行 Web UI 时需要 Node\.js。

# 最后

DeepSeek Harness 让我更关注的一点，是 **Harness 这个概念本身开始走到台前了。**

模型能力拉开一部分差距之后，下一层差距会落到 Harness 上。

DeepSeek Harness 这篇先把入门部分写到这里。

下载安装，配置模型，添加工作区，跑通第一个任务。

后面我再继续折腾插件、Skills、自动化和多模型接入。



