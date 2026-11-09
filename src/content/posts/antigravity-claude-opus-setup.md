---
title: "Claude又封号？我在谷歌Antigravity里用上了Opus 5.5！附完整教程"
description: "从下载和安装 Google Antigravity 开始，记录账号登录、扫码和年龄验证的处理过程，以及在模型菜单里选择 Claude Opus 5.5 的步骤。"
date: "2026-11-04"
slug: "antigravity-claude-opus-setup"
published: true
---

大家好，我是佬刘。

想必大家都想用Claude，但是但是，这个公司不知道早年在国内受到多大委屈，只要检测出，就立马封号不解释！

![Claude 账号访问受限的提示](/images/antigravity-claude-opus-setup/step-01.jpg)

看到这种界面，我估计不少人都要骂娘了。

所以我们只能退而求其次，去用中转站，但是给你的是豆包，还是deepseek，咱们就不知道了。

而我自己平时就喜欢用 AI 写项目，Claude Opus 系列也是我常用的模型之一，尤其现在gpt经常不说人话。

所以，我一直在找一种能让我使用 Claude 模型，又不用单独折腾 Claude 官方账号的方法。

今天就给大家介绍一个我自己在用的工具。

**Google Antigravity。**

在 Antigravity 里面，可以使用 Claude Opus 5.5、Claude Sonnet 5.5 等模型。

![Antigravity 可选的模型列表](/images/antigravity-claude-opus-setup/step-02.png)

最关键的是，符合使用条件的个人用户可以通过 Google 账号登录，不需要通过Claude官方。

下面就把安装和使用方法整理出来。

## 一、Antigravity 是什么？

Antigravity 是 Google 家的一款 AI 编程工具。

如果用过 Codex、Claude Code，那么理解起来就容易了，就是另外一个agent工具

我自己平时用 Antigravity，主要就是opus 5.5来帮我写文案。

Google 目前已经在 Antigravity 中提供：Claude Opus 5.5  和 Claude Sonnet 5.5 

这就意味着，我们可以在 Antigravity 中选择opus 5.5 来执行任务。

