import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Calendar, TrendingUp, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AssetHistory {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  addedDate: string;
  addedTime: string;
  priceAtPurchase?: number;
}

const History = () => {
  const [history, setHistory] = useState<AssetHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<AssetHistory[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    // Load portfolio history from localStorage
    const savedAssets = localStorage.getItem('cryptoAssets');
    const savedHistory = localStorage.getItem('portfolioHistory');
    
    let historyData: AssetHistory[] = [];
    
    if (savedHistory) {
      historyData = JSON.parse(savedHistory);
    } else if (savedAssets) {
      // Convert current assets to history format if no history exists
      const assets = JSON.parse(savedAssets);
      historyData = assets.map((asset: any) => ({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        quantity: asset.quantity,
        addedDate: asset.addedDate || new Date().toISOString().split('T')[0],
        addedTime: asset.addedTime || new Date().toLocaleTimeString(),
        priceAtPurchase: asset.priceAtPurchase
      }));
      localStorage.setItem('portfolioHistory', JSON.stringify(historyData));
    }
    
    setHistory(historyData.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()));
  }, []);

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(item => item.symbol.toLowerCase() === selectedFilter.toLowerCase());
      setFilteredHistory(filtered);
    }
  }, [history, selectedFilter]);

  const getTimeSinceAdded = (addedDate: string) => {
    const now = new Date();
    const added = new Date(addedDate);
    const diffTime = Math.abs(now.getTime() - added.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const uniqueSymbols = [...new Set(history.map(item => item.symbol))];

  const totalAssets = history.length;
  const uniqueCoins = uniqueSymbols.length;
  const oldestEntry = history.length > 0 ? history[history.length - 1] : null;

  const exportToPDF = () => {
    // This would integrate with jsPDF for PDF export
    console.log('Exporting portfolio history to PDF...');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text">Portfolio History</h1>
          <p className="text-muted-foreground mt-1">
            Complete timeline of your crypto asset additions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={exportToPDF}
            variant="outline"
            className="border-secondary/50 hover:border-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold text-foreground">{totalAssets}</p>
            </div>
            <HistoryIcon className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="glass-card p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unique Coins</p>
              <p className="text-2xl font-bold text-foreground">{uniqueCoins}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-secondary" />
          </div>
        </Card>

        <Card className="glass-card p-6 hover-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Portfolio Age</p>
              <p className="text-2xl font-bold text-foreground">
                {oldestEntry ? getTimeSinceAdded(oldestEntry.addedDate) : 'New'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-accent" />
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by coin:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
              className={selectedFilter === 'all' ? 'gradient-primary' : 'border-border/50'}
            >
              All
            </Button>
            {uniqueSymbols.map((symbol) => (
              <Button
                key={symbol}
                size="sm"
                variant={selectedFilter === symbol ? 'default' : 'outline'}
                onClick={() => setSelectedFilter(symbol)}
                className={selectedFilter === symbol ? 'gradient-primary' : 'border-border/50'}
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* History Timeline */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-4">
          {filteredHistory.map((entry, index) => (
            <Card key={`${entry.id}-${index}`} className="glass-card p-6 hover-glow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-bold text-primary text-sm">
                      {entry.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {entry.symbol}
                      </h3>
                      <Badge variant="outline" className="border-primary/50 text-primary">
                        {entry.name}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Added {entry.quantity} {entry.symbol} 
                      {entry.priceAtPurchase && (
                        <span className="ml-2">
                          at ${entry.priceAtPurchase.toFixed(2)} each
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(entry.addedDate), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.addedTime} • {getTimeSinceAdded(entry.addedDate)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card p-12 text-center">
          <HistoryIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-float" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No portfolio history found
          </h3>
          <p className="text-muted-foreground mb-6">
            Start adding crypto assets to build your portfolio history
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="gradient-primary hover-glow"
          >
            Go to Dashboard
          </Button>
        </Card>
      )}
    </div>
  );
};

export default History;