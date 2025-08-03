import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Target,
  Lightbulb,
  BookOpen,
  AlertTriangle
} from 'lucide-react';

interface EducationalIndicatorModalProps {
  indicator: string | null;
  isOpen: boolean;
  onClose: () => void;
  tradingStyle: 'short-term' | 'long-term';
}

const indicatorEducation = {
  'RSI(14)': {
    name: 'Relative Strength Index (RSI)',
    description: 'RSI measures the speed and change of price movements to identify overbought and oversold conditions.',
    howToUse: [
      'RSI ranges from 0 to 100',
      'Values above 70 typically indicate overbought conditions (potential sell signal)',
      'Values below 30 typically indicate oversold conditions (potential buy signal)',
      'Look for divergences between RSI and price for reversal signals'
    ],
    levels: {
      'Overbought': 70,
      'Oversold': 30,
      'Neutral': '30-70'
    },
    tips: {
      'short-term': [
        'Use 5-minute or 15-minute charts for quick scalping opportunities',
        'Look for RSI to break above 30 or below 70 for entry signals',
        'Consider taking profits when RSI reaches extreme levels (80+ or 20-)'
      ],
      'long-term': [
        'Use daily or weekly charts for position trading',
        'RSI can stay overbought/oversold for extended periods in strong trends',
        'Wait for RSI to return to neutral zone before entering trades'
      ]
    }
  },
  'SMA(20)': {
    name: 'Simple Moving Average (20 Period)',
    description: 'SMA calculates the average price over the last 20 periods to identify trend direction and support/resistance levels.',
    howToUse: [
      'Price above SMA20 indicates bullish momentum',
      'Price below SMA20 indicates bearish momentum',
      'SMA20 acts as dynamic support in uptrends',
      'SMA20 acts as dynamic resistance in downtrends'
    ],
    levels: {
      'Strong Support': 'Price consistently above SMA20',
      'Strong Resistance': 'Price consistently below SMA20',
      'Neutral': 'Price crossing above and below frequently'
    },
    tips: {
      'short-term': [
        'Use SMA20 on 5-15 minute charts for intraday trading',
        'Look for price bounces off SMA20 for entry points',
        'Exit when price breaks decisively below SMA20 (for longs)'
      ],
      'long-term': [
        'Use SMA20 on daily charts for swing trading',
        'SMA20 breakouts often signal trend changes',
        'Combine with volume analysis for confirmation'
      ]
    }
  },
  'SMA(50)': {
    name: 'Simple Moving Average (50 Period)',
    description: 'SMA50 provides a longer-term trend perspective and is often considered a major support/resistance level.',
    howToUse: [
      'SMA50 is a key trend indicator for medium-term direction',
      'Golden Cross: SMA20 crossing above SMA50 (bullish signal)',
      'Death Cross: SMA20 crossing below SMA50 (bearish signal)',
      'SMA50 often acts as strong support/resistance'
    ],
    levels: {
      'Strong Bullish': 'SMA20 > SMA50 with price above both',
      'Strong Bearish': 'SMA20 < SMA50 with price below both',
      'Consolidation': 'SMAs converging with sideways price action'
    },
    tips: {
      'short-term': [
        'Use SMA50 as a filter for trade direction',
        'Only take long trades when price is above SMA50',
        'SMA50 can provide good support for pullback entries'
      ],
      'long-term': [
        'SMA50 breakouts often lead to significant moves',
        'Wait for weekly closes above/below SMA50 for confirmation',
        'SMA50 is excellent for position sizing decisions'
      ]
    }
  },
  'Volume': {
    name: 'Trading Volume',
    description: 'Volume measures the number of shares/contracts traded and confirms the strength of price movements.',
    howToUse: [
      'High volume confirms price movements',
      'Low volume suggests weak moves that may reverse',
      'Volume spikes often occur at support/resistance levels',
      'Rising volume with rising prices confirms bullish momentum'
    ],
    levels: {
      'High Volume': '150%+ of average volume',
      'Normal Volume': '50-150% of average volume',
      'Low Volume': 'Below 50% of average volume'
    },
    tips: {
      'short-term': [
        'Look for volume spikes at key levels for breakout confirmation',
        'Low volume pullbacks in trends often offer good entry points',
        'Avoid trading during extremely low volume periods'
      ],
      'long-term': [
        'Weekly volume patterns can predict major moves',
        'Volume accumulation often precedes big price moves',
        'Use volume to confirm trend changes'
      ]
    }
  },
  'Momentum': {
    name: 'Price Momentum',
    description: 'Momentum measures the rate of change in price to identify the strength of trends and potential reversals.',
    howToUse: [
      'Positive momentum indicates bullish pressure',
      'Negative momentum indicates bearish pressure',
      'Momentum divergences can signal trend reversals',
      'Strong momentum often leads to trend continuation'
    ],
    levels: {
      'Strong Bullish': '+2% or higher momentum',
      'Strong Bearish': '-2% or lower momentum',
      'Neutral': 'Between -2% and +2%'
    },
    tips: {
      'short-term': [
        'Use momentum for quick scalping opportunities',
        'Enter trades in direction of strong momentum',
        'Exit when momentum starts to weaken'
      ],
      'long-term': [
        'Monthly momentum helps identify major trend changes',
        'Strong momentum can override other technical signals',
        'Use momentum to determine position holding periods'
      ]
    }
  }
};

export const EducationalIndicatorModal: React.FC<EducationalIndicatorModalProps> = ({
  indicator,
  isOpen,
  onClose,
  tradingStyle
}) => {
  if (!indicator || !indicatorEducation[indicator as keyof typeof indicatorEducation]) {
    return null;
  }

  const education = indicatorEducation[indicator as keyof typeof indicatorEducation];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Brain className="w-6 h-6 text-primary" />
            Learn: {education.name}
            <Badge variant="outline" className="ml-auto">
              {tradingStyle.replace('-', ' ').toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">What is this indicator?</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {education.description}
            </p>
          </div>

          {/* How to Use */}
          <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-green-500">How to Use</h3>
            </div>
            <ul className="space-y-2">
              {education.howToUse.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Levels */}
          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-blue-500">Key Levels to Watch</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(education.levels).map(([level, value]) => (
                <div key={level} className="p-3 bg-background/50 rounded border">
                  <div className="font-medium text-sm">{level}</div>
                  <div className="text-xs text-muted-foreground font-mono">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Style Specific Tips */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">
                AI Tips for {tradingStyle.replace('-', ' ').toUpperCase()} Trading
              </h3>
            </div>
            <ul className="space-y-2">
              {education.tips[tradingStyle].map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-yellow-500">Important Reminder</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              No single indicator should be used in isolation. Always combine multiple indicators and consider market context, 
              risk management, and your overall trading strategy. Past performance does not guarantee future results.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="min-w-[120px]">
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};