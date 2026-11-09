---
title: "Claude Code 安装教程｜怎么下载、安装、登录和使用"
description: "从 Windows PowerShell 或 Mac 终端安装 Claude Code，检查版本、选择登录方式，并在自己的项目里运行 /init。附 Windows 代理地址报错的排查方法。"
date: "2026-10-05"
slug: "claude-code-install-guide"
published: true
---

大家好，我是佬刘。

最近Claude Opus 5.5 可以说是当红明星了，但是因为我之前Claude pro被封过，新建的号现在也没有 Claude 会员，所以写这篇之前，我先确认了一个问题：

**只用 Claude 免费账户，能通过订阅方式登录 Claude Code 吗？**

我试了一次，页面提示需要升级 Pro 或 Max。

![Claude 订阅授权页提示需要 Pro 或 Max 套餐](/images/claude-code-install-guide/step-01.png)

所以我这次没能用免费账户完成订阅授权。后面也会提到按用量付费的 API 登录方式。

全文比较长，建议先收藏，然后打开电脑一步一步跟着做！

## 一、Claude Code是什么？

很多人第一次看到 Claude Code，可能会把它和 Claude 网页版、Claude 桌面端 混在一起。

![Claude 桌面应用的聊天首页](/images/claude-code-install-guide/step-02.png)

上图为APP版，下图为网页版

![Claude 网页版的聊天首页](/images/claude-code-install-guide/step-03.png)

而Claude Code 可以理解成运行在终端里的 Claude。

打开一个项目文件夹，在这个文件夹里启动 Claude Code，它就可以读取项目里的代码和文件，帮你修改代码、创建文件、执行命令、查报错。

比如你可以告诉它：

> 帮我检查这个项目，告诉我怎么启动。

或者：

> 帮我做一个个人主页，包含首页、关于我和联系方式。

Claude Code 会围绕当前文件夹开始工作。

所以今天这篇讲的是 **Claude Code CLI**，也就是终端版本。

Claude Desktop 是另一个东西，后面我再单独写。

## 二、Claude Code怎么下载？

Claude Code 不需要你去网页里找一个 `.exe` 安装包。

