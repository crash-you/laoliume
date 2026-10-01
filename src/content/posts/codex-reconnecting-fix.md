---
title: "Codex重连5次怎么办？一段提示词自动修复 Reconnecting 问题（2026最新）"
description: "Codex Desktop 一直 Reconnecting 或 request timed out 时，通过提示词定位本机代理端口与协议，更新代理配置，再退出后台并重启。"
date: "2026-09-26"
slug: "codex-reconnecting-fix"
published: true
---

大家好，我是佬刘。

最近很多朋友在使用 Codex 的时候，遇到了一个非常头疼的问题。

就是打开 Codex 可以正常登录，但是一发送消息，就一直显示：

> Reconnecting
> 
> 

或者：

> request timed out
> 
> 



![Codex重连5次怎么办？一段提示词自动修复 Reconnecting 问题（2026最新），原文配图 1](/images/codex-reconnecting-fix/image-1.png)

大部分情况下，大概率是 **Codex 和本地配置之间的连接出现了问题。**

## 解决方法

不要自己手动找。

直接复制下面这段话：



复制这段指令新开个codex窗口发给它就行，让codex自己修复

```Plain Text
帮我修复 Codex Desktop 一直 Reconnecting 的问题。

请定位我本机正在使用的代理端口和代理协议，然后创建或更新 ~/.codex/.env，写入以下代理配置。不要写死端口，请替换成实际端口；如果文件已经存在，保留其他配置。

HTTP_PROXY=“http://127.0.0.1:<HTTP 或 mixed 端口>”
HTTPS_PROXY=“http://127.0.0.1:<HTTP 或 mixed 端口>”

写入后检查配置是否正确，并告诉我需要如何重启 Codex Desktop。
```

![解决方法，原文配图 2](/images/codex-reconnecting-fix/image-2.png)

修改完成后：

1. 完全退出 Codex

2. 打开任务管理器

3. 结束 Codex 后台进程

4. 重新打开



