// // import { MarketDataProvider, MarketQuote, StockSearchResult } from './marketDataProvider';
// // import { env } from '../../config/env';

// // /**
// //  * Placeholder for a real vendor integration (e.g. NSE-compatible data vendor,
// //  * Alpha Vantage, Finnhub, etc). It implements the exact same MarketDataProvider
// //  * contract as the mock provider, so nothing else in the app needs to change when
// //  * you switch MARKET_DATA_PROVIDER=real in .env - only this file.
// //  *
// //  * Intentionally not wired to a specific paid vendor for the hackathon build.
// //  * Fill in the fetch calls below with your provider's REST endpoints.
// //  */
// // export class RealMarketDataProvider implements MarketDataProvider {
// //   private apiKey = env.marketDataApiKey;

// //   async getQuote(symbol: string): Promise<MarketQuote> {
// //     if (!this.apiKey) {
// //       return {
// //         symbol,
// //         price: 0,
// //         previousClose: 0,
// //         high: 0,
// //         low: 0,
// //         volume: 0,
// //         averageVolume: 0,
// //         timestamp: new Date(),
// //         source: 'real-provider',
// //         status: 'UNAVAILABLE',
// //         marketStatus: 'UNAVAILABLE',
// //       };
// //     }

// //     // TODO: replace with a real HTTP call, e.g.:
// //     // const res = await fetch(`https://your-vendor.example/v1/quote?symbol=${symbol}&apikey=${this.apiKey}`);
// //     // const json = await res.json();
// //     // return mapVendorResponseToMarketQuote(json);
// //     throw new Error('RealMarketDataProvider is not configured. Implement getQuote() for your vendor.');
// //   }

// //   async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
// //     return Promise.all(symbols.map((s) => this.getQuote(s)));
// //   }

// //   async searchStocks(_query: string): Promise<StockSearchResult[]> {
// //     throw new Error('RealMarketDataProvider is not configured. Implement searchStocks() for your vendor.');
// //   }
// // }



// import { NseIndia } from 'stock-nse-india';
// import { MarketDataProvider, MarketQuote, StockSearchResult } from './marketDataProvider';
// import { STOCK_UNIVERSE } from './stockUniverse';

// const nseIndia = new NseIndia();

// // NSE's quote-equity response doesn't include a rolling average volume, so we
// // derive one from recent daily history and cache it for a few hours per symbol
// // instead of hitting the historical endpoint on every quote request.
// interface AvgVolumeCacheEntry { value: number; expiresAt: number }
// const avgVolumeCache = new Map<string, AvgVolumeCacheEntry>();
// const AVG_VOLUME_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// async function getAverageVolume(symbol: string, fallback: number): Promise<number> {
//   const cached = avgVolumeCache.get(symbol);
//   if (cached && cached.expiresAt > Date.now()) return cached.value;

//   try {
//     const end = new Date();
//     const start = new Date(end.getTime() - 20 * 24 * 60 * 60 * 1000); // ~20 trading days
//     const history = await nseIndia.getEquityHistoricalData(symbol, { start, end });
//     const rows = Array.isArray(history) ? history.flatMap((h: any) => h.data ?? []) : [];
//     const volumes = rows.map((r: any) => Number(r.CH_TOT_TRADED_QTY)).filter((v: number) => v > 0);
//     const avg = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : fallback;
//     avgVolumeCache.set(symbol, { value: avg, expiresAt: Date.now() + AVG_VOLUME_TTL_MS });
//     return avg;
//   } catch {
//     return fallback; // don't fail the whole quote just because the average lookup failed
//   }
// }

// function isMarketOpenNow(): 'OPEN' | 'CLOSED' {
//   const now = new Date();
//   const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
//   const day = ist.getUTCDay();
//   const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
//   const isWeekday = day >= 1 && day <= 5;
//   const isTradingWindow = minutes >= 9 * 60 + 15 && minutes <= 15 * 60 + 30;
//   return isWeekday && isTradingWindow ? 'OPEN' : 'CLOSED';
// }

// export class RealMarketDataProvider implements MarketDataProvider {
//   async getQuote(symbol: string): Promise<MarketQuote> {
//     try {
//       const details: any = await nseIndia.getEquityDetails(symbol);
//       const priceInfo = details?.priceInfo;
//       if (!priceInfo) throw new Error('No priceInfo in NSE response');

//       const volume = Number(details?.securityWiseDP?.quantityTraded ?? 0);
//       const averageVolume = await getAverageVolume(symbol, volume || 1);

//       return {
//         symbol,
//         price: Number(priceInfo.lastPrice),
//         previousClose: Number(priceInfo.previousClose),
//         high: Number(priceInfo.intraDayHighLow?.max ?? priceInfo.lastPrice),
//         low: Number(priceInfo.intraDayHighLow?.min ?? priceInfo.lastPrice),
//         volume,
//         averageVolume,
//         timestamp: new Date(),
//         source: 'nse-india',
//         status: 'LIVE',
//         marketStatus: isMarketOpenNow(),
//       };
//     } catch (err) {
//       // Never fabricate a value - surface UNAVAILABLE so the rest of the app
//       // (snapshot job, dashboard) degrades gracefully instead of crashing.
//       console.error(`[RealMarketDataProvider] failed to fetch ${symbol}:`, err);
//       return {
//         symbol,
//         price: 0,
//         previousClose: 0,
//         high: 0,
//         low: 0,
//         volume: 0,
//         averageVolume: 0,
//         timestamp: new Date(),
//         source: 'nse-india',
//         status: 'UNAVAILABLE',
//         marketStatus: 'UNAVAILABLE',
//       };
//     }
//   }

