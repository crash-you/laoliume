---
title: "个人博客网站怎么搭建？从买域名到GitHub+Cloudflare上线完整实操"
description: "没买服务器、没用 WordPress、全程零成本：从买域名、让 AI 做网站、GitHub 托管，到 Cloudflare 上线 laoliu.me 的完整实操记录。"
seoTitle: "个人博客网站怎么搭建？从买域名到 GitHub+Cloudflare 上线"
seoDescription: "零成本个人博客实操：买域名、让 AI 生成网站、GitHub 托管、Cloudflare Workers 部署、D1 阅读量和公众号入口，全程记录。"
image: "/og/blog-build-guide.png"
imageAlt: "佬刘AI 文章分享图：个人博客网站怎么搭建？从买域名到 GitHub+Cloudflare 上线"
date: 2026-09-06
slug: "blog-build-guide"
published: true
wechat_url: "https://mp.weixin.qq.com/s/-R7VwMVjPvdkuTIPtP05xg"
---

大家好，我是佬刘。

个人博客网站怎么搭建？

前两天我给自己搭了一个个人博客网站： **laoliu.me**

没买服务器，也没用 WordPress，全程没用一分钱！

整个网站是我让 WorkBuddy 帮我做的，文章用 Markdown 管理，代码放 GitHub，网站部署在 Cloudflare。

现在我的公众号文章写完以后，只需要同步一份 Markdown 到 GitHub，网站就会完成更新。

这篇就把我从买域名、做网站，到最后上线 `laoliu.me` 的完整过程重新走一遍。

![微信公众号佬刘AI的文章列表截图](/images/blog-build-guide/image-1.png)

## 一、我为什么又做了一个个人博客？

这个念头来自公众号。

我现在每天都在写【佬刘AI】。

但我写着写着发现一个问题：**这些文章如果只放在公众号里，还是属于平台里的内容，而且相对闭源！**

我花几个小时做实操、截图、整理，再写成一篇文章。

最后它只存在公众号里，那为什么不顺手再同步一份到自己的网站？

还能沉淀为我自己的资产！

运营 X，也可以把 `laoliu.me` 放在个人主页。

所以我对这个网站的需求从一开始就很简单。

不要登录；不要评论；不要会员；不要后台；不要各种卡片、分类、标签。

首页显示【佬刘AI】，下面放文章。

点进去能看正文，每篇文章有阅读量。

再加上 SEO。

没了！

![微信公众号佬刘AI主页截图](/images/blog-build-guide/image-2.png)

## 二、第一件事：先买一个域名

做个人网站，先得有自己的地址。

我是在这里买的域名： spaceship.com

我第一反应是：`laoliu.ai`

结果一搜价格，500 多一年。

![laoliu.ai 域名搜索结果及注册价格截图](/images/blog-build-guide/image-3.png)

打扰了。

后来又看了 `.com`、`.cn`、`.net`，最后买的是：

**laoliu.me**

首年价格不到 10 块钱。

![laoliu.me 域名购买页面截图，显示首年优惠价格](/images/blog-build-guide/image-4.png)

`.me` 也刚好符合这个网站的定位：

这是佬刘自己的主页。

而且这个域名没有把自己锁死在某个产品上。

今天我写 Codex，明天写 GPT，agent，以后写自己的产品、工作流、商业实验。

`laoliu.me` 都还能接着用。

![域名控制台截图，显示 laoliu.me 可继续使用](/images/blog-build-guide/image-5.png)

域名买好以后，我就开始让 WorkBuddy 干活。

## 三、和 GPT 讨论需求

不用那么麻烦，直接大白话说就行！

![与 GPT 对话截图，用大白话描述博客需求](/images/blog-build-guide/image-6.png)

然后AI就会给我一堆建议，当然我是要求，第一版绝对简单！

极简风格，模仿一下苹果官网哈哈。

## 四、让GPT给出在workbuddy干活的提示词

为什么要用workbuddy，而不用chatgpt呢？

因为我目前体验下来，workbuddy已经可以连接到GitHub上，而且国产模型的coding能力，其实差不了多少，对于普通小项目来说，缺少的是，提示词，规划能力。

