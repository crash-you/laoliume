---
title: "解决Codex的【Selected model is at capacity】问题"
description: "佬刘记录自己遇到模型容量报错后的排查过程：先换对话或模型，再检查网络、时区、登录设备，并附上联系支持时使用的申诉范例。"
date: "2026-11-05"
slug: "codex-selected-model-at-capacity"
published: true
---

大家好，我是佬刘。

在做自媒体这段时间，一直还在边做AI plus相关服务，这么久以来，我遇到的最多的客户来问我的问题就是：

> Selected model is at capacity. Please try a different model.

![Codex 显示 Selected model is at capacity](/images/codex-selected-model-at-capacity/step-01.jpg)

而且这个问题最恶心的地方在于，不管是新号还是老号，是plus还是pro，是菲区卡充还是美区直充，都会遇到这个问题！

没错，就这么离谱！

**一开始，我以为是 OpenAI 那边的问题。**

报错写的是模型满了，我就以为是服务器不够用，大家都一样，等等就好。

直到我开了一个小号。

**新注册的免费小号，跑得巨流畅。我充了 100 刀的老号，还是隔几步就报错。**

![免费账号和付费账号运行任务的体验对比](/images/codex-selected-model-at-capacity/step-02.png)

那一刻我才反应过来：

**这可能根本不是服务器的问题，而是 Codex 的风控，把我的账号给限制了。**

就跟 Claude 封号一样。

但 Claude 封号，封了就是封了；Codex 它不封你，就这么恶心你，限制你。

钱照扣，活干不了。

说实话，太恶心了！

但气归气，活还得干。

于是我开始想办法解决这个问题。

> **从第一次报错到彻底解决，前后差不多一个月。**

其中真正下决心去解决，花了我一个星期，到处问、到处查，一步步试。

解决之后，现在已经能**流畅使用了，至今没有出现任何问题。**

![恢复后继续运行的 Codex 任务](/images/codex-selected-model-at-capacity/step-03.png)

我把自己走通的整套流程，一步一步写了出来。

```text
这篇会讲两部分：
快速解决：一两分钟搞定，马上继续干活
新开一个对话，在新对话里发一句「接受xx的任务」，让它把报错那个对话的活接过来。
换一个模型，报错原话本身就让你这么做。
长期解决：一劳永逸，从根上解决
检测网络环境，换一个高质量节点
把电脑和浏览器的时区，改成跟节点一样
给 OpenAI 写申诉（附我用的英文原文，复制就能用）
在 ChatGPT 官网退出所有设备
只在网页端登录一次
静置三小时，再打开 Codex
```

每一步在哪点、填什么，我都写清楚了。

大家可以照着自己做，相对来说还挺简单的，没有 Claude 那么复杂。

也可以直接把整篇教程发给 AI，让它帮你配置。

# 二.快速解决：先试这两招

这两招不用改任何设置，报错一出来就可以先试。

## 01：新开一个对话

有时候是当前这个对话卡住了，换个新对话就好。

在 Codex 里点左上角的“新对话”（New thread），开一个新对话。

![Codex 左上角的新对话入口](/images/codex-selected-model-at-capacity/step-04.png)

新对话开好以后，不用把任务从头再讲一遍，直接发一句：

> 接接手xx的任务

![复制旧对话的任务链接](/images/codex-selected-model-at-capacity/step-05.png)

xx 换成刚才报错的那个对话的深度链接，它就会把那边的活接过来，接着往下做。

![在新对话中继续原任务](/images/codex-selected-model-at-capacity/step-06.png)

## 02：换一个模型

报错那句话自己就写着：Please try a different model，换一个模型试试。

在 Codex 里点输入框下方显示模型名字的地方，换一个模型，或者把推理档位调低一档。

换完先跑个小任务试试。

能跑就先这么用着，等原来的模型恢复了再换回来。

![Codex 可切换的模型选项](/images/codex-selected-model-at-capacity/step-07.png)

# 三.长期解决：六步走

这两招要是都不管用，或者好了没一会儿又开始报，就说明不是一时卡住，得从根上解决。

下面这 6 步，建议一步一步跟着做，尽量别跳。

## 第 1 步：换高质节点

所有步骤里，节点是最重要的。

后面的时区要跟着节点改，节点一换，时区就得重来。

### 01 检测网络环境

**出口在哪：**

打开魔法，浏览器访问搜索任意一个可以测ip纯净度的

![浏览器查找网络环境检测工具](/images/codex-selected-model-at-capacity/step-08.png)

看一下魔法的地点，以及这个 IP 干不干净（是不是机房、有没有风险标记）。

记住这里的地点我们后面要用，如果看不懂的话，可以截屏给AI帮你看。

![IP 检测结果中的地理位置](/images/codex-selected-model-at-capacity/step-09.png)

### （2）换高质量节点

如果上面查出来 IP 风险高，或者你用的是很多人一起挤的那种，就换节点。

