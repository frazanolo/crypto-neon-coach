export interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
    url?: string;
  };
  category: 'crypto' | 'finance' | 'markets' | 'general';
}

export interface NewsResponse {
  articles: NewsItem[];
  totalResults: number;
  status: string;
}

/**
 * Fetches financial and crypto news from NewsAPI
 * Note: This requires an API key from NewsAPI.org
 */
export async function fetchFinancialNews(
  category: 'crypto' | 'finance' | 'markets' = 'crypto',
  limit: number = 10
): Promise<NewsItem[]> {
  // For now, return mock data. Will be replaced with real API calls when keys are configured
  const mockNews: NewsItem[] = [
    {
      title: "Bitcoin ETF sees record inflows as institutional adoption accelerates",
      description: "Major Bitcoin ETFs recorded their highest single-day inflows since launch as institutional investors continue to embrace digital assets.",
      url: "https://example.com/bitcoin-etf-inflows",
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      source: {
        name: "CryptoNews",
        url: "https://cryptonews.com"
      },
      category: 'crypto'
    },
    {
      title: "Federal Reserve maintains interest rates at 5.25% amid economic uncertainty",
      description: "The Fed decided to hold rates steady as inflation shows signs of cooling while employment remains strong.",
      url: "https://example.com/fed-rates",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      source: {
        name: "Reuters",
        url: "https://reuters.com"
      },
      category: 'finance'
    },
    {
      title: "Crypto market shows resilience despite global economic headwinds",
      description: "Digital assets demonstrate strong performance as traditional markets face volatility from geopolitical tensions.",
      url: "https://example.com/crypto-resilience",
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      source: {
        name: "Bloomberg",
        url: "https://bloomberg.com"
      },
      category: 'markets'
    },
    {
      title: "Major tech stocks rally on AI optimism and earnings beats",
      description: "Technology sector leads market gains as companies report strong quarterly results driven by AI investments.",
      url: "https://example.com/tech-rally",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      source: {
        name: "MarketWatch",
        url: "https://marketwatch.com"
      },
      category: 'markets'
    },
    {
      title: "Central banks explore digital currencies as adoption grows worldwide",
      description: "Multiple countries advance CBDC pilots as digital payment systems gain mainstream acceptance.",
      url: "https://example.com/cbdc-adoption",
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      source: {
        name: "Financial Times",
        url: "https://ft.com"
      },
      category: 'crypto'
    },
    {
      title: "Inflation data shows continued cooling trend, supporting market optimism",
      description: "Latest CPI figures indicate that inflationary pressures are easing, providing relief to investors and policymakers.",
      url: "https://example.com/inflation-cooling",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      source: {
        name: "CNBC",
        url: "https://cnbc.com"
      },
      category: 'finance'
    }
  ];

  // Filter by category and limit results
  const filteredNews = mockNews
    .filter(article => article.category === category)
    .slice(0, limit);

  return filteredNews;
}

/**
 * Fetches mixed financial, crypto, and market news
 */
export async function fetchMixedFinancialNews(limit: number = 10): Promise<NewsItem[]> {
  try {
    const [cryptoNews, financeNews, marketNews] = await Promise.all([
      fetchFinancialNews('crypto', 3),
      fetchFinancialNews('finance', 4),
      fetchFinancialNews('markets', 3)
    ]);

    // Combine and sort by publication date
    const allNews = [...cryptoNews, ...financeNews, ...marketNews]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);

    return allNews;
  } catch (error) {
    console.error('Error fetching mixed financial news:', error);
    throw error;
  }
}

/**
 * Formats news for display
 */
export function formatNewsForDisplay(news: NewsItem[]): {
  title: string;
  subtitle: string;
  timeAgo: string;
  source: string;
  url: string;
}[] {
  return news.map(article => ({
    title: article.title,
    subtitle: article.description.length > 100 
      ? article.description.substring(0, 100) + '...'
      : article.description,
    timeAgo: getTimeAgo(article.publishedAt),
    source: article.source.name,
    url: article.url
  }));
}

/**
 * Helper function to get relative time
 */
function getTimeAgo(dateString: string): string {
  const now = new Date();
  const publishedDate = new Date(dateString);
  const diffInMs = now.getTime() - publishedDate.getTime();
  
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
}