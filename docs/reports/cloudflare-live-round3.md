# laoliu.me 线上只读核验（本轮重新实测）

时间：2026-09-12T14:52:21.495Z
方式：只读 HTTP GET（redirect: manual），未修改任何 Cloudflare 生产设置。

## 跳转链

### https://laoliu.me/
```
301 https://laoliu.me/ -> https://www.laoliu.me/
200 https://www.laoliu.me/ (final)
```

### https://laoliu.me/codex-buy
```
301 https://laoliu.me/codex-buy -> https://www.laoliu.me/codex-buy
307 https://www.laoliu.me/codex-buy -> /codex-buy/
200 https://www.laoliu.me/codex-buy/ (final)
```

### https://www.laoliu.me/
```
200 https://www.laoliu.me/ (final)
```

## robots.txt

- 状态: 200
- content-type: text/plain; charset=utf-8
- server: cloudflare
- 是否含 Sitemap 声明: 否
- 是否含 Cloudflare Managed content: 是
- body 长度: 1836

```
# As a condition of accessing this website, you agree to abide by the following
# content signals:

# (a)  If a Content-Signal = yes, you may collect content for the corresponding
#      use.
# (b)  If a Content-Signal = no, you may not collect content for the
#      corresponding use.
# (c)  If the website operator does not include a Content-Signal for a
#      corresponding use, the website operator neither grants nor restricts
#      permission via Content-Signal with respect to the corresponding use.

# The content signals and their meanings are:

# search:   building a search index and providing search results (e.g., returning
#           hyperlinks and short excerpts from your website's contents). Search does not
#           include providing AI-generated search summaries.
# ai-input: inputting content into one or more AI models (e.g., retrieval
#           augmented generation, grounding, or other real-time taking of content for
#           generative AI search answers).
# ai-train: training or fine-tuning AI models.
# use:      how AI systems may consume the content (immediate, reference, or full).

# ANY RESTRICTIONS EXPRESSED VIA CONTENT SIGNALS ARE EXPRESS RESERVATIONS OF
# RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN UNION DIRECTIVE 2019/790 ON COPYRIGHT
# AND RELATED RIGHTS IN THE DIGITAL SINGLE MARKET.

# BEGIN Cloudflare Managed content

User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CloudflareBrowserRenderingCrawler
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: meta-externalagent
Disallow: /

# END Cloudflare Managed Content
```