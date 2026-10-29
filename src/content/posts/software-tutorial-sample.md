---
title: "一段85秒软件教程样片：把操作、结果和限制讲清楚"
description: "用自制PPT结构检查器展示一段真实录屏：选择文件、检查逐页结构、整理需求和保存报告。提供1080p视频、中英文字幕、对应图文步骤与演示文件，明确系统配音和合成样例边界。"
date: "2026-10-30"
slug: "software-tutorial-sample"
published: true
---

一段软件教程，除了告诉观众点哪里，还应该说明做完后会看到什么、哪些问题仍需要人工判断。

下面是一份 **85 秒的真实操作样片**。演示的是自制 PPTX 结构检查器，文件和业务数字都是合成材料。它是原创演示项目，不是客户委托、品牌合作或效果案例。

<button id="load-sample-video" type="button" hidden style="padding:10px 16px;border:1px solid #1c5948;border-radius:6px;background:#1c5948;color:white;font:inherit;cursor:pointer;">加载视频（约3.2 MB）</button>
<p id="sample-video-status" role="status" aria-live="polite">也可以通过下方链接下载视频观看。</p>
<style>#sample-video::cue { font-size: clamp(12px, 1.1vw, 18px); }</style>
<video id="sample-video" playsinline preload="none" tabindex="0" width="1920" height="1080" style="max-width:100%;height:auto;" poster="/media/software-tutorial-sample/poster.png" aria-describedby="sample-video-status" aria-label="85秒PPT结构检查器操作样片，系统语音配音，合成材料">
  <track kind="subtitles" srclang="en" label="English captions" src="/media/software-tutorial-sample/captions-en.vtt" />
  你的浏览器可能不支持内嵌播放，请通过下方链接下载视频。
</video>
<script src="/media/software-tutorial-sample/player.js" defer></script>
<noscript><p>当前浏览器未启用JavaScript，请使用下方视频下载链接观看，字幕和图文说明仍可阅读。</p></noscript>

手机上建议全屏查看操作细节；英文字幕可以在播放器的字幕菜单中选择。

**制作说明：** 1080p 实际浏览器录屏，使用 AI 辅助整理脚本与制作流程。声音来自 Windows 的 Microsoft Huihui Desktop 系统语音，画面中也有标识；不是本人真人配音。视频已带中文字幕，播放器可选英文字幕。字幕沿用句级近似时间轴，没有进行逐字强制对齐。

录制的是工具初版界面。当前[公开检查器](/tools/ppt-check/)已增加一些说明入口，核心检查流程与三个演示文件仍可重现。

## 这段视频具体演示了什么

| 大约位置 | 画面里的动作 | 要解释清楚的事 |
| --- | --- | --- |
| 00:00 | 展示检查器与演示范围 | PPTX 后缀不代表所有内容都能编辑 |
| 00:15 | 检查整页图片版 | 文件可以打开，但图片里的字没有独立文字对象 |
| 00:28 | 检查原生重建版 | 看含字对象、形状和连接线数量，继续实际验收 |
| 00:42 | 检查混合版 | 第一页和第二页结构不同，要逐页查看 |
| 00:55 | 填写一份合成需求清单 | 只生成文字，不发送订单或客户文件 |
| 01:10 | 保存结构报告 | 报告是检查材料，最终仍要实际修改、保存和重开 |

这段样片只展示**结构检查与报告交付**。没有演示从截图自动转换为 PPT，也没有在视频里完成 PowerPoint 实际修改。因此，不能拿这段录屏单独证明视觉还原准确率、文字识别质量或所有对象都能方便编辑。

更完整的[结构检查与修改验收说明](/ppt-editability-check/)里列出了三份对照文件、实际改字和移动后保存重开的检查结果，以及原生表格、图表数据等没有被这个样例覆盖的能力。

## 配套材料可以一起检查

也可以一次下载[样片审阅包](/downloads/software-tutorial-sample-kit-v1.zip)：含视频、中英文字幕、三份演示PPT、英文说明与文件清单。它是自制样品的审阅材料，不含原始录制/剪辑工程或工具程序。

- <a href="/media/software-tutorial-sample/ppt-check-demo.mp4" download="ppt-check-demo.mp4">下载1080p视频</a>，约 3.2 MB。
- <a href="/media/software-tutorial-sample/captions-zh.srt" download="captions-zh.srt">下载中文字幕 SRT</a>。
- <a href="/media/software-tutorial-sample/captions-en.srt" download="captions-en.srt">下载英文字幕 SRT</a>，英文内容由 AI 辅助翻译，时间段与中文版本一致。
- [打开对应图文教程](/ppt-editability-check/)，按步骤复现并理解限制。
- [下载三份合成演示文件](/tools/ppt-check/samples/editable-demo-pack.zip)，比较整页图片、混合结构和原生重建版。

视频、字幕、操作说明和示例文件对应同一个流程。这样查看者不必只相信一张宣传图，可以自己打开工具，检查输入和输出。

## Sample brief in English

This sample demonstrates a browser-based PPTX structure checker built for an original demonstration project. It is a real screen recording with synthetic files, not client work. The workflow covers image-only, native-object and mixed slides, followed by a written brief and report export. The deliverable is an 85-second 1080p video with Chinese system-voice narration, embedded Chinese subtitles, optional English captions, and a matching written guide. AI assisted the preparation. Structure counts do not verify text accuracy or practical editability; those require separate checks. Client scope, language, narration and AI-content policy would be agreed before any quotation.

## 讨论类似教程前，先明确一个流程

如果你希望讨论软件操作教程的制作，可以先在公众号「佬刘AI」说明软件名称、目标观众、希望讲清的一段流程、预计时长与交付形式，以及是否要求真人配音或限制 AI 辅助。可通过[已发表的公众号文章](https://mp.weixin.qq.com/s/v6gqmLi7n21jBisV_8RCPA)核对作者名称。

首次先描述需求，演示账号、授权材料和文件提供方式再单独确认。是否适合承接、范围、报价和时间都需另行沟通；这份样片没有证明任何特定品牌已经认可，也没有承诺播放量、获客或收入。
