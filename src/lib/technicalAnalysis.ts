// Professional Technical Analysis Library
export interface TechnicalIndicatorResult {
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: 'STRONG' | 'WEAK' | 'NEUTRAL';
}

export interface FibonacciLevels {
  high: number;
  low: number;
  levels: {
    '0%': number;
    '23.6%': number;
    '38.2%': number;
    '50%': number;
    '61.8%': number;
    '78.6%': number;
    '100%': number;
  };
}

export interface PatternResult {
  pattern: string;
  probability: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  target: number;
  stopLoss: number;
}

export class TechnicalAnalysis {
  // Accurate RSI calculation
  static calculateRSI(prices: number[], period = 14): TechnicalIndicatorResult {
    if (prices.length < period + 1) {
      return { value: 50, signal: 'HOLD', strength: 'NEUTRAL' };
    }

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate RSI using smoothed averages
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let strength: 'STRONG' | 'WEAK' | 'NEUTRAL' = 'NEUTRAL';

    if (rsi <= 30) {
      signal = 'BUY';
      strength = rsi <= 20 ? 'STRONG' : 'WEAK';
    } else if (rsi >= 70) {
      signal = 'SELL';
      strength = rsi >= 80 ? 'STRONG' : 'WEAK';
    }

    return { value: Number(rsi.toFixed(2)), signal, strength };
  }

