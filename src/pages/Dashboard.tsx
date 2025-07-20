import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AddAssetModal } from '../components/AddAssetModal';
import { AICoachPanel } from '../components/AICoachPanel';

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
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Load assets from localStorage on mount
  useEffect(() => {
    const savedAssets = localStorage.getItem('cryptoAssets');
    if (savedAssets) {
      const parsedAssets = JSON.parse(savedAssets);
      setAssets(parsedAssets);
    }
  }, []);

  // Calculate total portfolio value
  useEffect(() => {
    const total = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
    setTotalPortfolioValue(total);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text">
            Portfolio Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your crypto investments with AI-powered insights
          </p>
        </div>
        <div className="flex gap-3">
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

      {/* Assets Grid */}
      {assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <Card key={asset.id} className="glass-card p-6 hover-glow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary">{asset.symbol.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{asset.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{asset.name}</p>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  asset.priceChange24h >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <span className="text-sm font-medium">{asset.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Price</span>
                  <span className="text-sm font-medium">${asset.currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-2">
                  <span className="text-sm text-muted-foreground">Total Value</span>
                  <span className="font-bold text-foreground">
                    ${asset.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </Card>
          ))}
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
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAsset={handleAddAsset}
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