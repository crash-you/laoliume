---
title: "Codex 反复 Reconnecting 或重连 5 次怎么办？排查本机代理配置"
description: "Codex Desktop 能登录，发消息却多次重连并提示 request timed out。本文记录使用本机代理时如何定位端口和协议、更新代理配置，再重启客户端。"
date: "2026-09-26"
updated: "2026-11-09"
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



![发送消息后，Codex 显示“正在重新连接 5/5”和 request timed out](/images/codex-reconnecting-fix/image-1.png)

如果你用的是本机代理，可以先查 **Codex 用的代理端口和协议**。下面是我排查这个场景时用的提示词。

## 解决方法

如果新开的 Codex 窗口可以收发消息，把这段提示词贴进去，让它先找出本机实际使用的端口，再更新配置。

```Plain Text
帮我修复 Codex Desktop 一直 Reconnecting 的问题。

请先确认我本机代理的协议和实际端口。如果有 HTTP 或 mixed 端口，把下面两行里的 PORT 换成查到的端口号，再写入 ~/.codex/.env。保留文件里的其他配置。如果只找到 SOCKS 端口，请告诉我，不要套用下面的 HTTP 配置。

HTTP_PROXY=http://127.0.0.1:PORT
HTTPS_PROXY=http://127.0.0.1:PORT

写入后检查配置是否正确，并告诉我需要如何重启 Codex Desktop。
```

![解决方法，原文配图 2](/images/codex-reconnecting-fix/image-2.png)

修改完成后：

1. 完全退出 Codex

2. 打开任务管理器

3. 结束 Codex 后台进程

4. 重新打开



