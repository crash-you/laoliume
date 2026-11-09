// 站点地图内的公开页面需要允许这三种搜索爬虫访问。
const SEARCH_CRAWLERS = ['Googlebot', 'Bingbot', 'Baiduspider'];

function compilePath(pattern) {
  const anchored = pattern.endsWith('$');
  const path = anchored ? pattern.slice(0, -1) : pattern;
  const escaped = path.split('*').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp('^' + escaped.join('.*') + (anchored ? '$' : ''));
}

export function parseRobots(text) {
  const groups = [];
  const sitemaps = [];
  let group;
  for (const line of text.split(/\r?\n/)) {
    const match = line.split('#', 1)[0].trim().match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    const field = match[1].toLowerCase();
    const value = match[2].trim();
    if (field === 'sitemap') {
      sitemaps.push(value);
    } else if (field === 'user-agent' && value) {
      if (!group || group.rules.length) {
        group = { agents: [], rules: [] };
        groups.push(group);
      }
      group.agents.push(value.toLowerCase());
    } else if (group && (field === 'allow' || field === 'disallow')) {
      // 空规则结束 User-agent 声明，本身不匹配 URL。
      group.rules.push({ type: field, path: value, matcher: value ? compilePath(value) : null });
    }
  }

  function allowsCrawler(agent, path = '/') {
    const token = agent.toLowerCase();
    const specific = groups.filter((g) => g.agents.includes(token));
    const applicable = specific.length ? specific : groups.filter((g) => g.agents.includes('*'));
    let best;
    for (const group of applicable) {
      for (const rule of group.rules) {
        if (!rule.matcher?.test(path)) continue;
        const result = { allowed: rule.type === 'allow', reason: rule.type + ': ' + rule.path };
        // 百度从上到下采用首条匹配规则，后置 Allow 不能覆盖前置禁抓。
        // https://www.baidu.com/search/robots_english.html (section 7)
        if (token === 'baiduspider') return result;
        const length = Buffer.byteLength(rule.path);
        if (!best || length > best.length || (length === best.length && result.allowed)) {
          best = { length, result };
        }
      }
    }
    return best?.result ?? { allowed: true, reason: '无匹配规则，默认允许' };
  }
  return { groups, sitemaps, allowsCrawler };
}

export function checkSearchCrawlers(robots, paths) {
  const issues = [];
  for (const agent of SEARCH_CRAWLERS) {
    for (const path of paths) {
      const verdict = robots.allowsCrawler(agent, path);
      if (!verdict.allowed) {
        issues.push(agent + ' 禁抓 ' + path + '（' + verdict.reason + '）');
        break;
      }
    }
  }
  return issues;
}
