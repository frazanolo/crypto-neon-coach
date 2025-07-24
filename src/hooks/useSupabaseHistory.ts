import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AssetHistory {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  addedDate: string;
  addedTime: string;
  priceAtPurchase?: number;
}

export const useSupabaseHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AssetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!user) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get user's portfolio
      const { data: portfolios, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (portfolioError) throw portfolioError;

      if (!portfolios || portfolios.length === 0) {
        setHistory([]);
        setIsLoading(false);
        return;
      }

      const portfolioId = portfolios[0].id;

      // Get portfolio assets as history
      const { data: assets, error: assetsError } = await supabase
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false });

      if (assetsError) throw assetsError;

      const historyData: AssetHistory[] = (assets || []).map(asset => ({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        quantity: parseFloat(asset.quantity.toString()),
        addedDate: new Date(asset.created_at).toISOString().split('T')[0],
        addedTime: new Date(asset.created_at).toLocaleTimeString(),
        priceAtPurchase: asset.purchase_price ? parseFloat(asset.purchase_price.toString()) : undefined,
      }));

      setHistory(historyData);
    } catch (error: any) {
      console.error('Error loading history:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to load history when user changes
  useEffect(() => {
    loadHistory();
  }, [user]);

  const refreshHistory = () => {
    loadHistory();
  };

  return {
    history,
    isLoading,
    error,
    refreshHistory,
  };
};