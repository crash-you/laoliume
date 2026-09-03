---
title: "Codex怎么设置成中文？界面中文、中文回复和全局设置一次讲清楚"
description: "Codex 中文界面、中文回复，以及换新对话后仍默认中文的全局设置，三种情况一次讲清楚。"
date: 2026-08-28
slug: "codex-chinese-settings"
published: true
wechat_url: "https://mp.weixin.qq.com/s/ZjUt4vrU3i31ClKTH3hUjw"
---

大家好，我是佬刘。

如果你打开Codex之后，发现软件菜单是英文，Codex的任务计划、进度更新和最终总结也一直用英文回复，那么这篇教程会把 **Codex中文界面、中文回复，以及换一个新对话后仍然默认使用中文** 的设置方法，一次讲清楚。

先说结论，Codex设置中文，实际上分成三种情况：

- 只想让当前对话使用中文，直接发送一段提示词就可以； 

- 想让Codex以后所有新对话都默认使用中文，需要设置全局`AGENTS.md`； 

- 想把Codex App里的按钮和菜单改成中文，需要修改`Language`界面语言。 

这三种设置不是一回事。

所以，我把Codex App的界面语言、当前对话提示词和全局`AGENTS.md`都重新跑了一遍。

最终留下来的方案很简单：

> **界面语言用Language设置，临时中文用提示词，长期中文写进全局AGENTS\.md。**
> 
> 

下面从最简单的开始。

## 一、只让当前对话使用中文

最简单的方法，就是直接告诉Codex你要用中文：

```Plain Text
从现在开始，请默认使用简体中文与我交流。

任务计划、进度更新、问题说明、代码审查意见和最终总结，全部使用简体中文。

代码、终端命令、文件路径、配置项、API名称、函数名、变量名和专有名词保留原文。

遇到英文报错时，先保留完整的英文原文，再使用中文解释原因和解决方法。

除非我明确要求，否则不要切换为英文。
```

![image\.png](/images/codex-chinese-settings/image-2.png)

发送之后，Codex后续的任务计划、最终总结，基本就会切换成中文。

当然，平时只是随手问个问题，也不用每次都发送这么长的一段。

直接告诉它：

```Plain Text
接下来默认使用简体中文回复，代码、命令、路径和报错保留英文。
```

也能解决。

但是，这种方法有一个问题：

**它只解决了当前对话。**

换一个Codex项目，或者新建一个对话之后，你可能还要重新提醒它。

我之前就是这样，每开一个新对话，都要先补一句：

> 默认使用中文回复。
> 
> 

一两次还好，次数多了之后就很烦。

所以，想让Codex以后所有新对话都默认使用中文，真正应该设置的是全局`AGENTS.md`。

## 二、让Codex以后所有新对话都默认使用中文

先简单解释一下`AGENTS.md`是什么。

可以把它理解成：

> Codex每次开始工作之前，都会先读取的一份规则。
> 
> 

比如如果你喜欢当霸总，可以限制说“每次回答前先说一句霸总！”

![image\.png](/images/codex-chinese-settings/image-8.png)

都可以写进`AGENTS.md`。

Codex官方支持全局、项目和子目录等不同层级的`AGENTS.md`。全局文件适合放个人长期偏好，项目文件则用来记录当前项目特有的规则。离当前工作目录越近的规则，优先级越高。**也就是当全局文件和项目层级同时存在时，优先遵循项目层级的规则。**

我们这次要设置的是：

**全局****`AGENTS.md`****。**

也就是无论打开哪个项目，都默认生效。

### 1、找到Codex全局配置目录

我用的是Windows系统，所以先以Windows为例。

打开文件资源管理器，点击最上面的地址栏，输入：

```Plain Text
%USERPROFILE%\.codex
```

然后按下回车。正常情况下，会直接进入类似下面这样的文件夹：

```Plain Text
C:\Users\你的用户名\.codex
```

Windows版Codex App和Windows原生Codex默认共用这个目录。

![image\.png](/images/codex-chinese-settings/image-11.png)

没有看到`.codex`文件夹，也可以手动新建一个。

文件夹名称就是：

```Plain Text
.codex
```

![image\.png](/images/codex-chinese-settings/image-6.png)

前面的点不要漏掉！

macOS或者Linux用户，对应的默认目录是：

```Plain Text
~/.codex
```

### 2、新建AGENTS\.md

进入`.codex`文件夹之后，新建一个文本文件。

然后把文件名修改成：

```Plain Text
AGENTS.md
```

