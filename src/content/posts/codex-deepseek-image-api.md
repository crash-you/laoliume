---
title: "Codex 接 DeepSeek 后怎么生图？调用外部生图 API 完整教程"
description: "Codex 接入 DeepSeek 后，通过硅基流动的外部生图 API 生成图片：注册、获取 API Key、创建 Python 脚本、选择模型和日常调用的完整过程。"
date: "2026-09-19"
slug: "codex-deepseek-image-api"
published: true
wechat_url: "https://mp.weixin.qq.com/s/cp2mfjKfLvdvS6-N_9gVyA"
---

大家好，我是佬刘。

Codex 接上 DeepSeek 之后，写代码、改文档的成本降了一大截。

但很我如果让它生图，就给我卡住了。

![Codex 接 DeepSeek 后怎么生图？调用外部生图 API 完整教程，原文配图 1](/images/codex-deepseek-image-api/image-1.png)

它要么说干不了，要么给你一段“想象中的图片描述”。

原因就是**DeepSeek 官方 API 没有生图模型。**

想生图，就得单独调外部 API。

## 一、DeepSeek 为什么生不了图

去翻 DeepSeek 的 API 文档，能调用的模型只有两个：deepseek\-flash 和 deepseek\-v4\-pro，都是纯文本模型，输入输出都是文字。

![一、DeepSeek 为什么生不了图，原文配图 2](/images/codex-deepseek-image-api/image-2.png)

你可能见过 deepseek\-v4\-flash\-vision\-exp 这个带vision（视觉）的名字，但是，它只是看图模型，接收图片、返回文字，比如识别截图里的报错。

图片进去，文字出来，不会生成新图片，这个模型后来并入了 V4\.1 Flash。

DeepSeek官方调研之后，确实有能生图的模型，叫 Janus\-Pro，但它是开源的模型，只在 HuggingFace上提供下载和 demo，没有进官方API。

想要用它生图，要本地部署 7B 模型，需要 GPU，但那是另一条折腾路线，不适合大多数只想让 Codex 出张配图的选择。

![一、DeepSeek 为什么生不了图，原文配图 3](/images/codex-deepseek-image-api/image-3.png)

所以结论是**别在 Codex 的 config\.toml 里找DeepSeek 生图配置**找不到；也别去搜“DeepSeek 生图 API”，搜出来的第三方网站多半是仿冒的。

生图，需要在 Codex 里调外部 API 补上。

## 二、调用生图 API

这里选硅基流动（SiliconFlow）做主路径，有几个理由理由：

1. 它是 OpenAI 兼容接口，调用格式和接 DeepSeek 时用的一样思路；

2. 注册就有免费额度，FLUX 系列有免费模型；

3. 国内直连，不用折腾网络。

![二、调用生图 API，原文配图 4](/images/codex-deepseek-image-api/image-4.png)

### 第一步，注册拿Key。

打开 https://cloud\.siliconflow\.cn/i/gFWAPCoI，注册账号，

在控制台新建一个 API Key。

![第一步，注册拿Key。，原文配图 5](/images/codex-deepseek-image-api/image-5.png)

Key 复制好，后面要用。

![第一步，注册拿Key。，原文配图 6](/images/codex-deepseek-image-api/image-6.png)

选择一个生图模型，我这里选 Z\-image

![第一步，注册拿Key。，原文配图 7](/images/codex-deepseek-image-api/image-7.png)

进入API文档页面，然后把API文档链接复制

![第一步，注册拿Key。，原文配图 8](/images/codex-deepseek-image-api/image-8.png)

### 第二步，让 Codex 把脚本建好

打开你接了 DeepSeek 的 Codex，把下面这段指令直接复制给它：

> 帮我写一个 Python 脚本 gen\_image\.py，调用硅基流动的生图 API。
> 
> API文档地址是 https://api\-docs\.siliconflow\.cn/docs/api/images\-generations\-post 
> 
> 模型用 Tongyi\-MAI/Z\-Image，API Key 为：【输入你刚刚创建的KEY】，可以把key写进代码。
> 
> 脚本接收一段提示词作为参数，生成的图片保存到当前项目的 images 目录，文件名用时间戳命名。
> 
> 写完后先用提示词“一只戴墨镜的橘猫坐在沙滩上”实际生成一张图，告诉我保存路径和文件大小。
> 
> 

![第二步，让 Codex 把脚本建好，原文配图 9](/images/codex-deepseek-image-api/image-9.png)

Codex 会装好依赖、写好脚本，然后把刚刚的Key发给它

![第二步，让 Codex 把脚本建好，原文配图 10](/images/codex-deepseek-image-api/image-10.png)

看到它报告图片路径，去 images 目录打开确认，这一步就成了。

![第二步，让 Codex 把脚本建好，原文配图 11](/images/codex-deepseek-image-api/image-11.png)

### 第三步，以后怎么用。

需要图的时候，直接跟 Codex 说

```Plain Text
“用 gen_image.py 生成一张……”
```

把用途和风格说具体。

![第三步，以后怎么用。，原文配图 12](/images/codex-deepseek-image-api/image-12.png)

想让 Codex 批量出图，也只需要一句话交代清楚命名规则和输出目录。

## 三、模型怎么选

脚本里的模型名可以按需换，常用的几个：

- Z\-Image：速度快，出图快，日常配图、封面够用，默认选它。

- Qwen\-Image\-Edit：写实风格更强，要照片质感的时候换这个，生成时间会长一些。

- Kwai\-Kolors/Kolors：快手的模型，中文提示词理解好，写中文描述时更顺手。

![三、模型怎么选，原文配图 13](/images/codex-deepseek-image-api/image-13.png)

尺寸参数支持 1024x1024、1024x1792、1792x1024 三档，竖图横图都有。

还有两个参数有用：negative\_prompt 填不想出现的元素；seed 固定后同样的提示词出同样的图，方便复现。

![三、模型怎么选，原文配图 14](/images/codex-deepseek-image-api/image-14.png)

## 四、两个注意点

### Key 的安全

环境变量里配好就行，别把完整的 Key 泄露

### 免费额度

硅基流动的免费模型有速率限制，个人配图完全够用；

如果一天要出几十张图，去它的模型广场看付费模型的价格。