官方模型列表：[https://antigravity.google/docs/models](https://antigravity.google/docs/models)

## 二、下载安装 Antigravity

我现在用的是 Mac，所以这次就以 macOS 为例来讲。

首先打开 Antigravity 官网：

[https://antigravity.google/download](https://antigravity.google/download)

![Google Antigravity 下载页面](/images/antigravity-claude-opus-setup/step-03.png)

Antigravity 目前支持 macOS、Windows 和 Linux。

Mac选择Apple Silicon版本，Windows根据系列选择对应版本即可

![Mac 和 Windows 的安装包选择](/images/antigravity-claude-opus-setup/step-04.png)

Mac 用户在下载的时候，需要注意自己的芯片类型。

**Download for Apple Silicon**：适用于 M1、M2、M3、M4 等苹果芯片的 Mac。

**Download for Intel**：适用于 Intel 处理器的 Mac。

如果不知道自己的 Mac 用的什么芯片，可以点击屏幕左上角的苹果图标，选择「关于本机」，查看芯片信息。

![关于本机里显示的芯片类型](/images/antigravity-claude-opus-setup/step-05.png)

点击下载Apple Silicon版本之后，就会在右上角提示下载中

![浏览器中的安装包下载进度](/images/antigravity-claude-opus-setup/step-06.png)

移动到应用程序

![将 Antigravity 移到应用程序文件夹](/images/antigravity-claude-opus-setup/step-07.png)

完成安装

![安装后的 Antigravity](/images/antigravity-claude-opus-setup/step-08.png)

如果之前安装过旧版本，系统弹出是否替换的提示，选择替换即可。

## 三、登陆Antigravity

这个是重中之重

首次启动会进入账号登录流程。

点击登陆，

![Antigravity 登录入口](/images/antigravity-claude-opus-setup/step-09.png)

这里一定一定要注意，去跳转到谷歌去登陆！！

![在浏览器中继续 Google 登录](/images/antigravity-claude-opus-setup/step-10.png)

继续

![Google 账号登录的继续按钮](/images/antigravity-claude-opus-setup/step-11.png)

跳转到antigravity

![由浏览器返回 Antigravity](/images/antigravity-claude-opus-setup/step-12.png)

然后就遇到错误

![登录时遇到的错误提示](/images/antigravity-claude-opus-setup/step-13.png)

哈哈哈哈，这个坑，我们是大概率要踩的

因为antigravity对网络要求非常严格，所以我们需要给我们的魔法，设置为

Tun

![网络工具的 TUN 设置](/images/antigravity-claude-opus-setup/step-14.png)

然后再推出，重新走一遍上面的流程

然后你就会惊奇的发现，登上来了！

![调整后成功登录的页面](/images/antigravity-claude-opus-setup/step-15.png)

选择一系列指引后，然后进入主界面

![首次设置后的工作界面](/images/antigravity-claude-opus-setup/step-16.png)

当然，我这个号是free，目前还没有pro会员。

接下来是充值pro会员

## 四、充值pro

我们可以去鱼，或者其他地方，去搜索对应的Gemini，去买pro会员

但是一定要注意的是，Gemini的pro有很多种

一种是类似 jio活动、学生一年pro等等的，这种属于试用版，是没有opus 5.5的

![试用方案显示的可选模型](/images/antigravity-claude-opus-setup/step-17.png)

第二种就是Gemini ultra，Gemini pro（付费）以及enterprise，这三种是可以用到opus 5.5的

![付费方案下的模型选择](/images/antigravity-claude-opus-setup/step-18.png)

也可以在我的小店去购买

![会员服务的选择页面](/images/antigravity-claude-opus-setup/step-19.png)

这三种都可以正常使用antigravity里的4 argon和5.5！

**注意：三种方式不会影响谷歌账号本身，但是如果是新号的话容易被异地登陆风险**

使用之前注意

![激活前的使用说明](/images/antigravity-claude-opus-setup/step-20.png)

接下来输入对应的信息即可

![激活页面的信息填写区](/images/antigravity-claude-opus-setup/step-21.png)

等待激活

![正在处理的激活请求](/images/antigravity-claude-opus-setup/step-22.png)

激活成功

![激活成功提示](/images/antigravity-claude-opus-setup/step-23.png)

回到谷歌网页版Gemini

![Gemini 网页版的会员状态](/images/antigravity-claude-opus-setup/step-24.png)

成功！

登陆antigravity！over！！

![Antigravity 登录后的工作区](/images/antigravity-claude-opus-setup/step-25.png)

当然这篇教程，原本是计划到这里，但是但是，在我自己实操的过程中，遇到了若干问题，其中下面这个问题最最最常见！

所以临时决定，再写一下对应的解决办法！

## 五、解决Google 手机扫描二维码问题

接下来，到这里，肯定会有很多人，遇到一个问题，就是

![Google 登录要求扫码验证](/images/antigravity-claude-opus-setup/step-26.png)

这里先尝试用手机的**原生相机**扫码，有概率不需要发送短信就能完成验证（比如xiaomi）。（**当然记得打开魔法**）

如果是正常浏览器扫码，会让你发短信、短信要么发不出去，要不然发出去没反应

![扫码后的短信验证提示](/images/antigravity-claude-opus-setup/step-27.jpg)

焚决！：用手机/ipad下载Google app，打开手机设置里的谷歌服务选项，在Google app里登录一个正常的谷歌账号，用google app内部的扫码功能扫码即可。

在手机设置里搜索“谷歌基础服务管理”，打开选项

**注意注意！！！一定一定要是 Google app，而不是chrome！！！**

单独的chrome没有搜索功能！

![手机端 Google 和 Chrome 的区别](/images/antigravity-claude-opus-setup/step-28.png)

打开谷歌基础服务管理（不同手机可能叫法不一样，但是大概都是谷歌xxxxx）

![手机系统中的 Google 基础服务设置](/images/antigravity-claude-opus-setup/step-29.png)

应用商店下载google

![应用商店里的 Google 应用](/images/antigravity-claude-opus-setup/step-30.png)

**登录一个正常的谷歌账号**，用自己的注册的一般可以（至于用这个反重力登录需要验证的账号行不行，没试过）

打开谷歌APP，选择相机扫码（记得打开魔法）

![Google 应用里的相机扫码入口](/images/antigravity-claude-opus-setup/step-31.png)

看到这个界面，基本稳了，点是，继续，就会显示通过验证

![在手机上确认验证操作](/images/antigravity-claude-opus-setup/step-32.png)

如果显示还是要发短信，基本寄了，换节点、换谷歌账号登录google app、换设备，一直重试，总能成功的。

![扫码验证流程的后续提示](/images/antigravity-claude-opus-setup/step-33.png)

如果通过了会显示身份认证成功

![身份验证成功的确认页面](/images/antigravity-claude-opus-setup/step-34.png)

这时候返回反重力，选择 sign in again，再次登录该谷歌账号即可。

![回到 Antigravity 再次登录](/images/antigravity-claude-opus-setup/step-35.png)

**如果重新登录，仍显示需要verify，**

浏览器显示身份验证成功，但是回到反重力sign in again后，仍然显示需要verify

这是因为反重力需要年龄验证，具体可见https://antigravity.google/docs/faq

![Antigravity 的账号年龄要求](/images/antigravity-claude-opus-setup/step-36.png)

所以验证下年龄即可，打开谷歌验证年龄的地方

可以选择自拍人脸识别验证和上传证件

![可选的年龄验证方式](/images/antigravity-claude-opus-setup/step-37.png)

这里推荐自拍

点击 Take a selfie，会出现一个二维码，这二维码本质就是一个网址，可以使用任意浏览器的扫码功能扫码，或者选择link，会有一个http链接，复制到**手机**的浏览器打开即可，然后进行人脸识别（实测，一张脸可以无限扫）

![自拍验证的移动端二维码入口](/images/antigravity-claude-opus-setup/step-38.png)

认证通过

![年龄验证的完成结果](/images/antigravity-claude-opus-setup/step-39.png)

如果通过了会显示身份认证成功

![Google 显示已完成身份认证](/images/antigravity-claude-opus-setup/step-40.png)

这时候返回反重力，选择 sign in again，再次登录该谷歌账号即可。

![Antigravity 的重新登录入口](/images/antigravity-claude-opus-setup/step-41.png)

## 六、爽用 Opus 5.5

打开 Antigravity，创建一个工作区，或者打开自己已有的项目文件夹。

在 Agent 的对话输入框下方，找到模型选择菜单。

打开之后，可以看到当前账号支持的模型。

找到：**Claude Opus 5.5 (Thinking)**

选择它。

![在模型菜单中选择 Claude Opus](/images/antigravity-claude-opus-setup/step-42.png)

这样，接下来的任务就可以交给 Opus 5.5 执行了。

这里给大家一段可以用于检查项目的提示词。

```text
Read the current project and its README.

First, explain:
1. What this project does.
2. How the main modules work.
3. How to run and test it.
4. Whether there are any obvious problems.

Do not modify any files yet.
Wait for my confirmation before making changes.
```

![设置修改前需要确认的工作方式](/images/antigravity-claude-opus-setup/step-43.png)

至于效果怎么样，大家可以拿自己的项目试一下。

![Antigravity 中运行任务的效果](/images/antigravity-claude-opus-setup/step-44.png)

## 七、Opus 5.5 免费吗？Pro 和 Ultra 有什么区别？

这部分要说清楚。

**Antigravity 中的 Claude Opus 5.5 需要符合条件的付费订阅。**

根据 Google 目前的官方文档：

![Google 文档列出的模型信息](/images/antigravity-claude-opus-setup/step-45.png)

这里有个很坑的地方

有些明明显示自己是 Google AI Pro，打开 Antigravity 后，却找不到 Claude Opus 5.5。

原因可能是你当前的 Pro 属于试用资格。

**Google AI Pro 的试用资格不包含 Opus 5.5。**

## 八、几个常见问题

### 用 Antigravity 调用 Claude，会被封号吗？

这个问题我估计很多人都会关心。

通过 Antigravity 使用 Claude 模型，不需要登录 Claude 官方账号。

所以完全不用担心Claude封号，大家只需要注意自己的谷歌号即可！

### 为什么我找不到 Claude Opus 5.5？

先检查这几个地方。

- Antigravity 有没有更新到支持该模型的版本。
- 当前账号是不是正式付费的 Google AI Pro 或 Ultra。

如果用的是免费版、AI Plus 或 Pro 试用版，就无法使用 Opus 5.5。

### 能不能把 Antigravity 的 Claude 额度给 Claude Code 使用？

答案肯定是否定的哈，当前谷歌对于反向代理风控极其严格，如果被查出来封的就不止是Gemini了，而是谷歌号。

## 最后

写到这里，我真的感觉很无奈了

想用 Claude，担心 Claude 封号。

换到 Google Antigravity 用 Claude，又开始操心 Google 的风控。

现在的 AI 模型都能帮我写代码、开发项目了，结果我们还在研究怎么登录、怎么验证、怎么避免账号被封。

这事多少有点抽象了。。。

不过话说回来，Antigravity 我还是会继续用的，毕竟 Opus 5.5 确实是我喜欢的模型之一。

只不过，账号稳定性这块，，Google之前被薅羊毛薅怕了，现在风控极其严格，谁也不能保证一个账号能一直用下去。

有时候我也在想，什么时候才能不用折腾账号、网络、验证这些东西，打开软件就能安心干活呢？

算了。

希望以后我写 Claude 的时候，能多分享一些用 AI 做出来的项目，少写一点这些账号和登录的破事。

这篇就先写到这里，我继续折腾我的项目去了。

咱们下篇见！