安装命令来自 [Claude 帮助中心](https://support.claude.com/en/articles/14552382-your-first-day-in-claude-code)

先从 Windows 开始。

### Windows安装Claude Code

打开 PowerShell。

![Windows PowerShell 终端](/images/claude-code-install-guide/step-04.png)

不知道 PowerShell 在哪，可以按：

`Win + S`

搜索：

`PowerShell`

![在 Windows 搜索中找到 PowerShell](/images/claude-code-install-guide/step-05.png)

打开以后输入：

```powershell
irm https://claude.ai/install.ps1 | iex
```

等待安装完成。这里可能会有一个坑导致安装错误，后面会讲到解决办法！

![PowerShell 显示 Claude Code 安装成功及程序位置](/images/claude-code-deepseek-setup/step-03.png)

安装结束以后，输入：

```text
claude --version
```

![运行 claude --version 后显示已安装的版本](/images/claude-code-deepseek-setup/step-04.png)

如果能看到 Claude Code 的版本号，说明安装完成。

## 三、Mac怎么安装Claude Code？

Mac 可以打开终端，输入：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

如果你平时使用 Homebrew，也可以：

```bash
brew install --cask claude-code
```

安装完成以后同样检查：

```text
claude --version
```

![核对 Claude Code 版本的输出示例](/images/claude-code-deepseek-setup/step-04.png)

Linux 的安装方法和前面的终端安装方式相同：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

如果你的电脑有 Node.js，也可以使用 npm：

```bash
npm install -g @anthropic-ai/claude-code
```

不过现在有官方原生安装方式，新手跟着前面的方式走就够了。

## 四、Claude Code怎么登录？

安装完成以后，在 PowerShell 或终端输入：

```text
claude
```

第一次启动时，Claude Code 会进入登录流程。

![Claude Code 询问是否信任当前工作目录](/images/claude-code-install-guide/step-09.png)

这里先核对终端显示的路径。上图当时停在 Windows 系统目录，应该选 No 退出，用 `cd` 进入自己的项目文件夹后重新启动 `claude`。确认路径是你信任的项目，再选 Yes，I trust this folder。

![首次进入 Claude Code 后的未登录提示](/images/claude-code-install-guide/step-10.png)

输入

```text
/login
```

![运行 /login 后可选择订阅账户、API 账户或第三方平台](/images/claude-code-install-guide/step-11.png)

正常情况下浏览器会打开 Claude 的授权页面，你用自己的 Claude 账号登录并完成授权。

我这里也补一个容易踩的坑。

如果你的电脑之前配置过：

```text
ANTHROPIC_API_KEY
```

Claude Code 会优先使用这个 API Key。

![Claude Code 终端显示按 API 用量计费](/images/claude-code-install-guide/step-12.png)

这时消耗的是 Claude Console API 额度，按 API 使用量计费，不是你 Claude 账户里的订阅额度。Anthropic 官方也专门提醒了这个问题。[Claude帮助中心](https://support.claude.com/en/articles/12304248-manage-api-key-environment-variables-in-claude-code)

如果你之前折腾过 Claude API、第三方中转或者各种环境变量，登录以后可以输入：

```text
/status
```

看看自己正在使用哪种认证方式。

![通过 /status 查看认证方式和服务地址](/images/claude-code-install-guide/step-13.png)

## 五、没有Claude会员怎么办？

这个问题我单独拿出来说，因为我自己现在也没有 Claude 会员，哈哈哈。

如果你只有 Claude Free 账户，可以先按照上面的方式下载。

还有一种方式是 Claude Console API，这种方式不需要 Claude Pro 或 Max，充值 API 余额以后，Claude Code按照 Token 产生费用。

也就是说，Claude Code 的使用路径不只有买 Claude 会员这一条。

至于我准备怎么用？

下一篇就有意思了。

**[Claude Code 接 DeepSeek](/claude-code-deepseek-setup/)。**

## 六、以后怎么打开Claude Code？

这个地方新手也容易绕。

Claude Code 不需要你每次找一个软件图标。

假设项目在：

```text
F:\za-pro
```

进入这个目录：

```powershell
cd F:\za-pro
```

再输入：

```text
claude
```

![在项目目录启动 Claude Code](/images/claude-code-install-guide/step-14.png)

它就会围绕这个项目工作。

所以 Claude Code 的方式很简单：

**先进入要处理的文件夹，再叫 Claude 进来干活。**

## 七、建议先执行一次 `/init`

如果你准备长期使用某个项目，进入 Claude Code 后可以执行：

```text
/init
```

![输入 /init 生成项目说明文件](/images/claude-code-install-guide/step-15.png)

Claude Code 会为当前项目生成一个 `CLAUDE.md`。

Anthropic 在自己的 Claude Code 新手指南里把这一步列为项目初始化的重要操作。这个文件可以记录项目结构、规范和需要 Claude 长期遵守的信息，后续重新打开这个项目时，Claude Code 会读取它。[Claude帮助中心](https://support.claude.com/en/articles/14552382-your-first-day-in-claude-code)

用 Codex 的朋友看到这里应该很熟悉。

本质上就是给这个项目留一份长期说明书。

## 常见问题：Windows 安装 Claude Code 报 `Invalid proxy URL` 怎么解决？

在第一次安装的时候，可能会报这个错误

![安装脚本提示 Invalid proxy URL](/images/claude-code-install-guide/step-16.png)

不用慌，先去查询本机 proxy

输入指令

```powershell
Get-ChildItem Env:*proxy*
```

![在 PowerShell 检查代理环境变量和端口](/images/claude-code-install-guide/step-17.png)

你会看到当前本机的 proxy

我这里的本地代理端口是 `12000`。如果你的端口不同，把下面两行里的端口一起替换，再在当前 PowerShell 里执行：

```powershell
$env:HTTP_PROXY="http://127.0.0.1:12000"
$env:HTTPS_PROXY="http://127.0.0.1:12000"
```

即可。

## 最后

Claude Code 到这里就算装好了。

如果你只是想体验，免费 Claude 账号就可以先装起来。

如果你准备长期使用，可以再考虑 Claude Pro、Max，或者 API。

而我下一步更想折腾的是另一条路：

**Claude Code + DeepSeek。**

毕竟 Claude Code 这套 Agent 和工具能力确实很好用，但是太贵了，而且众所周知，Claude封号太严重！

下一篇我实测一下，Claude Code 怎么接 DeepSeek。