//   async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
//     // Sequential, not Promise.all - NSE rate-limits bursts of concurrent requests.
//     const results: MarketQuote[] = [];
//     for (const symbol of symbols) {
//       results.push(await this.getQuote(symbol));
//       await new Promise((r) => setTimeout(r, 150));
//     }
//     return results;
//   }

//   async searchStocks(query: string): Promise<StockSearchResult[]> {
//     // Reuses the local catalogue for name search (NSE's symbol list has no
//     // company-name search); getQuote() above is what actually goes live.
//     const q = query.trim().toLowerCase();
//     return STOCK_UNIVERSE.filter(
//       (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
//     ).slice(0, 10).map((s) => ({ symbol: s.symbol, name: s.name, exchange: s.exchange }));
//   }
// }



import { NseIndia } from 'stock-nse-india';
import { MarketDataProvider, MarketQuote, StockSearchResult } from './marketDataProvider';
import { STOCK_UNIVERSE } from './stockUniverse';

const nseIndia = new NseIndia();

interface AvgVolumeCacheEntry { value: number; expiresAt: number }
const avgVolumeCache = new Map<string, AvgVolumeCacheEntry>();
const AVG_VOLUME_TTL_MS = 6 * 60 * 60 * 1000;

async function getAverageVolume(symbol: string, fallback: number): Promise<number> {
  const cached = avgVolumeCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const end = new Date();
    const start = new Date(end.getTime() - 20 * 24 * 60 * 60 * 1000);
    const history: any = await nseIndia.getEquityHistoricalData(symbol, { start, end });
    const rows = Array.isArray(history) ? history.flatMap((h: any) => h.data ?? []) : [];
    const volumes = rows.map((r: any) => Number(r.CH_TOT_TRADED_QTY)).filter((v: number) => v > 0);
    const avg = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : fallback;
    avgVolumeCache.set(symbol, { value: avg, expiresAt: Date.now() + AVG_VOLUME_TTL_MS });
    return avg;
  } catch {
    return fallback;
  }
}

function isMarketOpenNow(): 'OPEN' | 'CLOSED' | 'PRE_MARKET' {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const day = ist.getUTCDay();
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  if (day < 1 || day > 5) return 'CLOSED';
  if (minutes >= 9 * 60 && minutes < 9 * 60 + 15) return 'PRE_MARKET';
  if (minutes >= 9 * 60 + 15 && minutes <= 15 * 60 + 30) return 'OPEN';
  return 'CLOSED';
}

export class RealMarketDataProvider implements MarketDataProvider {
  async getQuote(symbol: string): Promise<MarketQuote> {
    try {
      const details: any = await nseIndia.getEquityDetails(symbol);
      const priceInfo = details?.priceInfo;
      const preOpen = details?.preOpenMarket;
      const securityWiseDP = details?.securityWiseDP;

      if (!priceInfo) throw new Error('No priceInfo in NSE response');

      const lastPrice = priceInfo.lastPrice;
      const previousClose = priceInfo.previousClose;

      const rangeIsPlausible = (v: number) =>
        typeof v === 'number' && Math.abs(v - lastPrice) / lastPrice < 0.2;
      const high = rangeIsPlausible(priceInfo.intraDayHighLow?.max)
        ? priceInfo.intraDayHighLow.max
        : lastPrice;
      const low = rangeIsPlausible(priceInfo.intraDayHighLow?.min)
        ? priceInfo.intraDayHighLow.min
        : lastPrice;

      let price = lastPrice;
      let volume = 0;
      let marketStatus: MarketQuote['marketStatus'] = isMarketOpenNow();

      if (securityWiseDP) {
        volume = Number(securityWiseDP.quantityTraded ?? 0);
      } else if (preOpen) {
        price = preOpen.IEP ?? lastPrice;
        volume = Number(preOpen.totalTradedVolume ?? 0);
        marketStatus = 'PRE_MARKET';
      }

      const averageVolume = await getAverageVolume(symbol, volume || 1);

      return {
        symbol,
        price,
        previousClose,
        high,
        low,
        volume,
        averageVolume,
        timestamp: new Date(),
        source: 'nse-india',
        status: 'LIVE',
        marketStatus,
      };
    } catch (err) {
      console.error(`[RealMarketDataProvider] failed to fetch ${symbol}:`, err);
      return {
        symbol, price: 0, previousClose: 0, high: 0, low: 0, volume: 0, averageVolume: 0,
        timestamp: new Date(), source: 'nse-india', status: 'UNAVAILABLE', marketStatus: 'UNAVAILABLE',
      };
    }
  }

  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    const results: MarketQuote[] = [];
    for (const symbol of symbols) {
      results.push(await this.getQuote(symbol));
      await new Promise((r) => setTimeout(r, 150));
    }
    return results;
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const q = query.trim().toLowerCase();
    return STOCK_UNIVERSE.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 10).map((s) => ({ symbol: s.symbol, name: s.name, exchange: s.exchange }));
  }
}