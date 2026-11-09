---
title: "DeepSeek大肥鱼安装教程：用Harness在电脑上养一只蓝色DeepSeek大肥鱼"
description: "从安装 DeepSeek Harness 到启用 dsh-pet 插件，在电脑上养一只蓝色大肥鱼，试试桌宠互动、聊天和工作时的状态动画。"
date: "2026-10-28"
slug: "deepseek-harness-desktop-pet"
published: true
---

大家好，我是佬刘。

这两天在 B 站刷到一只蓝色的大肥鱼，能在桌面上走来走去，鼠标点它还会有反应。它能吃饭、打瞌睡、玩魔方，甚至能在 AI 工作时切换动作，真的有点上头。（尤其我还有点二次元之魂！）

![DeepSeek Harness 工作区旁的大肥鱼桌宠](/images/deepseek-harness-desktop-pet/step-01.webp)

如果你也想在电脑上养一只，今天就把安装方法整理出来。用官方桌面端就行，不用碰命令行。

## 一、DeepSeek Harness 和大肥鱼是什么关系？

DeepSeek Harness 是 DeepSeek 推出的开源 Agent 工具。

和广为人知的Codex同属一类，能在本地创建修改文件，还能通过插件扩展能力等等。

官网：[https://www.deepseek.com/zh/harness/](https://www.deepseek.com/zh/harness/)

大家看到的蓝色【大肥鱼】，来自社区创作的 DeepSeek 鲸鱼娘形象。把它放进 Harness 的桌宠插件叫 **dsh-pet**，民办吉祥物来的。

插件项目：[https://github.com/PC2005-cloud/dsh-pet](https://github.com/PC2005-cloud/dsh-pet)

安装好之后，可以先和它互动，再让它陪你看 AI 执行任务。

## 二、下载安装 DeepSeek Harness

打开上面的 DeepSeek Harness 官网，点击【下载桌面端】。

这里注意一点，一定要认准：Deepseek.com，不是deepseekai.com，更不是deepseekk.com！！

![DeepSeek Harness 官网的桌面版下载入口](/images/deepseek-harness-desktop-pet/step-02.webp)

Windows 用户选择 **Windows（64 位）**，使用 Apple 芯片的 Mac 用户选择对应的 macOS 版本。

![下载菜单中的系统版本选项](/images/deepseek-harness-desktop-pet/step-03.webp)

下载完成后，注意一下，是这个命名方式的exe文件。

![浏览器下载记录中的 Harness 安装程序](/images/deepseek-harness-desktop-pet/step-04.webp)

打开安装程序，选择对应安装位置。

![选择 Harness 的安装位置](/images/deepseek-harness-desktop-pet/step-05.webp)

按页面提示完成安装。

![Harness 安装进度](/images/deepseek-harness-desktop-pet/step-06.webp)

完成安装

![Harness 安装完成界面](/images/deepseek-harness-desktop-pet/step-07.webp)

首次进入时，根据当前客户端页面选择 DeepSeek 账号登录，或者配置可用的模型 API Key。

![首次启动 Harness 时的登录选项](/images/deepseek-harness-desktop-pet/step-08.webp)

通过 API Key 调用模型计费，第一次登录推荐使用账号登录。

![DeepSeek 账号授权页面](/images/deepseek-harness-desktop-pet/step-09.webp)

然后就会跳转到页面的deepseek授权页面那里，选择登录即可。

然后去根据对应需求选择默认（这个无所谓，后边都能自己再改）

![Harness 首次启动的默认设置](/images/deepseek-harness-desktop-pet/step-10.webp)

进入主界面后，可以建一个空的测试工作区。后面的演示只在这个工作区里操作，不动电脑里的其他资料。

![新建的空白测试工作区](/images/deepseek-harness-desktop-pet/step-11.webp)

## 三、安装蓝色大肥鱼插件

打开 DeepSeek Harness 的「插件管理」，找到安装插件的输入框，输入下面这个名字：

```text
dsh-pet
```

确认插件来源后安装。对应的开源项目作者是 **PC2005-cloud**。

![在插件列表搜索大肥鱼并核对开发者](/images/deepseek-harness-desktop-pet/step-12.webp)

安装完成后，**退出并重新打开 DeepSeek Harness**，让插件生效。按照插件作者的说明，大肥鱼会出现在 Harness 界面右上角。

![安装大肥鱼桌宠插件的确认界面](/images/deepseek-harness-desktop-pet/step-13.webp)

立即启用

![选择立即启用大肥鱼插件](/images/deepseek-harness-desktop-pet/step-14.webp)

插件默认支持在 Harness 界面和电脑桌面同时显示。

![Harness 内和电脑桌面上的大肥鱼](/images/deepseek-harness-desktop-pet/step-15.webp)

首次启用独立桌面形态时，还可能自动下载 Electron 运行组件。如果界面里已经有鱼，桌面上还没有，先查看运行组件是否下载完成。

想让大肥鱼有不同的动作，位置等等，可以右键，然后就会看看到.....

![右键大肥鱼后展开的操作菜单](/images/deepseek-harness-desktop-pet/step-16.webp)


## 四、大肥鱼能做什么？

先试试鼠标互动。点击大肥鱼，它会播放回应动作；按住拖动，可以把它挪到屏幕其他位置。右键打开「动作」，还能挑选打瞌睡、吃东西、玩耍等动画。

![动作菜单和大肥鱼的动作示例](/images/deepseek-harness-desktop-pet/step-17.webp)


再试试聊天。在大肥鱼身上右键，选择「对话」，输入一句话，看看它怎么回复。

![桌宠对话气泡及回复示例](/images/deepseek-harness-desktop-pet/step-18.webp)


插件还提供「碎碎念」功能，并能保存对应的对话记忆。

更有意思的是，它还能跟随 Harness 的工作状态切换动作。AI 在思考、执行任务、完成任务或遇到错误时，桌宠会显示对应的状态动画。

这里我就不过多演示了，还挺好玩的哈哈哈。

## 五、让大肥鱼陪你完成第一个任务

新建一个空白测试工作区，打开 Harness 的对话框，输入下面这段话：

> 请在当前测试工作区中创建一个名为 `dafeiyu-demo` 的文件夹，并在里面新建 `README.md`。文件里写一段中文说明，介绍这只大肥鱼桌宠的用途。完成后告诉我创建了哪些文件。只允许修改 `dafeiyu-demo` 文件夹，不要操作其他目录。

![向 Harness 提交创建说明文件的任务](/images/deepseek-harness-desktop-pet/step-19.webp)

如果模型与工具权限已经配置完成，Harness 就可以尝试执行这个文件任务。执行过程中观察大肥鱼的状态动画，结束后再打开文件夹核对结果。

![工作区中完成的文件与桌宠状态](/images/deepseek-harness-desktop-pet/step-20.webp)

这样就把「桌宠互动」和「AI 真正干活」连起来了。后续可以给 Harness 增加其他社区插件，让它参与更多任务。

跟养闺女一样。

## 六、常见问题

1. **大肥鱼需要付费吗？**

DeepSeek Harness 和 dsh-pet 都有开源项目。

桌宠动画和模型调用是两件事。

1. **安装了 dsh-pet，为什么看不到鱼？**

先确认插件已安装并重启 Harness，再检查「桌宠配置」里的显示位置。

桌面模式还依赖 Electron 运行组件，下载失败可能导致鱼只显示在 Harness 界面里。

1. **能不打开 DeepSeek Harness，只养大肥鱼吗？**

项目提供独立运行方式，部分通知能力受到限制。想让大肥鱼和 AI 任务联动，建议先用 Harness 桌面端。

最后附上三个入口，安装时**认准官方和项目作者的仓库**。

DeepSeek Harness 官网：[https://www.deepseek.com/zh/harness/](https://www.deepseek.com/zh/harness/)

DeepSeek Harness 开源项目：[https://github.com/deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)

大肥鱼桌宠 dsh-pet：[https://github.com/PC2005-cloud/dsh-pet](https://github.com/PC2005-cloud/dsh-pet)

## 最后

大肥鱼deepseek的形象爆火，佬刘认为是一次破圈的划时代意义

也是 AI 走向大众的一种方式。

一个有趣的形象，降低了普通人接触 AI 的门槛，也让更多人开始了解 Agent 能做什么。

至于这只大肥鱼以后还能学会多少本领，我也挺期待的。哈哈哈！
