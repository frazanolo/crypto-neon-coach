import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cryptoAPI } from '@/lib/cryptoApi';

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  priceChange24h: number;
  totalValue: number;
  addedDate: string;
  marketData?: any;
  purchase_price?: number;
}

interface PortfolioData {
  assets: CryptoAsset[];
  totalValue: number;
  totalChange: number;
  changePercent: number;
  isLoading: boolean;
  error: string | null;
}

interface HistoricalDataPoint {
  date: string;
  value: number;
  change: number;
}

export const useSupabasePortfolio = (currency: string = 'usd') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    assets: [],
    totalValue: 0,
    totalChange: 0,
    changePercent: 0,
    isLoading: true,
    error: null,
  });
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);

  // Load portfolio from database
  const loadPortfolio = async () => {
    if (!user) return;

    try {
      setPortfolioData(prev => ({ ...prev, isLoading: true, error: null }));

      // Get user's portfolio
      const { data: portfolios, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (portfolioError) throw portfolioError;

      if (!portfolios || portfolios.length === 0) {
        // Create default portfolio if none exists
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert([{ user_id: user.id, name: 'My Portfolio', currency }])
          .select('id')
          .single();

        if (createError) throw createError;
        portfolios.push(newPortfolio);
      }

      const portfolioId = portfolios[0].id;

      // Get portfolio assets
      const { data: assets, error: assetsError } = await supabase
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolioId);

      if (assetsError) throw assetsError;

      if (assets && assets.length > 0) {
        await updateAssetsWithLivePrices(assets, portfolioId);
      } else {
        setPortfolioData(prev => ({
          ...prev,
          assets: [],
          totalValue: 0,
          totalChange: 0,
          changePercent: 0,
          isLoading: false,
        }));
      }
    } catch (error: any) {
      console.error('Error loading portfolio:', error);
      setPortfolioData(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  };

  // Update assets with live prices
  const updateAssetsWithLivePrices = async (dbAssets: any[], portfolioId?: string) => {
    if (!dbAssets || dbAssets.length === 0) return;

    try {
      const symbols = dbAssets.map(asset => asset.symbol);
      const livePrices = await cryptoAPI.getLivePrices(symbols, currency, true);

      const updatedAssets: CryptoAsset[] = [];
      let totalValue = 0;
      let totalChange = 0;

      for (const asset of dbAssets) {
        const liveData = livePrices[asset.symbol.toLowerCase()];
        if (liveData) {
          const currentPrice = liveData.price;
          const priceChange24h = liveData.change_24h || 0;
          const assetTotalValue = asset.quantity * currentPrice;
          
          const updatedAsset: CryptoAsset = {
            id: asset.id,
            symbol: asset.symbol.toUpperCase(),
            name: asset.name,
            quantity: parseFloat(asset.quantity),
            currentPrice,
            priceChange24h,
            totalValue: assetTotalValue,
            addedDate: asset.created_at,
            purchase_price: asset.purchase_price ? parseFloat(asset.purchase_price) : undefined,
          };

          updatedAssets.push(updatedAsset);
          totalValue += assetTotalValue;
          
          if (asset.purchase_price) {
            const change = (currentPrice - parseFloat(asset.purchase_price)) * asset.quantity;
            totalChange += change;
          }

          // Update database with current price
          if (portfolioId) {
            await supabase
              .from('portfolio_assets')
              .update({
                current_price: currentPrice,
                total_value: assetTotalValue,
              })
              .eq('id', asset.id);
          }
        }
      }

      const changePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

      setPortfolioData({
        assets: updatedAssets,
        totalValue,
        totalChange,
        changePercent,
        isLoading: false,
        error: null,
      });

      // Generate historical data
      generateHistoricalData(updatedAssets);
    } catch (error: any) {
      console.error('Error updating live prices:', error);
      setPortfolioData(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  };

  // Add asset to portfolio
  const addAsset = async (newAssetData: {
    symbol: string;
    name: string;
    quantity: number;
    currentPrice: number;
  }) => {
    if (!user) return;

    try {
      // Get user's portfolio
      const { data: portfolios, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (portfolioError) throw portfolioError;

      const portfolioId = portfolios?.[0]?.id;
      if (!portfolioId) throw new Error('Portfolio not found');

      // Insert new asset
      const { data: newAsset, error: insertError } = await supabase
        .from('portfolio_assets')
        .insert([{
          portfolio_id: portfolioId,
          symbol: newAssetData.symbol.toUpperCase(),
          name: newAssetData.name,
          quantity: newAssetData.quantity,
          purchase_price: newAssetData.currentPrice,
          current_price: newAssetData.currentPrice,
          total_value: newAssetData.quantity * newAssetData.currentPrice,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Asset Added",
        description: `${newAssetData.symbol.toUpperCase()} has been added to your portfolio.`,
      });

      // Reload portfolio
      await loadPortfolio();
    } catch (error: any) {
      console.error('Error adding asset:', error);
      toast({
        title: "Error Adding Asset",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Remove asset from portfolio
  const removeAsset = async (assetId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('portfolio_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Asset Removed",
        description: "Asset has been removed from your portfolio.",
      });

      // Reload portfolio
      await loadPortfolio();
    } catch (error: any) {
      console.error('Error removing asset:', error);
      toast({
        title: "Error Removing Asset",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Generate realistic historical data based on current portfolio
  const generateHistoricalData = (assets: CryptoAsset[]) => {
    if (assets.length === 0) {
      setHistoricalData([]);
      return;
    }

    const data: HistoricalDataPoint[] = [];
    const today = new Date();
    const currentTotalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);

    // Generate 30 days of historical data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create more realistic price movements
      let dailyPortfolioValue = 0;
      
      assets.forEach(asset => {
        // Simulate historical price with some volatility
        const daysBack = i;
        const volatility = Math.sin((daysBack / 30) * Math.PI * 2) * 0.1; // Sine wave for realistic movement
        const randomFactor = (Math.random() - 0.5) * 0.05; // Small random variation
        const priceMultiplier = 1 + volatility + randomFactor;
        
        // Calculate historical price
        const historicalPrice = asset.currentPrice * priceMultiplier;
        const historicalValue = asset.quantity * historicalPrice;
        dailyPortfolioValue += historicalValue;
      });

      // Ensure we don't have unrealistic values
      dailyPortfolioValue = Math.max(dailyPortfolioValue, currentTotalValue * 0.3);
      
      // Calculate daily change
      const previousValue = i === 29 ? dailyPortfolioValue : data[data.length - 1]?.value || dailyPortfolioValue;
      const change = i === 29 ? 0 : ((dailyPortfolioValue - previousValue) / previousValue) * 100;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: dailyPortfolioValue,
        change: change
      });
    }
    
    setHistoricalData(data);
  };

  // Refresh data
  const refreshData = async () => {
    await loadPortfolio();
  };

  // Effect to load portfolio on mount and user change
  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user, currency]);

  // Effect for periodic updates (every 5 minutes)
  useEffect(() => {
    if (!user || portfolioData.assets.length === 0) return;

    const interval = setInterval(() => {
      updateAssetsWithLivePrices(portfolioData.assets);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, portfolioData.assets, currency]);

  return {
    ...portfolioData,
    historicalData,
    addAsset,
    removeAsset,
    updateLivePrices: () => updateAssetsWithLivePrices(portfolioData.assets),
    refreshData,
  };
};