这里一定要注意！Windows默认可能会隐藏文件扩展名！

你看到的文件名是：AGENTS\.md

它的真实名称却可能是：AGENTS\.md\.txt

这种情况下，Codex就不会把它当成`AGENTS.md`读取。

可以在文件资源管理器顶部点击：

```Plain Text
查看 → 显示 → 文件扩展名
```

![image\.png](/images/codex-chinese-settings/image-3.png)

确认最终文件名确实是：AGENTS\.md

![image\.png](/images/codex-chinese-settings/image-10.png)

### 3、写入全局中文规则

用记事本、VS Code或者其他编辑器打开`AGENTS.md`。

然后写入下面这些内容：

```Plain Text
# 全局语言与沟通规则

- 默认使用简体中文与我交流。
- 任务计划、进度更新、问题说明、代码审查意见和最终总结均使用简体中文。
- 代码、终端命令、文件路径、配置键、API名称、函数名、变量名和专有名词保持原文。
- 引用英文报错时，先保留完整的英文原文，再使用中文解释原因和解决方法。
- 除非我明确要求，否则不要切换为英文。
- 不要为了追求中文表达而翻译会影响执行、复制或者搜索的技术内容。
```

保存文件。

![image\.png](/images/codex-chinese-settings/image.png)

我不建议为了显得专业，一上来就在里面写几十条规则。

官方给出的建议也是让`AGENTS.md`保持实用、简短，先写真正反复需要的规则，遇到重复问题之后再慢慢补充。

先把默认使用中文这一个最小闭环跑通，后面真的遇到重复问题，再往里面加。

好的规则文件，不是第一次就设计出来的。

**是用着用着，慢慢长出来的。**

### 4、新建对话验证

文件保存之后，不要继续在原来的对话里测试。

先新建一个Codex对话。然后发送一段英文任务：

```Plain Text
Please inspect the current project and tell me what you would check first. Do not modify any files.
```

正常情况下，即便你发送的是英文任务，Codex也应该按照刚才的全局规则，使用中文回复。

同时，代码、文件名、命令和技术名词仍然保留英文。

![image\.png](/images/codex-chinese-settings/image-4.png)

为了验证得更严谨一点，还可以继续发送：

```Plain Text
先不要修改任何文件。

请列出本次会话实际加载的全局和项目级指令文件，包括AGENTS.md和AGENTS.override.md。

请告诉我：

1. 每个文件的准确路径；
2. 当前与语言和沟通方式有关的规则；
3. 你接下来默认使用什么语言回复。
```

Codex能够正确说出全局`AGENTS.md`的路径，并复述出刚才设置的中文规则，基本就说明设置已经生效。

![image\.png](/images/codex-chinese-settings/image-12.png)

Codex CLI用户也可以按照官方文档提供的方式，让Codex直接总结当前加载的指令：

```Plain Text
codex --ask-for-approval never "Summarize the current instructions."
```

官方文档预期Codex会复述`~/.codex/AGENTS.md`中的规则。

![image\.png](/images/codex-chinese-settings/image-9.png)

## 三、让Codex自己设置

懒得进入文件夹，也可以让Codex自己检查并创建全局`AGENTS.md`。

直接把下面这段话发给它：

```Plain Text
请检查我当前实际使用的Codex全局配置目录。

在不覆盖已有内容的前提下，创建或增量更新全局AGENTS.md，并加入以下规则：

1. 默认使用简体中文与我交流；
2. 任务计划、进度更新、问题说明、代码审查意见和最终总结使用简体中文；
3. 代码、命令、文件路径、配置键、API名称、函数名、变量名和专有名词保留原文；
4. 英文报错先保留完整原文，再使用中文解释；
5. 除非我明确要求，否则不要切换为英文。

执行要求：

- 先检查当前实际使用的CODEX_HOME；
- 检查是否已经存在AGENTS.md或者AGENTS.override.md；
- 已有相同规则时不要重复添加；
- 不要覆盖或者删除已有规则；
- 不要读取或修改auth.json；
- 不要修改config.toml和其他无关文件；
- 修改完成后，告诉我实际修改的文件路径；
- 展示本次新增的diff；
- 检查文件名是否误保存成AGENTS.md.txt。
```

Codex需要访问全局目录时，可能会向你申请对应的文件权限。看清楚它准备修改的路径，确认是自己的`.codex`目录之后，再批准即可。

让Codex自己给Codex设置中文。

确实有点套娃了哈哈哈。

但是相比自己手动找路径，这种方法还有一个好处：

