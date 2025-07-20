import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

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

interface AICoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: CryptoAsset[];
  totalValue: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AICoachPanel: React.FC<AICoachPanelProps> = ({ 
  isOpen, 
  onClose, 
  portfolio, 
  totalValue 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome! I'm your AI Crypto Coach. I can help analyze your portfolio and provide insights. Your current portfolio value is $${totalValue.toLocaleString()} with ${portfolio.length} assets.`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate portfolio insights
  const generatePortfolioInsights = () => {
    if (portfolio.length === 0) {
      return "Your portfolio is empty. Consider starting with established cryptocurrencies like Bitcoin (BTC) or Ethereum (ETH) for a foundation.";
    }

    const topPerformer = portfolio.reduce((prev, current) => 
      (prev.priceChange24h > current.priceChange24h) ? prev : current
    );
    
    const worstPerformer = portfolio.reduce((prev, current) => 
      (prev.priceChange24h < current.priceChange24h) ? prev : current
    );

    const totalChange = portfolio.reduce((sum, asset) => {
      const changeValue = (asset.priceChange24h / 100) * asset.totalValue;
      return sum + changeValue;
    }, 0);

    const insights = [
      `Portfolio Overview: You hold ${portfolio.length} different cryptocurrencies with a total value of $${totalValue.toLocaleString()}.`,
      `Best Performer: ${topPerformer.symbol} is up ${topPerformer.priceChange24h.toFixed(2)}% today.`,
      `Needs Attention: ${worstPerformer.symbol} is down ${Math.abs(worstPerformer.priceChange24h).toFixed(2)}% today.`,
      `Overall 24h Change: ${totalChange >= 0 ? '+' : ''}$${totalChange.toFixed(2)} (${((totalChange / (totalValue - totalChange)) * 100).toFixed(2)}%)`,
    ];

    return insights.join('\n\n');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response (In a real app, this would call OpenRouter API)
    setTimeout(() => {
      let response = '';
      
      if (inputMessage.toLowerCase().includes('portfolio') || inputMessage.toLowerCase().includes('analysis')) {
        response = generatePortfolioInsights();
      } else if (inputMessage.toLowerCase().includes('bitcoin') || inputMessage.toLowerCase().includes('btc')) {
        response = "Bitcoin remains the most established cryptocurrency with strong institutional adoption. It's often considered 'digital gold' and a store of value. Consider your risk tolerance and investment timeline.";
      } else if (inputMessage.toLowerCase().includes('ethereum') || inputMessage.toLowerCase().includes('eth')) {
        response = "Ethereum is the leading smart contract platform with a vast ecosystem of DeFi and NFT applications. The recent merge to proof-of-stake has improved its energy efficiency and long-term sustainability.";
      } else if (inputMessage.toLowerCase().includes('diversify') || inputMessage.toLowerCase().includes('strategy')) {
        response = "Diversification is key in crypto investing. Consider spreading investments across different categories: large-cap (BTC, ETH), DeFi tokens, layer-1 blockchains, and emerging sectors. Never invest more than you can afford to lose.";
      } else {
        response = "I can help you analyze your portfolio, discuss cryptocurrency fundamentals, and suggest general strategies. What specific aspect of crypto investing would you like to explore? Remember, this is educational content, not financial advice.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const quickActions = [
    { label: 'Analyze Portfolio', action: () => setInputMessage('Please analyze my current portfolio') },
    { label: 'Diversification Tips', action: () => setInputMessage('How can I better diversify my portfolio?') },
    { label: 'Market Outlook', action: () => setInputMessage('What do you think about current market conditions?') },
    { label: 'Risk Assessment', action: () => setInputMessage('Help me assess the risk level of my portfolio') }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[80vh] glass-card border border-border/50 flex flex-col">
        <DialogHeader className="border-b border-border/30 pb-4">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center">
              <Bot className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-xl font-display font-bold neon-text">
              AI Crypto Coach
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-muted/20 border border-border/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted/20 border border-border/50 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-secondary" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="border-t border-border/30 pt-4">
            <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={action.action}
                  className="text-xs border-border/50 hover:border-primary/50"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about your portfolio, market insights, or strategies..."
              className="bg-muted/20 border-border/50"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="gradient-primary hover-glow"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Disclaimer */}
          <Card className="bg-amber-500/10 border-amber-500/20 p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-xs text-amber-200">
                This is educational content, not financial advice. Always do your own research and consult professionals before making investment decisions.
              </p>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};