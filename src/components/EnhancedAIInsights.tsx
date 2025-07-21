import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Key, Loader2, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { aiService } from '@/lib/aiService';
import { toast } from 'sonner';

interface EnhancedAIInsightsProps {
  symbol: string;
  price: number;
  marketData?: any;
  indicators?: any;
}

const EnhancedAIInsights: React.FC<EnhancedAIInsightsProps> = ({ 
  symbol, 
  price, 
  marketData,
  indicators 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [isAIAvailable, setIsAIAvailable] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setIsAIAvailable(aiService.isAvailable());
    const savedKey = aiService.getApiKey();
    if (savedKey) {
      setApiKey('••••••••••••••••');
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey && !apiKey.includes('•')) {
      aiService.setApiKey(apiKey);
      setIsAIAvailable(true);
      setShowSettings(false);
      toast.success('AI API key saved successfully');
    }
  };

  const generateInsights = async () => {
    if (!isAIAvailable) {
      toast.error('Please configure your AI API key first');
      setShowSettings(true);
      return;
    }

    setIsGenerating(true);
    
    try {
      const analysisRequest = {
        symbol,
        price,
        indicators: {
          rsi: indicators?.rsi || 50,
          marketCap: marketData?.market_cap || 0,
          volume24h: marketData?.total_volume || 0,
          support_levels: indicators?.support_levels || [price * 0.95],
          resistance_levels: indicators?.resistance_levels || [price * 1.05]
        },
        marketData
      };

      const aiInsights = await aiService.generateInsights(analysisRequest);
      setInsights(aiInsights);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      toast.error('Failed to generate AI insights. Using fallback analysis.');
      
      // Fallback insights
      setInsights({
        type: 'neutral',
        confidence: 60,
        signal: 'Mixed signals detected',
        reasoning: 'Technical indicators show conflicting signals. Monitor price action at key levels.',
        timeframe: 'short',
        keyLevels: {
          support: [price * 0.95],
          resistance: [price * 1.05]
        },
        riskLevel: 'medium'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSentimentIcon = (type: string) => {
    switch (type) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <AlertTriangle className="w-4 h-4 text-accent" />;
    }
  };

  const getSentimentBadge = (type: string) => {
    switch (type) {
      case 'bullish': return 'bg-success/20 text-success border-success/30';
      case 'bearish': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-accent/20 text-accent border-accent/30';
    }
  };

  const formatPrice = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 4 : 2
    }).format(value);

  return (
    <Card className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-display font-bold neon-text">AI Market Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-border/50"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  AI Configuration
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">AI API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your AI API key (OpenAI, Claude, etc.)"
                    className="bg-muted/20 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally and used to generate AI-powered insights.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveApiKey}
                    className="flex-1 gradient-primary"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            onClick={generateInsights}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className="border-primary/30 hover:bg-primary/10"
          >
            <Bot className="w-4 h-4 mr-2" />
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Generate Insights'
            )}
          </Button>
        </div>
      </div>

      {!isAIAvailable && !insights && (
        <div className="text-center py-8 space-y-4">
          <Key className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
          <div>
            <p className="text-muted-foreground mb-2">Configure AI to get advanced insights</p>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              className="border-primary/30"
            >
              <Key className="w-4 h-4 mr-2" />
              Setup AI API Key
            </Button>
          </div>
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          {/* Overall Signal */}
          <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
            <div className="flex items-center gap-3">
              {getSentimentIcon(insights.type)}
              <div>
                <div className="font-medium text-foreground capitalize">
                  {insights.signal}
                </div>
                <div className="text-sm text-muted-foreground">
                  {insights.confidence}% confidence • {insights.timeframe}-term
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getSentimentBadge(insights.type)}>
                {insights.type.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={`border-${insights.riskLevel === 'high' ? 'destructive' : insights.riskLevel === 'low' ? 'success' : 'accent'}/30`}>
                {insights.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Analysis
            </h4>
            <div className="p-3 bg-muted/5 rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground">{insights.reasoning}</p>
            </div>
          </div>

          {/* Key Levels */}
          {insights.keyLevels && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">AI-Identified Key Levels</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-success">Support</h5>
                  {insights.keyLevels.support.slice(0, 2).map((level: number, index: number) => (
                    <div key={`ai-support-${index}`} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">AI S{index + 1}</span>
                      <span className="text-sm font-medium text-success">{formatPrice(level)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-destructive">Resistance</h5>
                  {insights.keyLevels.resistance.slice(0, 2).map((level: number, index: number) => (
                    <div key={`ai-resistance-${index}`} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">AI R{index + 1}</span>
                      <span className="text-sm font-medium text-destructive">{formatPrice(level)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeframe Analysis */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Trading Signal</span>
            </div>
            <p className="text-sm text-foreground">
              Based on current market conditions, this analysis is most relevant for{' '}
              <span className="font-medium text-primary">{insights.timeframe}-term</span> trading decisions.
              Risk level is assessed as <span className="font-medium">{insights.riskLevel}</span>.
            </p>
          </div>
        </div>
      )}

      {!insights && isAIAvailable && !isGenerating && (
        <div className="text-center py-8 text-muted-foreground">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Click "Generate Insights" to get AI-powered market analysis</p>
        </div>
      )}
    </Card>
  );
};

export default EnhancedAIInsights;