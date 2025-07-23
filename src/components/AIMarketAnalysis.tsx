import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Bitcoin,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { CryptoAsset } from '@/hooks/useSupabasePortfolio';

interface AIMarketAnalysisProps {
  selectedAsset: CryptoAsset | null;
  portfolioAssets: CryptoAsset[];
  totalValue: number;
  currency: string;
}

interface MarketIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
  icon: React.ReactNode;
}

interface AIInsight {
  type: 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  confidence: number;
}

const AIMarketAnalysis: React.FC<AIMarketAnalysisProps> = ({
  selectedAsset,
  portfolioAssets,
  totalValue,
  currency
}) => {
  const [indicators, setIndicators] = useState<MarketIndicator[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate market indicators
  const generateMarketIndicators = (asset: CryptoAsset): MarketIndicator[] => {
    const rsi = Math.random() * 100;
    const marketCap = Math.random() * 100000000000;
    const volume24h = Math.random() * 1000000000;
    const fibLevel = 0.618; // Golden ratio

    return [
      {
        name: 'RSI (14)',
        value: rsi,
        signal: rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral',
        confidence: 85,
        description: rsi > 70 ? 'Overbought - potential sell signal' : rsi < 30 ? 'Oversold - potential buy signal' : 'Neutral momentum',
        icon: <Activity className="w-4 h-4" />
      },
      {
        name: 'Market Cap Rank',
        value: Math.floor(Math.random() * 100) + 1,
        signal: marketCap > 10000000000 ? 'bullish' : marketCap > 1000000000 ? 'neutral' : 'bearish',
        confidence: 75,
        description: 'Market position and stability indicator',
        icon: <BarChart3 className="w-4 h-4" />
      },
      {
        name: 'Volume (24h)',
        value: volume24h / 1000000,
        signal: volume24h > 500000000 ? 'bullish' : volume24h > 100000000 ? 'neutral' : 'bearish',
        confidence: 70,
        description: 'Trading activity and liquidity indicator',
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        name: 'Fibonacci Level',
        value: fibLevel,
        signal: asset.currentPrice > (asset.purchase_price || asset.currentPrice) * (1 + fibLevel) ? 'bullish' : 'neutral',
        confidence: 80,
        description: 'Technical resistance/support level',
        icon: <Target className="w-4 h-4" />
      },
      {
        name: 'Bitcoin Dominance',
        value: 45 + Math.random() * 20,
        signal: asset.symbol === 'BTC' ? 'neutral' : Math.random() > 0.5 ? 'bullish' : 'bearish',
        confidence: 65,
        description: 'Bitcoin market share influence on altcoins',
        icon: <Bitcoin className="w-4 h-4" />
      }
    ];
  };

  // Generate AI insights
  const generateAIInsights = (asset: CryptoAsset, indicators: MarketIndicator[]): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    const rsiIndicator = indicators.find(i => i.name.includes('RSI'));
    const volumeIndicator = indicators.find(i => i.name.includes('Volume'));
    const btcDominance = indicators.find(i => i.name.includes('Bitcoin'));

    if (rsiIndicator && rsiIndicator.signal === 'bullish') {
      insights.push({
        type: 'opportunity',
        title: 'Oversold Opportunity',
        description: `${asset.symbol} is showing oversold conditions (RSI: ${rsiIndicator.value.toFixed(1)}). This could be a good entry point.`,
        confidence: rsiIndicator.confidence
      });
    }

    if (rsiIndicator && rsiIndicator.signal === 'bearish') {
      insights.push({
        type: 'warning',
        title: 'Overbought Warning',
        description: `${asset.symbol} may be overbought (RSI: ${rsiIndicator.value.toFixed(1)}). Consider taking profits or waiting for a pullback.`,
        confidence: rsiIndicator.confidence
      });
    }

    if (volumeIndicator && volumeIndicator.signal === 'bullish') {
      insights.push({
        type: 'opportunity',
        title: 'High Volume Confirmation',
        description: `Strong volume (${volumeIndicator.value.toFixed(0)}M) suggests genuine market interest in ${asset.symbol}.`,
        confidence: volumeIndicator.confidence
      });
    }

    if (asset.priceChange24h > 10) {
      insights.push({
        type: 'info',
        title: 'Strong Price Movement',
        description: `${asset.symbol} has gained ${asset.priceChange24h.toFixed(2)}% in 24h. Monitor for continuation or reversal signals.`,
        confidence: 75
      });
    }

    if (asset.priceChange24h < -10) {
      insights.push({
        type: 'warning',
        title: 'Significant Decline',
        description: `${asset.symbol} has dropped ${Math.abs(asset.priceChange24h).toFixed(2)}% in 24h. Look for support levels.`,
        confidence: 80
      });
    }

    return insights;
  };

  // Run analysis
  const runAnalysis = async () => {
    if (!selectedAsset) return;

    setIsAnalyzing(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const newIndicators = generateMarketIndicators(selectedAsset);
      const newInsights = generateAIInsights(selectedAsset, newIndicators);
      
      setIndicators(newIndicators);
      setInsights(newInsights);
      setIsAnalyzing(false);
    }, 1500);
  };

  // Auto-run analysis when asset changes
  useEffect(() => {
    if (selectedAsset) {
      runAnalysis();
    }
  }, [selectedAsset]);

  if (!selectedAsset) {
    return (
      <Card className="glass-card p-8 text-center">
        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          AI Market Analysis
        </h3>
        <p className="text-muted-foreground">
          Select an asset from your portfolio to get AI-powered market insights and trading suggestions.
        </p>
      </Card>
    );
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return 'text-success bg-success/20';
      case 'bearish': return 'text-destructive bg-destructive/20';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                AI Market Analysis
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedAsset.symbol} • {selectedAsset.name}
              </p>
            </div>
          </div>
          <Button
            onClick={runAnalysis}
            variant="outline"
            size="sm"
            disabled={isAnalyzing}
            className="border-border/50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>

        {/* Current Price Info */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/10 border border-border/30">
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-lg font-semibold text-foreground">
              ${selectedAsset.currentPrice.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">24h Change</p>
            <p className={`text-lg font-semibold ${
              selectedAsset.priceChange24h >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {selectedAsset.priceChange24h >= 0 ? '+' : ''}
              {selectedAsset.priceChange24h.toFixed(2)}%
            </p>
          </div>
        </div>
      </Card>

      {/* Technical Indicators */}
      <Card className="glass-card p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">
          Technical Indicators
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indicators.map((indicator, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-muted/10 border border-border/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {indicator.icon}
                  <span className="font-medium text-foreground">{indicator.name}</span>
                </div>
                <Badge className={getSignalColor(indicator.signal)}>
                  {indicator.signal}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">
                  {typeof indicator.value === 'number' 
                    ? indicator.value < 1 
                      ? indicator.value.toFixed(3)
                      : indicator.value.toFixed(1)
                    : indicator.value
                  }
                </span>
                <span className="text-xs text-muted-foreground">
                  {indicator.confidence}% confidence
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {indicator.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insights */}
      <Card className="glass-card p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">
          AI Trading Insights
        </h4>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-muted/10 border border-border/30"
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-foreground">{insight.title}</h5>
                      <span className="text-xs text-muted-foreground">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing market data...</span>
                </div>
              ) : (
                'No insights available. Try refreshing the analysis.'
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AIMarketAnalysis;