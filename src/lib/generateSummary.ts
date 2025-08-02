import { MarketData } from './marketData';
import { NewsItem } from './newsData';
import { supabase } from '@/integrations/supabase/client';

interface SummaryContext {
  marketData: MarketData;
  news: NewsItem[];
  portfolioContext?: {
    totalValue: number;
    assets: string[];
    performance: number;
  };
}

export interface AISummary {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * Generates an AI summary of market conditions using OpenRouter API
 */
export async function generateMarketSummary(context: SummaryContext): Promise<AISummary> {
  try {
    const prompt = buildSummaryPrompt(context);
    
    // Call the OpenRouter edge function
    const { data, error } = await supabase.functions.invoke('generate-market-summary', {
      body: { prompt }
    });

    if (error) {
      console.error('Error calling generate-market-summary function:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error generating market summary:', error);
    
    // Return fallback summary
    return generateFallbackSummary(context);
  }
}

/**
 * Builds the prompt for the AI summary
 */
function buildSummaryPrompt(context: SummaryContext): string {
  const { marketData, news, portfolioContext } = context;
  
  let prompt = `As a financial market analyst, provide a comprehensive but concise analysis of current market conditions based on the following data:

**Market Sentiment:**
- Fear & Greed Index: ${marketData.fearGreed.value}/100 (${marketData.fearGreed.classification})
- Market Cycle: ${marketData.marketCycle.cycle} market (${marketData.marketCycle.confidence}% confidence)
- Key Indicators: ${marketData.marketCycle.indicators.join(', ')}

**Macroeconomic Indicators:**`;

  marketData.macroIndicators.forEach(indicator => {
    prompt += `\n- ${indicator.name}: ${indicator.value}${indicator.unit}`;
  });

  prompt += `\n\n**Recent News Headlines:**`;
  news.slice(0, 5).forEach((article, index) => {
    prompt += `\n${index + 1}. ${article.title}`;
  });

  if (portfolioContext) {
    prompt += `\n\n**Portfolio Context:**
- Total Value: $${portfolioContext.totalValue.toLocaleString()}
- Assets: ${portfolioContext.assets.join(', ')}
- Performance: ${portfolioContext.performance > 0 ? '+' : ''}${portfolioContext.performance.toFixed(2)}%`;
  }

  prompt += `\n\nPlease provide:
1. A 2-3 sentence executive summary of market conditions
2. 3-4 key points about the current environment
3. 2-3 actionable recommendations for investors
4. Your confidence level (1-100) in this analysis

Format your response as JSON with the following structure:
{
  "summary": "Executive summary here",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "confidence": 85
}`;

  return prompt;
}

/**
 * Generates a fallback summary when AI is unavailable
 */
function generateFallbackSummary(context: SummaryContext): AISummary {
  const { marketData } = context;
  const fearGreed = marketData.fearGreed;
  const cycle = marketData.marketCycle.cycle;
  
  let summary = `Current market sentiment shows ${fearGreed.classification.toLowerCase()} conditions with a Fear & Greed Index of ${fearGreed.value}/100. `;
  
  if (cycle === 'bull') {
    summary += "Market indicators suggest a bullish environment with positive investor confidence. ";
  } else if (cycle === 'bear') {
    summary += "Market indicators suggest a bearish environment with cautious investor sentiment. ";
  } else {
    summary += "Market indicators show mixed signals with neutral investor sentiment. ";
  }
  
  summary += "Macroeconomic conditions continue to influence market dynamics.";

  const keyPoints = [
    `Fear & Greed Index at ${fearGreed.value} indicates ${fearGreed.classification.toLowerCase()} sentiment`,
    `${cycle.charAt(0).toUpperCase() + cycle.slice(1)} market cycle detected with ${marketData.marketCycle.confidence}% confidence`,
    `Key macroeconomic factors: ${marketData.macroIndicators.slice(0, 2).map(i => `${i.name} at ${i.value}${i.unit}`).join(', ')}`
  ];

  const recommendations = cycle === 'bull' 
    ? ["Consider gradual position building", "Monitor for overvaluation signals"]
    : cycle === 'bear'
    ? ["Focus on risk management", "Look for value opportunities"]
    : ["Maintain balanced approach", "Stay alert to market shifts"];

  return {
    summary,
    keyPoints,
    recommendations,
    confidence: 70
  };
}

/**
 * Formats summary for display
 */
export function formatSummaryForDisplay(summary: AISummary): {
  mainText: string;
  highlights: string[];
  actions: string[];
  confidenceLevel: 'low' | 'medium' | 'high';
} {
  const confidenceLevel = summary.confidence >= 80 ? 'high' : 
                         summary.confidence >= 60 ? 'medium' : 'low';

  return {
    mainText: summary.summary,
    highlights: summary.keyPoints,
    actions: summary.recommendations,
    confidenceLevel
  };
}