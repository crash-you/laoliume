---
title: "Codex额度用完怎么买？额度刷新、用完、购买一次讲清"
description: "Codex 的套餐额度、Credits、Reset 是三种不同的东西。这篇讲清额度在哪看、多久刷新一次、用完了怎么办、怎么买，以及让额度用得更久的两个习惯。"
seoTitle: "Codex 额度用完怎么买？刷新、Credits、Reset 一次讲清"
seoDescription: "Codex 额度指南：套餐自带额度、付费 Credits、Reset 的区别；Usage 页面和 /status 查用量；5 小时与周额度窗口；用完后的购买选择与省额度技巧。"
image: "/og/codex-quota-buy.png"
imageAlt: "佬刘AI 文章分享图：Codex 额度用完怎么买"
date: 2026-09-12
slug: "codex-quota-buy"
published: true
wechat_url: "https://mp.weixin.qq.com/s/jzGY5x2kBSXXEzkWgxckXA"
---

大家好，我是佬刘。

如果你最近在用 Codex，大概率已经见过那个额度条了。

![Codex 额度条显示每周使用限额剩余 44%](/images/codex-quota-buy/image-1.png)

项目做到一半，突然提示达到使用上限，这时候就像一口痰在嘴里吐不出来一样，如果恰好这个任务很重要，那就更难受了！

我自己每天也在用 Codex，所以这篇就专门把 **Codex额度** 这件事捋清楚。

这里很多规则在今年都发生过变化。本文已于 2026 年 9 月 27 日按 OpenAI 官方资料重新核对；具体额度和重置时间，仍以你自己账号的 Usage 页面为准。

## 一、先搞清楚，Codex额度不是一个数字

这是整篇最重要的地方，很多人会把 Codex 里的所有额度理解成一种东西，现在其实已经不是这样了。

你至少会碰到三种东西。

**第一种，是 ChatGPT 套餐本身自带的 Codex 使用额度。**

比如你是 Plus，就使用 Plus 对应的 Codex 权益；你是 Pro，则会拥有比 Plus 更高的使用量。

![ChatGPT 各档套餐对比，红框标注 Codex 使用量差异](/images/codex-quota-buy/image-2.png)

