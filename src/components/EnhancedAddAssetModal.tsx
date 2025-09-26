import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Loader2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [inputType, setInputType] = useState<'quantity' | 'fiat'>('fiat');
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [fiatInput, setFiatInput] = useState<string>('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoMarketData | null>(null);
  const [searchResults, setSearchResults] = useState<CryptoMarketData[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<CryptoMarketData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Currency symbols for display
  const currencySymbols: { [key: string]: string } = {
    usd: '$',
    eur: '€',
    gbp: '£',
    jpy: '¥',
    cad: 'C$',
    aud: 'A$',
    chf: 'CHF',
    cny: '¥',
    krw: '₩',
    inr: '₹'
  };

  const currencySymbol = currencySymbols[currency.toLowerCase()] || '$';

  // Auto-calculate based on input type
  useEffect(() => {
    if (!selectedCrypto) return;

    if (inputType === 'fiat' && fiatInput) {
      const fiatAmount = parseFloat(fiatInput);
      if (!isNaN(fiatAmount) && selectedCrypto.current_price > 0) {
        const calculatedQuantity = fiatAmount / selectedCrypto.current_price;
        setQuantityInput(calculatedQuantity.toFixed(8));
      }
    } else if (inputType === 'quantity' && quantityInput) {
      const quantity = parseFloat(quantityInput);
      if (!isNaN(quantity) && selectedCrypto.current_price > 0) {
        const calculatedFiat = quantity * selectedCrypto.current_price;
        setFiatInput(calculatedFiat.toFixed(2));
      }
    }
  }, [inputType, fiatInput, quantityInput, selectedCrypto]);

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
    if (!selectedCrypto) {
      toast.error('Please select a cryptocurrency');
      return;
    }

    const quantity = parseFloat(quantityInput);
    if (!quantity || quantity <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newAssetData = {
      symbol: selectedCrypto.symbol.toUpperCase(),
      name: selectedCrypto.name,
      quantity: quantity,
      currentPrice: selectedCrypto.current_price,
    };

    onAddAsset(newAssetData);
    handleClose();
    
    const fiatValue = quantity * selectedCrypto.current_price;
    toast.success(
      `Added ${currencySymbol}${fiatValue.toLocaleString()} worth of ${selectedCrypto.symbol.toUpperCase()} (${quantity.toFixed(8)} tokens)`
    );
  };

  const handleClose = () => {
    setSelectedCrypto(null);
    setQuantityInput('');
    setFiatInput('');
    setSearchTerm('');
    setSearchResults([]);
    setInputType('fiat');
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

          {/* Amount Input */}
          {selectedCrypto && (
            <div className="space-y-4">
              {/* Input Type Toggle */}
              <Tabs value={inputType} onValueChange={(value) => setInputType(value as 'quantity' | 'fiat')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fiat">
                    Amount ({currencySymbol})
                  </TabsTrigger>
                  <TabsTrigger value="quantity">
                    Quantity (Tokens)
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="fiat" className="space-y-2">
                  <Label htmlFor="fiat-input" className="text-foreground">
                    Purchase Amount in {currency.toUpperCase()}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      {currencySymbol}
                    </span>
                    <Input
                      id="fiat-input"
                      type="number"
                      value={fiatInput}
                      onChange={(e) => setFiatInput(e.target.value)}
                      placeholder="100.00"
                      min="0"
                      step="any"
                      className="pl-8 bg-muted/20 border-border/50"
                    />
                  </div>
                  {quantityInput && (
                    <p className="text-xs text-muted-foreground">
                      = {parseFloat(quantityInput).toFixed(8)} {selectedCrypto.symbol.toUpperCase()}
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="quantity" className="space-y-2">
                  <Label htmlFor="quantity-input" className="text-foreground">
                    Token Quantity
                  </Label>
                  <div className="relative">
                    <Input
                      id="quantity-input"
                      type="number"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e.target.value)}
                      placeholder="0.00000000"
                      min="0"
                      step="any"
                      className="pr-16 bg-muted/20 border-border/50"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">
                      {selectedCrypto.symbol.toUpperCase()}
                    </span>
                  </div>
                  {fiatInput && (
                    <p className="text-xs text-muted-foreground">
                      = {currencySymbol}{parseFloat(fiatInput).toLocaleString()}
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Purchase Preview */}
          {selectedCrypto && (quantityInput || fiatInput) && parseFloat(quantityInput) > 0 && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-primary" />
                <p className="text-sm text-primary font-medium">Purchase Preview</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">You're buying</p>
                  <p className="font-medium text-foreground">
                    {parseFloat(quantityInput).toFixed(8)} {selectedCrypto.symbol.toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedCrypto.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Total cost</p>
                  <p className="font-medium text-foreground">
                    {formatPrice(parseFloat(quantityInput) * selectedCrypto.current_price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(selectedCrypto.current_price)} per token
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
              disabled={!selectedCrypto || !quantityInput || parseFloat(quantityInput) <= 0}
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