所以我和GPT讨论，让GPT指导WorkBuddy干活！

域名买好，需求确认完成之后，和GPT说，让 GPT 给我提示词。

![GPT 生成建站提示词的回复截图](/images/blog-build-guide/image-7.png)

## 五、UI设计

提示词出来之后，不要发给workbuddy的。

众所周知，AI coding自己生成的UI，往往丑不拉几的，所以，我让 GPT Image 来帮我设计UI

![WorkBuddy 中让 GPT Image 设计博客 UI 的对话截图](/images/blog-build-guide/image-8.png)

UI有问题，直接让AI改：

![让 AI 修改博客 UI 的对话截图](/images/blog-build-guide/image-9.png)

这样，才算是完成准备工作，

## 六、WorkBuddy前期准备

新建一个文件夹，我给它命名为blog

![新建名为 blog 的文件夹截图](/images/blog-build-guide/image-10.png)

在workbuddy中，打开这个文件夹

![在 WorkBuddy 中打开 blog 文件夹的界面截图](/images/blog-build-guide/image-11.png)

然后把UI原型图，和刚刚的提示词全发给workbuddy。

模型选择极致：

![WorkBuddy 模型选择界面截图](/images/blog-build-guide/image-12.png)

这样，workbuddy就开始干活了！

在等待的时间里，我们要先新建GitHub仓库。

## 七、然后把代码上传 GitHub

创建一个 GitHub 仓库。

网址： github.com

![GitHub 网站首页截图](/images/blog-build-guide/image-13.png)

点击New

![GitHub 新建仓库页面截图](/images/blog-build-guide/image-14.png)

设置好，仓库地址，仓库昵称，选择是否为公开仓库之后，点击Create repository

![GitHub 仓库创建成功页面截图，显示 git 命令](/images/blog-build-guide/image-15.png)

这样GitHub初始化仓库已经完成！

复制一下仓库地址

![GitHub 仓库地址复制界面截图](/images/blog-build-guide/image-16.png)

接下来就不用动了，等待workbuddy写好代码。

![WorkBuddy 生成博客代码的对话截图](/images/blog-build-guide/image-17.png)

写好代码之后，把代码推送到GitHub里：

```Plain Text
这是我的GitHub地址，你来帮我推送：【你的GitHub仓库地址】
然后再给我剩下我需要做的内容。
在本机帮我启动一下，我看一下效果
```

## 八、部署 Cloudflare Workers

代码有了，也推送到GitHub里了，接下来就是让别人能访问。

在访问之前，我又问了一下GPT，让GPT给我一次上线前验收

![向 GPT 询问上线前验收指令的对话截图](/images/blog-build-guide/image-18.png)

同时，因为我没有单独买云服务器。

这个网站使用 Cloudflare Workers 部署。

Cloudflare官网： cloudflare.com （使用自己邮箱注册即可）

WorkBuddy 已经把 Cloudflare 的配置文件也写好了。

所以我需要做的，就是在 Cloudflare 里连接 GitHub 仓库。

所以把，GPT再次给我的上线前验收指令，与授权workbuddy让它帮我授权指令，全都给workbuddy

![GPT 给出的上线前验收指令对话截图](/images/blog-build-guide/image-19.png)

部署成功以后，Cloudflare 会先生成一个 `workers.dev` 地址。

![部署成功页面截图，显示 Cloudflare workers.dev 地址](/images/blog-build-guide/image-20.png)

我先用这个地址测试网站。

首页能开；文章能开；手机端没问题。

然后再绑定 `laoliu.me`。

## 九、阅读量怎么做？

我一开始就想加一个功能：**阅读量。**

别的动态功能都不要。

所以我让 WorkBuddy 用 Cloudflare D1 建了一个小数据库。

里面记录：文章 slug。阅读次数。更新时间。

用户打开文章以后，阅读量接口执行一次计数。

同一个浏览器短时间重复刷新，不会一直加。

![佬刘AI 博客上线后的首页截图](/images/blog-build-guide/image-21.png)

我没有去做复杂 UV、用户识别、账号体系。

