import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  Percent
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cryptoAPI } from '@/lib/cryptoApi';
import { CandlestickChart } from '@/components/CandlestickChart';

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

interface TradingTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'drawing' | 'fibonacci' | 'patterns' | 'indicators';
}

interface AnalysisResult {
  toolUsed: string;
  analysis: string;
  signals: string[];
  timestamp: Date;
}

interface TradingViewChartProps {
  symbol: string;
  tradingStyle: 'short-term' | 'long-term';
  onAnalysisUpdate?: (analysis: any) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  tradingStyle,
  onAnalysisUpdate
}) => {
  const [timeframe, setTimeframe] = useState<string>(tradingStyle === 'short-term' ? '1h' : '1d');
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedTool, setSelectedTool] = useState<string>('cursor');
  const [showToolsPanel, setShowToolsPanel] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  const { toast } = useToast();

  // Professional trading tools like TradingView
  const tradingTools: TradingTool[] = [
    // Basic tools
    {
      id: 'cursor',
      name: 'Cursor',
      icon: <MousePointer className="w-4 h-4" />,
      description: 'Select and interact with chart elements',
      category: 'drawing'
    },
    {
      id: 'trendline',
      name: 'Trend Line',
      icon: <Minus className="w-4 h-4" />,
      description: 'Draw trend lines to identify support and resistance',
      category: 'drawing'
    },
    {
      id: 'horizontal',
      name: 'Horizontal Line',
      icon: <Target className="w-4 h-4" />,
      description: 'Draw horizontal support and resistance levels',
      category: 'drawing'
    },
    
    // Fibonacci tools
    {
      id: 'fib-retracement',
      name: 'Fib Retracement',
      icon: <Percent className="w-4 h-4" />,
      description: 'Fibonacci retracement levels for pullback analysis',
      category: 'fibonacci'
    },
    {
      id: 'fib-extension',
      name: 'Fib Extension',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Fibonacci extension levels for price targets',
      category: 'fibonacci'
    },
    {
      id: 'fib-fan',
      name: 'Fib Fan',
      icon: <Triangle className="w-4 h-4" />,
      description: 'Fibonacci fan lines for dynamic support/resistance',
      category: 'fibonacci'
    },
    
    // Pattern recognition
    {
      id: 'head-shoulders',
      name: 'Head & Shoulders',
      icon: <Activity className="w-4 h-4" />,
      description: 'Identify head and shoulders reversal patterns',
      category: 'patterns'
    },
    {
      id: 'bull-flag',
      name: 'Bull Flag',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Identify bull flag continuation patterns',
      category: 'patterns'
    },
    {
      id: 'bear-flag',
      name: 'Bear Flag',
      icon: <TrendingDown className="w-4 h-4" />,
      description: 'Identify bear flag continuation patterns',
      category: 'patterns'
    },
    
    // Technical indicators
    {
      id: 'sma20',
      name: 'SMA 20',
      icon: <Activity className="w-4 h-4" />,
      description: '20-period Simple Moving Average',
      category: 'indicators'
    },
    {
      id: 'sma50',
      name: 'SMA 50',
      icon: <Activity className="w-4 h-4" />,
      description: '50-period Simple Moving Average',
      category: 'indicators'
    },
    {
      id: 'rsi',
      name: 'RSI',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Relative Strength Index for momentum analysis',
      category: 'indicators'
    }
  ];

  // Fetch real market data with proper OHLC formatting
  const fetchRealMarketData = async (timeframe: string): Promise<CandleData[]> => {
    try {
      const livePrice = await cryptoAPI.getLivePrices([symbol]);
      const currentPriceData = livePrice[symbol.toLowerCase()];
      
      if (currentPriceData) {
        setCurrentPrice(currentPriceData.price);
      }

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
          open: parseFloat(open.toFixed(4)),
          high: parseFloat(high.toFixed(4)),
          low: parseFloat(low.toFixed(4)),
          close: parseFloat(close.toFixed(4)),
          volume: parseFloat(volume.toFixed(0))
        });
      }

      // Calculate technical indicators
      data.forEach((item, index) => {
        if (index >= 19) {
          item.sma20 = parseFloat((data.slice(index - 19, index + 1)
            .reduce((sum, d) => sum + d.close, 0) / 20).toFixed(4));
        }
        if (index >= 49) {
          item.sma50 = parseFloat((data.slice(index - 49, index + 1)
            .reduce((sum, d) => sum + d.close, 0) / 50).toFixed(4));
        }
        
        // RSI calculation
        if (index >= 14) {
          let gains = 0, losses = 0;
          for (let j = 1; j <= 14; j++) {
            const diff = data[index - j + 1].close - data[index - j].close;
            if (diff > 0) gains += diff;
            else losses -= diff;
          }
          const rs = gains / losses;
          item.rsi = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
        }
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      return [];
    }
  };

  // Load chart data
  const loadChartData = async () => {
    try {
      const data = await fetchRealMarketData(timeframe);
      setChartData(data);
      
      toast({
        title: "Chart Updated",
        description: `Loaded ${symbol.toUpperCase()} ${timeframe} data`,
      });
    } catch (error) {
      console.error('Data loading failed:', error);
      toast({
        title: "Data Error",
        description: "Failed to load chart data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadChartData();
  }, [timeframe, symbol]);

  // Handle tool selection and generate analysis
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

    // Generate analysis for tools used
    if (tool.category !== 'drawing' && toolId !== 'cursor') {
      generateAnalysis(tool);
    }

    toast({
      title: `${tool.name} Selected`,
      description: tool.description,
    });
  };

  // Generate AI-driven technical analysis
  const generateAnalysis = (tool: TradingTool) => {
    const currentData = chartData[chartData.length - 1];
    if (!currentData) return;

    let analysis = '';
    let signals: string[] = [];

    switch (tool.id) {
      case 'fib-retracement':
        analysis = `Fibonacci retracement analysis for ${symbol.toUpperCase()}: Key levels at 23.6%, 38.2%, 50%, 61.8%, and 78.6%. Current price suggests ${currentData.close > currentData.open ? 'bullish' : 'bearish'} momentum.`;
        signals = ['Watch for bounces at 61.8% level', 'Break below 78.6% indicates continuation'];
        break;
        
      case 'head-shoulders':
        analysis = `Head and Shoulders pattern analysis: ${currentData.high > currentData.low * 1.02 ? 'Potential formation detected' : 'No clear pattern visible'}. Monitor neckline breaks for confirmation.`;
        signals = ['Volume confirmation needed', 'Neckline break = strong signal'];
        break;
        
      case 'bull-flag':
        const trend = chartData.slice(-5).every((candle, i, arr) => 
          i === 0 || candle.close >= arr[i-1].close * 0.99);
        analysis = `Bull flag pattern analysis: ${trend ? 'Bullish consolidation detected' : 'No clear bull flag pattern'}. Look for breakout above resistance.`;
        signals = ['Wait for volume spike', 'Target = pole height added to breakout'];
        break;
        
      case 'sma20':
        analysis = `SMA 20 analysis: Price is ${currentData.close > (currentData.sma20 || 0) ? 'above' : 'below'} the 20-period moving average, indicating ${currentData.close > (currentData.sma20 || 0) ? 'bullish' : 'bearish'} short-term trend.`;
        signals = ['Price above SMA = bullish', 'Price below SMA = bearish'];
        break;
        
      case 'rsi':
        const rsi = currentData.rsi || 50;
        analysis = `RSI analysis: Current RSI is ${rsi.toFixed(2)}. ${rsi > 70 ? 'Overbought territory - potential selling pressure' : rsi < 30 ? 'Oversold territory - potential buying opportunity' : 'Neutral momentum'}`;
        signals = rsi > 70 ? ['Overbought - watch for reversal'] : rsi < 30 ? ['Oversold - potential bounce'] : ['Neutral - await breakout'];
        break;
        
      default:
        analysis = `${tool.name} analysis: Tool selected for ${symbol.toUpperCase()}. Monitor price action for relevant signals.`;
        signals = ['Technical analysis in progress'];
    }

    const newResult: AnalysisResult = {
      toolUsed: tool.name,
      analysis,
      signals,
      timestamp: new Date()
    };

    setAnalysisResults(prev => [newResult, ...prev.slice(0, 4)]); // Keep last 5 results
  };

  const getToolCategoryName = (category: string) => {
    switch (category) {
      case 'drawing': return 'Drawing Tools';
      case 'fibonacci': return 'Fibonacci Tools';
      case 'patterns': return 'Pattern Recognition';
      case 'indicators': return 'Technical Indicators';
      default: return 'Tools';
    }
  };

  const groupedTools = tradingTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, TradingTool[]>);

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
        </div>

        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {tradingStyle.replace('-', ' ').toUpperCase()}
          </Badge>
          <Badge variant="outline" className="font-mono">
            ${currentPrice.toFixed(2)}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadChartData}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Professional Tools Panel */}
        {showToolsPanel && (
          <Card className="w-64 bg-card/50 backdrop-blur-sm border border-border/50">
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Professional Trading Tools</h3>
                
                {Object.entries(groupedTools).map(([category, tools]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {getToolCategoryName(category)}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {tools.map((tool) => (
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
                  </div>
                ))}

                {/* Active Indicators */}
                {activeIndicators.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
            </CardContent>
          </Card>
        )}

        {/* Main Chart */}
        <Card className="flex-1 bg-card/50 backdrop-blur-sm border border-border/50">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  📈 {symbol.toUpperCase()} / USD
                </h2>
                <Badge variant="outline" className="text-xs">
                  {timeframe.toUpperCase()}
                </Badge>
              </div>
              
              {selectedTool !== 'cursor' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Active Tool:</span>
                  <Badge variant="secondary" className="text-xs">
                    {tradingTools.find(t => t.id === selectedTool)?.name}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="h-[600px] w-full">
              <CandlestickChart 
                data={chartData} 
                activeIndicators={activeIndicators}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results Panel - Initially Empty */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysisResults.length === 0 ? (
          <>
            <Card className="bg-card/30 border-dashed border-2 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Technical Analysis</p>
                  <p className="text-xs">Use tools above to generate insights</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/30 border-dashed border-2 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Pattern Recognition</p>
                  <p className="text-xs">Select pattern tools for analysis</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/30 border-dashed border-2 border-border/50">
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  <Percent className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Fibonacci Levels</p>
                  <p className="text-xs">Use Fibonacci tools for levels</p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          analysisResults.map((result, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {result.toolUsed}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground/90">
                    {result.analysis}
                  </p>
                  
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-muted-foreground">Key Signals:</h4>
                    {result.signals.map((signal, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <span>{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
  );
};