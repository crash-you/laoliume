---
title: "Codex 怎么连接 GitHub？谷歌验证器、双重验证、仓库授权完整教程"
description: "用一个测试仓库走完 Codex 连接 GitHub 的过程：创建云端环境、设置身份验证器、选择允许访问的仓库，再验证连接结果。"
date: "2026-10-14"
slug: "codex-connect-github-2fa"
published: true
---

大家好，我是佬刘。

最近有不少朋友来问我，Codex 怎么连接 GitHub？尤其是连接过程中，GitHub 会要求使用谷歌身份验证器，还有朋友被卡在了六位验证码那里。

![身份验证器的一次性验证码输入框](/images/codex-connect-github-2fa/step-01.png)

今天就把整个连接流程写一下，包括 GitHub 的双重验证怎么设置、没有谷歌验证器怎么办，以及连接成功后怎么让 Codex 读取和修改 GitHub 仓库里的代码。

## 一、Codex 怎么连接 GitHub？

先准备两个账号，一个 ChatGPT 账号，一个 GitHub 账号。

GitHub 官网：[https://github.com](https://github.com)，

GitHub账号注册可以用自己QQ、163邮箱都可以

注册成功主界面

![GitHub 账号的 Dashboard](/images/codex-connect-github-2fa/step-02.png)

创建完成账号之后，

如果还没有 GitHub 仓库，可以登录后打开 [https://github.com/new](https://github.com/new) ，

创建一个测试仓库。

![新建仓库时填写名称和可见性](/images/codex-connect-github-2fa/step-03.png)

填写 Repository name（仓库名称），选择 Public（公开）或者 Private（私有），勾选 Add a README file，点击 Create repository 即可。

![创建完成的测试仓库](/images/codex-connect-github-2fa/step-04.png)

有了仓库，就可以开始连接 Codex 了。

### **第一步，打开 Codex。**

进入 [https://chatgpt.com/codex](https://chatgpt.com/codex) ，登录自己的 ChatGPT 账号。

![登录后的 Codex 任务界面](/images/codex-connect-github-2fa/step-05.png)

在新建任务页面，找到 Work in（工作位置），选择 Cloud（云端）。

![把任务的工作位置切换为云端](/images/codex-connect-github-2fa/step-06.png)

打开 Select environment（选择环境），点击 Create environment（创建环境）。

![在环境列表里选择创建环境](/images/codex-connect-github-2fa/step-07.png)

这里要注意。

当前 Free、Go 账号不支持Codex Cloud。

Plus 需要符合开放资格，Pro 等符合条件的账号可以使用，具体以账号界面和工作空间权限为准。

### **第二步，连接 GitHub 账号。**

在创建云端环境时，Codex 会显示 GitHub 仓库选择页面。

![创建环境时显示的 GitHub 仓库选择器](/images/codex-connect-github-2fa/step-08.png)

如果还没有连接过 GitHub，就按照页面提示点击 Connect GitHub。

页面会跳转到 GitHub，要求登录并完成授权。

这里也是很多人遇到问题的地方。

有些朋友输入 GitHub 账号密码之后，页面又弹出了 **Two-factor authentication**，要求输入六位验证码；还有人第一次登录时，就被要求设置 Authenticator app。

![连接时要求输入双重验证码](/images/codex-connect-github-2fa/step-09.png)

这其实是 GitHub 的双重身份验证，也叫 2FA。

下面把这一步单独讲清楚。

## 二、GitHub 要求谷歌身份验证器怎么办？

我们可以使用 Google Authenticator（谷歌身份验证器），也可以使用其他兼容 TOTP 的验证器。

**这里有一个需要注意的地方，使用 Google Authenticator 生成 GitHub 验证码，不要求登录 Google 账号。**

不用再单独注册个谷歌账号！

![Google 身份验证器应用图标](/images/codex-connect-github-2fa/step-10.jpg)

Google 官方提供了不登录账号使用验证器的方式，验证码也可以在手机没有网络的情况下生成。

如果手机上无法安装 Google Authenticator，也可以选择 Microsoft Authenticator（微软身份验证器）。

两者都能用于 GitHub 的 TOTP 验证。

### 第一次绑定验证器

如果 GitHub 页面显示需要设置双重验证，可以按照下面的步骤操作。

在 GitHub 中点击头像，进入 Settings（设置）。

![从 GitHub 头像菜单打开 Settings](/images/codex-connect-github-2fa/step-11.png)

找到 Password and authentication（密码与身份验证），在 Two-factor authentication（双重身份验证）中点击 Enable two-factor authentication。

![在密码与身份验证设置里找到双重验证](/images/codex-connect-github-2fa/step-12.png)

选择 Authenticator app 后，GitHub 会显示一个二维码。

![选择验证器应用作为验证方式](/images/codex-connect-github-2fa/step-13.png)

打开手机上的谷歌验证器，点击添加账号，选择扫描二维码，用手机扫描 GitHub 页面上的二维码。

如果使用的是微软验证器，点击添加账号，选择 Other account（其他账户），扫描同一个二维码即可。

扫描完成后，手机上会出现一个 GitHub 条目，以及对应的六位数字验证码。

这个数字会按照时间周期发生变化，默认每 30 秒更新一次。

回到 GitHub 页面，把手机上显示的六位验证码填进去，完成验证。

### 保存 GitHub 恢复码

完成验证码验证后，GitHub 会要求保存 Recovery codes（恢复码）。

**这一步一定要完成。**

点击 Download，下载并保存恢复码，然后点击 I have saved my recovery codes。

GitHub 默认下载的恢复码文件名是：

`github-recovery-codes.txt`

如果以后手机丢失、验证器被删除，或者无法获取六位验证码，就可以通过恢复码登录 GitHub。

## 三、完成 GitHub 授权，连接 Codex

解决双重身份验证后，回到 Codex 的 GitHub 连接流程。

GitHub 会显示对应的应用授权页面，要求确认账号和仓库访问权限。

这里可能会看到两个选项。

**All repositories** 代表允许访问该账号下的所有仓库。

**Only select repositories** 代表只允许访问自己选中的仓库。

![只授权指定仓库的选择位置](/images/codex-connect-github-2fa/step-14.png)

到这里，Codex 的 GitHub 云端仓库连接就完成了。

## 四、怎么验证 Codex 已经成功连接 GitHub？

连接成功之后，我们可以让 Codex 读取 GitHub 仓库里的文件。

选择刚刚我们创建的那个仓库

![Codex 开始为测试仓库准备云端环境](/images/codex-connect-github-2fa/step-15.png)

这里给大家一段提示词。

**提示词：**

> 请读取当前 GitHub 仓库，检查 README.md 和项目的主要目录，告诉我这个项目的作用、技术栈和主要文件分别负责什么。
> 
> 所有结论都需要对应到实际文件。本次只做读取和分析，不修改任何代码。

如果 Codex 能读取仓库文件，并给出对应目录、文件内容与分析结果，说明仓库访问已经生效。

如果需要把修改提交到 GitHub，可以使用提交或创建 Pull Request 的功能。Pull Request 简称 PR，可以理解成一份等待审核合并的代码修改申请。

打开 GitHub，查看对应分支或 PR，确认修改内容符合要求后再合并。

这样就完成了从 GitHub 连接、读取代码到提交修改的整个流程。

## 五、常见问题 FAQ

### 谷歌验证器的六位验证码一直提示错误？

检查手机的日期、时间和时区，建议开启系统的自动设置时间功能。

TOTP 验证码每 30 秒更新，接近过期时可以等待生成下一组验证码后输入。

另外还要确认验证码对应的是正在登录的 GitHub 账号。如果验证器里有多个 GitHub 条目，要选择正确的那个。

### GitHub 已授权成功，Codex 却找不到仓库？

进入 GitHub 的 Settings → Applications → Installed GitHub Apps，找到对应的应用，点击 Configure。

检查 Repository access，确认需要的仓库已经加入授权范围。

如果仓库属于组织，还需要检查组织的应用安装、授权与仓库访问审批。

### GitHub 可以通过国内手机号接收短信验证码吗？

根据 GitHub 当前官方支持地区列表，中国大陆不在 GitHub 短信双重验证的支持名单中。

因此，国内用户更适合使用 TOTP 验证器完成绑定。谷歌验证器、微软验证器等兼容 TOTP 的应用都可以生成 GitHub 所需的六位动态验证码。

## 最后

Codex 连接 GitHub 的过程主要涉及 GitHub 账号授权、双重身份验证和 Codex 项目环境配置。

遇到谷歌验证器验证时，可以按照 GitHub 的官方流程绑定兼容的 TOTP 应用。已有账号需要使用原来绑定的验证方式，丢失验证器时优先检查恢复码和已配置的备用方式。

连接成功后，就可以让 Codex 读取仓库、修改代码，并通过分支或 Pull Request 管理修改结果。
