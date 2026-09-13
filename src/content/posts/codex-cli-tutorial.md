---
title: "Codex CLI是什么？怎么安装、登录、常用命令教程"
description: "从一台没装过 Codex 的环境开始，把安装、登录、进入项目、完成第一个任务完整跑一遍，附 /status、/model、/resume 等常用命令。没碰过命令行也能跟着做。"
seoTitle: "Codex CLI 是什么？安装、登录、常用命令完整教程"
seoDescription: "Codex CLI 从零教程：Windows/macOS/Linux 安装命令、ChatGPT 账号登录、进入项目目录启动、跑通第一个任务，以及 /status /model /resume 常用命令。"
image: "/og/codex-cli-tutorial.png"
imageAlt: "佬刘AI 文章分享图：Codex CLI 安装登录常用命令教程"
date: 2026-09-11
slug: "codex-cli-tutorial"
published: true
wechat_url: "https://mp.weixin.qq.com/s/xKgb7uqoFxCfSt6D8E9UIg"
---

大家好，我是佬刘。

在前边，我已经写了不少 Codex 的实操教程，那么为什么在UI如此盛行的今天，我依然推荐大家使用cli命令行这种古朴的方式呢？

因为计算机本身天然适应命令行，而 codex 在 cli 中执行的效率特别高！

所以这篇不聊复杂配置。

我会从一台没有安装 Codex CLI 的环境开始，把安装、登录、进入项目，再到完成第一个任务跑一遍。

哪怕你之前没碰过命令行，也可以跟着做，全文比较长，建议先收藏，跟着做！

## 一、Codex CLI是什么？

先解释一下 CLI。

CLI 全称 Command Line Interface，也就是命令行界面。

我们平时使用 Codex App，看到的是窗口、按钮、项目列表这些图形界面。

![Codex App 图形界面主页面](/images/codex-cli-tutorial/image-1.png)

Codex CLI 换了一个入口。

你打开终端，进入自己的项目文件夹，输入：

![在项目文件夹打开终端并准备启动 Codex](/images/codex-cli-tutorial/image-2.png)

Codex 就会在这个目录里启动。

比如我的项目在F盘里的某一个文件夹：

![在命令行终端输入 codex 命令](/images/codex-cli-tutorial/image-3.png)

进入这个目录以后启动 Codex，它就可以读取项目里的代码、配置文件和目录结构。

后面我们会实操一遍。

## 二、Codex CLI怎么安装？

为了把整个安装流程重新跑一遍，我这里拿了一台 Linux 云服务器做演示。

原因很简单，我自己的 Windows 电脑已经装过 Codex CLI 了！

云服务器里还没有安装，可以从0开始。

![Linux 云服务器执行 codex --version 提示命令未找到](/images/codex-cli-tutorial/image-4.png)

先输入：

```Plain Text
codex --version
```

如果机器里没有 Codex，会看到找不到命令之类的提示。

![终端提示 codex 命令不存在，说明尚未安装](/images/codex-cli-tutorial/image-5.png)

接下来开始安装。

### Linux和macOS安装

OpenAI 当前给 Linux 和 macOS 提供的官方安装命令是：

