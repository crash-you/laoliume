---
title: "Codex接入DeepSeek，CCSwitch到底要不要开路由？我终于搞明白了"
description: "Codex 接入 DeepSeek 时，CCSwitch 的路由到底要不要开？从 Responses API 与 Chat Completions API 的区别，理解直连和本地协议转换。"
date: "2026-09-21"
slug: "codex-deepseek-ccswitch-routing"
published: true
---

大家好，我是佬刘。

今天有人问了我一个很有意思的问题：

**为什么网上很多 Codex 接 DeepSeek 的教程，都让打开 CCSwitch 的路由，但他根本没开路由，只填了 API Key 和 Base URL，Codex 一样能正常用？**

![Codex接入DeepSeek，CCSwitch到底要不要开路由？我终于搞明白了，原文配图 1](/images/codex-deepseek-ccswitch-routing/image-1.png)

我一开始也以为这个问题很简单。

后来重新查了一下 CCSwitch 最新版本，才发现：

**网上很多教程其实已经有点过时了。**

先说结论，**现在 Codex 接 DeepSeek，不一定需要开启 CCSwitch 路由。**

到底要不要开，主要看你当前使用的供应商接口，到底是不是 Codex 能直接识别的 Responses API。

## 01 为什么以前接 DeepSeek 经常需要开路由？

Codex 现在主要使用的是chatgpt官方的的 **Responses API**。

但是很多第三方大模型以前提供的是另一套接口：**Chat Completions API。**

![01 为什么以前接 DeepSeek 经常需要开路由？，原文配图 2](/images/codex-deepseek-ccswitch-routing/image-2.png)

虽然看起来都是调用大模型，但两边发送过去的数据格式、返回格式并不完全一样。

比如 Codex 发出去的是：`/responses`

而很多第三方模型提供的是：`/chat/completions`

![01 为什么以前接 DeepSeek 经常需要开路由？，原文配图 3](/images/codex-deepseek-ccswitch-routing/image-3.png)

如果直接把一个只支持 Chat Completions 的接口塞给 Codex，就可能出现报错、模型无法加载、流式输出异常等问题。

这个时候 CCSwitch 的路由就派上用场了。

它相当于站在 Codex 和第三方模型中间，当一个翻译。

大概是：

**Codex → CCSwitch → DeepSeek**

Codex 按照 Responses API 发请求。

![01 为什么以前接 DeepSeek 经常需要开路由？，原文配图 4](/images/codex-deepseek-ccswitch-routing/image-4.png)

CCSwitch 收到以后，把它转换成第三方模型认识的 Chat Completions 格式。

第三方模型返回结果以后，它再转回来交给 Codex。

因此只要你走的是这种本地路由方式，CCSwitch 就需要保持运行。

CC Switch 官方文档目前也仍然保留了这套机制，主要就是为了兼容还没有原生支持 Responses 的第三方供应商。

![01 为什么以前接 DeepSeek 经常需要开路由？，原文配图 5](/images/codex-deepseek-ccswitch-routing/image-5.png)

## 02 那为什么现在 DeepSeek 不开路由也能用？

因为情况变了。

CC Switch 在 3\.19\.1 版本里更新了 DeepSeek 的 Codex 预设。

现在新建的 DeepSeek 供应商已经可以直接使用 Responses API，所以不再必须：

**Codex → CCSwitch → DeepSeek**

而是可以直接变成：**Codex → DeepSeek**

也就是说，CCSwitch 这时候主要负责帮我们管理和写入 Codex 的供应商配置。

配置写好之后，真正调用模型时，Codex 可以直接请求 DeepSeek。

![02 那为什么现在 DeepSeek 不开路由也能用？，原文配图 6](/images/codex-deepseek-ccswitch-routing/image-6.png)

所以你会发现**没有开启路由，DeepSeek 一样可以正常使用。**

这不是 CCSwitch 出 Bug 了，这是现在本来就支持的一种工作方式。

CC Switch 的 3\.19\.1 更新说明里也专门提到了这一点：DeepSeek 预设已经从需要本地路由改成了原生 Responses 直连。

![02 那为什么现在 DeepSeek 不开路由也能用？，原文配图 7](/images/codex-deepseek-ccswitch-routing/image-7.png)

## 03 那CCSwitch的路由是不是没用了？

当然不是。

DeepSeek现在可以直连，只能说明 DeepSeek 这个供应商已经适配了 Codex 的接口。

还有不少第三方模型仍然需要协议转换。

比如部分 Kimi、GLM等供应商，依然可能需要通过 CCSwitch 本地路由才能正常接入 Codex。

![03 那CCSwitch的路由是不是没用了？，原文配图 8](/images/codex-deepseek-ccswitch-routing/image-8.png)

所以路由解决的问题不是**能不能修改 Codex 配置。**

它解决的是**Codex 和第三方模型接口不一样的时候，怎么让两边正常交流。**

理解这一点以后，很多 CCSwitch 教程一下就看懂了。

## 05 最后总结一下

如果你只是想用 Codex 接 DeepSeek，现在最简单的办法就是使用官方的一键配置方案，可以参考这篇教程：



先用最新版 CCSwitch 添加 对应模型。

然后看供应商有没有提示需要路由。

**没有提示，直接使用，提示需要路由，再开启 CCSwitch 本地路由。**

不要再看到教程里说接第三方模型必须开路由，就无脑把开关打开。

因为CCSwitch更新得很快，很多几个月前完全正确的教程，到今天可能已经不是最简单的方案了。

