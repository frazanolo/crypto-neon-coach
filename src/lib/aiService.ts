// AI Service for crypto analysis and insights
interface AIAnalysisRequest {
  symbol: string;
  price: number;
  indicators: any;
  marketData?: any;
  historicalData?: any;
}

interface AIInsight {
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-100
  signal: string;
  reasoning: string;
  timeframe: 'short' | 'medium' | 'long';
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  riskLevel: 'low' | 'medium' | 'high';
}

interface PortfolioAdvice {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  diversificationScore: number; // 0-100
  riskScore: number; // 0-100
  recommendations: string[];
  rebalanceAdvice: {
    action: 'buy' | 'sell' | 'hold';
    asset: string;
    reasoning: string;
  }[];
}

class AIService {
  private apiKey: string | null = null;
  
  // Set API key (user will provide this)
  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('ai_api_key', key);
  }

  // Get stored API key
  getApiKey(): string | null {
    if (this.apiKey) return this.apiKey;
    this.apiKey = localStorage.getItem('ai_api_key');
    return this.apiKey;
  }

  // Check if AI service is available
  isAvailable(): boolean {
    return !!this.getApiKey();
  }

  // Generate AI insights for a specific cryptocurrency
  async generateInsights(request: AIAnalysisRequest): Promise<AIInsight> {
    if (!this.isAvailable()) {
      return this.getMockInsight(request);
    }

    try {
      // This would be replaced with actual AI API call
      const prompt = this.buildAnalysisPrompt(request);
      const response = await this.callAIAPI(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getMockInsight(request);
    }
  }

  // Generate portfolio advice
  async generatePortfolioAdvice(portfolio: any[], totalValue: number): Promise<PortfolioAdvice> {
    if (!this.isAvailable()) {
      return this.getMockPortfolioAdvice(portfolio);
    }

    try {
      const prompt = this.buildPortfolioPrompt(portfolio, totalValue);
      const response = await this.callAIAPI(prompt);
      return this.parsePortfolioResponse(response);
    } catch (error) {
      console.error('Portfolio analysis failed:', error);
      return this.getMockPortfolioAdvice(portfolio);
    }
  }

  // Build analysis prompt for individual crypto
  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    const { symbol, price, indicators } = request;
    
    return `
      Analyze ${symbol} cryptocurrency with the following data:
      Current Price: $${price}
      RSI: ${indicators.rsi}
      Market Cap: $${indicators.marketCap?.toLocaleString() || 'N/A'}
      24h Volume: $${indicators.volume24h?.toLocaleString() || 'N/A'}
      Support Levels: ${indicators.support_levels?.join(', ') || 'N/A'}
      Resistance Levels: ${indicators.resistance_levels?.join(', ') || 'N/A'}
      
      Provide a JSON response with:
      - type: "bullish", "bearish", or "neutral"
      - confidence: number (0-100)
      - signal: brief signal description
      - reasoning: detailed analysis reasoning
      - timeframe: "short", "medium", or "long"
      - keyLevels: {support: [], resistance: []}
      - riskLevel: "low", "medium", or "high"
    `;
  }

  // Build portfolio analysis prompt
  private buildPortfolioPrompt(portfolio: any[], totalValue: number): string {
    const holdings = portfolio.map(asset => 
      `${asset.symbol}: ${asset.quantity} coins, $${asset.totalValue.toFixed(2)} value`
    ).join('\n');

    return `
      Analyze this crypto portfolio:
      Total Value: $${totalValue.toLocaleString()}
      Holdings:
      ${holdings}
      
      Provide analysis on:
      - Overall sentiment
      - Diversification score (0-100)
      - Risk score (0-100)
      - Specific recommendations
      - Rebalancing advice
    `;
  }

  // Mock AI API call (replace with real implementation)
  private async callAIAPI(prompt: string): Promise<any> {
    // This is where you'd integrate with OpenAI, Claude, or another AI service
    // For now, we'll simulate a response
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { mockResponse: true };
  }

  // Parse AI response (implement based on actual AI service)
  private parseAIResponse(response: any): AIInsight {
    // This would parse the actual AI response
    return this.getMockInsight({} as AIAnalysisRequest);
  }

  // Parse portfolio response (implement based on actual AI service)
  private parsePortfolioResponse(response: any): PortfolioAdvice {
    return this.getMockPortfolioAdvice([]);
  }

  // Generate mock insights when AI is not available
  private getMockInsight(request: AIAnalysisRequest): AIInsight {
    const rsi = request.indicators?.rsi || 50;
    const price = request.price || 0;
    
    let type: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let confidence = 50;
    let signal = 'Hold position';
    let reasoning = 'Technical indicators show mixed signals';
    
    if (rsi < 30) {
      type = 'bullish';
      confidence = 75;
      signal = 'Potential buying opportunity';
      reasoning = 'RSI indicates oversold conditions, suggesting a potential reversal';
    } else if (rsi > 70) {
      type = 'bearish';
      confidence = 70;
      signal = 'Consider taking profits';
      reasoning = 'RSI indicates overbought conditions, price may face resistance';
    }

    return {
      type,
      confidence,
      signal,
      reasoning,
      timeframe: 'short',
      keyLevels: {
        support: [price * 0.95, price * 0.90],
        resistance: [price * 1.05, price * 1.10]
      },
      riskLevel: confidence > 70 ? 'low' : 'medium'
    };
  }

  // Generate mock portfolio advice
  private getMockPortfolioAdvice(portfolio: any[]): PortfolioAdvice {
    const hasMultipleAssets = portfolio.length > 1;
    const hasBitcoin = portfolio.some(asset => asset.symbol === 'BTC');
    const hasEthereum = portfolio.some(asset => asset.symbol === 'ETH');
    
    let diversificationScore = 30;
    if (hasMultipleAssets) diversificationScore += 30;
    if (hasBitcoin && hasEthereum) diversificationScore += 20;
    if (portfolio.length >= 5) diversificationScore += 20;

    const recommendations = [
      hasMultipleAssets ? 'Good diversification across multiple assets' : 'Consider diversifying into more cryptocurrencies',
      hasBitcoin ? 'Bitcoin provides good portfolio stability' : 'Consider adding Bitcoin for stability',
      hasEthereum ? 'Ethereum adds smart contract exposure' : 'Consider Ethereum for DeFi exposure'
    ];

    return {
      overallSentiment: 'neutral',
      diversificationScore: Math.min(diversificationScore, 100),
      riskScore: portfolio.length === 1 ? 80 : 50,
      recommendations,
      rebalanceAdvice: [
        {
          action: 'hold',
          asset: 'BTC',
          reasoning: 'Maintain current Bitcoin position'
        }
      ]
    };
  }
}

export const aiService = new AIService();