这个网站现在连登录都没有。

## 十、然后把 laoliu.me 绑上去

Cloudflare 部署完成之后，我把域名 DNS 接到 Cloudflare。

打开我们刚刚购买域名的网址，点击launchpad

![域名购买平台首页，点击 launchpad 入口](/images/blog-build-guide/image-22.png)

点击域名管理器

![平台菜单中选择域名管理器的截图](/images/blog-build-guide/image-23.png)

就可以看到我们刚刚买的域名

![域名管理器中显示已购域名的截图](/images/blog-build-guide/image-24.png)

点击域名，点击名称服务和DNS

![域名详情页的名称服务和 DNS 入口截图](/images/blog-build-guide/image-25.png)

把这里的配置，更改为cloudflare中所显示要配置的

![更新名称服务器弹窗，填入 Cloudflare 名称服务器](/images/blog-build-guide/image-26.png)

这个在哪找呢，登录cloudflare，点击概览

![Cloudflare 控制台概览页面截图](/images/blog-build-guide/image-27.png)

点击添加域名

![Cloudflare 添加域名入口截图](/images/blog-build-guide/image-28.png)

连接域名

![Cloudflare 添加站点时输入域名的截图](/images/blog-build-guide/image-29.png)

输入域名，其他保持默认，点击继续

![Cloudflare 连接域名配置页面截图](/images/blog-build-guide/image-30.png)

选择免费计划

![Cloudflare 选择免费计划页面截图](/images/blog-build-guide/image-31.png)

继续前往激活

![Cloudflare 域名激活页面截图](/images/blog-build-guide/image-32.png)

把这里现实的服务器名称，在 spaceship里更改

![Spaceship 名称服务器修改界面截图](/images/blog-build-guide/image-33.png)

![Spaceship 更新名称服务器弹窗截图](/images/blog-build-guide/image-34.png)

然后点击保存服务器设置，等待一段时间，就自动配置好啦

回到cloudflare，点击check nameservers now

![Cloudflare 检查名称服务器页面截图](/images/blog-build-guide/image-35.png)

当前是等待状态

![Cloudflare 域名等待激活状态截图](/images/blog-build-guide/image-36.png)

过一会，发现有一个绿色的勾，说明我们刚刚的nameserver替换成功了

![Cloudflare 域名激活成功截图](/images/blog-build-guide/image-37.png)

**重定向等基础配置：**

A：设置 SSL/TLS = Flexible

进入cloudflare.com

![cloudflare.com 控制台首页截图](/images/blog-build-guide/image-38.png)

找到SSL/TLS encryption mode，选择Flexible

![Cloudflare SSL/TLS 加密模式设置页截图](/images/blog-build-guide/image-39.png)

B：开启 Always Use HTTPS

![Cloudflare 开启 Always Use HTTPS 设置截图](/images/blog-build-guide/image-40.png)

C：root → www 重定向

![Cloudflare root 到 www 重定向规则设置截图](/images/blog-build-guide/image-41.png)

分别填：

https://你的域名/*

https://www.你的域名/${1}



到这里，全部的cloudflare配置已经完成了！

接下来，cloudflare连接到GitHub中

创建 worker

![Cloudflare 创建 Worker 页面截图](/images/blog-build-guide/image-42.png)

选择使用 GitHub

![Cloudflare 部署向导中选择 GitHub 的截图](/images/blog-build-guide/image-43.png)

选择刚刚我们创建的GitHub仓库

![选择刚创建的 GitHub 仓库的界面截图](/images/blog-build-guide/image-44.png)

部署

![Cloudflare Worker 部署设置页面截图](/images/blog-build-guide/image-45.png)

等待一段时间

![Cloudflare 部署进行中页面截图](/images/blog-build-guide/image-46.png)

部署完成

![Cloudflare 部署完成页面截图](/images/blog-build-guide/image-47.png)

到这里，把GitHub仓库部署到cloud flare也已经完成了！

网站也已经能正式访问了！

laoliu.me

## 十一、但既然做了，我顺手把 SEO 也补了

我做这个网站，本身就有一部分原因是为了 SEO。

