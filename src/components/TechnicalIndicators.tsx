import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Target } from 'lucide-react';

interface TechnicalIndicatorsProps {
  symbol: string;
  price: number;
  indicators: {
    rsi: number;
    marketCap: number;
    volume24h: number;
    support: number;
    resistance: number;
    fibonacciLevels: {
      level: number;
      price: number;
    }[];
  };
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({
  symbol,
  price,
  indicators
}) => {
  const getRSIStatus = (rsi: number) => {
    if (rsi > 70) return { status: 'Overbought', class: 'indicator-bearish' };
    if (rsi < 30) return { status: 'Oversold', class: 'indicator-bullish' };
    return { status: 'Neutral', class: 'indicator-neutral' };
  };

  const rsiStatus = getRSIStatus(indicators.rsi);

  const getSupportResistanceStatus = () => {
    if (price > indicators.resistance) return 'Above Resistance';
    if (price < indicators.support) return 'Below Support';
    return 'In Range';
  };

  return (
    <Card className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{symbol} Analysis</h3>
        <Badge variant="outline" className="border-primary/30">
          Technical
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* RSI */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">RSI (14)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-foreground">
              {indicators.rsi.toFixed(1)}
            </span>
            <Badge className={rsiStatus.class}>
              {rsiStatus.status}
            </Badge>
          </div>
          <div className="w-full bg-muted/20 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-primary transition-all duration-300"
              style={{ width: `${indicators.rsi}%` }}
            />
          </div>
        </div>

        {/* Market Cap */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Market Cap</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            ${(indicators.marketCap / 1e9).toFixed(2)}B
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">24h Volume</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            ${(indicators.volume24h / 1e6).toFixed(1)}M
          </div>
        </div>

        {/* Support/Resistance */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">S/R Status</span>
          </div>
          <div className="text-sm font-medium text-foreground">
            {getSupportResistanceStatus()}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-destructive">Support: ${indicators.support.toFixed(2)}</span>
              <span className="text-success">Resistance: ${indicators.resistance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fibonacci Levels */}
      <div className="space-y-2 border-t border-border/30 pt-4">
        <h4 className="text-sm font-medium text-muted-foreground">Fibonacci Retracement</h4>
        <div className="grid grid-cols-3 gap-2">
          {indicators.fibonacciLevels.slice(0, 3).map((fib, index) => (
            <div key={index} className="text-center p-2 bg-muted/10 rounded">
              <div className="text-xs text-muted-foreground">{(fib.level * 100).toFixed(1)}%</div>
              <div className="text-sm font-medium text-foreground">${fib.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TechnicalIndicators;