import { useState, useEffect, useCallback } from 'react';
import { cryptoAPI, CryptoMarketData } from '@/lib/cryptoApi';

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  priceChange24h: number;
  totalValue: number;
  addedDate: string;
  marketData?: CryptoMarketData;
}

export interface PortfolioData {
  assets: CryptoAsset[];
  totalValue: number;
  totalChange: number;
  changePercent: number;
  isLoading: boolean;
  error: string | null;
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
  change: number;
}

export const usePortfolioData = (currency: string = 'usd') => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    assets: [],
    totalValue: 0,
    totalChange: 0,
    changePercent: 0,
    isLoading: false,
    error: null
  });
  
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);

  // Load portfolio from localStorage
  const loadPortfolio = useCallback(() => {
    try {
      const saved = localStorage.getItem('cryptoAssets');
      if (saved) {
        const assets = JSON.parse(saved) as CryptoAsset[];
        setPortfolioData(prev => ({ ...prev, assets }));
        return assets;
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
    return [];
  }, []);

  // Save portfolio to localStorage
  const savePortfolio = useCallback((assets: CryptoAsset[]) => {
    try {
      localStorage.setItem('cryptoAssets', JSON.stringify(assets));
    } catch (error) {
      console.error('Failed to save portfolio:', error);
    }
  }, []);

  // Update live prices and market data
  const updateLivePrices = useCallback(async (assets: CryptoAsset[]) => {
    if (assets.length === 0) return assets;

    setPortfolioData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get coin IDs for API call
      const coinIds = assets.map(asset => cryptoAPI.mapSymbolToId(asset.symbol));
      
      // Fetch live market data
      const marketData = await cryptoAPI.getMarketData(coinIds, currency, 250, 1, false);
      
      // Update assets with live data
      const updatedAssets = assets.map(asset => {
        const coinId = cryptoAPI.mapSymbolToId(asset.symbol);
        const liveData = marketData.find(data => data.id === coinId);
        
        if (liveData) {
          const currentPrice = liveData.current_price;
          const priceChange24h = liveData.price_change_percentage_24h || 0;
          
          return {
            ...asset,
            currentPrice,
            priceChange24h,
            totalValue: asset.quantity * currentPrice,
            marketData: liveData
          };
        }
        
        return asset;
      });

      // Calculate portfolio totals
      const totalValue = updatedAssets.reduce((sum, asset) => sum + asset.totalValue, 0);
      const totalChange = updatedAssets.reduce((sum, asset) => {
        const changeValue = (asset.priceChange24h / 100) * asset.totalValue;
        return sum + changeValue;
      }, 0);
      
      const changePercent = totalValue > 0 
        ? (totalChange / (totalValue - totalChange)) * 100 
        : 0;

      const newPortfolioData = {
        assets: updatedAssets,
        totalValue,
        totalChange,
        changePercent,
        isLoading: false,
        error: null
      };

      setPortfolioData(newPortfolioData);
      savePortfolio(updatedAssets);
      
      return updatedAssets;
    } catch (error) {
      console.error('Failed to update live prices:', error);
      setPortfolioData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch live prices'
      }));
      return assets;
    }
  }, [currency, savePortfolio]);

  // Generate historical portfolio data
  const generateHistoricalData = useCallback(async (assets: CryptoAsset[], days: number = 30) => {
    if (assets.length === 0) {
      setHistoricalData([]);
      return;
    }

    try {
      // For now, generate mock historical data based on current values
      // In production, you'd aggregate historical data for all assets
      const data: HistoricalDataPoint[] = [];
      const today = new Date();
      const currentTotalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Simulate portfolio value changes
        const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily change
        const dayValue = currentTotalValue * (1 + randomChange * (i / days));
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Math.max(dayValue, currentTotalValue * 0.5), // Minimum 50% of current value
          change: randomChange * 100
        });
      }
      
      setHistoricalData(data);
    } catch (error) {
      console.error('Failed to generate historical data:', error);
    }
  }, []);

  // Add new asset
  const addAsset = useCallback(async (newAsset: Omit<CryptoAsset, 'currentPrice' | 'priceChange24h' | 'totalValue'>) => {
    try {
      // Get live price for the new asset
      const marketData = await cryptoAPI.getCoinBySymbol(newAsset.symbol);
      
      if (marketData) {
        const asset: CryptoAsset = {
          ...newAsset,
          currentPrice: marketData.current_price,
          priceChange24h: marketData.price_change_percentage_24h || 0,
          totalValue: newAsset.quantity * marketData.current_price,
          marketData
        };

        const updatedAssets = [...portfolioData.assets, asset];
        await updateLivePrices(updatedAssets);
        return asset;
      } else {
        throw new Error('Failed to fetch market data for asset');
      }
    } catch (error) {
      console.error('Failed to add asset:', error);
      throw error;
    }
  }, [portfolioData.assets, updateLivePrices]);

  // Remove asset
  const removeAsset = useCallback((assetId: string) => {
    const updatedAssets = portfolioData.assets.filter(asset => asset.id !== assetId);
    setPortfolioData(prev => ({ ...prev, assets: updatedAssets }));
    savePortfolio(updatedAssets);
  }, [portfolioData.assets, savePortfolio]);

  // Initial load and setup periodic updates
  useEffect(() => {
    const assets = loadPortfolio();
    if (assets.length > 0) {
      updateLivePrices(assets);
    }
  }, [loadPortfolio, updateLivePrices]);

  // Update historical data when assets change
  useEffect(() => {
    if (portfolioData.assets.length > 0) {
      generateHistoricalData(portfolioData.assets);
    }
  }, [portfolioData.assets, generateHistoricalData]);

  // Set up periodic price updates (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (portfolioData.assets.length > 0) {
        updateLivePrices(portfolioData.assets);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [portfolioData.assets, updateLivePrices]);

  return {
    ...portfolioData,
    historicalData,
    addAsset,
    removeAsset,
    updateLivePrices: () => updateLivePrices(portfolioData.assets),
    refreshData: () => {
      const assets = loadPortfolio();
      updateLivePrices(assets);
    }
  };
};