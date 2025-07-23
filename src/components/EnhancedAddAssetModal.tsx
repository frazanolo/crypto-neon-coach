import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cryptoAPI, CryptoMarketData } from '@/lib/cryptoApi';

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

interface EnhancedAddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (asset: {
    symbol: string;
    name: string;
    quantity: number;
    currentPrice: number;
  }) => void;
  currency: string;
}

export const EnhancedAddAssetModal: React.FC<EnhancedAddAssetModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddAsset,
  currency = 'usd'
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoMarketData | null>(null);
  const [searchResults, setSearchResults] = useState<CryptoMarketData[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<CryptoMarketData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load trending cryptocurrencies on mount
  useEffect(() => {
    if (isOpen) {
      loadTrendingCoins();
    }
  }, [isOpen]);

  // Search cryptocurrencies when search term changes
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        await searchCryptocurrencies(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  const loadTrendingCoins = async () => {
    setIsLoading(true);
    try {
      // Get top market cap cryptocurrencies as trending
      const marketData = await cryptoAPI.getMarketData(undefined, currency, 20, 1, false);
      setTrendingCoins(marketData);
    } catch (error) {
      console.error('Failed to load trending coins:', error);
      toast.error('Failed to load trending cryptocurrencies');
    } finally {
      setIsLoading(false);
    }
  };

  const searchCryptocurrencies = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Get market data for search results
      const marketData = await cryptoAPI.getMarketData(undefined, currency, 100, 1, false);
      
      // Filter results based on search query
      const filtered = marketData.filter(coin =>
        coin.name.toLowerCase().includes(query.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20); // Limit to 20 results
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddAsset = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!selectedCrypto) {
      toast.error('Please select a cryptocurrency');
      return;
    }

    const newAssetData = {
      symbol: selectedCrypto.symbol.toUpperCase(),
      name: selectedCrypto.name,
      quantity: parseFloat(quantity),
      currentPrice: selectedCrypto.current_price,
    };

    onAddAsset(newAssetData);
    handleClose();
    toast.success(`Added ${quantity} ${selectedCrypto.symbol.toUpperCase()} to your portfolio!`);
  };

  const handleClose = () => {
    setSelectedCrypto(null);
    setQuantity('');
    setSearchTerm('');
    setSearchResults([]);
    onClose();
  };

  const displayCoins = searchResults.length > 0 ? searchResults : trendingCoins;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const CoinItem: React.FC<{ coin: CryptoMarketData }> = ({ coin }) => (
    <div
      onClick={() => setSelectedCrypto(coin)}
      className={`p-4 rounded-lg cursor-pointer transition-all hover:bg-muted/30 ${
        selectedCrypto?.id === coin.id
          ? 'bg-primary/20 border border-primary/50'
          : 'bg-muted/10 border border-border/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={coin.image}
            alt={coin.name}
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://cryptoicon-api.pages.dev/api/icon/${coin.symbol.toLowerCase()}`;
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{coin.symbol.toUpperCase()}</p>
              <Badge variant="outline" className="text-xs">
                #{coin.market_cap_rank}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{coin.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {formatPrice(coin.current_price)}
          </p>
          <p className={`text-xs ${
            coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {coin.price_change_percentage_24h >= 0 ? '+' : ''}
            {coin.price_change_percentage_24h?.toFixed(2) || 0}%
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl glass-card border border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold neon-text">
            Add Crypto Asset
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cryptocurrencies..."
              className="pl-10 bg-muted/20 border-border/50"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Coin List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              {searchResults.length > 0 ? 'Search Results' : 'Trending Cryptocurrencies'}
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : displayCoins.length > 0 ? (
                displayCoins.map((coin) => (
                  <CoinItem key={coin.id} coin={coin} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No cryptocurrencies found' : 'Unable to load cryptocurrencies'}
                </div>
              )}
            </div>
          </div>

          {/* Quantity Input */}
          {selectedCrypto && (
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-foreground">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
                className="bg-muted/20 border-border/50"
              />
            </div>
          )}

          {/* Preview */}
          {selectedCrypto && quantity && parseFloat(quantity) > 0 && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary mb-2">Purchase Preview</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-foreground">
                    {quantity} {selectedCrypto.symbol.toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedCrypto.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {formatPrice(parseFloat(quantity) * selectedCrypto.current_price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(selectedCrypto.current_price)} each
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-border/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAsset}
              disabled={!selectedCrypto || !quantity || parseFloat(quantity) <= 0}
              className="flex-1 gradient-primary hover-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};