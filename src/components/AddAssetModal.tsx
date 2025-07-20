import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (asset: CryptoAsset) => void;
}

// Popular cryptocurrencies for quick selection
const popularCryptos = [
  { symbol: 'BTC', name: 'Bitcoin', price: 43000, change24h: 2.5 },
  { symbol: 'ETH', name: 'Ethereum', price: 2600, change24h: 1.8 },
  { symbol: 'BNB', name: 'BNB', price: 310, change24h: -0.5 },
  { symbol: 'SOL', name: 'Solana', price: 98, change24h: 4.2 },
  { symbol: 'ADA', name: 'Cardano', price: 0.52, change24h: 1.1 },
  { symbol: 'AVAX', name: 'Avalanche', price: 37, change24h: 3.4 },
  { symbol: 'DOT', name: 'Polkadot', price: 7.2, change24h: -1.2 },
  { symbol: 'MATIC', name: 'Polygon', price: 0.85, change24h: 2.8 }
];

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAddAsset }) => {
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customSymbol, setCustomSymbol] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const filteredCryptos = popularCryptos.filter(crypto =>
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAsset = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    let crypto;
    if (isCustomMode) {
      if (!customSymbol || !customName) {
        toast.error('Please enter both symbol and name for custom crypto');
        return;
      }
      crypto = {
        symbol: customSymbol.toUpperCase(),
        name: customName,
        price: 1, // Default price for custom cryptos
        change24h: 0
      };
    } else {
      if (!selectedCrypto) {
        toast.error('Please select a cryptocurrency');
        return;
      }
      crypto = selectedCrypto;
    }

    const newAsset: CryptoAsset = {
      id: `${crypto.symbol}-${Date.now()}`,
      symbol: crypto.symbol,
      name: crypto.name,
      quantity: parseFloat(quantity),
      currentPrice: crypto.price,
      priceChange24h: crypto.change24h,
      totalValue: parseFloat(quantity) * crypto.price,
      addedDate: new Date().toISOString().split('T')[0]
    };

    onAddAsset(newAsset);
    
    // Reset form
    setSelectedCrypto(null);
    setQuantity('');
    setSearchTerm('');
    setCustomSymbol('');
    setCustomName('');
    setIsCustomMode(false);
    
    toast.success(`Added ${quantity} ${crypto.symbol} to your portfolio!`);
    onClose();
  };

  const handleClose = () => {
    setSelectedCrypto(null);
    setQuantity('');
    setSearchTerm('');
    setCustomSymbol('');
    setCustomName('');
    setIsCustomMode(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md glass-card border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold neon-text">
            Add Crypto Asset
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={!isCustomMode ? 'default' : 'outline'}
              onClick={() => setIsCustomMode(false)}
              className={!isCustomMode ? 'gradient-primary' : 'border-border/50'}
            >
              Popular
            </Button>
            <Button
              size="sm"
              variant={isCustomMode ? 'default' : 'outline'}
              onClick={() => setIsCustomMode(true)}
              className={isCustomMode ? 'gradient-primary' : 'border-border/50'}
            >
              Custom
            </Button>
          </div>

          {isCustomMode ? (
            /* Custom Crypto Input */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol" className="text-foreground">Symbol</Label>
                <Input
                  id="symbol"
                  value={customSymbol}
                  onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., BTC"
                  className="bg-muted/20 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Name</Label>
                <Input
                  id="name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Bitcoin"
                  className="bg-muted/20 border-border/50"
                />
              </div>
            </div>
          ) : (
            /* Popular Crypto Selection */
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cryptocurrencies..."
                  className="pl-10 bg-muted/20 border-border/50"
                />
              </div>

              {/* Crypto List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredCryptos.map((crypto) => (
                  <div
                    key={crypto.symbol}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCrypto?.symbol === crypto.symbol
                        ? 'bg-primary/20 border border-primary/50'
                        : 'bg-muted/20 border border-border/30 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {crypto.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{crypto.symbol}</p>
                          <p className="text-xs text-muted-foreground">{crypto.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          ${crypto.price.toLocaleString()}
                        </p>
                        <p className={`text-xs ${
                          crypto.change24h >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Input */}
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

          {/* Preview */}
          {(selectedCrypto || (isCustomMode && customSymbol)) && quantity && parseFloat(quantity) > 0 && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary mb-1">Preview</p>
              <p className="text-foreground">
                {quantity} {isCustomMode ? customSymbol : selectedCrypto?.symbol} 
                {!isCustomMode && (
                  <span className="text-muted-foreground">
                    {' '}≈ ${(parseFloat(quantity) * selectedCrypto.price).toLocaleString()}
                  </span>
                )}
              </p>
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