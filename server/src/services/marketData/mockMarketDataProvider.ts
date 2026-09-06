import { MarketDataProvider, MarketQuote, StockSearchResult } from './marketDataProvider';
import { STOCK_UNIVERSE } from './stockUniverse';

interface SymbolState {
  price: number;
  previousClose: number;
  high: number;
  low: number;
  volume: number;
  averageVolume: number;
}

// A one-off shock queued by the demo/simulate endpoint (Module 20). It is consumed
// on the next getQuote() call for that symbol, then the symbol returns to its
// normal random walk - this is what lets the SAME change-detection pipeline used
// for "real" data also process demo scenarios.
interface PendingShock {
  priceChangePercent: number;
  volumeMultiplier: number;
  label?: string;
}

function isMarketOpenNow(): 'OPEN' | 'CLOSED' {
  // IST market hours, approximated: Mon-Fri 09:15-15:30 IST (UTC+5:30)
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffsetMs);
  const day = ist.getUTCDay();
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const isWeekday = day >= 1 && day <= 5;
  const isTradingWindow = minutes >= 9 * 60 + 15 && minutes <= 15 * 60 + 30;
  return isWeekday && isTradingWindow ? 'OPEN' : 'CLOSED';
}

export class MockMarketDataProvider implements MarketDataProvider {
  private state = new Map<string, SymbolState>();
  private pendingShocks = new Map<string, PendingShock>();

  constructor() {
    for (const stock of STOCK_UNIVERSE) {
      this.state.set(stock.symbol, {
        price: stock.basePrice,
        previousClose: stock.basePrice,
        high: stock.basePrice,
        low: stock.basePrice,
        volume: stock.baseVolume,
        averageVolume: stock.baseVolume,
      });
    }
  }

  /** Used by the demo/simulate endpoint to inject a deterministic shock. */
  queueShock(symbol: string, shock: PendingShock): void {
    this.pendingShocks.set(symbol.toUpperCase(), shock);
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const sym = symbol.toUpperCase();
    const s = this.state.get(sym);
    if (!s) {
      return {
        symbol: sym,
        price: 0,
        previousClose: 0,
        high: 0,
        low: 0,
        volume: 0,
        averageVolume: 0,
        timestamp: new Date(),
        source: 'mock-provider',
        status: 'UNAVAILABLE',
        marketStatus: 'UNAVAILABLE',
      };
    }

    const shock = this.pendingShocks.get(sym);
    let changePercent: number;
    let volume: number;

    if (shock) {
      changePercent = shock.priceChangePercent;
      volume = Math.round(s.averageVolume * shock.volumeMultiplier);
      this.pendingShocks.delete(sym);
    } else {
      // Small, mostly-benign random walk so a demo left running doesn't look frozen.
      changePercent = (Math.random() - 0.5) * 1.2; // roughly +/-0.6%
      volume = Math.round(s.averageVolume * (0.7 + Math.random() * 0.6));
    }

    s.previousClose = s.price;
    s.price = Math.max(0.05, +(s.price * (1 + changePercent / 100)).toFixed(2));
    s.high = Math.max(s.high, s.price);
    s.low = s.low === 0 ? s.price : Math.min(s.low, s.price);
    s.volume = volume;
    // Average volume drifts slowly toward recent volume - keeps the "3.2x average"
    // signal meaningful over time instead of static forever.
    s.averageVolume = Math.round(s.averageVolume * 0.98 + volume * 0.02);

    return {
      symbol: sym,
      price: s.price,
      previousClose: s.previousClose,
      high: s.high,
      low: s.low,
      volume: s.volume,
      averageVolume: s.averageVolume,
      timestamp: new Date(),
      source: 'mock-provider',
      status: 'LIVE',
      marketStatus: isMarketOpenNow(),
    };
  }

  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    return Promise.all(symbols.map((s) => this.getQuote(s)));
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return STOCK_UNIVERSE.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    )
      .slice(0, 10)
      .map((s) => ({ symbol: s.symbol, name: s.name, exchange: s.exchange }));
  }
}

// Singleton - the whole app shares one simulated market rather than each request
// spinning up a fresh (and inconsistent) random universe.
export const mockMarketDataProvider = new MockMarketDataProvider();
