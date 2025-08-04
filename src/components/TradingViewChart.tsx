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
import { CandlestickChart as CandlestickChartComponent } from '@/components/CandlestickChart';
import { EducationalIndicatorModal } from '@/components/EducationalIndicatorModal';

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

  // Generate realistic market data
  const generateMarketData = (timeframe: string): CandleData[] => {
    const now = Date.now();
    const intervals = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000
    }[timeframe] || 60 * 60 * 1000;

    const dataPoints = tradingStyle === 'short-term' ? 100 : 200;
    const data: CandleData[] = [];
    
    let basePrice = 50000; // Default BTC price
    if (symbol.toLowerCase() === 'eth') basePrice = 3000;
    if (symbol.toLowerCase() === 'xrp') basePrice = 2.5;

    // Generate price data with realistic patterns
    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = new Date(now - i * intervals);
      const volatility = tradingStyle === 'short-term' ? 0.03 : 0.02;
      
      // Add trend and noise
      const trendFactor = Math.sin(i / 20) * 0.1;
      const noise = (Math.random() - 0.5) * volatility;
      const change = trendFactor + noise;
      
      const open = basePrice;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.015);
      const low = Math.min(open, close) * (1 - Math.random() * 0.015);
      const volume = Math.random() * 1000000 + 500000;

      data.push({
        time: timestamp.toISOString().split('T')[0] + ' ' + timestamp.toTimeString().split(' ')[0],
        open,
        high,
        low,
        close,
        volume
      });

      basePrice = close;
    }

    // Calculate moving averages and RSI
    data.forEach((item, index) => {
      if (index >= 19) {
        item.sma20 = data.slice(index - 19, index + 1).reduce((sum, d) => sum + d.close, 0) / 20;
      }
      if (index >= 49) {
        item.sma50 = data.slice(index - 49, index + 1).reduce((sum, d) => sum + d.close, 0) / 50;
      }
      
      // Simple RSI calculation
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

    setCurrentPrice(data[data.length - 1]?.close || basePrice);
    return data;
  };

  // Load chart data
  const loadChartData = () => {
    try {
      const data = generateMarketData(timeframe);
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
      
      // Show educational info for indicators
      setSelectedIndicator(tool.name);
      setShowEducationalModal(true);
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
              <CandlestickChartComponent 
                data={chartData} 
                activeIndicators={activeIndicators}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Educational Modal */}
      <EducationalIndicatorModal
        indicator={selectedIndicator}
        isOpen={showEducationalModal}
        onClose={() => {
          setShowEducationalModal(false);
          setSelectedIndicator(null);
        }}
        tradingStyle={tradingStyle}
      />
    </div>
  );
};