**它可以顺便帮你检查，之前是不是已经存在别的规则文件。**

## 四、 Codex App中设置Agents\.md

这个简单一点，打开codex页面，点击右下角的设置

![image\.png](/images/codex-chinese-settings/image-1.png)

找到，个性化，自定义指令。

把上方的提示词，复制到这里，点击保存即可。

![image\.png](/images/codex-chinese-settings/image-7.png)

## 五、Codex App怎么设置中文界面？

前面解决的是Codex的回复语言。

接下来再修改按钮、菜单和设置页面的界面语言。

打开Codex App之后，进入Settings

![image\.png](/images/codex-chinese-settings/image-13.png)

然后找到常规，往下滑，找到语言

![image\.png](/images/codex-chinese-settings/image-5.png)

将它修改成，Chinese（简体中文）

![image\.png](/images/codex-chinese-settings/image-14.png)

没有直接看到中文选项，可以先选择：Auto Detect（自动检测）

并确认Windows系统显示语言已经设置为中文。

修改之后没有立即变化，可以关闭客户端，再重新打开一次。

但是还是要提醒一句：

> **Language修改的是Codex App界面，不是Codex回复语言。**
> 
> 

所以，菜单已经变成中文，但Codex的任务计划还是英文，不代表设置失败。

你还需要设置前面的提示词或者全局`AGENTS.md`。

反过来也一样。

已经设置了全局`AGENTS.md`，Codex可以一直用中文回复，但软件按钮仍然是英文，也很正常。

## 五、Codex怎么设置不了中文？

全部设置完成之后，Codex还是使用英文，重点检查下面几个地方。

### 1、只修改了Language

Codex的菜单变成了中文，但是任务计划、进度更新和最终总结依然使用英文。

这是因为`Language`只修改软件界面。

想让Codex回复中文，还需要发送中文提示词，或者配置全局`AGENTS.md`。

### 2、文件变成了AGENTS\.md\.txt

这个是Windows用户最容易踩的坑。

打开文件扩展名显示，确认文件不是：

```Plain Text
AGENTS.md.txt
```

而是：

```Plain Text
AGENTS.md
```

### 3、AGENTS\.md放错了位置

想让所有项目都默认使用中文，需要放在全局Codex目录中。

Windows：

```Plain Text
%USERPROFILE%\.codex\AGENTS.md
```

macOS或者Linux：

```Plain Text
~/.codex/AGENTS.md
```

只放在某个具体项目中，就只会对这个项目生效。

### 4、项目规则覆盖了全局规则

Codex读取完全局规则之后，还会继续读取当前项目以及子目录中的规则。

越靠近当前工作目录，优先级越高。

比如全局`AGENTS.md`里写着：

```Plain Text
默认使用简体中文回复。
```

但当前项目里的`AGENTS.md`又写着：

```Plain Text
Always respond in English.
```

最后生效的，很可能就是项目里的英文规则。

可以让Codex搜索当前项目中的：

```Plain Text
AGENTS.md
AGENTS.override.md
```

看看有没有相互冲突的语言要求。

### 6、修改之后还在使用原来的对话

`AGENTS.md`是在Codex开始任务时加载的。

当前对话已经打开之后，你才修改规则，它不一定会立即重新读取。

所以，修改完成后先新建一个对话。

还是没有生效，再完整重启一次客户端。

### 7、代码、命令和报错仍然是英文

这个不属于设置失败。

比如：

```Plain Text
npm install
git status
ModuleNotFoundError
package.json
```

这些内容本来就不应该全部翻译。函数名被翻译之后，代码没法运行。

报错被翻译之后，也不方便复制到搜索引擎里查。

我最推荐的状态，始终是：

> **Codex使用中文解释，技术原文继续保留。**
> 
> 

---

## 七、我最终保留的Codex中文设置

整个流程跑完之后，我最终没有追求所谓的彻底汉化。

最舒服的是

**中文负责降低理解成本。**

**英文负责保证技术内容不会被翻坏。**

而且，设置Codex默认使用中文，其实只是`AGENTS.md`最基础的一个用法。

除了语言偏好之外，后面还可以继续把自己的：

- 文件管理方式； 

- 测试要求； 

- 完成验收标准； 

慢慢沉淀进去。



当然，还是那句话：**不要一上来就写几百条规则。**

先把一个最小闭环跑通：

> 新建一个Codex对话，不再额外提醒，它依然默认使用中文回复。
> 
> 

能做到这一步，这次设置就已经完成了！

关注佬刘AI。
