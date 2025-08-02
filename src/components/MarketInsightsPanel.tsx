import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Eye, ExternalLink } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface MarketData {
  cycle: 'bull' | 'bear' | 'neutral';
  fearGreedIndex: {
    value: number;
    classification: string;
  };
  macroIndicators: {
    interestRate?: number;
    inflation?: number;
    gdpGrowth?: number;
  };
}

interface NewsItem {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
}

interface MarketInsightsPanelProps {
  className?: string;
}

export const MarketInsightsPanel: React.FC<MarketInsightsPanelProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const fetchMarketInsights = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch Fear & Greed Index (free API, no key needed)
      const fearGreedResponse = await fetch('https://api.alternative.me/fng/');
      const fearGreedData = await fearGreedResponse.json();
      
      const fearGreedValue = parseInt(fearGreedData.data[0].value);
      const fearGreedClassification = fearGreedData.data[0].value_classification;

      // Determine market cycle based on Fear & Greed Index (simplified logic)
      let cycle: 'bull' | 'bear' | 'neutral' = 'neutral';
      if (fearGreedValue >= 70) cycle = 'bull';
      else if (fearGreedValue <= 30) cycle = 'bear';

      const mockMarketData: MarketData = {
        cycle,
        fearGreedIndex: {
          value: fearGreedValue,
          classification: fearGreedClassification
        },
        macroIndicators: {
          interestRate: 5.25, // Mock data for now
          inflation: 3.1,
          gdpGrowth: 2.4
        }
      };

      setMarketData(mockMarketData);

      // Mock news data for now (will be replaced with real API)
      const mockNews: NewsItem[] = [
        {
          title: "Bitcoin ETF sees record inflows as institutional adoption grows",
          url: "#",
          publishedAt: new Date().toISOString(),
          source: "CryptoNews"
        },
        {
          title: "Federal Reserve maintains interest rates at 5.25%",
          url: "#",
          publishedAt: new Date().toISOString(),
          source: "Reuters"
        },
        {
          title: "Crypto market shows resilience amid global uncertainty",
          url: "#",
          publishedAt: new Date().toISOString(),
          source: "Bloomberg"
        }
      ];

      setNews(mockNews);

      // Generate AI summary (mock for now)
      const mockSummary = `Current market conditions show ${fearGreedClassification.toLowerCase()} sentiment with a Fear & Greed Index of ${fearGreedValue}. The ${cycle} market cycle indicates ${cycle === 'bull' ? 'optimistic' : cycle === 'bear' ? 'cautious' : 'mixed'} investor confidence. With interest rates at 5.25% and inflation at 3.1%, macroeconomic conditions suggest continued monetary policy vigilance.`;
      
      setAiSummary(mockSummary);

    } catch (err) {
      console.error('Error fetching market insights:', err);
      setError('Failed to load market insights. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load market insights",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !marketData) {
      fetchMarketInsights();
    }
  }, [isOpen]);

  const getCycleIcon = (cycle: string) => {
    switch (cycle) {
      case 'bull': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bear': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Eye className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCycleBadgeVariant = (cycle: string) => {
    switch (cycle) {
      case 'bull': return 'default';
      case 'bear': return 'destructive';
      default: return 'secondary';
    }
  };

  const getFearGreedColor = (value: number) => {
    if (value >= 75) return 'text-green-500';
    if (value >= 55) return 'text-green-400';
    if (value >= 45) return 'text-yellow-500';
    if (value >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border border-border/50 ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/20 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                📊 Market Insights
                {marketData && (
                  <Badge variant={getCycleBadgeVariant(marketData.cycle)} className="ml-2">
                    {getCycleIcon(marketData.cycle)}
                    {marketData.cycle.toUpperCase()}
                  </Badge>
                )}
              </span>
              <div className="flex items-center gap-2">
                {marketData && (
                  <span className={`text-sm font-medium ${getFearGreedColor(marketData.fearGreedIndex.value)}`}>
                    F&G: {marketData.fearGreedIndex.value}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchMarketInsights();
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {error && (
              <div className="text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : marketData ? (
              <div className="space-y-6">
                {/* Market Cycle & Fear & Greed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Market Cycle</h4>
                    <div className="flex items-center gap-2">
                      {getCycleIcon(marketData.cycle)}
                      <span className="font-semibold capitalize">{marketData.cycle} Market</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Fear & Greed Index</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getFearGreedColor(marketData.fearGreedIndex.value)}`}>
                        {marketData.fearGreedIndex.value}
                      </span>
                      <span className="text-sm capitalize">{marketData.fearGreedIndex.classification}</span>
                    </div>
                  </div>
                </div>

                {/* Macro Indicators */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Key Metrics</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-muted/10 rounded">
                      <div className="text-sm text-muted-foreground">Interest Rate</div>
                      <div className="font-semibold">{marketData.macroIndicators.interestRate}%</div>
                    </div>
                    <div className="text-center p-2 bg-muted/10 rounded">
                      <div className="text-sm text-muted-foreground">Inflation</div>
                      <div className="font-semibold">{marketData.macroIndicators.inflation}%</div>
                    </div>
                    <div className="text-center p-2 bg-muted/10 rounded">
                      <div className="text-sm text-muted-foreground">GDP Growth</div>
                      <div className="font-semibold">{marketData.macroIndicators.gdpGrowth}%</div>
                    </div>
                  </div>
                </div>

                {/* News Headlines */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Top Headlines</h4>
                  <div className="space-y-2">
                    {news.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/10 rounded text-sm">
                        <span className="text-xs text-muted-foreground mt-1">•</span>
                        <div className="flex-1">
                          <div className="line-clamp-2">{item.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{item.source}</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground mt-1 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Summary */}
                {aiSummary && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">🧠 AI Summary</h4>
                    <div className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm leading-relaxed">{aiSummary}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Click to load market insights</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};