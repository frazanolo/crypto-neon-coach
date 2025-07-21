// Enhanced crypto API service for comprehensive market data
export interface CryptoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  high_24h: number;
  low_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CryptoHistoricalData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface TechnicalIndicators {
  rsi: number;
  sma_20: number;
  sma_50: number;
  sma_200: number;
  ema_12: number;
  ema_26: number;
  macd: number;
  macd_signal: number;
  bb_upper: number;
  bb_middle: number;
  bb_lower: number;
  volume_sma: number;
  support_levels: number[];
  resistance_levels: number[];
}

class CryptoAPI {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 60000; // 1 minute

  private async fetchWithCache<T>(url: string): Promise<T> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}${url}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(url, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Get comprehensive market data for multiple cryptocurrencies
  async getMarketData(
    ids?: string[],
    vsCurrency = 'usd',
    perPage = 250,
    page = 1,
    includeSparkline = false
  ): Promise<CryptoMarketData[]> {
    const params = new URLSearchParams({
      vs_currency: vsCurrency,
      order: 'market_cap_desc',
      per_page: perPage.toString(),
      page: page.toString(),
      sparkline: includeSparkline.toString(),
      ...(ids && { ids: ids.join(',') })
    });

    return this.fetchWithCache(`/coins/markets?${params}`);
  }

  // Get historical price data for portfolio tracking
  async getHistoricalData(
    coinId: string,
    vsCurrency = 'usd',
    days = 30,
    interval?: string
  ): Promise<CryptoHistoricalData> {
    const params = new URLSearchParams({
      vs_currency: vsCurrency,
      days: days.toString(),
      ...(interval && { interval })
    });

    return this.fetchWithCache(`/coins/${coinId}/market_chart?${params}`);
  }

  // Search for cryptocurrencies
  async searchCoins(query: string): Promise<any[]> {
    if (!query.trim()) return [];
    return this.fetchWithCache(`/search?query=${encodeURIComponent(query)}`);
  }

  // Get supported currencies
  async getSupportedCurrencies(): Promise<string[]> {
    return this.fetchWithCache('/simple/supported_vs_currencies');
  }

  // Get trending cryptocurrencies
  async getTrending(): Promise<any> {
    return this.fetchWithCache('/search/trending');
  }

  // Get real-time prices for specific coins
  async getLivePrices(
    coinIds: string[],
    vsCurrency = 'usd',
    includeChange = true
  ): Promise<Record<string, any>> {
    if (coinIds.length === 0) return {};
    
    const params = new URLSearchParams({
      ids: coinIds.join(','),
      vs_currencies: vsCurrency,
      include_24hr_change: includeChange.toString(),
      include_24hr_vol: 'true',
      include_market_cap: 'true'
    });

    return this.fetchWithCache(`/simple/price?${params}`);
  }

  // Calculate technical indicators (mock implementation - in production use a proper library)
  calculateTechnicalIndicators(prices: number[]): TechnicalIndicators {
    if (prices.length < 20) {
      throw new Error('Insufficient data for technical analysis');
    }

    const calculateSMA = (data: number[], period: number): number => {
      const slice = data.slice(-period);
      return slice.reduce((sum, price) => sum + price, 0) / period;
    };

    const calculateEMA = (data: number[], period: number): number => {
      const multiplier = 2 / (period + 1);
      let ema = data[0];
      for (let i = 1; i < data.length; i++) {
        ema = (data[i] * multiplier) + (ema * (1 - multiplier));
      }
      return ema;
    };

    const calculateRSI = (data: number[], period = 14): number => {
      if (data.length < period + 1) return 50;
      
      let gains = 0;
      let losses = 0;
      
      for (let i = 1; i <= period; i++) {
        const change = data[data.length - i] - data[data.length - i - 1];
        if (change > 0) gains += change;
        else losses -= change;
      }
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / avgLoss;
      return 100 - (100 / (1 + rs));
    };

    const currentPrice = prices[prices.length - 1];
    const sma_20 = calculateSMA(prices, 20);
    const sma_50 = calculateSMA(prices.slice(-50), 50);
    const sma_200 = prices.length >= 200 ? calculateSMA(prices.slice(-200), 200) : sma_50;
    
    return {
      rsi: calculateRSI(prices),
      sma_20,
      sma_50,
      sma_200,
      ema_12: calculateEMA(prices.slice(-12), 12),
      ema_26: calculateEMA(prices.slice(-26), 26),
      macd: 0, // Simplified - would need proper MACD calculation
      macd_signal: 0,
      bb_upper: sma_20 * 1.02, // Simplified Bollinger Bands
      bb_middle: sma_20,
      bb_lower: sma_20 * 0.98,
      volume_sma: 0, // Would need volume data
      support_levels: [currentPrice * 0.95, currentPrice * 0.90, currentPrice * 0.85],
      resistance_levels: [currentPrice * 1.05, currentPrice * 1.10, currentPrice * 1.15]
    };
  }

  // Map common symbols to CoinGecko IDs
  mapSymbolToId(symbol: string): string {
    const symbolMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'SOL': 'solana',
      'DOT': 'polkadot',
      'AVAX': 'avalanche-2',
      'MATIC': 'polygon',
      'DOGE': 'dogecoin',
      'SHIB': 'shiba-inu',
      'LTC': 'litecoin',
      'TRX': 'tron',
      'UNI': 'uniswap',
      'LINK': 'chainlink',
      'ATOM': 'cosmos',
      'ETC': 'ethereum-classic',
      'XLM': 'stellar',
      'BCH': 'bitcoin-cash',
      'NEAR': 'near',
      'APT': 'aptos',
      'FIL': 'filecoin',
      'VET': 'vechain',
      'IMX': 'immutable-x',
      'HBAR': 'hedera-hashgraph',
      'QNT': 'quant-network',
      'ALGO': 'algorand',
      'MANA': 'decentraland',
      'SAND': 'the-sandbox'
    };
    
    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  // Get comprehensive coin info by symbol
  async getCoinBySymbol(symbol: string): Promise<CryptoMarketData | null> {
    try {
      const coinId = this.mapSymbolToId(symbol);
      const marketData = await this.getMarketData([coinId]);
      return marketData.length > 0 ? marketData[0] : null;
    } catch (error) {
      console.error(`Failed to get coin data for ${symbol}:`, error);
      return null;
    }
  }
}

export const cryptoAPI = new CryptoAPI();