import React, { useState, useEffect } from 'react';
import { 
  ComposedChart, 
  Bar,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart as LineChartIcon, 
  CandlestickChart,
  Activity,
  Target,
  Zap,
  Brain,
  Settings,
  Eye,
  HelpCircle
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

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  description: string;
  change: number;
}

interface AIAnalysis {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  recommendation: string;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  targetPrice: number;
  stopLoss: number;
}

interface TradingViewChartProps {
  symbol: string;
  tradingStyle: 'short-term' | 'long-term';
  onAnalysisUpdate?: (analysis: AIAnalysis) => void;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  tradingStyle,
  onAnalysisUpdate
}) => {
  const [timeframe, setTimeframe] = useState<string>(tradingStyle === 'short-term' ? '1h' : '1d');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['SMA20', 'SMA50']);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [showEducationalModal, setShowEducationalModal] = useState(false);

  const { toast } = useToast();

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

    // Calculate moving averages
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

  // Calculate technical indicators
  const calculateTechnicalIndicators = (data: CandleData[]): TechnicalIndicator[] => {
    if (data.length < 50) return [];

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    const indicators: TechnicalIndicator[] = [];

    // RSI
    if (latest.rsi !== undefined) {
      indicators.push({
        name: 'RSI(14)',
        value: latest.rsi,
        signal: latest.rsi > 70 ? 'sell' : latest.rsi < 30 ? 'buy' : 'neutral',
        description: latest.rsi > 70 ? 'Overbought Zone' : latest.rsi < 30 ? 'Oversold Zone' : 'Neutral Zone',
        change: latest.rsi - (previous.rsi || latest.rsi)
      });
    }

    // Moving Averages
    if (latest.sma20 !== undefined) {
      indicators.push({
        name: 'SMA(20)',
        value: latest.sma20,
        signal: latest.close > latest.sma20 ? 'buy' : 'sell',
        description: latest.close > latest.sma20 ? 'Price Above SMA20' : 'Price Below SMA20',
        change: latest.sma20 - (previous.sma20 || latest.sma20)
      });
    }

    if (latest.sma50 !== undefined) {
      indicators.push({
        name: 'SMA(50)',
        value: latest.sma50,
        signal: latest.close > latest.sma50 ? 'buy' : 'sell',
        description: latest.close > latest.sma50 ? 'Price Above SMA50' : 'Price Below SMA50',
        change: latest.sma50 - (previous.sma50 || latest.sma50)
      });
    }

    // Volume analysis
    const avgVolume = data.slice(-20).reduce((sum, d) => sum + d.volume, 0) / 20;
    indicators.push({
      name: 'Volume',
      value: latest.volume,
      signal: latest.volume > avgVolume * 1.5 ? 'buy' : latest.volume < avgVolume * 0.5 ? 'sell' : 'neutral',
      description: latest.volume > avgVolume * 1.5 ? 'High Volume' : latest.volume < avgVolume * 0.5 ? 'Low Volume' : 'Normal Volume',
      change: latest.volume - previous.volume
    });

    // Price momentum
    const priceChange = ((latest.close - previous.close) / previous.close) * 100;
    indicators.push({
      name: 'Momentum',
      value: priceChange,
      signal: priceChange > 2 ? 'buy' : priceChange < -2 ? 'sell' : 'neutral',
      description: priceChange > 2 ? 'Strong Bullish' : priceChange < -2 ? 'Strong Bearish' : 'Sideways',
      change: priceChange
    });

    return indicators;
  };

  // Generate AI analysis
  const generateAIAnalysis = async (data: CandleData[], indicators: TechnicalIndicator[]): Promise<AIAnalysis> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const latest = data[data.length - 1];
    const prices = data.map(d => d.close);
    const maxPrice = Math.max(...prices.slice(-50));
    const minPrice = Math.min(...prices.slice(-50));

    // Analyze sentiment based on indicators
    const bullishSignals = indicators.filter(i => i.signal === 'buy').length;
    const bearishSignals = indicators.filter(i => i.signal === 'sell').length;
    
    let sentiment: 'bullish' | 'bearish' | 'neutral';
    let confidence: number;
    let riskLevel: 'low' | 'medium' | 'high';

    if (bullishSignals > bearishSignals + 1) {
      sentiment = 'bullish';
      confidence = Math.min(95, 60 + (bullishSignals - bearishSignals) * 10);
      riskLevel = confidence > 80 ? 'low' : 'medium';
    } else if (bearishSignals > bullishSignals + 1) {
      sentiment = 'bearish';
      confidence = Math.min(95, 60 + (bearishSignals - bullishSignals) * 10);
      riskLevel = confidence > 80 ? 'medium' : 'high';
    } else {
      sentiment = 'neutral';
      confidence = 50 + Math.random() * 20;
      riskLevel = 'medium';
    }

    // Calculate key levels
    const support = [
      minPrice * 1.01,
      latest.close * 0.97,
      latest.close * 0.94
    ].sort((a, b) => b - a);

    const resistance = [
      maxPrice * 0.99,
      latest.close * 1.03,
      latest.close * 1.06
    ].sort((a, b) => a - b);

    // Set targets based on trading style and sentiment
    let targetPrice: number;
    let stopLoss: number;

    if (tradingStyle === 'short-term') {
      targetPrice = sentiment === 'bullish' ? latest.close * 1.05 : latest.close * 0.95;
      stopLoss = sentiment === 'bullish' ? latest.close * 0.98 : latest.close * 1.02;
    } else {
      targetPrice = sentiment === 'bullish' ? latest.close * 1.15 : latest.close * 0.85;
      stopLoss = sentiment === 'bullish' ? latest.close * 0.92 : latest.close * 1.08;
    }

    // Generate recommendation
    let recommendation = '';
    if (tradingStyle === 'short-term') {
      if (sentiment === 'bullish' && confidence > 70) {
        recommendation = `Strong ${timeframe} bullish signals detected. Consider entering long positions with target at $${targetPrice.toFixed(2)} and stop-loss at $${stopLoss.toFixed(2)}.`;
      } else if (sentiment === 'bearish' && confidence > 70) {
        recommendation = `Bearish momentum building. Consider short positions or protective strategies. Monitor support at $${support[0].toFixed(2)}.`;
      } else {
        recommendation = `Mixed signals in ${timeframe} timeframe. Wait for clearer directional confirmation before entering positions.`;
      }
    } else {
      if (sentiment === 'bullish' && confidence > 60) {
        recommendation = `Long-term bullish outlook supported by technical indicators. Consider DCA strategy or position accumulation on dips near $${support[0].toFixed(2)}.`;
      } else if (sentiment === 'bearish' && confidence > 60) {
        recommendation = `Long-term bearish pressure evident. Consider reducing exposure or implementing hedging strategies. Watch for breakdown below $${support[1].toFixed(2)}.`;
      } else {
        recommendation = `Consolidation phase in long-term view. Implement dollar-cost averaging strategy and monitor key levels for breakout direction.`;
      }
    }

    return {
      sentiment,
      confidence,
      keyLevels: { support, resistance },
      recommendation,
      timeframe: `${timeframe} ${tradingStyle}`,
      riskLevel,
      targetPrice,
      stopLoss
    };
  };

  // Load data and perform analysis
  const loadDataAndAnalyze = async () => {
    try {
      const data = generateMarketData(timeframe);
      setChartData(data);

      const technicalIndicators = calculateTechnicalIndicators(data);
      setIndicators(technicalIndicators);

      // Generate AI analysis
      setIsLoadingAnalysis(true);
      try {
        const analysis = await generateAIAnalysis(data, technicalIndicators);
        setAiAnalysis(analysis);
        onAnalysisUpdate?.(analysis);
      } catch (error) {
        console.error('AI Analysis failed:', error);
        toast({
          title: "Analysis Error",
          description: "Failed to generate AI analysis",
          variant: "destructive"
        });
      } finally {
        setIsLoadingAnalysis(false);
      }

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
    loadDataAndAnalyze();
  }, [timeframe, symbol, tradingStyle]);

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span>Open:</span>
              <span className="font-mono">${data.open?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>High:</span>
              <span className="font-mono text-green-500">${data.high?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Low:</span>
              <span className="font-mono text-red-500">${data.low?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Close:</span>
              <span className="font-mono font-semibold">${data.close?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Volume:</span>
              <span className="font-mono">{(data.volume / 1000).toFixed(0)}K</span>
            </div>
            {data.rsi && (
              <div className="flex justify-between gap-4">
                <span>RSI:</span>
                <span className="font-mono">{data.rsi.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'sell': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-green-500';
      case 'sell': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'bearish': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
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

          <div className="flex gap-1 bg-muted/20 rounded-lg p-1">
            <Button
              variant={chartType === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              <LineChartIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              <AreaChart className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === 'candlestick' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('candlestick')}
            >
              <CandlestickChart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {tradingStyle.replace('-', ' ').toUpperCase()}
          </Badge>
          <Badge variant="outline" className="font-mono">
            ${currentPrice.toFixed(2)}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadDataAndAnalyze}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Chart */}
      <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              📈 {symbol.toUpperCase()} Technical Analysis
            </span>
            {aiAnalysis && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {getSentimentIcon(aiAnalysis.sentiment)}
                  <span className="text-sm font-medium">
                    {aiAnalysis.sentiment.toUpperCase()}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {aiAnalysis.confidence}% Confidence
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full">
            {chartType === 'candlestick' ? (
              <CandlestickChartComponent 
                data={chartData} 
                activeIndicators={activeIndicators}
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9ca3af"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                     <YAxis 
                      stroke="#9ca3af"
                      fontSize={12}
                      domain={['dataMin - 50', 'dataMax + 50']}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                    {activeIndicators.includes('SMA20') && (
                      <Line 
                        type="monotone" 
                        dataKey="sma20" 
                        stroke="#10b981" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                    {activeIndicators.includes('SMA50') && (
                      <Line 
                        type="monotone" 
                        dataKey="sma50" 
                        stroke="#f59e0b" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9ca3af"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                     <YAxis 
                      stroke="#9ca3af"
                      fontSize={12}
                      domain={['dataMin - 50', 'dataMax + 50']}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#3b82f6" 
                      fill="url(#colorPrice)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                ) : (
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9ca3af"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                     <YAxis 
                      stroke="#9ca3af"
                      fontSize={12}
                      domain={['dataMin - 50', 'dataMax + 50']}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" yAxisId="volume" fill="#6b7280" opacity={0.3} />
                    <Line 
                      type="monotone" 
                      dataKey="high" 
                      stroke="#10b981" 
                      strokeWidth={1}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="low" 
                      stroke="#ef4444" 
                      strokeWidth={1}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs defaultValue="indicators" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="indicators">Technical Indicators</TabsTrigger>
          <TabsTrigger value="ai-analysis">
            <Brain className="w-4 h-4 mr-2" />
            AI Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Technical Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {indicators.map((indicator, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedIndicator(indicator.name);
                      setShowEducationalModal(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {getSignalIcon(indicator.signal)}
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {indicator.name}
                          <HelpCircle className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {indicator.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold font-mono">
                        {indicator.name === 'Volume' 
                          ? `${(indicator.value / 1000).toFixed(0)}K`
                          : indicator.name === 'Momentum'
                          ? `${indicator.value > 0 ? '+' : ''}${indicator.value.toFixed(2)}%`
                          : indicator.value.toFixed(4)
                        }
                      </div>
                      <div className={`text-sm capitalize ${getSignalColor(indicator.signal)}`}>
                        {indicator.signal}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-4">
          <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Trading Analysis
                {isLoadingAnalysis && (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiAnalysis ? (
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted/10 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-2">
                        {getSentimentIcon(aiAnalysis.sentiment)}
                      </div>
                      <div className="font-semibold capitalize text-sm">
                        {aiAnalysis.sentiment}
                      </div>
                      <div className="text-xs text-muted-foreground">Sentiment</div>
                    </div>
                    <div className="p-3 bg-muted/10 rounded-lg text-center">
                      <div className="text-xl font-bold text-primary">
                        {aiAnalysis.confidence}%
                      </div>
                      <div className="text-xs text-muted-foreground">Confidence</div>
                    </div>
                    <div className="p-3 bg-muted/10 rounded-lg text-center">
                      <div className={`text-lg font-bold capitalize ${getRiskColor(aiAnalysis.riskLevel)}`}>
                        {aiAnalysis.riskLevel}
                      </div>
                      <div className="text-xs text-muted-foreground">Risk Level</div>
                    </div>
                    <div className="p-3 bg-muted/10 rounded-lg text-center">
                      <div className="text-sm font-semibold">
                        {aiAnalysis.timeframe}
                      </div>
                      <div className="text-xs text-muted-foreground">Timeframe</div>
                    </div>
                  </div>

                  {/* Trading Levels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-500 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Target Price
                      </h4>
                      <div className="text-2xl font-bold font-mono">
                        ${aiAnalysis.targetPrice.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {((aiAnalysis.targetPrice - currentPrice) / currentPrice * 100).toFixed(1)}% from current
                      </div>
                    </div>
                    
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <h4 className="font-semibold text-red-500 mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Stop Loss
                      </h4>
                      <div className="text-2xl font-bold font-mono">
                        ${aiAnalysis.stopLoss.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {((aiAnalysis.stopLoss - currentPrice) / currentPrice * 100).toFixed(1)}% from current
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <h4 className="font-semibold text-blue-500 mb-3">Risk/Reward</h4>
                      <div className="text-2xl font-bold">
                        1:{Math.abs((aiAnalysis.targetPrice - currentPrice) / (aiAnalysis.stopLoss - currentPrice)).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Risk to Reward Ratio
                      </div>
                    </div>
                  </div>

                  {/* Key Levels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-500 mb-3">Support Levels</h4>
                      <div className="space-y-2">
                        {aiAnalysis.keyLevels.support.map((level, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">S{index + 1}</span>
                            <div className="text-right">
                              <span className="font-mono">${level.toFixed(2)}</span>
                              <div className="text-xs text-muted-foreground">
                                {((level - currentPrice) / currentPrice * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                      <h4 className="font-semibold text-red-500 mb-3">Resistance Levels</h4>
                      <div className="space-y-2">
                        {aiAnalysis.keyLevels.resistance.map((level, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">R{index + 1}</span>
                            <div className="text-right">
                              <span className="font-mono">${level.toFixed(2)}</span>
                              <div className="text-xs text-muted-foreground">
                                {((level - currentPrice) / currentPrice * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Recommendation
                    </h4>
                    <p className="text-sm leading-relaxed">{aiAnalysis.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Generating AI analysis...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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