原因是：几千人共用一个出口，里面只要有人在乱用，整段 IP 都会被盯上，你后面再怎么改时区也白搭。

节点推荐选美国的，换质量高一点的，或者还是建议自建节点最稳妥。

## 第 2 步：改设备时区

这是最好用的一步。

理解是：OpenAI 最近会看你的时区。

你的地区在美国，电脑和浏览器却还是北京时间，两边对不上，就容易出现这些报错。

改之前，先把 Codex 完全退出，退出登录。

![Codex 的退出登录入口](/images/codex-selected-model-at-capacity/step-10.png)

### （1）确认城市

就是上一步在 ipinfo 网页上看到的城市和时区。

比如显示的是洛杉矶（Los Angeles），那你就要改成洛杉矶时间。

我的节点在洛杉矶，改的就是这个。

![系统时区选择界面](/images/codex-selected-model-at-capacity/step-11.png)

### （2）改电脑时区

```text
Mac：
系统设置 → 通用 → 日期与时间。
关掉"使用当前位置自动设定时区"。
在"最近的城市"里搜你节点所在的城市，比如洛杉矶，选上。
再去 系统设置 → 隐私与安全性 → 定位服务 → 系统服务（在列表最下面"详细信息"里），把"设定时区"关掉。
不关的话，它可能过一会儿又给你改回北京。
Windows：
设置 → 时间和语言 → 日期和时间。
关掉"自动设置时区"。
时区选你节点对应的那个，美西就选（UTC-08:00）太平洋时间（美国和加拿大）。
改完，看一眼右上角（或右下角）的时间，变成美国时间就对了。
```

### （3）改浏览器时区

网页版也要改。

浏览器不一定跟着系统变，要单独处理。

## 第 3 步：给 OpenAI 写申诉

环境弄干净了，再去申诉。

顺序反过来的话，申诉恢复了，你一登录又是老样子。

申诉入口：

帮助中心：https://help.openai.com/ ，登录后点右下角的聊天气泡，选发消息给客服。

![OpenAI 帮助中心的联系入口](/images/codex-selected-model-at-capacity/step-12.png)

申诉表单：https://openai.com/form/appeal/ ，页面标题是"提交申诉或举报未经授权的活动"。

![OpenAI 申诉表单](/images/codex-selected-model-at-capacity/step-13.png)

用你 ChatGPT 账号的邮箱提交，把这段英文直接贴进去：

> I've been using GPT for a long time, and only recently started noticing what feels like a real drop in quality or intelligence. I've always trusted you guys to provide the level of service and quality users should be able to expect. I also genuinely believe that better collaboration between people and AI can help us do better work and, in some small way, make the world a better place.
> 
> So, if there's any chance you can press the 'back to normal effort/model' button on your side, I'd be incredibly grateful.

大意是：我用了很久，最近感觉质量明显下降。

我一直信任你们，也相信人和 AI 好好协作能让世界好一点。

能不能在你们那边帮我调回正常。

**提交一次就够了**，别一天刷好几遍。

## 第 4 步：在 ChatGPT 官网退出所有设备

1. 浏览器打开 chatgpt.com，登录。
2. 点左下角头像 → 设置（Settings）。
3. 找到"安全"（Security）。
4. 点"退出所有设备"（Log out of all devices），确认。

这样你手机、电脑、Codex 里的登录会全部被踢掉。

顺手可以在同一页做两件事：**改一个新密码**，**把双重认证关掉再重新打开**。

这两步跟退出所有设备是配套的，一起做。

按钮位置以后可能会变，找不到就在设置里翻一翻"安全"相关的。

![ChatGPT 安全设置中的设备管理](/images/codex-selected-model-at-capacity/step-14.png)

## 第 5 步：只在网页端登录一下

退出所有设备以后，**先只在浏览器里**重新登录 chatgpt.com。

登录前再确认一遍：魔法开着、走的是固定节点、浏览器时区是美国。

登进去以后随便发一句话，能正常回复就行。

这时候**先别打开 Codex**，也别在手机上登。

## 第 6 步：静置三小时

这一步最难，因为你会忍不住想试。

网页登录完，就放着，三个小时左右别碰 Codex。

我建议你晚上睡前做这几步。

**睡一觉，三个小时就过去了，第二天醒来直接就能用，不用干等。**

三小时以后：

1. 打开 Codex。
2. 如果它还挂着旧登录，先退出账号，再用 ChatGPT 账号重新登录。
3. 跑一个小任务试试。

恭喜你，走完这一步，你的 Codex 大概率已经恢复正常了。

如果还没有恢复，可以检查一下上面哪一步漏做了，或者换个高质量的魔法重新再来一遍。

# 最后

这个问题是目前普遍问题，和新号老号，充值地区，充值渠道，等等没有任何关系

纯粹是个黑盒。

不过以上解决办法还是很简单的，大家照做，基本不到一天就能完全解除了！
