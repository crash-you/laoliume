---
title: "VS Code 接入 ChatGPT 教程：安装 OpenAI 官方 Codex 插件，登录账号就能用"
description: "从 VS Code 扩展市场认准 OpenAI 发布的 Codex 插件，使用 ChatGPT 账号登录，打开侧边栏发起第一次对话。"
date: "2026-10-20"
slug: "vscode-chatgpt-codex-extension"
published: true
---

大家好，我是佬刘。

之前分享过几篇 Codex 的使用教程，今天来聊怎么把 ChatGPT 接入进 VSCode里。

如果你平时使用 VS Code 写代码，每次遇到问题都要把代码复制到 ChatGPT 网页，等 AI 回答之后，再复制回来修改，整个过程会比较麻烦。

现在可以通过官方提供的 Codex 插件，让 AI 在 VS Code 中读取项目文件、理解代码，并根据要求修改内容。

而且，**可以直接使用 ChatGPT 账号登录，用gpt里的额度！不需要单独购买 API，也不需要配置 API Key。**

下面从安装开始。

## 一、先准备好 VS Code

VS Code 是一款代码编辑器

如果电脑上已经安装，可以跳过这一步。

还没安装的朋友，打开 VS Code 官网。

官网：[https://code.visualstudio.com/](https://code.visualstudio.com/)

选择对应的操作系统下载安装即可。

安装完成后，打开 VS Code，就能看到编辑器的主界面。

![Visual Studio Code 主界面](/images/vscode-chatgpt-codex-extension/step-01.png)

## 二、安装 OpenAI 官方 Codex 插件

打开 VS Code，在左侧工具栏找到「扩展」，也就是 Extensions。

![VS Code 左侧的扩展入口](/images/vscode-chatgpt-codex-extension/step-02.png)

Windows 用户可以按下快捷键 `Ctrl + Shift + X`。

在搜索框输入：

`Codex`

注意，搜的是codex！

![在扩展市场搜索 Codex](/images/vscode-chatgpt-codex-extension/step-03.png)

搜索结果中找到 OpenAI 官方发布的扩展。

- **插件名称：** Codex – OpenAI's coding agent
- **发布者：** OpenAI
- **扩展 ID：** `openai.chatgpt`

注意检查发布者，避免安装名称相似的第三方插件。

![OpenAI 发布的 Codex 扩展详情](/images/vscode-chatgpt-codex-extension/step-04.png)

打开上面的链接，也可以点击 Install，跳转到 VS Code 中安装。

点击 Install，完成插件安装。

![安装官方扩展](/images/vscode-chatgpt-codex-extension/step-05.png)

整个安装过程不需要输入 API Key，也不用在终端安装 Codex CLI。

![扩展安装完成后的界面](/images/vscode-chatgpt-codex-extension/step-06.png)

## 三、使用 ChatGPT 账号登录

安装完成后，在 VS Code 中找到 Codex 图标，点击打开插件面板。

![从侧边栏打开 Codex 面板](/images/vscode-chatgpt-codex-extension/step-07.png)

选择 **Sign in with ChatGPT**。

接下来，浏览器会打开 ChatGPT 登录页面。

使用自己的 ChatGPT 账号登录，并按照页面提示完成授权。

授权完成后，返回 VS Code。

如果插件显示聊天输入框，就可以开始使用 Codex 了。

![登录后显示的对话输入框](/images/vscode-chatgpt-codex-extension/step-08.png)

这里补充一点。

如果此前已经使用 Codex CLI 登录过 ChatGPT，官方插件可能直接复用之前的登录信息。Codex CLI 和 VS Code 扩展支持共享本地登录凭据。

因此，安装完成后直接进入聊天界面，也属于正常情况。

## 四、ChatGPT 会员和 Codex 额度是什么关系？

这里需要说明一下。

通过 **Sign in with ChatGPT** 登录后，Codex 使用对应 ChatGPT 账号的 Codex 使用权益。

使用 ChatGPT 账号登录，无须另外购买 API Key。

如果选择 **Use API Key** 登录，则会使用 OpenAI API 的计费方式。

另外，VS Code 中使用的是 Codex 的模型与功能体系，具体可选模型取决于插件版本、配置和账号权限。网页 ChatGPT 中的模型选择界面与 VS Code 扩展并不完全相同。

## 五、常见问题 FAQ

### VS Code 接入 ChatGPT 必须购买 Plus 或 Pro 吗？

不需要。

### Windows 使用 Codex 插件需要安装 WSL 吗？

普通的 Windows 本地使用场景，可以直接安装 Codex 扩展。

### 插件安装后找不到入口，或者无法登录怎么办？

安装完成后没有出现 Codex 图标，可以按 `Ctrl + Shift + P`，搜索 `Codex: Open Codex Sidebar`。