  // Accurate SMA calculation
  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const slice = prices.slice(-period);
    return Number((slice.reduce((sum, price) => sum + price, 0) / period).toFixed(4));
  }

  // Accurate EMA calculation
  static calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return Number(ema.toFixed(4));
  }

  // MACD calculation
  static calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    // Calculate signal line (9-period EMA of MACD)
    const macdHistory = [];
    for (let i = 26; i < prices.length; i++) {
      const slice = prices.slice(0, i + 1);
      const ema12 = this.calculateEMA(slice, 12);
      const ema26 = this.calculateEMA(slice, 26);
      macdHistory.push(ema12 - ema26);
    }
    
    const signal = this.calculateEMA(macdHistory, 9);
    const histogram = macd - signal;
    
    return {
      macd: Number(macd.toFixed(4)),
      signal: Number(signal.toFixed(4)),
      histogram: Number(histogram.toFixed(4))
    };
  }

  // Bollinger Bands calculation
  static calculateBollingerBands(prices: number[], period = 20, multiplier = 2) {
    const sma = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);
    
    // Calculate standard deviation
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: Number((sma + (stdDev * multiplier)).toFixed(4)),
      middle: sma,
      lower: Number((sma - (stdDev * multiplier)).toFixed(4))
    };
  }

  // Fibonacci retracement calculation
  static calculateFibonacciRetracement(high: number, low: number): FibonacciLevels {
    const range = high - low;
    
    return {
      high,
      low,
      levels: {
        '0%': Number(high.toFixed(4)),
        '23.6%': Number((high - range * 0.236).toFixed(4)),
        '38.2%': Number((high - range * 0.382).toFixed(4)),
        '50%': Number((high - range * 0.5).toFixed(4)),
        '61.8%': Number((high - range * 0.618).toFixed(4)),
        '78.6%': Number((high - range * 0.786).toFixed(4)),
        '100%': Number(low.toFixed(4))
      }
    };
  }

  // Support and Resistance levels
  static calculateSupportResistance(prices: number[], minTouches = 2): { support: number[]; resistance: number[] } {
    const support: number[] = [];
    const resistance: number[] = [];
    
    // Find local minima and maxima
    for (let i = 2; i < prices.length - 2; i++) {
      const price = prices[i];
      const isLocalMin = price <= prices[i-1] && price <= prices[i-2] && 
                         price <= prices[i+1] && price <= prices[i+2];
      const isLocalMax = price >= prices[i-1] && price >= prices[i-2] && 
                         price >= prices[i+1] && price >= prices[i+2];
      
      if (isLocalMin) {
        support.push(Number(price.toFixed(4)));
      }
      if (isLocalMax) {
        resistance.push(Number(price.toFixed(4)));
      }
    }
    
    // Group similar levels (within 1% range) and count touches
    const groupLevels = (levels: number[]) => {
      const grouped: { level: number; count: number }[] = [];
      
      levels.forEach(level => {
        const existing = grouped.find(g => Math.abs(g.level - level) / g.level < 0.01);
        if (existing) {
          existing.count++;
          existing.level = (existing.level + level) / 2; // Average the levels
        } else {
          grouped.push({ level, count: 1 });
        }
      });
      
      return grouped
        .filter(g => g.count >= minTouches)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(g => g.level);
    };
    
    return {
      support: groupLevels(support),
      resistance: groupLevels(resistance)
    };
  }

  // Pattern recognition
  static detectPatterns(prices: number[]): PatternResult[] {
    const patterns: PatternResult[] = [];
    const currentPrice = prices[prices.length - 1];
    
    // Head and Shoulders detection
    if (prices.length >= 20) {
      const recentPrices = prices.slice(-20);
      const maxIndex = recentPrices.indexOf(Math.max(...recentPrices));
      
      if (maxIndex >= 5 && maxIndex <= 15) {
        const leftShoulder = Math.max(...recentPrices.slice(0, maxIndex - 2));
        const rightShoulder = Math.max(...recentPrices.slice(maxIndex + 2));
        const head = recentPrices[maxIndex];
        
        if (head > leftShoulder && head > rightShoulder &&
            Math.abs(leftShoulder - rightShoulder) / leftShoulder < 0.05) {
          patterns.push({
            pattern: 'Head and Shoulders',
            probability: 75,
            direction: 'BEARISH',
            target: Number((currentPrice * 0.95).toFixed(4)),
            stopLoss: Number((head * 1.02).toFixed(4))
          });
        }
      }
    }
    
    // Double Top/Bottom detection
    if (prices.length >= 30) {
      const recentHighs = [];
      const recentLows = [];
      
      for (let i = 2; i < prices.length - 2; i++) {
        if (prices[i] > prices[i-1] && prices[i] > prices[i+1]) {
          recentHighs.push({ price: prices[i], index: i });
        }
        if (prices[i] < prices[i-1] && prices[i] < prices[i+1]) {
          recentLows.push({ price: prices[i], index: i });
        }
      }
      
      // Check for double top
      if (recentHighs.length >= 2) {
        const lastTwo = recentHighs.slice(-2);
        if (Math.abs(lastTwo[0].price - lastTwo[1].price) / lastTwo[0].price < 0.02) {
          patterns.push({
            pattern: 'Double Top',
            probability: 70,
            direction: 'BEARISH',
            target: Number((currentPrice * 0.94).toFixed(4)),
            stopLoss: Number((Math.max(lastTwo[0].price, lastTwo[1].price) * 1.02).toFixed(4))
          });
        }
      }
      
      // Check for double bottom
      if (recentLows.length >= 2) {
        const lastTwo = recentLows.slice(-2);
        if (Math.abs(lastTwo[0].price - lastTwo[1].price) / lastTwo[0].price < 0.02) {
          patterns.push({
            pattern: 'Double Bottom',
            probability: 70,
            direction: 'BULLISH',
            target: Number((currentPrice * 1.06).toFixed(4)),
            stopLoss: Number((Math.min(lastTwo[0].price, lastTwo[1].price) * 0.98).toFixed(4))
          });
        }
      }
    }
    
    return patterns;
  }

  // Comprehensive analysis
  static performComprehensiveAnalysis(prices: number[]) {
    const currentPrice = prices[prices.length - 1];
    const rsi = this.calculateRSI(prices);
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const macd = this.calculateMACD(prices);
    const bb = this.calculateBollingerBands(prices);
    const levels = this.calculateSupportResistance(prices);
    const patterns = this.detectPatterns(prices);
    
    // Generate overall signal
    let bullishSignals = 0;
    let bearishSignals = 0;
    
    if (rsi.signal === 'BUY') bullishSignals++;
    if (rsi.signal === 'SELL') bearishSignals++;
    if (currentPrice > sma20) bullishSignals++;
    if (currentPrice < sma20) bearishSignals++;
    if (currentPrice > sma50) bullishSignals++;
    if (currentPrice < sma50) bearishSignals++;
    if (macd.macd > macd.signal) bullishSignals++;
    if (macd.macd < macd.signal) bearishSignals++;
    
    const overallSignal = bullishSignals > bearishSignals ? 'BULLISH' : 
                         bearishSignals > bullishSignals ? 'BEARISH' : 'NEUTRAL';
    
    return {
      currentPrice: Number(currentPrice.toFixed(4)),
      rsi,
      sma20,
      sma50,
      macd,
      bollingerBands: bb,
      supportResistance: levels,
      patterns,
      overallSignal,
      confidence: Math.abs(bullishSignals - bearishSignals) / (bullishSignals + bearishSignals) * 100
    };
  }
}