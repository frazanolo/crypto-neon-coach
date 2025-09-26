import React, { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, Bar, Cell, ReferenceLine } from 'recharts';

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

interface CandlestickChartProps {
  data: CandleData[];
  activeIndicators: string[];
  selectedTool?: string;
  fibLevels?: { label: string; price: number }[];
  onToolClick?: (tool: string, data: any) => void;
}

// Enhanced Professional Candlestick component
const ProfessionalCandlestick = (props: any) => {
  const { payload, x, y, width, height } = props;
  
  if (!payload || !payload.open || !payload.high || !payload.low || !payload.close) return null;
  
  const { open, high, low, close } = payload;
  const isPositive = close >= open;
  const candleColor = isPositive ? '#22c55e' : '#ef4444';
  
  // Ensure proper scaling with adequate space
  const wickWidth = 1;
  const candleWidth = Math.max(3, width * 0.7);
  const candleX = x + (width - candleWidth) / 2;
  const wickX = x + width / 2;
  
  // Calculate heights with proper scaling
  const bodyTop = Math.max(open, close);
  const bodyBottom = Math.min(open, close);
  const bodyHeight = Math.abs(close - open);
  
  // Scale to chart coordinate system
  const priceRange = high - low;
  if (priceRange === 0) return null;
  
  const scale = height / priceRange;
  const baseY = y + height;
  
  const highY = baseY - ((high - low) * scale);
  const lowY = baseY;
  const bodyTopY = baseY - ((bodyTop - low) * scale);
  const bodyBottomY = baseY - ((bodyBottom - low) * scale);
  const bodyHeightPx = Math.max(1, Math.abs(bodyTopY - bodyBottomY));

  return (
    <g>
      {/* Upper wick */}
      {high > bodyTop && (
        <line
          x1={wickX}
          y1={highY}
          x2={wickX}
          y2={bodyTopY}
          stroke={candleColor}
          strokeWidth={wickWidth}
        />
      )}
      
      {/* Lower wick */}
      {low < bodyBottom && (
        <line
          x1={wickX}
          y1={bodyBottomY}
          x2={wickX}
          y2={lowY}
          stroke={candleColor}
          strokeWidth={wickWidth}
        />
      )}
      
      {/* Body */}
      <rect
        x={candleX}
        y={Math.min(bodyTopY, bodyBottomY)}
        width={candleWidth}
        height={bodyHeightPx}
        fill={isPositive ? candleColor : candleColor}
        fillOpacity={isPositive ? 0.8 : 1}
        stroke={candleColor}
        strokeWidth={0.5}
      />
    </g>
  );
};

// Enhanced Professional tooltip with better formatting
const ProfessionalTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const change = data.close - data.open;
    const changePercent = ((change / data.open) * 100);
    
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-xl min-w-[240px]">
        <p className="text-sm font-semibold mb-3 text-foreground border-b border-border/30 pb-2">
          {label}
        </p>
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open:</span>
                <span className="font-mono text-foreground font-medium">${data.open?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">High:</span>
                <span className="font-mono text-green-500 font-medium">${data.high?.toFixed(4)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Low:</span>
                <span className="font-mono text-red-500 font-medium">${data.low?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Close:</span>
                <span className={`font-mono font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${data.close?.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/30 pt-2 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Change:</span>
              <div className="text-right">
                <div className={`font-mono text-sm font-bold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change >= 0 ? '+' : ''}${change.toFixed(4)}
                </div>
                <div className={`font-mono text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between border-t border-border/30 pt-2">
            <span className="text-muted-foreground">Volume:</span>
            <span className="font-mono text-foreground font-medium">
              {(data.volume / 1000000).toFixed(2)}M
            </span>
          </div>
          
          {data.rsi && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">RSI:</span>
              <span className={`font-mono font-medium ${
                data.rsi > 70 ? 'text-red-500' : data.rsi < 30 ? 'text-green-500' : 'text-foreground'
              }`}>
                {data.rsi.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ 
  data, 
  activeIndicators, 
  selectedTool,
  fibLevels,
  onToolClick 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [horizontalLines, setHorizontalLines] = useState<number[]>([]);
  const [trendLines, setTrendLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [pendingPoint, setPendingPoint] = useState<{ x: number; y: number } | null>(null);

  // Handle chart clicks for tools using Recharts event payload
  const handleChartClick = (event: any) => {
    const idx = event?.activeTooltipIndex;
    const chartData = event?.activePayload?.[0]?.payload;
    const price = chartData?.close;

    if (idx == null || price == null) return;

    if (selectedTool && selectedTool !== 'cursor') {
      if (selectedTool === 'horizontal') {
        setHorizontalLines(prev => [...prev, price]);
      } else if (selectedTool === 'trendline') {
        if (!pendingPoint) {
          setPendingPoint({ x: idx, y: price });
        } else {
          setTrendLines(prev => [...prev, { x1: pendingPoint.x, y1: pendingPoint.y, x2: idx, y2: price }]);
          setPendingPoint(null);
        }
      }

      onToolClick?.(selectedTool, {
        index: idx,
        time: chartData.time,
        price,
        data: chartData,
      });
    }
  };

  // Clear tools when tool changes
  useEffect(() => {
    if (selectedTool === 'cursor') {
      setHorizontalLines([]);
      setTrendLines([]);
      setPendingPoint(null);
    }
  }, [selectedTool]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background/50 rounded-lg border border-border/50">
        <div className="text-center text-muted-foreground">
          <div className="text-sm">Loading chart data...</div>
          <div className="text-xs mt-1">Please wait while we fetch real-time market data</div>
        </div>
      </div>
    );
  }

  // Calculate proper Y-axis domain with padding for better visibility
  const prices = data.flatMap(d => [d.high, d.low]);
  const indicators = data.flatMap(d => [d.sma20, d.sma50].filter(Boolean) as number[]);
  const allPrices = [...prices, ...indicators];
  
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const padding = (maxPrice - minPrice) * 0.1; // 10% padding
  const domain = [Math.max(0, minPrice - padding), maxPrice + padding];

  return (
    <div 
      ref={chartRef}
      className="w-full h-full bg-background/50 rounded-lg border border-border/50 p-3"
      style={{ cursor: selectedTool !== 'cursor' ? 'crosshair' : 'default' }}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={400} minHeight={300}>
        <ComposedChart 
          data={data} 
          margin={{ top: 20, right: 80, left: 20, bottom: 40 }}
          onClick={handleChartClick}
        >
          <CartesianGrid 
            strokeDasharray="2 2" 
            stroke="hsl(var(--border))" 
            opacity={0.4}
            horizontal={true}
            vertical={false}
          />
          
          {/* Time axis */}
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => {
              try {
                return new Date(value).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                });
              } catch {
                return value;
              }
            }}
            interval="preserveStartEnd"
            axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            tickLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
          />
          
          {/* Price axis */}
          <YAxis 
            yAxisId="price"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            domain={domain}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            width={80}
            orientation="right"
            axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            tickLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
          />
          
          {/* Volume axis */}
          <YAxis 
            yAxisId="volume"
            orientation="left"
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            width={50}
            domain={[0, 'dataMax']}
            axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            tickLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
          />
          
          <Tooltip content={<ProfessionalTooltip />} />
          
          {/* User-drawn horizontal lines */}
          {horizontalLines.map((y, i) => (
            <ReferenceLine
              key={`h-${i}`}
              y={y}
              yAxisId="price"
              stroke="hsl(var(--primary))"
              strokeDasharray="4 4"
              strokeWidth={2}
              ifOverflow="extendDomain"
              label={{ 
                value: `$${y.toFixed(2)}`, 
                position: 'right', 
                fill: 'hsl(var(--primary))', 
                fontSize: 11,
                fontWeight: 'bold'
              }}
            />
          ))}

          {/* Fibonacci retracement levels */}
          {fibLevels && fibLevels.map((lvl, i) => (
            <ReferenceLine
              key={`f-${i}`}
              y={lvl.price}
              yAxisId="price"
              stroke="hsl(var(--warning))"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              ifOverflow="extendDomain"
              label={{ 
                value: `${lvl.label}: $${lvl.price.toFixed(2)}`, 
                position: 'right', 
                fill: 'hsl(var(--warning))', 
                fontSize: 10,
                fontWeight: 'medium'
              }}
            />
          ))}
          
          {/* Volume bars */}
          <Bar 
            dataKey="volume" 
            yAxisId="volume"
            opacity={0.4}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`volume-${index}`} 
                fill={entry.close >= entry.open ? '#22c55e' : '#ef4444'} 
              />
            ))}
          </Bar>
          
          {/* Moving averages with improved visibility */}
          {activeIndicators.includes('SMA20') && (
            <Line 
              type="monotone" 
              dataKey="sma20" 
              stroke="#22c55e" 
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={false}
              connectNulls={false}
              yAxisId="price"
            />
          )}
          
          {activeIndicators.includes('SMA50') && (
            <Line 
              type="monotone" 
              dataKey="sma50" 
              stroke="#f59e0b" 
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={false}
              connectNulls={false}
              yAxisId="price"
            />
          )}

          {/* Enhanced candlesticks */}
          <Bar 
            dataKey="high"
            fill="transparent"
            shape={(props: any) => <ProfessionalCandlestick {...props} />}
            yAxisId="price"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Tool status indicator */}
      {selectedTool !== 'cursor' && (
        <div className="absolute top-4 left-4 bg-primary/20 border border-primary/50 rounded px-2 py-1 text-xs text-primary font-medium">
          {selectedTool === 'horizontal' && 'Click to add horizontal line'}
          {selectedTool === 'trendline' && (pendingPoint ? 'Click second point' : 'Click first point')}
          {selectedTool === 'fib-retracement' && 'Fibonacci levels active'}
        </div>
      )}
    </div>
  );
};