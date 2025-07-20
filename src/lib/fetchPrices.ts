export async function fetchLivePrices(symbols: string[], currency: string = "usd") {
  const ids = symbols.map(s => mapToCoingeckoId(s)).join(",");
  const res = await fetch(`/api-coingecko/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}&include_24hr_change=true`);
  if (!res.ok) throw new Error("Failed to fetch live prices");
  return res.json();
}

export function mapToCoingeckoId(symbol: string): string {
  switch (symbol.toUpperCase()) {
    case "BTC": return "bitcoin";
    case "ETH": return "ethereum";
    case "XRP": return "ripple";
    case "ADA": return "cardano";
    case "SOL": return "solana";
    case "DOT": return "polkadot";
    case "AVAX": return "avalanche-2";
    case "BNB": return "binancecoin";
    case "MATIC": return "polygon";
    default: return symbol.toLowerCase(); // fallback
  }
}