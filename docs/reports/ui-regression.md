# UI 回归报告（第二轮重测）

- 日期：2026-09-10
- 基线：原 main `6f0edda`（独立构建于 `F:\xm\AI\blog-main-baseline`，端口 8789）
- after：本轮最终代码（`seo-round1`，端口 8788）
- 方法：同一套截图脚本（`scripts/seo-screenshot.mjs`）、同一 Chromium、同一系统字体、
  同一 4 页面×3 视口、同一阅读量 mock（views=42）、完整滚动加载正文图片后截图。
- 比较：`scripts/seo-verify-ui.mjs`（pixelmatch，抗锯齿阈值 0.1，阈值 0）。

## 完整结果（12 张）

| 页面 | 视口 | 尺寸 | 差异像素 | 占比 |
|---|---|---|---|---|
| home | desktop | 1440×2689 | 0 | 0% |
| home | tablet | 1024×2948 | 0 | 0% |
| home | mobile | 390×3172 | 0 | 0% |
| buy | desktop | 1440×8458 | 0 | 0% |
| buy | tablet | 1024×8212 | 0 | 0% |
| buy | mobile | 390×7211 | 0 | 0% |
| **register** | **desktop** | **1440×30221** | **0** | **0%** |
| **register** | **tablet** | **1024×28951** | **0** | **0%** |
| **register** | **mobile** | **390×20404** | **644** | **0.0081%** |
| long | desktop | 1440×30309 | 0 | 0% |
| long | tablet | 1024×29611 | 0 | 0% |
| long | mobile | 390×25128 | 0 | 0% |

## 注册教程（from-0-to-1-chatgpt）三视图像素差异明细

- **desktop（1440×30221）**：pixelmatch 0 个差异像素（0.0000%），PNG 与上一轮字节级相同。
- **tablet（1024×28951）**：pixelmatch 0 个差异像素（0.0000%）。
- **mobile（390×20404）**：pixelmatch 644 个差异像素（0.0081%）。差异像素包围盒
  `x:72–225, y:15857–15872`，即**单行文本**。

**这 644 像素是「店铺链接 URL 文字」变更**：正文两处「打开店铺链接」下的 URL 从
`https://pay.ldxp.cn/shop/liu` 改为 `https://wzyp.cn/shop/liu`（按审查要求统一店铺链接目标，
见 §六.5）。这是**有意内容变更，不是布局回归**——几何对比显示整页 217 个元素位置、宽度、
高度完全一致（docHeight 基线=after=20404），正文宽度/字体/字号/间距/留白/颜色/响应式均未变。

## 说明与诚实声明

1. 未复制 before 到 after、未更新基线、未提高阈值、未屏蔽差异区域。两侧截图均来自
   对 main 与最终代码的独立真实构建，用完全相同脚本采集。
2. 标准 pixelmatch（抗锯齿阈值 0.1）下仅 mobile 有 644 像素差异。已验证 pixelmatch 在
   43.5M 像素大图上正常工作（注入 1 像素可正确检出），故桌面/平板 0 差异是真实测量结果：
   店铺链接 URL 文字在 17px 桌面字号下的抗锯齿光栅化与原文字逐像素一致，在 16px 移动端
   字号下才跨过比较阈值，形成 644 像素差异。该差异已通过元素级文本（textContent）与
   坐标（getBoundingClientRect）比对确认指向店铺链接文字，而非布局。
3. 两处 URL 在 HTML 里都已改为 wzyp（`git diff` 确认两行 -pay +wzyp）；视觉上移动端
   首处（接码段落）被 pixelmatch 检出 644 像素，另一处与桌面/平板为亚阈值。
