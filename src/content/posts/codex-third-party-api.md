---
title: "Codex怎么使用第三方API？"
description: "手把手教你在 Codex 中接入并使用第三方 API，附配置示例与常见问题。"
date: 2026-09-01
slug: "codex-third-party-api"
wechat_url: "https://mp.weixin.qq.com/s/example-codex-api"
published: true
---

很多人用 Codex 的时候会遇到一个现实问题：官方额度不够用，或者想走第三方 API 降低成本。

这篇文章讲清楚两件事：**怎么配**、**会踩什么坑**。

## 一、基本原理

Codex 本质上是通过 API 调用模型服务。只要第三方服务兼容 OpenAI 的接口协议，就可以通过修改配置让 Codex 走第三方通道。

核心就是三个环境变量：

- `OPENAI_BASE_URL`：第三方接口地址
- `OPENAI_API_KEY`：第三方给的密钥
- 模型名称：以第三方平台支持的为准

## 二、配置步骤

编辑 `~/.codex/config.toml`：

```toml
model_provider = "thirdparty"
model = "gpt-5"

[model_providers.thirdparty]
name = "第三方服务"
base_url = "https://api.example.com/v1"
env_key = "THIRD_PARTY_API_KEY"
wire_api = "responses"
```

然后设置环境变量：

```bash
export THIRD_PARTY_API_KEY="sk-xxxxxxxx"
```

## 三、常见第三方服务对比

| 服务 | 协议兼容 | 价格 | 稳定性 |
| --- | --- | --- | --- |
| 官方 API | 完全兼容 | 高 | 最稳 |
| 中转服务 A | 基本兼容 | 中 | 看运气 |
| 自建网关 | 完全可控 | 低 | 需要自己维护 |

> 提醒：第三方服务的水很深，**不要在里面放任何敏感代码和密钥**，这点务必记住。

## 四、验证是否生效

配置完成后，跑一个最小测试：

```bash
codex "用一句话介绍你自己"
```

如果返回正常且账单走的是第三方，说明配置成功。

### 排错思路

1. 报 `401`：密钥错了，检查环境变量名是否和 `env_key` 一致
2. 报 `404`：`base_url` 路径不对，注意要不要带 `/v1`
3. 一直超时：网络问题，或者该服务不支持 `responses` 协议

## 五、总结

第三方 API 能用，而且确实省钱，但代价是稳定性和安全性都要自己兜底。

我的建议是：**学习阶段用第三方，正经干活还是回官方**。
