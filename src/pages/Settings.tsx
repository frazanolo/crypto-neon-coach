import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, DollarSign, Bell, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface AppSettings {
  currency: string;
  notifications: boolean;
  priceAlerts: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'USD',
    notifications: true,
    priceAlerts: true,
    autoRefresh: true,
    refreshInterval: 30
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const currencies = [
    { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
    { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
    { value: 'JPY', label: 'Japanese Yen (JPY)', symbol: '¥' },
    { value: 'BTC', label: 'Bitcoin (BTC)', symbol: '₿' },
    { value: 'ETH', label: 'Ethereum (ETH)', symbol: 'Ξ' }
  ];

  const refreshIntervals = [
    { value: 10, label: '10 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 900, label: '15 minutes' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your Sense AIO experience
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="gradient-primary hover-glow">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Display Currency */}
        <Card className="glass-card p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Display Currency</h3>
              <p className="text-sm text-muted-foreground">
                Choose your preferred currency for portfolio values
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Primary Currency</Label>
                <Select 
                  value={settings.currency} 
                  onValueChange={(value) => setSettings({...settings, currency: value})}
                >
                  <SelectTrigger className="bg-muted/20 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        <div className="flex items-center space-x-2">
                          <span>{currency.symbol}</span>
                          <span>{currency.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="glass-card p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Manage your notification preferences
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive general app notifications
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Price Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified of significant price changes
                </p>
              </div>
              <Switch
                checked={settings.priceAlerts}
                onCheckedChange={(checked) => setSettings({...settings, priceAlerts: checked})}
              />
            </div>
          </div>
        </Card>

        {/* Data & Performance */}
        <Card className="glass-card p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Data & Performance</h3>
              <p className="text-sm text-muted-foreground">
                Configure data refresh and performance settings
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Auto Refresh</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically update portfolio data
                </p>
              </div>
              <Switch
                checked={settings.autoRefresh}
                onCheckedChange={(checked) => setSettings({...settings, autoRefresh: checked})}
              />
            </div>
            
            {settings.autoRefresh && (
              <div className="space-y-2">
                <Label className="text-foreground">Refresh Interval</Label>
                <Select 
                  value={settings.refreshInterval.toString()} 
                  onValueChange={(value) => setSettings({...settings, refreshInterval: parseInt(value)})}
                >
                  <SelectTrigger className="bg-muted/20 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    {refreshIntervals.map((interval) => (
                      <SelectItem key={interval.value} value={interval.value.toString()}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>

        {/* Security */}
        <Card className="glass-card p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Security & Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Your data security and privacy settings
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-success">Data Storage</p>
                  <p className="text-xs text-success/80">
                    All portfolio data is stored locally on your device
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center space-x-3">
                <SettingsIcon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-primary">API Usage</p>
                  <p className="text-xs text-primary/80">
                    Price data fetched from CoinGecko API (rate limited)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;