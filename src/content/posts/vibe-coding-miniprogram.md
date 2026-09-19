---
title: "Vibe Coding小程序教程：从0做一个Codex重置提醒小程序！"
description: "从一句话想法到能跑的小程序：GPT-6 Pro 出 PRD 和技术方案，Codex 写代码，便宜模型跑测试，做出一个专门盯 Codex 额度重置的提醒小程序「重置来了」。"
seoTitle: "Vibe Coding 小程序教程：从 0 做一个 Codex 重置提醒小程序"
seoDescription: "Vibe Coding 实操记录：GPT-6 Pro 整理 PRD/TECH/DATA_MODEL/TASKS 文档，Codex 按任务清单开发微信云开发小程序，再用低成本模型执行测试，完整开发流程与提示词。"
image: "/og/vibe-coding-miniprogram.png"
imageAlt: "佬刘AI 文章分享图：Vibe Coding 从 0 做一个 Codex 重置提醒小程序"
date: 2026-09-16
slug: "vibe-coding-miniprogram"
published: true
wechat_url: "https://mp.weixin.qq.com/s/Zajkfml-woozMBXDM2RaBw"
---

大家好，我是佬刘。

最近 Codex 经常会出现额度重置。

有时候是额度用完以后突然恢复，有时候是官方直接给一批用户 Reset。

问题是，这类消息很多都先出现在 X 上。

等我看到的时候，可能已经晚了几个小时，导致我的额度没有被浪费完！

所以我干脆做了个专门提醒我重置的微信小程序。

名字就两几个字：

**【重置来了】**

这篇我也不准备写什么复杂的小程序开发知识。

就记录一下，我是怎么从一个想法开始，利用 GPT 6 Pro 和 Codex 把它做出来的。

## 01 先把我想要的东西说清楚

我现在做这种项目，基本不会一上来就让 Codex 开始写。

因为我脑子里最开始通常只有一个很模糊的想法。

比如这次就是：**我想做一个小程序，专门提醒我 Codex 什么时候重置。**

至于页面怎么设计、数据存哪里、怎么抓 X、以后怎么加 Claude 和 Grok，这些东西其实都还没想清楚。

这种时候直接让 Codex 开干，很容易做到一半又推翻。

所以我更习惯于把想法丢给 Pro 模型，让它帮我把整个项目梳理一遍。

我给 Pro 的提示词很简单：

```Plain Text
我准备从 0 开发一个微信小程序，名字暂定为「重置」。

它主要用来记录和提醒AI产品的额度重置、额度赠送、限额调整等消息。

第一版重点支持Codex。

后面还会加入 Claude、Grok 等产品，所以架构不要围绕 Codex 写死。

我目前的核心需求是：

1. 用户打开小程序，可以看到 Codex 最近一次额度重置时间。
2. 可以查看历史重置记录。
3. 系统能够自动监控 Tibo 等 X 账号的新消息。
4. 抓到新消息后，让 AI 判断是否和额度重置有关。
5. 确认出现新的重要事件后，可以通过微信小程序订阅消息提醒用户。
6. 使用微信原生小程序 + CloudBase。
7. 第一版尽量简单，只解决核心问题，不增加无关功能。

现在先不要写代码。

请你作为产品经理和技术负责人，先帮我把这个想法整理成一套可以直接交给 Codex 开发的前置文档。

至少包括：

- PRD.md
- TECH.md
- DATA_MODEL.md
- TASKS.md

PRD 说明产品要做什么、第一版做什么、不做什么。

TECH 说明整体技术方案，包括微信小程序、CloudBase、X 消息获取、AI 判断和订阅消息之间怎么连接。

DATA_MODEL 设计数据库和核心字段，同时考虑以后可能加入 Claude、Grok 等其他模型。

TASKS 把开发拆成可以逐步执行的任务，按依赖关系排序。

如果我的需求里存在明显问题，可以指出并给出方案。

不要擅自增加功能。

目标是让 Codex 读完这些文档以后，可以直接开始开发。
```

然后让 Pro 先把整个项目想明白。

![Pro 模型生成的项目文档与开发流程说明](/images/vibe-coding-miniprogram/image-1.png)

我觉得这一步其实挺重要。

因为我负责提需求，Pro 帮我把需求整理成可以执行的东西，最后 Codex 再负责写代码。

### 新建一个文件夹

在等待的过程中，新建一个文件夹，用于项目的存放地，名字就叫resetAI

![在 F 盘新建 resetAI 项目文件夹的文件管理器界面](/images/vibe-coding-miniprogram/image-2.png)

这个文件夹，用于后续的 微信开发者平台 和 Codex

## 02 注册小程序

打开小程序注册页面：https://mp.weixin.qq.com/cgi-bin/wx?token=\&lang=zh\_CN

点击前往注册

![微信小程序注册页面，含前往注册按钮](/images/vibe-coding-miniprogram/image-3.png)

然后填一个没有注册过微信公众平台的邮箱，邮箱验证码、密码等信息

填写完成之后，点击注册，然后我这里选择其他，个人，然后填写完对应的身份信息之后，点击继续

![主体信息登记页面，选择其他与个人类型](/images/vibe-coding-miniprogram/image-4.png)

信息提交之后，前往小程序主页

![信息提交成功并前往小程序的提示弹窗](/images/vibe-coding-miniprogram/image-5.png)

这里的信息填写完之后，找到对应的APPID，打开微信开发者平台需要

![小程序管理后台的小程序开发与发布流程页面](/images/vibe-coding-miniprogram/image-6.png)

复制APPID

![小程序后台设置页，红框标注 AppID 与复制按钮](/images/vibe-coding-miniprogram/image-7.png)

