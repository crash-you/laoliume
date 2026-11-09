---
title: "Claude Code 接入 DeepSeek 教程｜Windows / Mac 配置，直接使用 DeepSeek API"
description: "在 Windows 或 Mac 安装 Claude Code，配置 DeepSeek API 地址、密钥与模型，再用状态命令和后台调用记录确认配置是否生效。"
date: "2026-10-06"
slug: "claude-code-deepseek-setup"
published: true
---

大家好，我是佬刘。

昨天我们写过了Claude Code怎么安装，但是免费版没法用，恰好群里又有伙伴在反馈说Codex太慢了，Claude Code相对来说更快，质量更高。

![关于用 DeepSeek 接入 Claude Code 的提问](/images/claude-code-deepseek-setup/step-01.png)

那么今天这篇直接从 0 开始，把 Claude Code 接入 DeepSeek API跑通。

如果你电脑里已经安装过 Claude Code，可以直接跳到第二部分。

---

## 一、Claude code是什么

Claude Code 和 Claude 模型，是两个不同的东西。

Claude Code 和 Codex一样，都属于Agent，是套在大模型外面的一层壳，负责读取项目、执行终端命令等等。

正常情况下，它连接的是 Anthropic 自己的 Claude 模型。

我们现在做的事情，是把 Claude Code 请求模型的地址改成 DeepSeek。

改完之后：

你打开的还是 Claude Code；

输入的还是 `claude` 启动；

![运行 Claude Code 时的模型示例](/images/claude-code-deepseek-setup/step-02.png)

底层模型请求则发给 DeepSeek API。

DeepSeek 官方目前已经支持 OpenAI（ChatGPT） 和 Anthropic（Claude） 两套 API 格式，其中 Anthropic API 的地址就是：

```text
https://api.deepseek.com/anthropic
```

这也是 Claude Code 可以直接接入 DeepSeek 的基础。

所以这里还有一个很多人会关心的问题。

**接入 DeepSeek 以后，消耗的不是 Claude Pro / Max 的 Claude Code 套餐额度。**

模型请求走的是你自己的 DeepSeek API Key，费用按照 DeepSeek API 使用量计算。

Claude Code 在这里就是一个 Agent 外壳。

## 二、安装 Claude Code

已经安装过的直接跳过。

Claude Code 现在支持 Windows 原生运行。

Windows 用户直接在 PowerShell 执行：

```powershell
irm https://claude.ai/install.ps1 | iex
```

![在 Windows 终端安装 Claude Code](/images/claude-code-deepseek-setup/step-03.png)

安装结束后输入：

```powershell
claude --version
```

能够正常返回版本号，就说明 Claude Code 已经安装成功。

![终端显示已安装的 Claude Code 版本](/images/claude-code-deepseek-setup/step-04.png)

Mac / Linux 用户可以执行：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

## 三、获取 DeepSeek API Key

接下来需要一个 DeepSeek API Key。

Deepseek 开放平台地址：https://platform.deepseek.com/

进入 DeepSeek 开放平台，创建自己的 API Key。

![DeepSeek 开放平台控制台](/images/claude-code-deepseek-setup/step-05.png)

![创建新的 DeepSeek API Key](/images/claude-code-deepseek-setup/step-06.png)

把API Key复制下来

![创建密钥后显示的复制按钮](/images/claude-code-deepseek-setup/step-07.png)

这里需要注意一下：

**API Key 不要发给别人，否则别人可以直接用到你的Deepseek里余额！**

后面配置的时候，把我代码里的：

```text
<你的 DeepSeek API Key>
```

替换成你自己的 Key。

![API Key 列表中掩码显示的密钥](/images/claude-code-deepseek-setup/step-08.png)

## 四、Windows 接入 DeepSeek

这一步是整篇最关键的地方。

直接在 PowerShell 中输入：

```text
notepad $HOME\.claude\settings.json
```

![用记事本打开 Claude Code 配置文件](/images/claude-code-deepseek-setup/step-09.png)

打开之后，把 DeepSeek 的配置写进去。

```powershell
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "这里替换成你的 DeepSeek API Key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-flash",
    "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-flash",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "786432"
  },
  "model": "deepseek-flash[1m]",
  "autoUpdatesChannel": "latest",
  "theme": "dark"
}
```

你需要修改的地方就是这一行：

```text
"ANTHROPIC_AUTH_TOKEN": "这里替换成你的 DeepSeek API Key"
```

![在配置中设置 DeepSeek 地址和模型](/images/claude-code-deepseek-setup/step-10.png)

把刚才在 DeepSeek 开放平台创建的 Key 填进去。

还有一个地方要注意。

