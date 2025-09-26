import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Target,
  Zap,
  Settings,
  Minus,
  MousePointer,
  Triangle,
  Activity,
  Percent,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cryptoAPI } from '@/lib/cryptoApi';
import { CandlestickChart } from '@/components/CandlestickChart';
import { TechnicalAnalysis } from '@/lib/technicalAnalysis';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  sma50?: number;
  rsi?: number;
}

interface AdvancedTradingChartProps {
  symbol: string;
  tradingStyle: 'short-term' | 'long-term';
  onAnalysisUpdate?: (analysis: any) => void;
}

export const AdvancedTradingChart: React.FC<AdvancedTradingChartProps> = ({
  symbol,
  tradingStyle,
  onAnalysisUpdate
}) => {
  const [timeframe, setTimeframe] = useState<string>(tradingStyle === 'short-term' ? '1h' : '1d');
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['SMA20', 'SMA50']);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedTool, setSelectedTool] = useState<string>('cursor');
  const [showToolsPanel, setShowToolsPanel] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fibLevels, setFibLevels] = useState<any>(null);

  const { toast } = useToast();

  // Professional trading tools
  const tradingTools = [
    {
      id: 'cursor',
      name: 'Cursor',
      icon: <MousePointer className="w-4 h-4" />,
      category: 'basic',
      description: 'Select and interact with chart elements'
    },
    {
      id: 'trendline',
      name: 'Trend Line',
      icon: <Minus className="w-4 h-4" />,
      category: 'drawing',
      description: 'Draw trend lines to identify support and resistance'
    },
    {
      id: 'horizontal',
      name: 'Horizontal Line',
      icon: <Target className="w-4 h-4" />,
      category: 'drawing',
      description: 'Draw horizontal support and resistance levels'
    },
    {
      id: 'fib-retracement',
      name: 'Fib Retracement',
      icon: <Percent className="w-4 h-4" />,
      category: 'fibonacci',
      description: 'Fibonacci retracement levels for pullback analysis'
    },
    {
      id: 'sma20',
      name: 'SMA 20',
      icon: <Activity className="w-4 h-4" />,
      category: 'indicators',
      description: '20-period Simple Moving Average'
    },
    {
      id: 'sma50',
      name: 'SMA 50',
      icon: <Activity className="w-4 h-4" />,
      category: 'indicators',
      description: '50-period Simple Moving Average'
    },
    {
      id: 'rsi',
      name: 'RSI',
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'indicators',
      description: 'Relative Strength Index for momentum analysis'
    }
  ];

  // Fetch and process market data with accurate calculations
  const fetchMarketData = async (): Promise<CandleData[]> => {
    try {
      setIsAnalyzing(true);
      
      // Get live price
      const livePrice = await cryptoAPI.getLivePrices([symbol]);
      const currentPriceData = livePrice[symbol.toLowerCase()];
      
      if (currentPriceData) {
        setCurrentPrice(currentPriceData.price);
      }

      // Get historical data
      const days = {
        '1m': 1,
        '5m': 1,
        '1h': 7,
        '4h': 30,
        '1d': 90,
        '1w': 365
      }[timeframe] || 30;

      const coinId = cryptoAPI.mapSymbolToId(symbol);
      const histData = await cryptoAPI.getHistoricalData(coinId, 'usd', days);
      
      const data: CandleData[] = [];
      const priceData = histData.prices || [];
      const volumeData = histData.total_volumes || [];
      
      // Process into proper OHLC candlestick data
      const pointsPerCandle = Math.max(1, Math.floor(priceData.length / 100));
      
      for (let i = 0; i < priceData.length - pointsPerCandle; i += pointsPerCandle) {
        const candlePrices = priceData.slice(i, i + pointsPerCandle);
        const candleVolumes = volumeData.slice(i, i + pointsPerCandle);
        
        if (candlePrices.length === 0) continue;
        
        const timestamp = new Date(candlePrices[0][0]);
        const prices = candlePrices.map(p => p[1]);
        const volumes = candleVolumes.map(v => v[1]);
        
        const open = prices[0];
        const close = prices[prices.length - 1];
        const high = Math.max(...prices);
        const low = Math.min(...prices);
        const volume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;

        data.push({
          time: timestamp.toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit',
            hour: timeframe.includes('h') || timeframe.includes('m') ? '2-digit' : undefined,
            minute: timeframe.includes('m') ? '2-digit' : undefined
          }),
          open: Number(open.toFixed(4)),
          high: Number(high.toFixed(4)),
          low: Number(low.toFixed(4)),
          close: Number(close.toFixed(4)),
          volume: Number(volume.toFixed(0))
        });
      }

      // Calculate technical indicators using professional calculations
      const prices = data.map(d => d.close);
      
      data.forEach((item, index) => {
        const priceSlice = prices.slice(0, index + 1);
        
        if (priceSlice.length >= 20) {
          item.sma20 = TechnicalAnalysis.calculateSMA(priceSlice, 20);
        }
        if (priceSlice.length >= 50) {
          item.sma50 = TechnicalAnalysis.calculateSMA(priceSlice, 50);
        }
        if (priceSlice.length >= 14) {
          const rsiResult = TechnicalAnalysis.calculateRSI(priceSlice);
          item.rsi = rsiResult.value;
        }
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      toast({
        title: "Data Error",
        description: "Failed to load market data",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Perform comprehensive technical analysis
  const performAnalysis = async () => {
    if (chartData.length === 0) return;
    
    setIsAnalyzing(true);
    
    try {
      const prices = chartData.map(d => d.close);
      const comprehensiveAnalysis = TechnicalAnalysis.performComprehensiveAnalysis(prices);
      
      // Calculate Fibonacci levels for current trend
      const recentHigh = Math.max(...prices.slice(-20));
      const recentLow = Math.min(...prices.slice(-20));
      const fibLevels = TechnicalAnalysis.calculateFibonacciRetracement(recentHigh, recentLow);
      
      setAnalysis(comprehensiveAnalysis);
      setFibLevels(fibLevels);
      
      // Notify parent component
      if (onAnalysisUpdate) {
        onAnalysisUpdate({
          ...comprehensiveAnalysis,
          fibonacciLevels: fibLevels,
          symbol,
          timeframe,
          timestamp: new Date()
        });
      }
      
      toast({
        title: "Analysis Complete",
        description: `${symbol.toUpperCase()} analysis updated with ${comprehensiveAnalysis.overallSignal} signal`,
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to perform technical analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load chart data and perform analysis
  const loadChartData = async () => {
    const data = await fetchMarketData();
    setChartData(data);
    
    if (data.length > 0) {
      // Automatically perform analysis after loading data
      setTimeout(performAnalysis, 1000);
    }
  };

  useEffect(() => {
    loadChartData();
  }, [timeframe, symbol]);

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    
    const tool = tradingTools.find(t => t.id === toolId);
    if (!tool) return;

    // Handle indicators
    if (tool.category === 'indicators') {
      const indicatorMap: { [key: string]: string } = {
        'sma20': 'SMA20',
        'sma50': 'SMA50',
        'rsi': 'RSI'
      };
      
      const indicatorName = indicatorMap[toolId];
      if (indicatorName) {
        setActiveIndicators(prev => {
          if (prev.includes(indicatorName)) {
            return prev.filter(i => i !== indicatorName);
          } else {
            return [...prev, indicatorName];
          }
        });
      }
    }

    // Handle Fibonacci tool
    if (toolId === 'fib-retracement') {
      if (chartData.length > 0) {
        const prices = chartData.map(d => d.close);
        const recentHigh = Math.max(...prices.slice(-20));
        const recentLow = Math.min(...prices.slice(-20));
        const fibLevels = TechnicalAnalysis.calculateFibonacciRetracement(recentHigh, recentLow);
        setFibLevels(fibLevels);
        
        toast({
          title: "Fibonacci Levels",
          description: `Key level: 61.8% at $${fibLevels.levels['61.8%']}`,
        });
      }
    }

    toast({
      title: `${tool.name} Selected`,
      description: tool.description,
    });
  };

  // Get signal badge variant
  const getSignalVariant = (signal: string) => {
    switch (signal) {
      case 'BULLISH':
      case 'BUY':
        return 'default';
      case 'BEARISH':
      case 'SELL':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 items-center">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1m</SelectItem>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="4h">4h</SelectItem>
              <SelectItem value="1d">1D</SelectItem>
              <SelectItem value="1w">1W</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showToolsPanel ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowToolsPanel(!showToolsPanel)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Tools
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={performAnalysis}
            disabled={isAnalyzing || chartData.length === 0}
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Analyze
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {tradingStyle.replace('-', ' ').toUpperCase()}
          </Badge>
          <Badge variant="outline" className="font-mono">
            ${currentPrice.toFixed(2)}
          </Badge>
          {analysis && (
            <Badge variant={getSignalVariant(analysis.overallSignal)}>
              {analysis.overallSignal}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={loadChartData}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Professional Tools Panel */}
        {showToolsPanel && (
          <Card className="w-80 bg-card/50 backdrop-blur-sm border border-border/50">
            <CardContent className="p-4">
              <Tabs defaultValue="tools" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tools" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Trading Tools</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {tradingTools.map((tool) => (
                        <Button
                          key={tool.id}
                          variant={selectedTool === tool.id ? 'default' : 'ghost'}
                          size="sm"
                          className="flex flex-col items-center gap-1 h-auto p-2"
                          onClick={() => handleToolSelect(tool.id)}
                          title={tool.description}
                        >
                          {tool.icon}
                          <span className="text-xs">{tool.name}</span>
                        </Button>
                      ))}
                    </div>

                    {/* Active Indicators */}
                    {activeIndicators.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase">
                          Active Indicators
                        </h4>
                        <div className="space-y-1">
                          {activeIndicators.map((indicator) => (
                            <div key={indicator} className="flex items-center justify-between text-xs">
                              <span>{indicator}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setActiveIndicators(prev => prev.filter(i => i !== indicator))}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="analysis">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {analysis ? (
                        <>
                          {/* Overall Signal */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Overall Signal</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={getSignalVariant(analysis.overallSignal)}>
                                {analysis.overallSignal}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {analysis.confidence?.toFixed(0)}% confidence
                              </span>
                            </div>
                          </div>

                          {/* RSI */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">RSI Analysis</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Value:</span>
                                <span className={`font-mono ${
                                  analysis.rsi.value > 70 ? 'text-red-500' : 
                                  analysis.rsi.value < 30 ? 'text-green-500' : 'text-foreground'
                                }`}>
                                  {analysis.rsi.value}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Signal:</span>
                                <Badge variant={getSignalVariant(analysis.rsi.signal)}>
                                  {analysis.rsi.signal}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Support & Resistance */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Key Levels</h4>
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Resistance:</div>
                                {analysis.supportResistance.resistance.map((level: number, i: number) => (
                                  <div key={i} className="text-xs font-mono text-red-500">
                                    ${level.toFixed(2)}
                                  </div>
                                ))}
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Support:</div>
                                {analysis.supportResistance.support.map((level: number, i: number) => (
                                  <div key={i} className="text-xs font-mono text-green-500">
                                    ${level.toFixed(2)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Fibonacci Levels */}
                          {fibLevels && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Fibonacci Levels</h4>
                              <div className="space-y-1">
                                {Object.entries(fibLevels.levels).map(([level, price]) => (
                                  <div key={level} className="flex justify-between text-xs">
                                    <span>{level}:</span>
                                    <span className="font-mono">${(price as number).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Patterns */}
                          {analysis.patterns.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Detected Patterns</h4>
                              {analysis.patterns.map((pattern: any, i: number) => (
                                <div key={i} className="space-y-1 p-2 border border-border/50 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold">{pattern.pattern}</span>
                                    <Badge variant={getSignalVariant(pattern.direction)}>
                                      {pattern.direction}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Probability: {pattern.probability}%
                                  </div>
                                  <div className="text-xs">
                                    Target: ${pattern.target}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center text-muted-foreground text-sm">
                          {isAnalyzing ? 'Analyzing...' : 'Click Analyze to get started'}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Main Chart */}
        <Card className="flex-1 bg-card/50 backdrop-blur-sm border border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                📈 {symbol.toUpperCase()} / USD
              </CardTitle>
              
              {selectedTool !== 'cursor' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Active Tool:</span>
                  <Badge variant="secondary" className="text-xs">
                    {tradingTools.find(t => t.id === selectedTool)?.name}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="h-[600px] w-full">
              <CandlestickChart 
                data={chartData} 
                activeIndicators={activeIndicators}
                selectedTool={selectedTool}
                fibLevels={fibLevels ? Object.entries(fibLevels.levels).map(([label, price]) => ({
                  label,
                  price: price as number
                })) : undefined}
                onToolClick={(tool, data) => {
                  toast({
                    title: `${tool} Tool Applied`,
                    description: `${tool === 'fib-retracement' ? 'Fibonacci levels' : 'Drawing tool'} added at $${data.price?.toFixed(4)}`,
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};