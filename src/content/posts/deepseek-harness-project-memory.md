---
title: "DeepSeek Harness 长期记忆教程｜让 AI 记住你的项目，不用每次重新解释"
description: "在 DeepSeek Harness 安装并启用 dsh-auto-memory，把项目约束保存成 Markdown，再开一个新对话验证记忆是否生效。"
date: "2026-10-07"
slug: "deepseek-harness-project-memory"
published: true
---

大家好，我是佬刘。

这两天我在用 DeepSeek 官方发布的 Harness Preview 桌面版。

![DeepSeek Harness 桌面版](/images/deepseek-harness-project-memory/step-01.png)

用 Agent 做长期项目时，有一个问题绕不开。

比如我在上一个会话里花了很久和 AI 确认：这个项目用什么技术栈、哪些文件不能动、为什么之前的方案被放弃、后面准备怎么改。

换一个新会话以后，这些信息不会变成一套长期项目记忆。

所以这篇就解决一个问题：

**让 DeepSeek Harness 记住你的项目。**

以后开一个新会话，不用把项目背景重新解释一遍。

## 一、先安装 dsh-auto-memory

这次用的是一个社区插件：**dsh-auto-memory**

项目地址：[https://github.com/AskTheWay/dsh-auto-memory?utm_source=chatgpt.com](https://github.com/AskTheWay/dsh-auto-memory?utm_source=chatgpt.com)

![dsh-auto-memory 的项目页面](/images/deepseek-harness-project-memory/step-02.png)

这是社区插件，不是 DeepSeek 官方内置功能。

它的思路很像 Claude Code 的 Memory。

**需要长期保留的信息会被存成 Markdown 文件，同时生成一份 `MEMORY.md` 索引。**

每次 Harness 请求模型时，这份记忆索引会进入系统上下文，模型可以知道自己有哪些记忆，再读取对应内容。

重点是，它不用额外部署数据库，也不用其他麻烦的操作。

记忆文件就放在本地。

## 二、用 DeepSeek 官方桌面版安装插件

我这里用的是 DeepSeek 官方 Harness Preview 桌面版。

![打开 DeepSeek Harness 工作区](/images/deepseek-harness-project-memory/step-03.png)

新版官方桌面端左侧本身就有一个：

**插件**

![在侧栏找到插件管理](/images/deepseek-harness-project-memory/step-04.png)

点进去。

找到：**添加插件**

![插件管理里的添加入口](/images/deepseek-harness-project-memory/step-05.png)

DeepSeek Harness 官方的插件管理器支持通过 npm 包名、Git 地址、压缩包和本地目录安装第三方插件。

这里不需要折腾 GitHub 源码。

输入：

```text
dsh-auto-memory
```

![搜索 dsh-auto-memory 插件](/images/deepseek-harness-project-memory/step-06.png)

然后安装。

![安装记忆插件](/images/deepseek-harness-project-memory/step-07.png)

安装完成以后确认插件处于启用状态。

![检查插件是否已启用](/images/deepseek-harness-project-memory/step-08.png)

如果安装以后界面没有变化，把 Harness 退出，再重新打开一次。

确保再次打开插件是这样的状态

![再次打开后的插件状态](/images/deepseek-harness-project-memory/step-09.png)

官方桌面端使用独立的 `desktop` Profile，插件也会安装到这个 Profile 里，不会和你以前用命令行启动的 Web Profile 混在一起。

插件作者要求的 Harness 版本为：

```text
@deepseek-ai/dsh >= 0.1.5-rc.2
```

如果安装时提示兼容性问题，先检查 Harness 版本。

## 三、怎么测试它有没有记住？

安装成功以后，别先研究一堆配置。

Harness 会多出一组和长期记忆有关的工具：

```text
memory_write
memory_read
memory_list
memory_delete
memory_prune
memory_delete_all
```

做一个最简单的测试。

我新建一个测试工作区，然后在第一个会话里告诉 Harness：

```text
请把下面的信息写入长期记忆。

项目名称：Memory Test

项目技术栈：
Vue 3 + FastAPI

项目约束：
1. 不要修改现有 UI
2. 修改接口之前先阅读 README
3. 数据库使用 PostgreSQL
```

![向当前项目写入需要记住的约束](/images/deepseek-harness-project-memory/step-10.png)

`memory_write` 用来写入长期记忆，`memory_list` 用来查看已经保存的记忆，`memory_read` 用来读取某一条记忆的完整内容。

我这里先把 Memory Test 项目的技术栈和项目约束发给 Harness，并明确告诉它：

> 请把下面的信息写入长期记忆。

执行完成后，Harness 返回了两条已经保存的项目记忆：

```text
memory-test-project
memory-test-project-constraints
```

![示例项目的记忆记录](/images/deepseek-harness-project-memory/step-11.png)

一条保存项目技术栈和数据库信息，一条保存项目约束。

## 四、关掉这个会话，再开一个新的

这一步才是重点。

不要继续在原来的会话问。

点：**新会话**

保持同一个工作区，然后不要给它任何项目背景。

只问：

```text
这个项目使用什么技术栈？

修改项目的时候，有哪些需要遵守的约束？
```

![在新对话中询问项目约束](/images/deepseek-harness-project-memory/step-12.png)

这时候就看它能不能回答出：

```text
Vue 3 + FastAPI

PostgreSQL

不要修改现有 UI

修改接口前先阅读 README
```

如果可以，这个测试就跑通了。

因为这些信息只出现在上一个会话里，新会话没有重新告诉它。

**新会话还能拿到，才算跨会话记忆。**

有趣的是，DeepSeek 官方自己在测试第三方 Memory MCP 时，用的也是类似方法：会话 A 写入一个唯一信息，再开会话 B 验证能否召回。

## 五、它到底把这些东西存到哪里了？

这也是我喜欢这个插件的一点，没有搞一个看不见的云端数据库。

它把记忆存在：

```text
$DSH_HOME/memory/
```

里面就是普通的 Markdown 文件。

![项目目录中的 Markdown 记忆文件](/images/deepseek-harness-project-memory/step-13.png)

插件会把记忆分成几类：

```text
user
feedback
project
reference
```

比如你的个人偏好，可以归到 `user`。

项目技术栈、架构决定、开发约束，可以归到 `project`。

你曾经纠正过 AI 的工作方式，可以放进 `feedback`。

外部资料和长期参考信息，可以放进 `reference`。

这些 Markdown 文件你自己也可以打开。

也就是说，AI 记住了什么，你是能看到的。

## 六、它和聊天记录有什么区别？

聊天记录解决的是：**以前聊过什么。**

长期记忆解决的是：**以前聊过的内容里，什么值得以后继续使用。**

比如一场两个小时的开发对话里，可能有上百条消息。

真正需要带到一个月后的新会话里的，也许只有几条：

```text
项目使用什么架构

为什么放弃某个方案

哪些目录不能改

用户有哪些固定要求

之前踩过什么坑
```

没必要把两小时聊天记录全文重新读一遍。

把这些长期有效的信息提出来，才是 Memory 的价值。

## 最后

我之前一直觉得，Coding Agent 用久以后，记忆会是一个绕不开的问题。

在我最开始的文章里，也在反复说这个问题。

模型越来越强以后，很多任务它都会做。

麻烦的是：**昨天已经教过它的东西，今天又得重新说一遍。**

尤其是项目一做就是几周、几个月的时候。

DeepSeek Harness 本身采用的就是 Everything is a Plugin。

官方没有把一套长期记忆系统写死在 Harness 里，目前提供的是第三方 Memory MCP 接入示例；社区插件也可以沿着这套架构补能力。

这次装完 `dsh-auto-memory`，要验证的东西也很简单：

**关掉旧会话。**

**新开一个。**

**一句背景都不给。**

然后问它：

> 我们这个项目之前定了什么规则？

能答出来，这套长期记忆就算跑通了。
