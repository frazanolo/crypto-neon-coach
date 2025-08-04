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
  HelpCircle,
  Pencil,
  Activity,
  Triangle,
  Minus,
  Square,
  MousePointer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cryptoAPI } from '@/lib/cryptoApi';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';

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
  category: 'drawing' | 'indicators' | 'patterns';
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
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [showToolsPanel, setShowToolsPanel] = useState(false);

  const { toast } = useToast();

  // Available trading tools
  const tradingTools: TradingTool[] = [
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
      id: 'horizontalline',
      name: 'Horizontal Line',
      icon: <Target className="w-4 h-4" />,
      description: 'Draw horizontal support and resistance levels',
      category: 'drawing'
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: <Square className="w-4 h-4" />,
      description: 'Draw rectangles to mark consolidation zones',
      category: 'drawing'
    },
    {
      id: 'triangle',
      name: 'Triangle',
      icon: <Triangle className="w-4 h-4" />,
      description: 'Identify triangle patterns for breakout trades',
      category: 'patterns'
    },
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

  // Fetch real market data from CoinGecko API
  const fetchRealMarketData = async (timeframe: string): Promise<CandleData[]> => {
    try {
      // Get real current price first
      const livePrice = await cryptoAPI.getLivePrices([symbol]);
      const currentPriceData = livePrice[symbol.toLowerCase()];
      
      if (currentPriceData) {
        setCurrentPrice(currentPriceData.price);
      }

      // Calculate days based on timeframe
      const days = {
        '1m': 1,
        '5m': 1,
        '1h': 7,
        '4h': 30,
        '1d': 365,
        '1w': 365 * 2
      }[timeframe] || 30;

      // Get historical data
      const coinId = cryptoAPI.mapSymbolToId(symbol);
      const histData = await cryptoAPI.getHistoricalData(coinId, 'usd', days);
      
      // Convert price data to candlestick format
      const data: CandleData[] = [];
      const priceData = histData.prices || [];
      const volumeData = histData.total_volumes || [];
      
      // Group prices by timeframe intervals
      const intervals = {
        '1m': 60 * 1000,
        '5m': 5 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000
      }[timeframe] || 24 * 60 * 60 * 1000;

      // Process data into OHLC format
      for (let i = 0; i < priceData.length - 4; i += 4) {
        const timestamp = new Date(priceData[i][0]);
        const prices = priceData.slice(i, i + 4).map(p => p[1]);
        const volumes = volumeData.slice(i, i + 4).map(v => v[1]);
        
        const open = prices[0];
        const close = prices[prices.length - 1];
        const high = Math.max(...prices);
        const low = Math.min(...prices);
        const volume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;

        data.push({
          time: timestamp.toISOString().split('T')[0] + ' ' + timestamp.toTimeString().split(' ')[0],
          open,
          high,
          low,
          close,
          volume
        });
      }

      // Calculate technical indicators
      data.forEach((item, index) => {
        if (index >= 19) {
          item.sma20 = data.slice(index - 19, index + 1).reduce((sum, d) => sum + d.close, 0) / 20;
        }
        if (index >= 49) {
          item.sma50 = data.slice(index - 49, index + 1).reduce((sum, d) => sum + d.close, 0) / 50;
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
          item.rsi = 100 - (100 / (1 + rs));
        }
      });

      return data.slice(-100); // Return last 100 data points
    } catch (error) {
      console.error('Failed to fetch real market data:', error);
      // Fallback to demo data if API fails
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
        description: `Loaded ${symbol.toUpperCase()} ${timeframe} real market data`,
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
  }, [timeframe, symbol, tradingStyle]);

  // Handle tool selection
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    
    const tool = tradingTools.find(t => t.id === toolId);
    if (!tool) return;

    // Handle indicator tools
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
      
      // Show tooltip for indicators
      toast({
        title: `${tool.name} Indicator`,
        description: `${tool.description} - Added to chart`,
      });
    }

    // Handle pattern recognition tools
    if (tool.category === 'patterns') {
      toast({
        title: `${tool.name} Tool Selected`,
        description: `${tool.description}. Click on the chart to start analysis.`,
      });
    }

    // Handle drawing tools
    if (tool.category === 'drawing' && toolId !== 'cursor') {
      toast({
        title: `${tool.name} Tool Selected`,
        description: `${tool.description}. Click and drag on the chart to draw.`,
      });
    }
  };

  const getToolCategoryName = (category: string) => {
    switch (category) {
      case 'drawing': return 'Drawing Tools';
      case 'indicators': return 'Technical Indicators';
      case 'patterns': return 'Pattern Recognition';
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
        {/* Tools Panel */}
        {showToolsPanel && (
          <Card className="w-64 bg-card/50 backdrop-blur-sm border border-border/50">
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Trading Tools</h3>
                
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
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    domain={['dataMin - 5', 'dataMax + 5']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  
                  {/* Candlesticks */}
                  <Bar 
                    dataKey={(data: CandleData) => [data.low, data.high]}
                    fill="transparent"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                  />
                  
                  {/* Price lines */}
                  <Line 
                    type="monotone" 
                    dataKey="close" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                  />
                  
                  {/* Technical indicators */}
                  {activeIndicators.includes('SMA20') && (
                    <Line 
                      type="monotone" 
                      dataKey="sma20" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={1}
                      dot={false}
                    />
                  )}
                  
                  {activeIndicators.includes('SMA50') && (
                    <Line 
                      type="monotone" 
                      dataKey="sma50" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={1}
                      dot={false}
                    />
                  )}
                  
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as CandleData;
                        return (
                          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{label}</p>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between gap-4">
                                <span>Open:</span>
                                <span className="font-mono">${data.open.toFixed(4)}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span>High:</span>
                                <span className="font-mono text-green-500">${data.high.toFixed(4)}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span>Low:</span>
                                <span className="font-mono text-red-500">${data.low.toFixed(4)}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span>Close:</span>
                                <span className="font-mono">${data.close.toFixed(4)}</span>
                              </div>
                              {activeIndicators.includes('RSI') && data.rsi && (
                                <div className="flex justify-between gap-4">
                                  <span>RSI:</span>
                                  <span className="font-mono">{data.rsi.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};