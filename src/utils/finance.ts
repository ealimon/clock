import { FinancialNewsItem, MarketIndexItem } from '../types';

export const DEFAULT_MARKET_INDICES: MarketIndexItem[] = [
  { symbol: 'S&P 500', name: 'S&P 500', price: '5,626.02', change: '+0.42%', isPositive: true },
  { symbol: 'NASDAQ', name: 'Nasdaq Composite', price: '17,713.62', change: '+0.68%', isPositive: true },
  { symbol: 'DOW', name: 'Dow Jones', price: '41,622.08', change: '+0.25%', isPositive: true },
  { symbol: 'US10Y', name: '10-Yr Yield', price: '3.64%', change: '-0.03%', isPositive: false },
  { symbol: 'BTC/USD', name: 'Bitcoin', price: '$58,410', change: '+1.94%', isPositive: true },
  { symbol: 'OIL', name: 'Crude Oil', price: '$70.85', change: '-0.45%', isPositive: false },
  { symbol: 'GOLD', name: 'Gold', price: '$2,582.40', change: '+0.31%', isPositive: true },
  { symbol: 'EUR/USD', name: 'EUR / USD', price: '1.1124', change: '+0.12%', isPositive: true },
];

export const INITIAL_FINANCIAL_HEADLINES: FinancialNewsItem[] = [
  {
    id: 'f1',
    title: 'Federal Reserve begins policy meeting with rate cut expectations in focus',
    source: 'CNBC',
    url: 'https://www.cnbc.com/markets/',
    time: '15m ago',
    category: 'economy',
  },
  {
    id: 'f2',
    title: 'Tech stocks push indexes higher as AI semiconductor demand shows continued strength',
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com/markets',
    time: '32m ago',
    category: 'markets',
  },
  {
    id: 'f3',
    title: 'Treasury yields steady ahead of central bank monetary outlook statement',
    source: 'Wall Street Journal',
    url: 'https://www.wsj.com/finance',
    time: '45m ago',
    category: 'markets',
  },
  {
    id: 'f4',
    title: 'Global oil prices stabilize amid production updates and economic demand indicators',
    source: 'Reuters',
    url: 'https://www.reuters.com/business',
    time: '1h ago',
    category: 'commodities',
  },
  {
    id: 'f5',
    title: 'European markets track gains following regional corporate earnings updates',
    source: 'Financial Times',
    url: 'https://www.ft.com/markets',
    time: '1h 15m ago',
    category: 'markets',
  },
  {
    id: 'f6',
    title: 'Retail sales figures demonstrate ongoing consumer spending resilience',
    source: 'MarketWatch',
    url: 'https://www.marketwatch.com',
    time: '2h ago',
    category: 'economy',
  },
  {
    id: 'f7',
    title: 'Institutional interest in digital asset treasury reserves expands',
    source: 'CoinDesk',
    url: 'https://www.coindesk.com',
    time: '2h 20m ago',
    category: 'crypto',
  }
];

const FINANCE_RSS_URLS = [
  {
    source: 'CNBC',
    url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    category: 'markets' as const,
  },
  {
    source: 'MarketWatch',
    url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    category: 'markets' as const,
  }
];

function formatTimeAgo(dateStr: string): string {
  try {
    const pub = new Date(dateStr).getTime();
    if (isNaN(pub)) return 'Recent';
    const diffMin = Math.floor((Date.now() - pub) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return 'Recent';
  }
}

/**
 * Clean headline title from common RSS suffixes like " - CNBC" or "[Bloomberg]"
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\s*[-–—|]\s*(CNBC|MarketWatch|Reuters|Bloomberg|Yahoo Finance|WSJ).*/i, '')
    .trim();
}

/**
 * Fetches live financial headlines using public RSS-to-JSON endpoints
 */
export async function fetchLiveFinancialNews(): Promise<FinancialNewsItem[]> {
  const items: FinancialNewsItem[] = [];

  for (const feed of FINANCE_RSS_URLS) {
    try {
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&api_key=&count=8`
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.status === 'ok' && Array.isArray(data.items)) {
          for (const item of data.items) {
            if (item.title && typeof item.title === 'string') {
              items.push({
                id: item.guid || item.link || `${feed.source}-${Math.random()}`,
                title: cleanTitle(item.title),
                source: feed.source,
                url: item.link || undefined,
                time: item.pubDate ? formatTimeAgo(item.pubDate) : 'Recent',
                category: feed.category,
              });
            }
          }
        }
      }
    } catch {
      // Continue to next feed if one fails
    }
  }

  // If we got items from live feeds, return them deduplicated
  if (items.length >= 3) {
    const unique = new Map<string, FinancialNewsItem>();
    items.forEach((item) => {
      const key = item.title.toLowerCase().slice(0, 30);
      if (!unique.has(key)) {
        unique.set(key, item);
      }
    });
    return Array.from(unique.values()).slice(0, 15);
  }

  // Fallback to rich curated current headlines
  return INITIAL_FINANCIAL_HEADLINES;
}
