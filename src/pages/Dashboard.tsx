import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Bot, BarChart3, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EnhancedAddAssetModal } from '../components/EnhancedAddAssetModal';
import { AICoachPanel } from '../components/AICoachPanel';
import PortfolioChart from '../components/PortfolioChart';
import EnhancedTechnicalIndicators from '../components/EnhancedTechnicalIndicators';
import EnhancedAIInsights from '../components/EnhancedAIInsights';
import { CurrencySelector } from '../components/CurrencySelector';
import { usePortfolioData } from '../hooks/usePortfolioData';

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  priceChange24h: number;
  totalValue: number;
  addedDate: string;
}

const Dashboard = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [currency, setCurrency] = useState(() => 
    localStorage.getItem('selectedCurrency') || 'usd'
  );
  
  const {
    assets,
    totalValue: totalPortfolioValue,
    totalChange: portfolioChange,
    changePercent: portfolioChangePercent,
    historicalData,
    isLoading,
    error,
    addAsset,
    removeAsset,
    updateLivePrices,
    refreshData
  } = usePortfolioData(currency);

  useEffect(() => {
    const loadLivePrices = async () => {
      try {
        const symbols = assets.map((a) => a.symbol);
        const liveData = await fetchLivePrices(symbols, "usd");
        const updatedAssets = assets.map((asset) => {
          const id = mapToCoingeckoId(asset.symbol);
          const live = liveData[id];
          const currentPrice = live?.usd || asset.currentPrice;
          return {
            ...asset,
            currentPrice,
            priceChange24h: live?.usd_24h_change || 0,
            totalValue: asset.quantity * currentPrice,
          };
        });

        setAssets(updatedAssets);
        const total = updatedAssets.reduce((sum, a) => sum + a.totalValue, 0);
        setTotalPortfolioValue(total);
      } catch (err) {
        console.error("Failed to fetch live prices:", err);
      }
    };

    if (assets.length > 0) {
      loadLivePrices();
    }
  }, [assets]);


  const handleAddAsset = (newAsset: CryptoAsset) => {
    const updatedAssets = [...assets, newAsset];
    setAssets(updatedAssets);
    localStorage.setItem('cryptoAssets', JSON.stringify(updatedAssets));
  };

  const portfolioChange = assets.reduce((sum, asset) => {
    const changeValue = (asset.priceChange24h / 100) * asset.totalValue;
    return sum + changeValue;
  }, 0);

  const portfolioChangePercent = totalPortfolioValue > 0 
    ? (portfolioChange / (totalPortfolioValue - portfolioChange)) * 100 
    : 0;

  // Generate mock portfolio chart data
  const generateChartData = () => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const baseValue = totalPortfolioValue || 10000;
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily change
      const value = baseValue * (1 + randomChange * (i / 30));
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(value, 1000),
        change: randomChange * 100
      });
    }
    return data;
  };

  // Generate mock technical indicators
  const generateMockIndicators = (asset: CryptoAsset) => ({
    rsi: Math.random() * 100,
    marketCap: Math.random() * 100000000000, // Random market cap up to 100B
    volume24h: Math.random() * 1000000000, // Random volume up to 1B
    support: asset.currentPrice * (0.85 + Math.random() * 0.1),
    resistance: asset.currentPrice * (1.05 + Math.random() * 0.1),
    fibonacciLevels: [
      { level: 0.236, price: asset.currentPrice * 1.05 },
      { level: 0.382, price: asset.currentPrice * 1.08 },
      { level: 0.618, price: asset.currentPrice * 1.12 }
    ]
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text">
            Portfolio Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage, track, and analyze your crypto like a Sensei. All In One.
          </p>
        </div>
        <div className="flex gap-3">
          <CurrencySelector 
            selectedCurrency={currency}
            onCurrencyChange={setCurrency}
          />
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            className="border-border/50"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setShowAIPanel(true)}
            variant="secondary"
            className="bg-secondary/20 border border-secondary/50 hover:bg-secondary/30"
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Coach
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gradient-primary hover-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-foreground">
                ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">24h Change</p>
              <p className={`text-2xl font-bold ${portfolioChangePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                {portfolioChangePercent >= 0 ? '+' : ''}
                {portfolioChangePercent.toFixed(2)}%
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              portfolioChangePercent >= 0 ? 'bg-success/20' : 'bg-destructive/20'
            }`}>
              {portfolioChangePercent >= 0 ? (
                <TrendingUp className="w-6 h-6 text-success" />
              ) : (
                <TrendingDown className="w-6 h-6 text-destructive" />
              )}
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold text-foreground">{assets.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio Chart */}
      {assets.length > 0 && (
        <PortfolioChart
          data={historicalData}
          totalValue={totalPortfolioValue}
          totalChange={portfolioChange}
          changePercent={portfolioChangePercent}
        />
      )}

      {/* Assets Grid */}
      {assets.length > 0 ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-display font-bold neon-text mb-6">
              Your Crypto Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((asset) => (
                <Card 
                  key={asset.id} 
                  className={`glass-card p-6 hover-glow cursor-pointer transition-all duration-300 ${
                    selectedAsset?.id === asset.id ? 'ring-2 ring-primary/50' : ''
                  }`}
                  onClick={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                        <img
                          src={`https://cryptoicon-api.pages.dev/api/icon/${asset.symbol.toLowerCase()}`}
                          alt={asset.symbol}
                          className="w-8 h-8 rounded-full bg-muted"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{asset.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{asset.name}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                      asset.priceChange24h >= 0 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Quantity</span>
                      <span className="text-sm font-medium">{asset.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Price</span>
                      <span className="text-sm font-medium">${asset.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border/50 pt-3">
                      <span className="text-sm text-muted-foreground">Total Value</span>
                      <span className="font-bold text-foreground text-lg">
                        ${asset.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    {/* Technical indicators preview */}
                    <div className="flex gap-2 pt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Activity className="w-3 h-3" />
                        <span>RSI: {generateMockIndicators(asset).rsi.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BarChart3 className="w-3 h-3" />
                        <span>Vol: ${(generateMockIndicators(asset).volume24h / 1e6).toFixed(0)}M</span>
                      </div>
                    </div>
                  </div>

                  {selectedAsset?.id === asset.id && (
                    <div className="mt-4 pt-4 border-t border-border/30">
                      <div className="text-xs text-primary text-center">
                        Click for detailed analysis ↓
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Asset Analysis */}
          {selectedAsset && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold neon-text">
                {selectedAsset.symbol} Technical Analysis
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedTechnicalIndicators
                  symbol={selectedAsset.symbol}
                  price={selectedAsset.currentPrice}
                  marketData={selectedAsset.marketData}
                  currency={currency}
                />
                <EnhancedAIInsights
                  symbol={selectedAsset.symbol}
                  price={selectedAsset.currentPrice}
                  marketData={selectedAsset.marketData}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="glass-card p-12 text-center">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-float" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Ready to start your crypto journey?
          </h3>
          <p className="text-muted-foreground mb-6">
            Add your first crypto asset to begin tracking your portfolio
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gradient-primary hover-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Asset
          </Button>
        </Card>
      )}

      {/* Modals */}
      <EnhancedAddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAsset={addAsset}
        currency={currency}
      />
      
      <AICoachPanel
        isOpen={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        portfolio={assets}
        totalValue={totalPortfolioValue}
      />
    </div>
  );
};

export default Dashboard;