如果你的 `settings.json` 之前配置过其他 API 地址，比如：

```text
"ANTHROPIC_BASE_URL": "https://其他地址"
```

记得改成：

```text
"ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic"
```

保存文件，然后把原来的 Claude Code 关闭。

重新打开 PowerShell，进入你的项目目录：

```text
cd D:\你的项目
```

![从终端进入自己的项目目录](/images/claude-code-deepseek-setup/step-11.png)

运行：

```text
claude
```

Claude Code 就会按照新的配置启动。

![Claude Code 启动后的终端界面](/images/claude-code-deepseek-setup/step-12.png)

## 五、怎么确认自己真的接上 DeepSeek 了

进入 Claude Code 后，可以输入：

```text
/status
```

检查当前 Claude Code 的状态和模型配置。

![运行状态命令查看正在使用的模型](/images/claude-code-deepseek-setup/step-13.png)

另外一个更直接的办法，是去 DeepSeek API 后台看调用记录和余额变化。

![DeepSeek 后台记录的调用次数和消耗](/images/claude-code-deepseek-setup/step-14.png)

你让 Claude Code读取一个项目、分析代码或者修改文件，如果 DeepSeek 后台产生了对应 API 消耗，就说明请求已经走到 DeepSeek。

也可以问一句：

```text
你是什么模型？
```

![向配置后的模型发送测试问题](/images/claude-code-deepseek-setup/step-15.png)

## 六、上面的配置有一个问题

API Key 会直接写在：

```text
settings.json
```

里面。

所以这个文件不要公开 GitHub ，也不要把带有完整 API Key 的配置截图发出去。

## 七、想永久使用 DeepSeek 怎么办

上面的 `settings.json` 配置保存之后，本身就会保留下来。

以后不需要每次打开 PowerShell重新执行环境变量。

进入自己的项目目录：

```text
cd D:\你的项目
```

然后运行：

```text
claude
```

就可以继续使用。

## 八、Mac / Linux 怎么配置

Mac 和 Linux 同样可以通过 Claude Code 配置文件接入。

配置文件位于：

```text
~/.claude/settings.json
```

把同样的配置写进去：

```text
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "这里替换成你的 DeepSeek API Key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-flash",
    "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-flash",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "786432"
  },
  "model": "deepseek-flash[1m]"
}
```

保存之后重新运行：

```text
claude
```

即可。

## 九、我有 Claude Pro，还能切回去吗

可以。

如果以后不想继续使用 DeepSeek，把 `settings.json` 里面和 DeepSeek 有关的配置删除，再恢复原来的 Claude Code 登录方式即可。

有 Claude Pro / Max 的用户，可以继续使用自己的 Claude 账号运行 Claude Code。

两套方式可以根据自己的需求切换。

## 十、那还需要登录 Claude 吗？

如果你的目的就是：

```text
Claude Code + DeepSeek API
```

模型调用依赖的是你的 DeepSeek API Key。

整个链路可以理解成：

```text
Claude Code
    ↓
Anthropic API 格式
    ↓
DeepSeek Anthropic 兼容接口
    ↓
DeepSeek 模型
```

Claude Code 负责读取项目、修改文件、执行命令和整个 Agent 工作流。

模型请求则交给 DeepSeek。

## 十一、到底用哪个 DeepSeek 模型

这篇教程里使用的是：

```text
deepseek-flash[1m]
```

所以配置文件里我们把主要模型都指向了它：

```text
"ANTHROPIC_MODEL": "deepseek-flash[1m]",
"ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-flash[1m]",
"ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-flash[1m]"
```

第一次配置直接按照上面的内容来就行。

先把 Claude Code + DeepSeek 跑通，再考虑其他模型。

## 十二、Claude Code 的联网搜索还能用吗

接入 DeepSeek 之后，Claude Code 原本的 Agent 工作方式还在。

读取项目、修改文件、执行终端命令这些能力还是由 Claude Code 提供。

所以这套玩法的重点，也不只是换了一个聊天模型。

我们保留的是 Claude Code 这一整套编程 Agent 工作流，只把后面的模型 API 换成了 DeepSeek。

## 最后

以前想把 Claude Code 接到其他模型上，经常还要折腾中转、代理和协议兼容。

现在整个配置已经简单很多。

真正需要做的核心操作就是找到：

```text
C:\Users\你的用户名\.claude\settings.json
```

填入自己的 DeepSeek API Key，把 API 地址改成：

```text
https://api.deepseek.com/anthropic
```

再把模型设置成：

```text
deepseek-flash[1m]
```

保存配置，重新运行：

```text
claude
```

就可以开始用了。