## 03 初始化微信开发者平台

打开微信开发者平台，用微信登录

![微信开发者工具登录窗口，可扫码登录](/images/vibe-coding-miniprogram/image-8.png)

点击加号

![微信开发者工具主界面，红框标注新建项目入口](/images/vibe-coding-miniprogram/image-9.png)

云开发，小程序，把刚刚复制的AppID复制进去，选择我们刚刚创建的文件夹地址：resetAI

![创建小程序项目窗口，填写 AppID 并选择 resetAI 目录](/images/vibe-coding-miniprogram/image-10.png)

创建，基础页面

![微信开发者工具编辑器与模拟器中的基础页面](/images/vibe-coding-miniprogram/image-11.png)

## 04 然后再把文档交给 Codex

等前面的东西确认差不多以后，给 Codex 的提示词反而很短。

![项目开发文档中的流程说明内容](/images/vibe-coding-miniprogram/image-12.png)

我准备直接把 Pro 生成的几份文档放进项目里，然后告诉 Codex：

```Plain Text
当前文件夹，已经是一个基础的微信云开发小程序模板项目,云开发信息如图所示

请先完整读取项目根目录的 reset-dev-docs 中的 
PRD.md、TECH.md、DATA_MODEL.md、TASKS.md，再按 TASKS.md 的依赖顺序开发。 
 
先执行 T00 中可以核验的事项，并建立 T01 项目骨架。缺少 AppID、密钥、订阅模板或其他凭证时，
记录阻塞项，继续完成不依赖这些凭证的任务；不要虚构接口成功或真实测试结果。 
 
功能范围以 PRD.md 为准，不擅自扩展。每完成一个任务，更新 TASKS.md，记录修改、测试结果和未完成项。 
 
未经我明确允许，不购买服务、不删除生产数据、不向真实用户群发、不发布生产版本。
参考mcp： 微信开发者的mcp来调用测试

产品UI图，大致参考我给你的这两种，极简风格。
```

然后就可以让它干了。

![Codex 打开 resetAI 项目后的起始界面](/images/vibe-coding-miniprogram/image-13.png)

这其实就是我现在比较喜欢的一种 Vibe Coding 方式：

**我负责告诉 AI，我到底想做什么。**

**Pro 负责把模糊的想法变成项目方案，Codex 负责真正把项目做出来。**

然后codex就开始苦哈哈的干活（顺便测试一下70%的额度，用Astra Ultra，能坚持多久）

![Codex 执行开发任务时的长对话与代码输出](/images/vibe-coding-miniprogram/image-14.png)

## 05 先别继续加功能，把第一版跑起来

把文档交给 Codex 以后，剩下的事情就简单很多了。

前面 PRD、技术方案、数据结构这些已经确定好了，所以这里我没有继续跟它聊一大堆需求。

就让它按照 `TASKS.md` 往下执行。

![Codex 中按 TASKS.md 逐项执行的任务清单](/images/vibe-coding-miniprogram/image-15.png)

打开微信开发者平台，如果前面没有出问题，这个时候应该已经可以看到第一版页面了。

![微信开发者工具中显示的小程序第一版页面](/images/vibe-coding-miniprogram/image-16.png)

首页先只展示 Codex，最近一次什么时候重置、当前状态、最近一条消息，能正常显示就行。

我给 Codex 又补了一句话：

> 先把完整链路做完，然后单独给一份测试文档，我让glm或者deepseek去测试，然后把测试结果给你你再去修！
> 
> 

![Codex 完成开发后的文件变更与提交记录](/images/vibe-coding-miniprogram/image-17.png)

为什么要这样呢？因为太费额度了！不够用的，只能上备用的 Workbuddy里的deepseek 4.1了！

![安排用 deepseek 4.1 执行测试的说明页面](/images/vibe-coding-miniprogram/image-18.png)

所以，以我个人经验来看，我也推荐这样的工作流。

让GPT 6负责写核心部分，剩下的各种测试，让GPT生成详细的测试文档，然后用deepseek或者其他比较便宜的模型去测试！

## 06 测试

workbuddy执行完成之后，会生成一份回执涵

![WorkBuddy 执行完成后生成的回执函内容](/images/vibe-coding-miniprogram/image-19.png)

复制这个文件路径，到codex里，给codex说

```Plain Text
已经执行好了，文件目录在：××××××××
```

![把回执文件路径交给 Codex 的对话](/images/vibe-coding-miniprogram/image-20.png)

接下来的流程就是，继续测试，继续修复！

直到，codex说所有测试用例通过

![Codex 确认所有测试用例通过](/images/vibe-coding-miniprogram/image-21.png)

## 07 看一下成品

到这里，第一版【重置来了】差不多就完成了。

它现在做的事情其实特别简单。

**看 Codex 最近什么时候重置；看之前的重置记录；自动盯 Tibo 的消息；发现新的 Reset以后提醒我。**

就这些。

![手机模拟器中的重置来了小程序页面](/images/vibe-coding-miniprogram/image-22.png)

第一版我没有继续往里面塞其他东西，Claude、Grok这些后面再去加。

不过先把 Codex 这一条链路跑通，再考虑后面的。

## 总结

开发整体流程是：

让 Pro 帮我把 PRD 和技术方案整理出来，再把文档交给 Codex，让它完成核心功能，生成测试用例，交给deepseek去执行。

最后真的能跑起来就行。

等【重置来了】备案通过、正式上线以后，我也会把小程序放出来。

![小程序设置页面，显示重置方法等选项](/images/vibe-coding-miniprogram/image-23.png)

下一次 Codex 再 Reset，**希望这次，是它先告诉我。**
