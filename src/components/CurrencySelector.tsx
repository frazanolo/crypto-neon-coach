import React, { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cryptoAPI } from '@/lib/cryptoApi';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

const popularCurrencies: Currency[] = [
  { code: 'usd', name: 'US Dollar', symbol: '$' },
  { code: 'eur', name: 'Euro', symbol: '€' },
  { code: 'gbp', name: 'British Pound', symbol: '£' },
  { code: 'jpy', name: 'Japanese Yen', symbol: '¥' },
  { code: 'cad', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'aud', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'chf', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'cny', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'krw', name: 'South Korean Won', symbol: '₩' },
  { code: 'inr', name: 'Indian Rupee', symbol: '₹' },
];

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
}) => {
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCurrencyData = popularCurrencies.find(
    curr => curr.code === selectedCurrency
  ) || popularCurrencies[0];

  useEffect(() => {
    const loadSupportedCurrencies = async () => {
      setIsLoading(true);
      try {
        const currencies = await cryptoAPI.getSupportedCurrencies();
        setSupportedCurrencies(currencies);
      } catch (error) {
        console.error('Failed to load supported currencies:', error);
        // Fallback to popular currencies
        setSupportedCurrencies(popularCurrencies.map(c => c.code));
      } finally {
        setIsLoading(false);
      }
    };

    loadSupportedCurrencies();
  }, []);

  const availableCurrencies = popularCurrencies.filter(currency =>
    supportedCurrencies.includes(currency.code)
  );

  const handleCurrencySelect = (currencyCode: string) => {
    onCurrencyChange(currencyCode);
    localStorage.setItem('selectedCurrency', currencyCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="glass-card border-border/50 hover:bg-muted/30"
          disabled={isLoading}
        >
          <span className="font-medium">
            {selectedCurrencyData.symbol} {selectedCurrencyData.code.toUpperCase()}
          </span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-border/50 min-w-[200px]">
        {availableCurrencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => handleCurrencySelect(currency.code)}
            className="flex items-center justify-between cursor-pointer hover:bg-muted/30"
          >
            <div className="flex items-center space-x-3">
              <span className="font-medium text-primary">
                {currency.symbol}
              </span>
              <div>
                <div className="font-medium text-foreground">
                  {currency.code.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currency.name}
                </div>
              </div>
            </div>
            {selectedCurrency === currency.code && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};