所以我让 WorkBuddy 在第一版把搜索引擎需要的基础东西一起加上。

现在每一篇文章都有自己的 Title、Description、Canonical。

网站还有：

`sitemap.xml、robots.txt、rss.xml`

文章页面也带 Article JSON-LD。

正文在构建阶段就会生成 HTML，不需要等浏览器执行一堆 JS 才能看到内容。

当然，做完这些不代表搜索引擎马上给流量。

它只是把基础设施搭好，后面有没有搜索流量，还是看文章、关键词、网站权重和时间。

所以我接下来会把公众号每天写的文章同步一份过来。

看看几个月之后，Google、Bing 和百度能不能开始给这个网站带来搜索！

## 十二、我还给公众号留了入口

做到这里，我又想到一件事。

既然这些文章本身都是公众号首发，那为什么不把网站的流量再导回公众号？

所以我又加了两个地方。

首页左侧现在会显示：

**公众号：佬刘AI**

![公众号文章截图，显示公众号名称佬刘AI](/images/blog-build-guide/image-48.png)

每一篇文章标题下面，也会显示：

> 首发于微信公众号「佬刘AI」 · 查看微信原文 ↗
> 
> 

点击以后，会打开对应的微信公众号原文。

![微信文章跳转公众号原文的截图](/images/blog-build-guide/image-49.png)

填哪篇公众号文章，它就跳到哪篇。文章底部我也保留了公众号原文入口。没有二维码，没有弹窗，没有关注浮窗。我还是想让这个网站保持现在的简约感。

![博客文章底部保留微信原文入口的截图](/images/blog-build-guide/image-50.png)

## 十三、现在我每天怎么更新这个网站？

到这里，整个个人博客搭建流程就结束了。

后面我需要做的事情只有一个：

**往里面放文章。**

公众号文章写完之后：

把正文整理成 Markdown。

填写标题、日期、描述、公众号链接。提交 GitHub。

Cloudflare完成构建。

然后：

```Plain Text
laoliu.me/文章地址
```

就出来了。

这才是我想要的个人博客。

不是让我每天维护网站。

而是网站负责承接我每天已经在生产的内容。

## 十四、这套东西适合谁？

如果你想做的是一个论坛、会员站、电商站，那这套肯定不够。

但如果你的需求跟我一样：

有自己的公众号，或者只是单纯的输出一下自己的想法。

平时会写文章。

想要一个自己的域名。想把内容再沉淀一份到公开互联网。

那我觉得这种方式就够用了。

不用因为搭个人博客先学一个月前端，也不用为了一个博客先租服务器、装宝塔、配数据库。

把自己的需求说清楚，让 AI 帮你做第一版。

然后自己验收，有问题就改。

直到它变成你愿意用下去的东西。

## 我遇到的一些问题

### UI太丑

我在第一版，workbuddy虽然是按照我给定的UI做，但是做的还是太丑，我就把网站连接直接给GPT，让它给我改的提示词给workbuddy。就这样来回改

### 部署完之后没法访问

优先看 cloudflare 中的 **重定向 、 Always Use HTTPS 、 root → www 重定向**，是否按照教程开启！

### 想要的域名被买走或太贵

这个没办法，问一下AI，给推荐一些其他后缀，或者变种昵称。

就比如我这个，GPT还给我推荐过，heylaoliu.com 呢哈哈哈。

## 最后

这几天从买 `laoliu.me`，到让 WorkBuddy 写第一版，再到改 UI、部署 Cloudflare、上传文章，我自己的感受是：

现在做一个网站，代码已经不是最大的门槛了。

更大的问题是：**你知不知道自己到底要什么。**

第一版 WorkBuddy 不是没完成任务。

它完成了。

只是我给它的 UI 方向，本身就有问题。

所以如果你也准备搭一个个人博客，先让它能做到一件事：

**把你的文章放上去，并且让别人能打开。**

剩下的东西，遇到需求再加。

我的个人博客已经上线：

**laoliu.me**

后面公众号发出的文章，我也会同步更新到这里。

毕竟一篇文章都已经写出来了。

多给它一个能被找到的地方，挺帅！
