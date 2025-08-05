import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, PriceLineOptions } from 'lightweight-charts';

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
  onToolClick?: (tool: string, data: any) => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ 
  data, 
  activeIndicators, 
  selectedTool,
  onToolClick 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const sma20SeriesRef = useRef<any>(null);
  const sma50SeriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create the chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
        fontSize: 12,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      grid: {
        vertLines: { color: '#374151', style: 1 },
        horzLines: { color: '#374151', style: 1 },
      },
      rightPriceScale: {
        borderColor: '#4b5563',
        visible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        borderColor: '#4b5563',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6b7280',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: '#6b7280',
          width: 1,
          style: 3,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: {
          time: true,
          price: true,
        },
        axisDoubleClickReset: {
          time: true,
          price: true,
        },
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Create candlestick series
    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: 4,
        minMove: 0.0001,
      },
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Create volume series
    const volumeSeries = (chart as any).addHistogramSeries({
      color: '#6b7280',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    volumeSeriesRef.current = volumeSeries;

    // Handle tool clicks
    if (selectedTool && selectedTool !== 'cursor') {
      chart.subscribeClick((param) => {
        if (param.time && onToolClick) {
          const price = param.seriesData?.get(candlestickSeries) as any;
          onToolClick(selectedTool, {
            time: param.time,
            price: price?.close || param.point?.y,
            logical: param.logical,
            point: param.point
          });
        }
      });
    }

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [selectedTool, onToolClick]);

  // Update data
  useEffect(() => {
    if (!chartRef.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) return;
    if (data.length === 0) return;

    // Convert data to lightweight-charts format
    const candlestickData: CandlestickData[] = data.map((item) => ({
      time: Math.floor(new Date(item.time).getTime() / 1000) as any,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    const volumeData = data.map((item) => ({
      time: Math.floor(new Date(item.time).getTime() / 1000) as any,
      value: item.volume,
      color: item.close >= item.open ? '#22c55e33' : '#ef444433',
    }));

    candlestickSeriesRef.current.setData(candlestickData);
    volumeSeriesRef.current.setData(volumeData);
  }, [data]);

  // Update indicators
  useEffect(() => {
    if (!chartRef.current) return;

    // Remove existing indicator series
    if (sma20SeriesRef.current) {
      chartRef.current.removeSeries(sma20SeriesRef.current);
      sma20SeriesRef.current = null;
    }
    if (sma50SeriesRef.current) {
      chartRef.current.removeSeries(sma50SeriesRef.current);
      sma50SeriesRef.current = null;
    }

    // Add SMA20 if active
    if (activeIndicators.includes('SMA20')) {
      const sma20Series = (chartRef.current as any).addLineSeries({
        color: '#22c55e',
        lineWidth: 2,
        lineStyle: 2, // dashed
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      const sma20Data: LineData[] = data
        .filter(item => item.sma20 !== undefined)
        .map(item => ({
          time: Math.floor(new Date(item.time).getTime() / 1000) as any,
          value: item.sma20!,
        }));

      sma20Series.setData(sma20Data);
      sma20SeriesRef.current = sma20Series;
    }

    // Add SMA50 if active
    if (activeIndicators.includes('SMA50')) {
      const sma50Series = (chartRef.current as any).addLineSeries({
        color: '#f59e0b',
        lineWidth: 2,
        lineStyle: 2, // dashed
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      const sma50Data: LineData[] = data
        .filter(item => item.sma50 !== undefined)
        .map(item => ({
          time: Math.floor(new Date(item.time).getTime() / 1000) as any,
          value: item.sma50!,
        }));

      sma50Series.setData(sma50Data);
      sma50SeriesRef.current = sma50Series;
    }
  }, [activeIndicators, data]);

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-full bg-background relative"
      style={{ minHeight: '400px' }}
    />
  );
};