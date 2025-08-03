import React from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, Bar } from 'recharts';

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
}

// Custom Candlestick component
const Candlestick = (props: any) => {
  const { payload, x, y, width, height } = props;
  
  if (!payload) return null;
  
  const { open, high, low, close } = payload;
  const isPositive = close >= open;
  const color = isPositive ? '#10b981' : '#ef4444';
  const bodyHeight = Math.abs(close - open);
  const bodyY = Math.min(open, close);
  
  // Calculate scaled positions
  const candleWidth = Math.max(2, width * 0.6);
  const candleX = x + (width - candleWidth) / 2;
  
  return (
    <g>
      {/* Wick (high-low line) */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      
      {/* Body (open-close rectangle) */}
      <rect
        x={candleX}
        y={y + (height * (1 - (bodyY + bodyHeight - low) / (high - low)))}
        width={candleWidth}
        height={Math.max(1, height * (bodyHeight / (high - low)))}
        fill={isPositive ? color : color}
        fillOpacity={isPositive ? 0.8 : 1}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

// Custom tooltip for candlestick chart
const CandlestickTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const change = data.close - data.open;
    const changePercent = ((change / data.open) * 100);
    
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg min-w-[200px]">
        <p className="text-sm font-medium mb-2 border-b border-border/30 pb-2">
          {new Date(label).toLocaleDateString()} {new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span>Open:</span>
            <span className="font-mono">${data.open?.toFixed(4)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>High:</span>
            <span className="font-mono text-green-500">${data.high?.toFixed(4)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Low:</span>
            <span className="font-mono text-red-500">${data.low?.toFixed(4)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Close:</span>
            <span className={`font-mono font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${data.close?.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-border/30 pt-1">
            <span>Change:</span>
            <span className={`font-mono text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}${change.toFixed(4)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
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
          {data.sma20 && (
            <div className="flex justify-between gap-4">
              <span>SMA20:</span>
              <span className="font-mono text-green-600">${data.sma20.toFixed(4)}</span>
            </div>
          )}
          {data.sma50 && (
            <div className="flex justify-between gap-4">
              <span>SMA50:</span>
              <span className="font-mono text-orange-600">${data.sma50.toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, activeIndicators }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis 
          dataKey="time" 
          stroke="#9ca3af"
          fontSize={11}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          }}
          interval="preserveStartEnd"
        />
        <YAxis 
          stroke="#9ca3af"
          fontSize={11}
          domain={['dataMin * 0.995', 'dataMax * 1.005']}
          tickFormatter={(value) => `$${value.toFixed(4)}`}
          width={80}
        />
        <Tooltip content={<CandlestickTooltip />} />
        
        {/* Volume bars at the bottom */}
        <Bar 
          dataKey="volume" 
          fill="#6b7280" 
          opacity={0.2}
          yAxisId="volume"
        />
        
        {/* Moving averages */}
        {activeIndicators.includes('SMA20') && (
          <Line 
            type="monotone" 
            dataKey="sma20" 
            stroke="#10b981" 
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            connectNulls={false}
          />
        )}
        {activeIndicators.includes('SMA50') && (
          <Line 
            type="monotone" 
            dataKey="sma50" 
            stroke="#f59e0b" 
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            connectNulls={false}
          />
        )}

        {/* Custom candlesticks rendered as bars with custom shape */}
        <Bar 
          dataKey="high"
          fill="transparent"
          shape={(props: any) => <Candlestick {...props} />}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};