目前 [OpenAI 官方 Codex 定价页](https://developers.openai.com/codex/pricing)写的是：Pro 5x 档的 Codex 使用量为 Plus 的 5 倍，Pro 20x 档为 Plus 的 20 倍。具体能做多少任务，还会受到模型、上下文、任务复杂度等影响。这部分是套餐自带的使用量，不能直接换算成固定的 token 数。另外，适用账号上的 Codex 和 ChatGPT Work 等功能可能共享使用额度，不能只按自己在 Codex 里的操作来估算。[官方用量说明](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)

**第二种叫 Credits。**

可以理解成套餐额度之外的使用余额，既可能是自己买的，也可能来自符合条件的活动。

当套餐自带额度用到上限后，如果账号支持购买 Credits，就可以继续按使用量消耗余额，不需要为了多用一点 Codex 再升级整个会员套餐。Credits 的购买入口和价格以账号内显示为准。[官方 Credits 说明](https://help.openai.com/en/articles/12642688-using-credits-for-flexible-usage-in-chatgpt-personal-plans)

![Credits 额外用量购买入口](/images/codex-quota-buy/image-3.png)

**第三种叫 Reset。**

也就是我们所熟知的重置，这个又和 Credits 不一样。

Reset 的作用，是刷新适用的使用窗口。现在要分清楚：有的 Reset 是活动送到账号里、可以在有效期内使用的；符合条件的 Plus、Pro 账号也可以购买立即生效的 Reset。它们都不会变成 Credits。[官方可留存 Reset 说明](https://help.openai.com/en/articles/20001498-how-banked-codex-resets-work) · [官方付费 Reset 说明](https://help.openai.com/en/articles/20001507-paid-weekly-work-and-codex-rate-limit-resets)

![Codex 使用限额的 Reset 重置说明](/images/codex-quota-buy/image-4.png)

## 二、Codex额度在哪里看？

最简单的办法，就是进入 ChatGPT 或 Codex 的 Usage 页面。

ChatGPT 网页端可以从 **Settings → Usage** 查看；Codex 桌面端则看 **Usage & Billing**。

![Pro 账号菜单中的使用情况与设置入口](/images/codex-quota-buy/image-5.png)

![ChatGPT 设置中的使用情况页面，红框标注用量区域](/images/codex-quota-buy/image-6.png)

打开后，先看 Codex 这一栏。

这里能看哪个使用窗口快到上限、Credits 余额，以及账号显示的重置时间。不同账号的可用选项也可能不一样，直接以这个页面和限额提示为准。[官方用量说明](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)

如果你使用 Codex CLI，还有一个更方便的方法。

直接输入：

```Plain Text
/status
```

Codex 会把当前会话和使用情况显示出来。

![Codex CLI 执行 /status 查看当前会话与用量](/images/codex-quota-buy/image-7.png)

所以以后想知道自己还有多少额度，不用靠猜。

看 Usage，或者 `/status`。

所以后面看到买额度买 Credits买 Reset，千万不要全部理解成一回事。

这一点搞明白，后面的东西就简单了。

## 三、Codex额度多久刷新一次？

先把最容易说错的地方改过来：**Codex 不能只记一个“7 天刷新”。**

**Plus 用户**：要看 5 小时使用窗口，也要看周额度。

**Pro 用户**：同样有 5 小时使用窗口和周额度。Pro 5x、Pro 20x 提高的是使用量，不能理解为“Pro 不存在 5 小时限额”。

[OpenAI 的 Codex 定价页](https://developers.openai.com/codex/pricing)按每 5 小时给出 Plus 和 Pro 的用量估算，同时说明周限额也可能适用。这些估算不是每个人固定能发多少条，具体还得看自己的 Usage 页面。

所以你可能遇到这种情况：

明明短期额度还有一些，但是周额度已经到了，或者短期窗口到了限制，需要等下一次刷新。

按照[官方付费 Reset 说明](https://help.openai.com/en/articles/20001507-paid-weekly-work-and-codex-rate-limit-resets)，符合条件的 Plus、Pro 用户购买即时 Reset 后，5 小时和周使用量都会恢复。买完后第一次使用 Work 或 Codex，新的周周期才开始；下一次自动周重置是从这次使用起 7 天。

如果用的是账号里可用的 **full banked reset**，官方也明确说它会刷新 5 小时和周使用窗口，并改变周重置日期。活动送的 Reset 是否能留存、何时过期，要看当次活动和账号页面。[官方可留存 Reset 说明](https://help.openai.com/en/articles/20001498-how-banked-codex-resets-work)

所以网上有人说：

Codex固定每周星期几刷新。

这种说法已经不适合所有账号了。

**看自己 Usage 页面。**

## 四、 Codex额度用完了怎么办？

现在的选择已经比以前多了。

如果你不着急，可以看 Usage 页面，等套餐额度自己恢复。

### 邀请好友

如果账号里有 **邀请好友**，也可以点进去看看。不过奖励需要受邀人完成活动条件，别把它当成今天一定到账的应急办法。

![邀请好友活动奖励的历史页面示例，当前奖励以账号弹窗为准](/images/codex-quota-buy/image-8.png)

![Pro 账号菜单中的邀请好友入口](/images/codex-quota-buy/image-9.png)

上面是当时的页面截图，不代表你现在打开也会看到相同奖励。邀请奖励不能写死成“250、500 或 1000 Credits”。[官方邀请活动规则](https://help.openai.com/en/articles/20001271-chatgpt-desktop-referral-promotions)说，奖励可能是 Credits、可留存的限额重置，或者其他临时使用权益；奖励数额、条件和有效期，都看你账号当时展示的活动。先点开自己的邀请弹窗，确认它到底送什么。

### Reset

这个是大家比较熟悉的重置，但现在还要分两种。

**活动送的 Reset**，有些直接生效，有些会存到账号里，需要自己在有效期内使用。官方没有保证以后会固定送，先看 Usage 里有没有、活动写了什么。

**付费即时 Reset**，符合条件的 Plus、Pro 个人账号可以在 Usage 中查看购买入口；周额度用尽后，也可能出现购买提示。只用尽 5 小时窗口，不一定会弹出那条周限额购买提示。买下后立即刷新，不能存着下次用，也不会增加 Credits 余额。[官方说明](https://help.openai.com/en/articles/20001507-paid-weekly-work-and-codex-rate-limit-resets)

活动送的就当意外惊喜，别按“每周必送”安排项目。

## 五、 Codex额度怎么买？

如果想额外购买，先去 ChatGPT 的 **Settings → Usage**，或者 Codex 桌面端的 **Usage & Billing**，看自己账号能不能添加 Credits。Plus、Pro 用户达到使用上限时，也可能看到添加入口；可购买金额和付款方式以结账页为准。[官方 Credits 说明](https://help.openai.com/en/articles/12642688-using-credits-for-flexible-usage-in-chatgpt-personal-plans)

![官方 Codex 额度购买页面，可购买额外用量](/images/codex-quota-buy/image-10.png)

![账号菜单中的添加额度入口](/images/codex-quota-buy/image-11.png)

对于一些国内用户，真正卡住的可能还是结账时能用的付款方式。先看官方页面给你提供什么选项，再决定要不要买 Credits；如果想直接恢复套餐窗口，也要看自己账号有没有即时 Reset 入口。两种购买的作用不一样。

所以我自己的小店里，也放了对应的 **Codex额度购买服务**。

如果你的账号里已经能看到，但是卡在付款这一步，可以看一下。

https://wzyp.cn/shop/liu

![小店中的 Codex 额度购买服务页面](/images/codex-quota-buy/image-12.png)

## 六、 Plus和Pro的Codex额度差多少？

这个我上一篇已经单独讲过了。

按[官方 Codex 定价页](https://developers.openai.com/codex/pricing)，Pro 有相对 Plus 5 倍或 20 倍的使用量档位；页面列的是每 5 小时的用量估算，也提醒周限额可能适用。**这不等于 Plus 每周固定多少亿 token、Pro 再乘一个倍数。**模型、上下文、推理强度和任务内容都会影响实际消耗，想知道自己还能用多少，还是看 Usage。

所以如果你只是偶尔用 Codex，Plus 够不够，要看你的工作强度。

但如果你每天拿大项目跑，连续开 Agent，频繁使用高消耗模型，Pro 的意义就出来了。

关于 Plus、Pro、Codex之间到底是什么关系，我前边已经写过：

这里不再重复。

## 七、 怎么让Codex额度用得久一点？

我自己现在主要看两个东西。

一个是模型，简单任务没必要每次都使用高消耗模型。

另一个是任务本身，一个项目聊了很久，上下文越来越大，Codex每次处理的内容也会增加。

这种时候，该开新对话就开新对话，该整理项目说明就整理项目说明。

我前边写过 Codex 上下文和长期项目怎么处理，这里可以直接过去。

核心就一句：

**该花额度的地方花，不需要重模型的时候别硬上。**

## 最后

说一下个人经验，GPT-6 Astra 出来之后，我自己用起来也能明显感觉额度走得快。日常任务能用 medium 就用 medium，复杂点再上 xhigh；至于 ultra，与神对话是需要烧点米的哈哈。