```Plain Text
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

复制进去，回车即可。

![执行官方安装脚本下载安装 Codex CLI](/images/codex-cli-tutorial/image-6.png)

这样就已经安装好了！

最后那一行是在问你，要不要现在启动Codex，Y(yes)，N（No）我们选择  N

输入：

```Plain Text
codex --version
```

如果已经显示版本号，说明 Codex CLI 安装完成。

![codex --version 显示版本号，说明安装完成](/images/codex-cli-tutorial/image-7.png)

### Windows怎么安装？

如果你用的是 Windows，不用照抄我上面的 Linux 命令，只需要在powershell中输入即可

![Codex 官方安装说明网页，标注 Windows 安装方式](/images/codex-cli-tutorial/image-8.png)

然后输入：

```Plain Text
powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"
```

这是 OpenAI 当前提供的 Windows 安装方式。

安装结束以后，同样输入：

```Plain Text
codex --version
```

看到版本号即可。

![Windows 终端中执行 codex --version 显示版本号](/images/codex-cli-tutorial/image-9.png)

Windows 和 Linux 的区别主要出现在安装这一段。

安装完成以后，后面的 Codex CLI 使用逻辑差别不大。

## 三、Codex CLI怎么登录？

接下来是很多人会卡住的地方。

如果是在自己的 Windows 或 Mac 上使用 Codex，可以输入：

```Plain Text
codex login
```

![Windows 终端中执行安装脚本安装 Codex CLI](/images/codex-cli-tutorial/image-10.png)

然后会跳转到浏览器里，登录ChatGPT

![ChatGPT 登录页面，可选择 Google、Apple 或邮箱登录](/images/codex-cli-tutorial/image-11.png)

选择你的账户

![选择用于登录 Codex 的 ChatGPT 账户](/images/codex-cli-tutorial/image-12.png)

个人账户，然后继续

![选择工作空间页面，选择个人账户并继续](/images/codex-cli-tutorial/image-13.png)

成功！

![浏览器显示已成功登录 Codex，可以关闭页面](/images/codex-cli-tutorial/image-14.png)

成功之后，终端会显示“successfully logged in”

![终端提示成功登录 Codex](/images/codex-cli-tutorial/image-15.png)

【如果你本身有 ChatGPT 套餐，我建议先用 ChatGPT 账号登录。使用 ChatGPT 登录时，Codex 会按照当前 ChatGPT 账户对应的权益使用；如果使用 API Key，则走 OpenAI API 的计费体系。】

## 四、Linux和Windows里的Codex一样吗？

看到这里，可能有人会问。

我演示的是 Linux，那 Windows 上的 Codex CLI 怎么办？

Codex 本身的很多命令是一样的。

比如 启动codex，查看版本等等这些在 Windows 和 Linux 都可以用。

区别主要来自操作系统本身。

Linux 的目录可能长这样：

```Plain Text
/home/root/project
```

Windows可能是：

```Plain Text
D:\project
```

Linux 和 Windows 的系统命令也会有区别，但是我们这篇主要讲 Codex CLI，所以不用先学一遍 Linux。

## 五、开始使用Codex CLI

接下来我们建一个演示项目。

我在我的F盘里，新建了一个test文件夹，然后找到后，右键点击复制文件地址

![在 F 盘 test 文件夹上右键复制文件地址](/images/codex-cli-tutorial/image-16.png)

打开powershell，进入这个目录：

```Plain Text
cd "F:\null2\desktop\oldLiu\My-Thing\a-gzh\test"
```

![命令行中进入 test 项目目录](/images/codex-cli-tutorial/image-17.png)

进入到这个文件夹里，然后输入：

```Plain Text
codex
```

Codex CLI 就会在这个项目目录里启动。如果是第一次的话，会提示是否信任，选择yes，然后回车

![Codex CLI 在项目目录启动并提示是否信任该目录](/images/codex-cli-tutorial/image-18.png)

启动完成

![Codex CLI 启动完成并读取当前目录内容](/images/codex-cli-tutorial/image-19.png)

接下来，你的所有指令，都会在你选择的这个文件夹下执行！

到这里，Codex CLI 就算跑起来了，但是很多人第一次打开以后会卡在这里。

看着输入框，不知道该说什么，可以先给一个简单任务：

```Plain Text
先读取当前目录，告诉我这个目录里现在有什么文件，不要创建或修改任何内容。
```

因为这是个新目录，它应该会告诉你目前没有什么项目文件。

![Codex 回复当前目录没有项目文件](/images/codex-cli-tutorial/image-20.png)

怎么样，是不是有点帅了。

接下来让它真正干一次活。

可以输入：

```Plain Text
在当前目录创建一个 index.html，页面中间放一个“Hello Codex CLI”标题，再加一段说明文字。
不要安装任何依赖。
完成以后检查文件是否创建成功，并告诉我你做了什么。
```

![Codex 执行任务创建 index.html 的过程输出](/images/codex-cli-tutorial/image-21.png)

Codex 会创建文件，在test文件夹里，也有了一个 index.html 文件

![test 文件夹中已生成 index.html 文件](/images/codex-cli-tutorial/image-22.png)

双击打开就是

![浏览器打开 Codex 生成的 Hello Codex CLI 页面](/images/codex-cli-tutorial/image-23.png)

到这里，你已经把 Codex CLI 最基础的一套流程跑通了。

安装； 登录 ； 进入项目目录 ； 启动 Codex ； 让它读取项目 ； 让它修改文件。

后面无论是让它写代码、改项目、跑脚本，底层逻辑都从这里开始。

## 六、Codex CLI常用命令

Codex CLI 里还有一套 `/` 开头的命令。

进入 Codex 后输入：

```Plain Text
/
```

![Codex CLI 输入斜杠查看可用命令列表](/images/codex-cli-tutorial/image-24.png)

就能看到当前可以使用的命令。

不用背一整张表，刚开始使用，我建议先认识这几个。

### /status

输入：`/status`

![Codex CLI 执行 /status 查看会话与额度信息](/images/codex-cli-tutorial/image-25.png)

可以查看当前会话、上下文使用情况和额度信息。

### /model

输入： `/model`

![在 Codex CLI 中输入 /model 命令](/images/codex-cli-tutorial/image-26.png)

可以选择当前会话使用的模型。

![Codex CLI 的模型选择列表，含 GPT-6 Astra 等](/images/codex-cli-tutorial/image-27.png)

### /resume

输入： `/resume`

![Codex CLI 执行 /resume 查看历史对话列表](/images/codex-cli-tutorial/image-28.png)

可以看到历史对话记录

### /new

输入 `/new`

![Codex CLI 执行 /new 新开一个对话](/images/codex-cli-tutorial/image-29.png)

可以新开一个对话

另外还有 `/init`、`/mcp`、`/plan` 等命令。

需要的时候输入 `/` 看列表就行。

## 七、Codex CLI和Codex App有什么区别？

现在很多人已经在用 Codex App。

所以问题来了，既然 App 有图形界面，为什么还要用 CLI？

我自己的使用感受是，Cli端的执行效率更高！而APP端往往会因为cmd，powershell，wsl，互相冲突而大家，浪费额度！

但新手不用纠结哪个更高级。

用 App 顺手，就继续用 App，想尝试终端工作流（装一波）再装 CLI。

## 八、常见问题

### 1.Codex CLI登录，需要输入ChatGPT账号密码吗？

本机登录时，会通过浏览器完成 ChatGPT 登录，然后在自己的浏览器登录 ChatGPT并输入一次性验证码。

### 2.ChatGPT Plus和Pro可以使用Codex CLI吗？

可以使用 ChatGPT 账号登录 Codex CLI。官方目前支持通过 ChatGPT 套餐使用 Codex；具体额度取决于账户和套餐。

### 3.Linux和Windows的Codex CLI命令一样吗？

Codex 自己的命令基本一致，安装命令、文件路径以及操作系统 Shell 命令会有区别。

## 最后

Codex CLI 看着像程序员的东西。

但把第一遍流程跑下来，会发现门槛没想象中高。

安装，登录，进入项目目录，输入：

```Plain Text
codex
```

然后开始告诉它你想做什么，这篇先把最基本的解决掉。

如果你还没用过 Codex CLI，可以先把这一篇跑一遍。

**至少让它在你的终端里，完成第一个真实任务。**
