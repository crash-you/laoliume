---
title: "Codex究极省额度教程：把ChatGPT网页版接入Codex，节省90%的额度"
description: "把 ChatGPT 网页版接入 Codex 的实操记录：从部署项目、初始化和配置 MCP，到验证调用与实际体验，减少任务中的 Codex 额度消耗。"
date: "2026-09-25"
slug: "codex-chatgpt-web-mcp"
published: true
---

大家好，我是佬刘。

最近一直在折腾 Codex，但是codex额度实在不够用，前几天刚重置，今天就已经快没了！

![Codex究极省额度教程：把ChatGPT网页版接入Codex，节省90%的额度，原文配图 1](/images/codex-chatgpt-web-mcp/image-1.png)

但是，网页版的额度又几乎是无限的！

那么能不能让网页版当成codex内置的一个模型呢？

刚好最近发现了一个 GitHub 开源项目：**codex\-chatgpt\-web**

项目地址：[https://github\.com/miuuyy/codex\-chatgpt\-web](https://github.com/miuuyy/codex-chatgpt-web)

它做的事情就是：**把 ChatGPT 网页端作为一个额外的 AI 能力接入 Codex。**

安装完成以后，你可以在一个界面里面同时使用：

- ChatGPT 网页端模型 

- Codex 模型 

![Codex究极省额度教程：把ChatGPT网页版接入Codex，节省90%的额度，原文配图 2](/images/codex-chatgpt-web-mcp/image-2.png)

然后根据不同任务选择不同模型。

## 一、这个项目解决了什么问题？

正常情况下，我们使用 Codex 就是直接在终端里面和 Codex 对话。

但是如果你想使用 ChatGPT 网页端的能力，就需要打开浏览器，切换页面，复制内容来回传递。

整个过程其实比较割裂。

而这个项目就是把这个过程整合起来。

让 ChatGPT 和 Codex 可以在同一个工作流里协作。

![一、这个项目解决了什么问题？，原文配图 3](/images/codex-chatgpt-web-mcp/image-3.png)

## 二、部署项目

首先我们要安装这个GitHub项目，直接打开我们的codex，输入下面这段指令

```Plain Text
https://github.com/miuuyy/codex-chatgpt-web

安装部署这个GitHub项目，告诉我怎么启动，启动完怎么操作。
```

![二、部署项目，原文配图 4](/images/codex-chatgpt-web-mcp/image-4.png)

安装完成以后，会启动一个 Web 页面。

### 初始化

选择对应的语言

![初始化，原文配图 5](/images/codex-chatgpt-web-mcp/image-5.png)

完成对应设置之后，会进入到这个主页

![初始化，原文配图 6](/images/codex-chatgpt-web-mcp/image-6.png)

打开以后，大概类似一个 AI 工作台，点击登录chatgpt

![初始化，原文配图 7](/images/codex-chatgpt-web-mcp/image-7.png)

然后根据它的流程，进行一下冒烟测试

![初始化，原文配图 8](/images/codex-chatgpt-web-mcp/image-8.png)

然后它会操纵内置浏览器，去发送一条消息

![初始化，原文配图 9](/images/codex-chatgpt-web-mcp/image-9.png)

最重要的最后一步，退出codex，然后安装模型

![初始化，原文配图 10](/images/codex-chatgpt-web-mcp/image-10.png)

安装成功！

![初始化，原文配图 11](/images/codex-chatgpt-web-mcp/image-11.png)

退出重新启动codex后，打开模型选择列表，就会惊奇的发现，网页web已经作为模型出现在选择列表了

![初始化，原文配图 12](/images/codex-chatgpt-web-mcp/image-12.png)

验证一下

![初始化，原文配图 13](/images/codex-chatgpt-web-mcp/image-13.png)

整个过程不需要反复打开多个窗口。

### 配置 MCP

创建 Tunnel 和 API key

![配置 MCP，原文配图 14](/images/codex-chatgpt-web-mcp/image-14.png)

打开 Tunnels，会跳转到 gpt 创建 API页面

![配置 MCP，原文配图 15](/images/codex-chatgpt-web-mcp/image-15.png)

创建 Tunnels

![配置 MCP，原文配图 16](/images/codex-chatgpt-web-mcp/image-16.png)

输入基本信息

![配置 MCP，原文配图 17](/images/codex-chatgpt-web-mcp/image-17.png)

完成，复制 Tunnels ID

![配置 MCP，原文配图 18](/images/codex-chatgpt-web-mcp/image-18.png)

然后创建 API Key

![配置 MCP，原文配图 19](/images/codex-chatgpt-web-mcp/image-19.png)

Creat

![配置 MCP，原文配图 20](/images/codex-chatgpt-web-mcp/image-20.png)

填写基本信息

![配置 MCP，原文配图 21](/images/codex-chatgpt-web-mcp/image-21.png)

复制Key

![配置 MCP，原文配图 22](/images/codex-chatgpt-web-mcp/image-22.png)

完成 Tunnels 和 API Key这两部之后，点击下一步

![配置 MCP，原文配图 23](/images/codex-chatgpt-web-mcp/image-23.png)

把刚刚复制的 Tunnels ID 和 API Key填进去

![配置 MCP，原文配图 24](/images/codex-chatgpt-web-mcp/image-24.png)

连接harness，

![配置 MCP，原文配图 25](/images/codex-chatgpt-web-mcp/image-25.png)

打开 ChatGPT Plugins

![配置 MCP，原文配图 26](/images/codex-chatgpt-web-mcp/image-26.png)

在 ChatGPT 的 **设置 → 安全与登录** 中开启 **开发者模式**

![配置 MCP，原文配图 27](/images/codex-chatgpt-web-mcp/image-27.png)

返回 页面，点击 **「＋」新建连接器，****`Create app`**

![配置 MCP，原文配图 28](/images/codex-chatgpt-web-mcp/image-28.png)

**名称填 ：** `Codex Native2`

**图标、描述**：可留空；

**连接**：选 **「隧道」**，再选择你刚创建的 Tunnel。

**身份验证**：从当前的 `OAuth` 改成 **「无」**。

保留风险确认勾选，点 **「创建」**。

![配置 MCP，原文配图 29](/images/codex-chatgpt-web-mcp/image-29.png)

创建成功

![配置 MCP，原文配图 30](/images/codex-chatgpt-web-mcp/image-30.png)

![配置 MCP，原文配图 31](/images/codex-chatgpt-web-mcp/image-31.png)

创建后把该连接器的权限设为 **「允许所有操作」**，再回启动器点「验证运行时」。

![配置 MCP，原文配图 32](/images/codex-chatgpt-web-mcp/image-32.png)

通过

![配置 MCP，原文配图 33](/images/codex-chatgpt-web-mcp/image-33.png)

### 验证成功

一个神奇的 事情来了！

![验证成功，原文配图 34](/images/codex-chatgpt-web-mcp/image-34.png)

成功

![验证成功，原文配图 35](/images/codex-chatgpt-web-mcp/image-35.png)

## 三、实际体验

我自己跑了一遍以后，最大的感受是**它更像是在 Codex 外面加了一层调度入口。**

以前：Codex 是一个独立开发助手。

现在：可以同时接入其他模型。

对于一些简单任务可以直接交给网页版模型。

真正需要修改项目文件的时候，再交给 Codex。

这样可以减少一些不必要的 Codex 调用。

## 四、最后

这个 GitHub 项目提供了一种比较有意思的尝试。

让 ChatGPT 网页端和 Codex 不再是两个独立工具，而是组成一个开发工作流。

如果你经常使用 Codex 开发项目，这种多模型协作方式，值得体验一下。

极度省token！！！

【叠个甲，网传该方式可能会导致账号封禁，仅供娱乐使用，大家选择而为！】



