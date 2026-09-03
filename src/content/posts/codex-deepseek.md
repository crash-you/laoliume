---
title: "Codex接入DeepSeek完整教程：接入第三方模型，配置V4 Flash、Pro与Vision"
description: "给 Codex 接入第三方模型：DeepSeek V4 Flash、V4 Pro 与 Vision 的完整配置教程。"
date: 2026-09-02
slug: "codex-deepseek"
published: true
---

Codex接入DeepSeek，本质上就是给Codex接入第三方模型，也可以理解为Codex接入国产模型的一种官方方案。

配置完成以后，Codex CLI、ChatGPT桌面版和VS Code里的Codex扩展，都可以调用DeepSeek V4 Flash、V4 Pro，以及最新上线的V4 Flash Vision Exp视觉模型。

大家好，我是佬刘。

前两天，我刚把Codex从下载安装到登录、AGENTS\.md、Memories、Skill、MCP和并行开发完整写了一遍。

还没有安装Codex的，可以先看上一篇：

[万字长文｜Codex 使用指南：登录、接码、记忆、Skill、MCP、并行开发详解（附codex安装包）](https://mp.weixin.qq.com/s/rEsTLCh5uNVQUYfbh6i5EQ)

今天继续往下！把DeepSeek接入Codex！

为什么要接入呢？因为ChatGPT有点贵，而deepseek很便宜。那么我用顶级Codex 作为框架 加上我不那么智能的模型，能不能弥补模型的缺陷呢？

这一次不需要中转站，也**不用**安装乱七八糟的第三方插件。

DeepSeek现在已经**原生支持**的API，并且单独提供了Codex官方接入教程和一键配置脚本。

目前可以接入Codex的DeepSeek模型一共有三个：

deepseek\-v4\-flash

deepseek\-v4\-pro

deepseek\-v4\-flash\-vision\-exp

最后一个就是DeepSeek在2026年8月21日刚刚上线的视觉模型，可以直接处理图片输入。

旧教程里常见的`deepseek-chat`和`deepseek-reasoner`已经停止使用，当前接入时不要再填写这两个旧模型名。

![image\.png](/images/codex-deepseek/image-11.png)

![image\.png](/images/codex-deepseek/image-28.png)

下面从API Key创建、模型选择、一键配置、接入验证、视觉模型、价格、常见报错到恢复原配置，完整走一遍。

## 一、Codex接入DeepSeek，改变了什么？

接入DeepSeek以后，Codex还是原来的Codex。还是那个地表最强“agent”，依然可以做原生的所有功能，比如读取本地项目、修改查找文件等等，发生变化的是Codex背后的模型。

原来的调用链路是：

打开codex，发送指令，codex读取项目、调用工具，gpt的模型理解任务并生成方案，Codex修改文件、运行命令。

现在则变成了：打开codex，发送指令，codex读取项目、调用工具，DeepSeek模型理解任务并生成方案，Codex修改文件、运行命令、验证。

![ChatGPT Image 2026年8月28日 22\_24\_17\.png](/images/codex-deepseek/ChatGPT-Image-2026%E5%B9%B48%E6%9C%8828%E6%97%A5-22_24_17.png)

Codex负责和本地项目、终端以及开发环境打交道，DeepSeek负责理解任务、推理和生成代码。

ChatGPT官方对Codex的定位，也是让它在本地仓库中检查代码、编辑文件并运行电脑上已经安装的开发工具。

DeepSeek则通过 API，作为新的模型接入Codex。

而且Codex CLI、ChatGPT桌面版，共用同一份`~/.codex/config.toml`配置。

配置一次，三个客户端都能生效，不需要分别填写三遍。

需要注意的是：

**Codex接入DeepSeek以后，消耗的是DeepSeek API余额。**

ChatGPT Plus、Pro或者其他ChatGPT订阅，不能抵扣DeepSeek API产生的费用。每次调用产生的Token费用，会从DeepSeek账户的赠送余额或充值余额中扣除。

## **二、接入之前需要准备什么？**

既然基础知识扫盲已经结束。

那么在接入之前我们应该先准备以下内容：

### 1、已经安装好的Codex

Codex CLI、ChatGPT桌面版或者VS Code Codex扩展都可以。

但是**至少要启动过一次**。

### 2、检查Codex版本

打开PowerShell，如果不知道怎么找，可以直接在底部搜索框输入 powershell：

![image\.png](/images/codex-deepseek/image-21.png)

输入：

codex \-\-version

![image\.png](/images/codex-deepseek/image-4.png)

当前DeepSeek官方模型目录要求Codex客户端版本不低于： 0\.144\.0

如果你的版本低于`0.144.0`，打开chatGPT软件，左下角这里会有一个蓝色的更新按钮，更新一下，，再继续操作。

![image\.png](/images/codex-deepseek/image-27.png)

### 3、DeepSeek API Key

API Key不是DeepSeek网页版的账号密码。

它是调用DeepSeek API时使用的身份凭证，通常以 sk\- 开头

获取方式：

打开deepseek官网：https://www\.deepseek\.com/

![image\.png](/images/codex-deepseek/image-15.png)

点击API开放平台，按照流程注册实名好之后，会看到一个这样的页面

![image\.png](/images/codex-deepseek/image.png)

点击API Keys，点击创建 API Key

![image\.png](/images/codex-deepseek/image-23.png)

输入一个可以正常识别的名称（方便你后续知道这个Key的工作内容是什么），比如 **接入Codex**

![image\.png](/images/codex-deepseek/image-16.png)

点击创建，成功后，会返回给你一个sk开头的key，注意注意！这个key只会出现一次！！也不要让任何人拿到你的key！任何拿到Key的人，都有可能消耗你的DeepSeek余额！

![image\.png](/images/codex-deepseek/image-10.png)

复制下来，这样Deepseek API Key就已经准备好了。

### 4、DeepSeek API余额

接入完成后，每次让Codex调用DeepSeek，都会产生Token费用（token可以理解为deepseek运行需要交的佣金）

账户没有可用余额时，会直接返回：

402 Insufficient Balance

DeepSeek账户的可用余额由充值余额和未过期赠送余额组成。

![image\.png](/images/codex-deepseek/image-26.png)

## 四、Windows一键配置Codex接入DeepSeek

Windows用户打开PowerShell。

**注意是PowerShell，不是CMD。**

在开始配置前，先彻底关闭正在运行的：

- Codex CLI； 

- ChatGPT桌面版； 

- VS Code里的Codex扩展页面。 

然后在PowerShell中运行DeepSeek官方提供的一键配置命令：

irm https://cdn\.deepseek\.com/api\-docs/codex\-deepseek\-setup\-en\.ps1 \| iex

![image\.png](/images/codex-deepseek/image-2.png)

这条命令会从DeepSeek官方CDN下载并运行Codex配置脚本。

按下回车以后，会出现模型选择菜单。

当前菜单对应关系如下：

![image\.png](/images/codex-deepseek/image-18.png)

第一次接入，建议输入 1：

![image\.png](/images/codex-deepseek/image-9.png)

选择：deepseek\-v4\-flash

Flash速度更快，价格更低，适合先确认整个过程能不能正常运行。

等后面遇到复杂重构、跨模块排错或者长链路任务，再切换到V4 Pro。

需要让Codex读取截图、设计稿和页面图片时，再切换到Vision Exp。

切换也很简单！codex中直接选择就行！

![image\.png](/images/codex-deepseek/image-13.png)

输入模型编号以后，脚本会要求填写DeepSeek API Key。

把刚刚创建的、以`sk-`开头的API Key粘贴进去。

![image\.png](/images/codex-deepseek/image-1.png)

enter！

![image\.png](/images/codex-deepseek/image-6.png)

这样说明格式配置验证成功。

如果格式验证失败，脚本会直接停止，不会继续写入错误配置。

## 五、macOS和Linux怎么配置？

macOS和Linux用户打开终端，运行：

```Plain Text
bash <(curl -fsSL https://cdn.deepseek.com/api-docs/codex-deepseek-setup-en.sh)
```

后面的选择方式和Windows一致：

1 = deepseek\-v4\-flash

2 = deepseek\-v4\-pro

3 = deepseek\-v4\-flash\-vision\-exp

9 = 恢复原配置

第一次运行时，需要输入DeepSeek API Key。

配置完成以后，关闭并重新启动Codex。

## 六、怎么确认Codex真的接入DeepSeek成功了？

脚本显示成功，只能说明配置文件已经写入好了，但是我们还要看codex是否真的读取了这份配置！

### 方法一：查看Codex CLI启动页面

完全退出codex，然后重新打开PowerShell。

先进入一个真实项目目录：

比如  

> cd "F:\\null2\\desktop\\oldLiu\\My\-Thing"
> 
> 

![image\.png](/images/codex-deepseek/image-3.png)

然后运行： 

```Plain Text
codex 
```

如果让你勾选是否信任此项目，选择信任即可

![image\.png](/images/codex-deepseek/image-20.png)

只要启动横幅中的模型名称已经变成DeepSeek，配置就已经生效。

进入Codex以后，还可以输入：

```Plain Text
/status
```

查看当前会话正在使用的模型、目录和权限设置。

![image\.png](/images/codex-deepseek/image-17.png)

可以尝试问一下，你是什么模型？

![image\.png](/images/codex-deepseek/image-5.png)

### 方法二：查看ChatGPT桌面版

打开ChatGPT桌面版，进入Codex。

你就会惊奇的发现，codex下方模型选择处，已经变为deepsek模型了！

![image\.png](/images/codex-deepseek/image-30.png)

也有部分可能会显示 Custom ，不代表接入失败，当前实际调用的，仍然是配置文件中选择的DeepSeek模型。

### 方法三：查看DeepSeek API用量

在Codex里真正执行一次任务。

任务完成以后，重新打开DeepSeek开放平台，查看余额或API用量。

只要余额发生变化，或者后台出现对应调用记录，就能确认这次任务确实通过DeepSeek API完成。

![image\.png](/images/codex-deepseek/image-24.png)

## 七、不要只问你是什么模型，直接拿真实项目测试

很多接入教程最后只测试一句：

你好，你是什么模型？

这个验证没有太大意义。

模型回复自己叫DeepSeek，不等于它已经能够正常读取项目、修改文件和调用工具。

更直接的方式，是先让它只读一个真实项目。

把下面这段提示词发给Codex：

先只读当前项目，不要修改任何文件。



请完成以下任务：



1. 判断这是一个什么项目；

2. 找到项目的入口文件；

3. 找到项目的启动命令；

4. 梳理主要目录和核心模块；

5. 找出当前最值得优先处理的三个问题；

6. 每个判断都标出对应的文件路径。

    

不要根据文件名直接猜测，先阅读相关代码再回答。

然后codex，就会苦哈哈的执行任务了

![image\.png](/images/codex-deepseek/image-14.png)

经过一段时间思考执行，最终输出

![image\.png](/images/codex-deepseek/image-19.png)

![image\.png](/images/codex-deepseek/image-12.png)

确认读取项目没有问题以后，再让它完成一个最小改动：

现在完成一个最小改动：



【在这里填写你的真实任务】



要求：



1. 修改前先给出执行计划；

2. 只修改与任务直接相关的文件；

3. 不要重构无关代码；

4. 修改完成后运行现有测试；

5. 没有测试时，启动项目进行验证；

6. 如果验证失败，继续定位原因；

7. 最后列出修改文件、执行命令、验证结果和仍然存在的问题。

第一次测试不要直接交给它一个特别大的任务。

可以选择新建一个文件

![image\.png](/images/codex-deepseek/image-25.png)

## 八、DeepSeek V4 Flash、V4 Pro和Vision怎么选？

DeepSeek目前为Codex提供三个模型。

三个模型当前都支持：

- 1M上下文； 最高384K输出；  

- 思考模式与非思考模式。 

思考模式默认开启，默认推理等级为`high`。

日常思路，推荐使用 flash ； 遇到任务比较复杂的，选择 pro ；遇到需要deepseek理解图片的内容，选择 vision模型

这里要特别说一下：

DeepSeek官方在2026年8月21日上线了这个实验性多模态模型。它的纯文字能力与V4 Flash处于同一水平，同时增加了图片理解能力，支持Chat Completions、Messages和Responses三种接口。

## 九、Codex接入DeepSeek不能识别图片，怎么办？

先检查当前使用的模型，下面两个模型只能处理文字：

> deepseek\-v4\-flash 
> 
> deepseek\-v4\-pro
> 
> 

如果想要默认为视觉理解模型，可以在前一步配置codex 的时候，默认选择 3 deepseek\-v4\-flash\-vision\-exp 模型

也可以直接在codex里选择  deepseek\-v4\-flash\-vision\-exp 选项。

![image\.png](/images/codex-deepseek/image-29.png)

## 十、Codex接入DeepSeek需要多少钱？

DeepSeek API按照输入和输出Token数量计费。

当前价格单位均为：

每100万Token

### DeepSeek V4 Flash

### DeepSeek V4 Pro

### DeepSeek V4 Flash Vision Exp

Vision Exp和普通Flash采用相同的文字Token价格。

以上是官方价格，不过其实不做中转的话，不用管这么多，毕竟 deepseek 本身的价格已经足够低，而且计算缓存命中率、输入输出价格，没有意义。

最直接的方法，仍然是记录任务开始前后的余额变化。

## 十一、怎么切换DeepSeek模型？

重新运行同一条官方命令：

```Plain Text
irm https://cdn.deepseek.com/api-docs/codex-deepseek-setup-en.ps1 | iex
```

然后重新选择：

![image\.png](/images/codex-deepseek/image-22.png)

脚本会更新默认模型。

切换完成以后，重新启动Codex。

## 十二、怎么恢复原来的Codex配置？

重新运行：

```Plain Text
irm https://cdn.deepseek.com/api-docs/codex-deepseek-setup-en.ps1 | iex
```

选择 9 

![image\.png](/images/codex-deepseek/image-7.png)

输入y，代表yes。

脚本会移除DeepSeek相关配置，并恢复接入前备份的Codex配置。完成以后，彻底关闭并重新启动Codex或ChatGPT桌面版。

**注意：需要再次重新授权登录chatGPT**

截至到这里，我们已经完全走通了一遍，在codex里接入第三方模型deepseek。

接下来说一下优缺点

## 十三、Codex接入DeepSeek的优缺点

### 优点一：官方直接支持

DeepSeek已经原生支持API，并且针对Codex提供了单独的接入文档、模型目录和一键配置脚本。

**不需要自己搭建中转服务。**

开盒即用！！

### 优点二：配置一次，多端生效

Codex CLI、ChatGPT桌面版和VS Code Codex扩展，共用同一份配置。

不需要每个客户端重复配置。

### 优点三：可以按任务选择模型

日常任务使用Flash。

复杂任务切换Pro。

需要看图时切换Vision Exp。

不同任务不必一直使用同一个模型。

### 优点四：API用量可以单独查看

DeepSeek后台可以查看余额和调用情况。

每完成一个任务，都可以记录实际消耗。

### 缺点一：需要单独支付API费用

ChatGPT订阅不能抵扣DeepSeek API余额。

账户余额不足时，任务会直接失败。

### 缺点二：不是100%完整兼容GPT API

DeepSeek目前支持Responses API的核心能力，但并不是所有参数和内置工具都完全支持。

部分不支持的参数会被静默忽略，不一定直接报错。

因此，接入成功不等于所有高级功能都能和OpenAI官方模型保持完全一致。

![image\.png](/images/codex-deepseek/image-8.png)

### 缺点三：视觉模型仍处于实验阶段

Vision Exp已经可以读取图片，但名称中仍然包含`exp`（实验！！）

涉及重要界面、数据图表和科研图片时，需要再次核对识别结果。

### 缺点四：默认脚本会把API Key写进配置文件

使用官方一键脚本以后，API Key默认以明文形式保存在`config.toml`。

不要上传或公开这个文件。

## 最后

Codex接入DeepSeek，不是重新安装一套AI编程工具。

Codex 作为壳子，依然负责读取项目、修改文件、调用命令和验证。

DeepSeek 则作为新的模型提供商，负责理解任务、推理和生成代码。

现在的选择也很清楚：

```Plain Text
日常开发：DeepSeek V4 Flash
复杂任务：DeepSeek V4 Pro
图片任务：DeepSeek V4 Flash Vision Exp
恢复官方模型：重新运行脚本并选择9
```

而且现在已经不需要照着旧教程，手动修改一堆过时的模型名称。

DeepSeek官方已经把模型目录、配置备份、模型切换、视觉能力和恢复入口全部放进了一键脚本里。

配置成功只是第一步。

真正值得对比的是，同一个项目、同一条任务，Codex官方模型、DeepSeek V4 Flash和DeepSeek V4 Pro：

谁改得更准？谁返工更少？谁运行验证更完整？谁的实际成本更低？

AI编程工具好不好用，最终还是要落到同一件事情上：

**它到底有没有把任务真正做完。**
