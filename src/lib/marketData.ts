interface MacroIndicator {
  name: string;
  value: number;
  unit: string;
  lastUpdated: string;
}

interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

interface MarketCycleData {
  cycle: 'bull' | 'bear' | 'neutral';
  confidence: number;
  indicators: string[];
}

export interface MarketData {
  fearGreed: FearGreedData;
  macroIndicators: MacroIndicator[];
  marketCycle: MarketCycleData;
}

/**
 * Fetches Fear & Greed Index from alternative.me API
 */
export async function fetchFearGreedIndex(): Promise<FearGreedData> {
  try {
    const response = await fetch('https://api.alternative.me/fng/');
    
    if (!response.ok) {
      throw new Error(`Fear & Greed API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !data.data[0]) {
      throw new Error('Invalid Fear & Greed data format');
    }
    
    const latestData = data.data[0];
    
    return {
      value: parseInt(latestData.value),
      classification: latestData.value_classification,
      timestamp: latestData.timestamp
    };
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
    throw error;
  }
}

/**
 * Fetches macroeconomic indicators from Trading Economics API
 * Note: This requires an API key from Trading Economics
 */
export async function fetchMacroIndicators(): Promise<MacroIndicator[]> {
  // For now, return mock data. Will be replaced with real API calls when keys are configured
  const mockIndicators: MacroIndicator[] = [
    {
      name: 'US Interest Rate',
      value: 5.25,
      unit: '%',
      lastUpdated: new Date().toISOString()
    },
    {
      name: 'US Inflation Rate',
      value: 3.1,
      unit: '%',
      lastUpdated: new Date().toISOString()
    },
    {
      name: 'US GDP Growth',
      value: 2.4,
      unit: '%',
      lastUpdated: new Date().toISOString()
    },
    {
      name: 'US Unemployment Rate',
      value: 3.7,
      unit: '%',
      lastUpdated: new Date().toISOString()
    }
  ];

  return mockIndicators;
}

/**
 * Determines market cycle based on various indicators
 */
export function determineMarketCycle(
  fearGreedValue: number,
  macroIndicators: MacroIndicator[]
): MarketCycleData {
  const indicators: string[] = [];
  let bullishSignals = 0;
  let bearishSignals = 0;

  // Fear & Greed analysis
  if (fearGreedValue >= 70) {
    bullishSignals += 2;
    indicators.push('High Fear & Greed Index');
  } else if (fearGreedValue <= 30) {
    bearishSignals += 2;
    indicators.push('Low Fear & Greed Index');
  } else {
    indicators.push('Neutral Fear & Greed Index');
  }

  // Interest rate analysis
  const interestRate = macroIndicators.find(i => i.name.includes('Interest Rate'))?.value;
  if (interestRate) {
    if (interestRate < 3) {
      bullishSignals += 1;
      indicators.push('Low interest rates');
    } else if (interestRate > 5) {
      bearishSignals += 1;
      indicators.push('High interest rates');
    }
  }

  // Inflation analysis
  const inflation = macroIndicators.find(i => i.name.includes('Inflation'))?.value;
  if (inflation) {
    if (inflation < 2) {
      bullishSignals += 1;
      indicators.push('Low inflation');
    } else if (inflation > 4) {
      bearishSignals += 1;
      indicators.push('High inflation');
    }
  }

  // GDP Growth analysis
  const gdpGrowth = macroIndicators.find(i => i.name.includes('GDP'))?.value;
  if (gdpGrowth) {
    if (gdpGrowth > 3) {
      bullishSignals += 1;
      indicators.push('Strong GDP growth');
    } else if (gdpGrowth < 1) {
      bearishSignals += 1;
      indicators.push('Weak GDP growth');
    }
  }

  // Determine cycle
  let cycle: 'bull' | 'bear' | 'neutral';
  let confidence: number;

  if (bullishSignals > bearishSignals) {
    cycle = 'bull';
    confidence = Math.min(90, (bullishSignals / (bullishSignals + bearishSignals)) * 100);
  } else if (bearishSignals > bullishSignals) {
    cycle = 'bear';
    confidence = Math.min(90, (bearishSignals / (bullishSignals + bearishSignals)) * 100);
  } else {
    cycle = 'neutral';
    confidence = 50;
  }

  return {
    cycle,
    confidence: Math.round(confidence),
    indicators
  };
}

/**
 * Main function to fetch all market data
 */
export async function fetchMarketData(): Promise<MarketData> {
  try {
    const [fearGreed, macroIndicators] = await Promise.all([
      fetchFearGreedIndex(),
      fetchMacroIndicators()
    ]);

    const marketCycle = determineMarketCycle(fearGreed.value, macroIndicators);

    return {
      fearGreed,
      macroIndicators,
      marketCycle
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}