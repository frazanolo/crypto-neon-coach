import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Zap, 
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TradingViewChart } from './TradingViewChart';

interface AdvancedAIAnalysisProps {
  selectedAsset: any;
  portfolioAssets: any[];
  totalValue: number;
  currency: string;
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  description: string;
  type: 'momentum' | 'trend' | 'volume' | 'volatility';
}

interface FibonacciLevel {
  level: number;
  price: number;
  type: 'support' | 'resistance';
  strength: 'strong' | 'moderate' | 'weak';
}

interface MarketAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timeframe: '1h' | '4h' | '1d' | '1w';
  priceTarget: {
    short: number;
    medium: number;
    long: number;
  };
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  fibonacci: FibonacciLevel[];
  marketMetrics: {
    bitcoinDominance: number;
    fearGreedIndex: number;
    marketCap: number;
    volume24h: number;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
}

const AdvancedAIAnalysis: React.FC<AdvancedAIAnalysisProps> = ({
  selectedAsset,
  portfolioAssets,
  totalValue,
  currency
}) => {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1d');

  const generateAdvancedAnalysis = () => {
    if (!selectedAsset) return;

    setIsAnalyzing(true);
    
    // Simulate advanced AI analysis
    setTimeout(() => {
      const mockAnalysis: MarketAnalysis = {
        sentiment: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral',
        confidence: 75 + Math.random() * 20,
        timeframe,
        priceTarget: {
          short: selectedAsset.currentPrice * (0.98 + Math.random() * 0.04),
          medium: selectedAsset.currentPrice * (0.95 + Math.random() * 0.1),
          long: selectedAsset.currentPrice * (0.9 + Math.random() * 0.2),
        },
        keyLevels: {
          support: [
            selectedAsset.currentPrice * 0.95,
            selectedAsset.currentPrice * 0.92,
            selectedAsset.currentPrice * 0.88
          ],
          resistance: [
            selectedAsset.currentPrice * 1.05,
            selectedAsset.currentPrice * 1.08,
            selectedAsset.currentPrice * 1.12
          ]
        },
        fibonacci: [
          { level: 0.236, price: selectedAsset.currentPrice * 1.024, type: 'resistance', strength: 'moderate' },
          { level: 0.382, price: selectedAsset.currentPrice * 1.038, type: 'resistance', strength: 'strong' },
          { level: 0.618, price: selectedAsset.currentPrice * 0.962, type: 'support', strength: 'strong' },
          { level: 0.786, price: selectedAsset.currentPrice * 0.921, type: 'support', strength: 'moderate' }
        ],
        marketMetrics: {
          bitcoinDominance: 45 + Math.random() * 10,
          fearGreedIndex: 30 + Math.random() * 40,
          marketCap: 2.1e12 + Math.random() * 5e11,
          volume24h: 5e10 + Math.random() * 2e10
        },
        riskAssessment: {
          level: Math.random() > 0.7 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          factors: [
            'Market volatility increasing',
            'Bitcoin dominance trending up',
            'Institutional buying pressure',
            'Technical breakout pattern forming'
          ]
        }
      };

      const mockIndicators: TechnicalIndicator[] = [
        {
          name: 'RSI (14)',
          value: 30 + Math.random() * 40,
          signal: Math.random() > 0.5 ? 'bullish' : 'bearish',
          strength: 70 + Math.random() * 25,
          description: 'Momentum oscillator indicating overbought/oversold conditions',
          type: 'momentum'
        },
        {
          name: 'MACD',
          value: -0.5 + Math.random() * 1,
          signal: Math.random() > 0.5 ? 'bullish' : 'bearish',
          strength: 60 + Math.random() * 30,
          description: 'Trend-following momentum indicator',
          type: 'momentum'
        },
        {
          name: 'Bollinger Bands',
          value: Math.random(),
          signal: Math.random() > 0.5 ? 'bullish' : 'neutral',
          strength: 65 + Math.random() * 25,
          description: 'Volatility indicator showing potential breakout zones',
          type: 'volatility'
        },
        {
          name: 'Volume Profile',
          value: 80 + Math.random() * 20,
          signal: 'bullish',
          strength: 75 + Math.random() * 20,
          description: 'Volume-based analysis showing buying/selling pressure',
          type: 'volume'
        },
        {
          name: 'Ichimoku Cloud',
          value: Math.random(),
          signal: Math.random() > 0.6 ? 'bullish' : 'bearish',
          strength: 70 + Math.random() * 25,
          description: 'Comprehensive trend analysis system',
          type: 'trend'
        }
      ];

      setAnalysis(mockAnalysis);
      setIndicators(mockIndicators);
      setIsAnalyzing(false);
    }, 2000);
  };

  useEffect(() => {
    if (selectedAsset) {
      generateAdvancedAnalysis();
    }
  }, [selectedAsset, timeframe]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-success';
      case 'bearish': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return TrendingUp;
      case 'bearish': return TrendingDown;
      default: return Activity;
    }
  };

  const getSignalBadge = (signal: string) => {
    switch (signal) {
      case 'bullish': return <Badge variant="default" className="bg-success/20 text-success border-success/40">Bullish</Badge>;
      case 'bearish': return <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/40">Bearish</Badge>;
      default: return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/40">Neutral</Badge>;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      default: return 'text-destructive';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  if (!selectedAsset) {
    return (
      <Card className="glass-card p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Advanced AI Analysis</h3>
            <p className="text-muted-foreground">
              Select an asset to get comprehensive technical analysis with retracement tools and macro insights
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Advanced AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                {selectedAsset.symbol} • Powered by retracement & macro tools
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Timeframe selector */}
            <div className="flex rounded-lg bg-muted/20 p-1">
              {(['1h', '4h', '1d', '1w'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs rounded transition-all ${
                    timeframe === tf
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <Button
              onClick={generateAdvancedAnalysis}
              variant="outline"
              size="sm"
              disabled={isAnalyzing}
              className="border-border/50"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Current Price */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(selectedAsset.currentPrice)}
            </div>
            <div className={`flex items-center space-x-2 ${selectedAsset.priceChange24h >= 0 ? 'text-success' : 'text-destructive'}`}>
              {selectedAsset.priceChange24h >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">
                {Math.abs(selectedAsset.priceChange24h).toFixed(2)}%
              </span>
            </div>
          </div>

          {analysis && (
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                {React.createElement(getSentimentIcon(analysis.sentiment), {
                  className: `w-5 h-5 ${getSentimentColor(analysis.sentiment)}`
                })}
                <span className={`font-medium capitalize ${getSentimentColor(analysis.sentiment)}`}>
                  {analysis.sentiment}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Confidence: {analysis.confidence.toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      </Card>

      {isAnalyzing ? (
        <Card className="glass-card p-8 text-center">
          <div className="space-y-4">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
            <div>
              <h4 className="font-medium text-foreground">Analyzing Market Data</h4>
              <p className="text-sm text-muted-foreground">
                Running advanced technical analysis with retracement tools...
              </p>
            </div>
          </div>
        </Card>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Trading Chart */}
          <Card className="glass-card p-6">
            <TradingViewChart
              symbol={selectedAsset.symbol}
              tradingStyle="long-term"
              onAnalysisUpdate={(chartAnalysis) => {
                console.log('Chart analysis updated:', chartAnalysis);
              }}
            />
          </Card>

          {/* Technical Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Indicators */}
            <Card className="glass-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <LineChart className="w-5 h-5 text-destructive" />
                <h4 className="font-semibold text-foreground">Technical Indicators</h4>
              </div>
              <div className="space-y-4">
                {indicators.map((indicator, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{indicator.name}</span>
                      <Badge 
                        variant={indicator.signal === 'bullish' ? 'default' : 'destructive'}
                        className={indicator.signal === 'bullish' ? 'bg-destructive text-destructive-foreground' : 'bg-destructive text-destructive-foreground'}
                      >
                        {indicator.signal === 'bullish' ? 'Bullish' : 'Bearish'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{indicator.description}</span>
                      <span>{indicator.strength.toFixed(2)}% strength</span>
                    </div>
                    <div className="w-full bg-muted/20 rounded-full h-2">
                      <div 
                        className="bg-destructive h-2 rounded-full transition-all" 
                        style={{ width: `${indicator.strength}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Fibonacci Retracement */}
            <Card className="glass-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-destructive" />
                <h4 className="font-semibold text-foreground">Fibonacci Levels</h4>
              </div>
              <div className="space-y-3">
                {analysis.fibonacci.map((fib, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div>
                      <div className="font-medium text-foreground">
                        {(fib.level * 100).toFixed(1)}% {fib.type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPrice(fib.price)}
                      </div>
                    </div>
                    <Badge 
                      variant={fib.strength === 'strong' ? 'destructive' : 'secondary'}
                      className={fib.strength === 'strong' ? 'bg-destructive text-destructive-foreground' : 'bg-warning text-warning-foreground'}
                    >
                      {fib.strength}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Price Targets */}
            <Card className="glass-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ChevronRight className="w-5 h-5 text-destructive" />
                <h4 className="font-semibold text-foreground">Price Targets</h4>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/20">
                    <div className="text-xs text-muted-foreground mb-1">Short-term</div>
                    <div className="font-medium text-foreground">
                      {formatPrice(analysis.priceTarget.short)}
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/20">
                    <div className="text-xs text-muted-foreground mb-1">Medium-term</div>
                    <div className="font-medium text-foreground">
                      {formatPrice(analysis.priceTarget.medium)}
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/20">
                    <div className="text-xs text-muted-foreground mb-1">Long-term</div>
                    <div className="font-medium text-foreground">
                      {formatPrice(analysis.priceTarget.long)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Market Metrics */}
            <Card className="glass-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <PieChart className="w-5 h-5 text-warning" />
                <h4 className="font-semibold text-foreground">Macro Analysis</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bitcoin Dominance</span>
                  <span className="font-medium text-foreground">
                    {analysis.marketMetrics.bitcoinDominance.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fear & Greed Index</span>
                  <Badge variant={analysis.marketMetrics.fearGreedIndex > 50 ? 'default' : 'destructive'}>
                    {analysis.marketMetrics.fearGreedIndex.toFixed(0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">24h Volume</span>
                  <span className="font-medium text-foreground">
                    ${(analysis.marketMetrics.volume24h / 1e9).toFixed(1)}B
                  </span>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="mt-6 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Risk Level</span>
                  <Badge className={`${getRiskColor(analysis.riskAssessment.level)} border-destructive`}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {analysis.riskAssessment.level.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {analysis.riskAssessment.factors.slice(0, 3).map((factor, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground mr-2" />
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdvancedAIAnalysis;