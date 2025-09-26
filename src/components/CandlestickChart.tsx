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

// Professional Candlestick component with proper styling
const ProfessionalCandlestick = (props: any) => {
  const { payload, x, y, width, height } = props;
  
  if (!payload) return null;
  
  const { open, high, low, close } = payload;
  const isPositive = close >= open;
  const color = isPositive ? '#22c55e' : '#ef4444';
  
  // Calculate proper scaling
  const priceRange = high - low;
  const bodyHeight = Math.abs(close - open);
  const bodyTop = Math.max(open, close);
  const bodyBottom = Math.min(open, close);
  
  // Scale to chart dimensions
  const wickTop = y + ((high - bodyTop) / priceRange) * height;
  const wickBottom = y + ((high - bodyBottom) / priceRange) * height;
  const bodyY = y + ((high - bodyTop) / priceRange) * height;
  const bodyHeightPx = (bodyHeight / priceRange) * height;
  
  const candleWidth = Math.max(2, width * 0.8);
  const candleX = x + (width - candleWidth) / 2;
  const wickX = x + width / 2;
  
  return (
    <g>
      {/* Upper wick */}
      {high > bodyTop && (
        <line
          x1={wickX}
          y1={wickTop}
          x2={wickX}
          y2={bodyY}
          stroke={color}
          strokeWidth={1}
        />
      )}
      
      {/* Lower wick */}
      {low < bodyBottom && (
        <line
          x1={wickX}
          y1={wickBottom}
          x2={wickX}
          y2={bodyY + bodyHeightPx}
          stroke={color}
          strokeWidth={1}
        />
      )}
      
      {/* Body */}
      <rect
        x={candleX}
        y={bodyY}
        width={candleWidth}
        height={Math.max(1, bodyHeightPx)}
        fill={isPositive ? color : color}
        fillOpacity={isPositive ? 0.9 : 1}
        stroke={color}
        strokeWidth={0.5}
      />
    </g>
  );
};

// Professional tooltip
const ProfessionalTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const change = data.close - data.open;
    const changePercent = ((change / data.open) * 100);
    
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl min-w-[220px]">
        <p className="text-sm font-semibold mb-2 text-foreground border-b border-border/30 pb-2">
          {new Date(data.time).toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
        <div className="space-y-1.5 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open:</span>
                <span className="font-mono text-foreground">${data.open?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">High:</span>
                <span className="font-mono text-green-500">${data.high?.toFixed(4)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Low:</span>
                <span className="font-mono text-red-500">${data.low?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Close:</span>
                <span className={`font-mono font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${data.close?.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/30 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Change:</span>
              <div className="text-right">
                <div className={`font-mono text-sm font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change >= 0 ? '+' : ''}${change.toFixed(4)}
                </div>
                <div className={`font-mono text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Volume:</span>
            <span className="font-mono text-foreground">{(data.volume / 1000000).toFixed(2)}M</span>
          </div>
          
          {data.rsi && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">RSI:</span>
              <span className={`font-mono ${data.rsi > 70 ? 'text-red-500' : data.rsi < 30 ? 'text-green-500' : 'text-foreground'}`}>
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

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background/50 rounded-lg border border-border/50">
        <div className="text-center text-muted-foreground">
          <div className="text-sm">Loading chart data...</div>
        </div>
      </div>
    );
  }

  // Calculate proper Y-axis domain
  const prices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.05;
  const domain = [minPrice - padding, maxPrice + padding];

  return (
    <div 
      ref={chartRef}
      className="w-full h-full bg-background/50 rounded-lg border border-border/50 p-2"
      style={{ cursor: selectedTool !== 'cursor' ? 'crosshair' : 'default' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={data} 
          margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
          onClick={handleChartClick}
        >
          <CartesianGrid 
            strokeDasharray="1 1" 
            stroke="hsl(var(--border))" 
            opacity={0.3}
            horizontal={true}
            vertical={false}
          />
          
          {/* Time axis */}
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            tick={{ fontSize: 10 }}
            domain={domain}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            width={70}
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
            tick={{ fontSize: 9 }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            width={50}
            domain={[0, 'dataMax']}
            axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
            tickLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
          />
          
          <Tooltip content={<ProfessionalTooltip />} />
          
          {/* Horizontal lines (user drawn) */}
          {horizontalLines.map((y, i) => (
            <ReferenceLine
              key={`h-${i}`}
              y={y}
              yAxisId="price"
              stroke="hsl(var(--primary))"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
          ))}

          {/* Fibonacci retracement levels */}
          {fibLevels && fibLevels.map((lvl, i) => (
            <ReferenceLine
              key={`f-${i}`}
              y={lvl.price}
              yAxisId="price"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="6 6"
              ifOverflow="extendDomain"
              label={{ value: lvl.label, position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
          ))}
          
          <Bar 
            dataKey="volume" 
            yAxisId="volume"
            opacity={0.3}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`volume-${index}`} 
                fill={entry.close >= entry.open ? '#22c55e' : '#ef4444'} 
              />
            ))}
          </Bar>
          
          {/* Moving averages */}
          {activeIndicators.includes('SMA20') && (
            <Line 
              type="monotone" 
              dataKey="sma20" 
              stroke="#22c55e" 
              strokeWidth={2}
              strokeDasharray="3 3"
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
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={false}
              yAxisId="price"
            />
          )}

          {/* Candlesticks */}
          <Bar 
            dataKey="high"
            fill="transparent"
            shape={(props: any) => <ProfessionalCandlestick {...props} />}
            yAxisId="price"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};