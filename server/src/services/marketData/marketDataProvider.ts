export interface MarketQuote {
  symbol: string;
  price: number;
  previousClose: number;
  high: number;
  low: number;
  volume: number;
  averageVolume: number;
  timestamp: Date;
  source: string;
  status: 'LIVE' | 'DELAYED' | 'STALE' | 'UNAVAILABLE';
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'POST_MARKET' | 'UNAVAILABLE';
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

/**
 * Every market-data backend (mock, a real vendor API, a second vendor used for
 * reconciliation, etc.) implements this same interface. Controllers and services
 * never talk to a vendor directly - they only depend on this contract, so swapping
 * providers is a one-line config change (MARKET_DATA_PROVIDER in .env).
 */
export interface MarketDataProvider {
  getQuote(symbol: string): Promise<MarketQuote>;
  getQuotes(symbols: string[]): Promise<MarketQuote[]>;
  searchStocks(query: string): Promise<StockSearchResult[]>;
}
