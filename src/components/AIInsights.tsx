import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';

interface AIInsightsProps {
  symbol: string;
  price: number;
  indicators: {
    rsi: number;
    marketCap: number;
    volume24h: number;
    support: number;
    resistance: number;
  };
}

const AIInsights: React.FC<AIInsightsProps> = ({ symbol, price, indicators }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<{
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    scenarios: {
      type: 'bullish' | 'bearish' | 'neutral';
      title: string;
      description: string;
      probability: number;
    }[];
    recommendations: string[];
  } | null>(null);

  const generateInsights = () => {
    setIsGenerating(true);
    
    // Simulate AI analysis based on technical indicators
    setTimeout(() => {
      const rsiSignal = indicators.rsi > 70 ? 'bearish' : indicators.rsi < 30 ? 'bullish' : 'neutral';
      const pricePosition = price > indicators.resistance ? 'bullish' : price < indicators.support ? 'bearish' : 'neutral';
      
      // Determine overall sentiment
      const signals = [rsiSignal, pricePosition];
      const bullishCount = signals.filter(s => s === 'bullish').length;
      const bearishCount = signals.filter(s => s === 'bearish').length;
      
      let sentiment: 'bullish' | 'bearish' | 'neutral';
      if (bullishCount > bearishCount) sentiment = 'bullish';
      else if (bearishCount > bullishCount) sentiment = 'bearish';
      else sentiment = 'neutral';

      const confidence = Math.max(bullishCount, bearishCount) / signals.length * 100;

      setInsights({
        sentiment,
        confidence,
        scenarios: [
          {
            type: 'bullish',
            title: 'Breakout Scenario',
            description: `If ${symbol} breaks above $${indicators.resistance.toFixed(2)} resistance with strong volume, it could target the next Fibonacci level.`,
            probability: sentiment === 'bullish' ? 65 : 35
          },
          {
            type: 'bearish',
            title: 'Support Break',
            description: `A break below $${indicators.support.toFixed(2)} support could signal further downside to the next major level.`,
            probability: sentiment === 'bearish' ? 60 : 25
          },
          {
            type: 'neutral',
            title: 'Range-bound Trading',
            description: `${symbol} may continue trading between support ($${indicators.support.toFixed(2)}) and resistance ($${indicators.resistance.toFixed(2)}).`,
            probability: sentiment === 'neutral' ? 70 : 40
          }
        ],
        recommendations: [
          indicators.rsi > 70 ? 'Consider taking profits as RSI shows overbought conditions' : 
          indicators.rsi < 30 ? 'Potential buying opportunity as RSI indicates oversold conditions' : 
          'Monitor for breakout signals at key levels',
          'Watch volume for confirmation of any price movements',
          'Set stop-losses below key support levels',
          'Use dollar-cost averaging for long-term positions'
        ]
      });
      
      setIsGenerating(false);
    }, 2000);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <AlertTriangle className="w-4 h-4 text-accent" />;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'indicator-bullish';
      case 'bearish': return 'indicator-bearish';
      default: return 'indicator-neutral';
    }
  };

  return (
    <Card className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI Market Analysis</h3>
        </div>
        <Button
          onClick={generateInsights}
          disabled={isGenerating}
          variant="outline"
          size="sm"
          className="border-primary/30 hover:bg-primary/10"
        >
          <Bot className="w-4 h-4 mr-2" />
          {isGenerating ? 'Analyzing...' : 'Generate Insights'}
        </Button>
      </div>

      {insights && (
        <div className="space-y-6">
          {/* Overall Sentiment */}
          <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
            <div className="flex items-center gap-3">
              {getSentimentIcon(insights.sentiment)}
              <div>
                <div className="font-medium text-foreground capitalize">
                  {insights.sentiment} Sentiment
                </div>
                <div className="text-sm text-muted-foreground">
                  {insights.confidence.toFixed(0)}% confidence
                </div>
              </div>
            </div>
            <Badge className={getSentimentBadge(insights.sentiment)}>
              {insights.sentiment.toUpperCase()}
            </Badge>
          </div>

          {/* Scenarios */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Possible Scenarios
            </h4>
            {insights.scenarios.map((scenario, index) => (
              <div key={index} className="p-3 bg-muted/5 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(scenario.type)}
                    <span className="font-medium text-foreground">{scenario.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {scenario.probability}% probability
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              AI Recommendations
            </h4>
            <ul className="space-y-2">
              {insights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!insights && !isGenerating && (
        <div className="text-center py-8 text-muted-foreground">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Click "Generate Insights" to get AI-powered market analysis</p>
        </div>
      )}
    </Card>
  );
};

export default AIInsights;