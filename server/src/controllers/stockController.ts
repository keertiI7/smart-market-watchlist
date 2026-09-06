import { Request, Response } from 'express';
import { marketDataProvider } from '../services/marketData';
import { STOCK_UNIVERSE } from '../services/marketData/stockUniverse';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, Errors } from '../utils/apiResponse';

// Debounced client-side + a small in-memory cache server-side keeps this from
// hitting the provider on every keystroke (spec Module 6).
const searchCache = new Map<string, { expires: number; results: unknown }>();
const CACHE_TTL_MS = 30_000;

export const searchStocks = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  if (q.length === 0) {
    ok(res, { results: [] });
    return;
  }

  const cacheKey = q.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    ok(res, { results: cached.results });
    return;
  }

  const results = await marketDataProvider.searchStocks(q);
  searchCache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, results });
  ok(res, { results });
});

export const getStockBySymbol = asyncHandler(async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const known = STOCK_UNIVERSE.find((s) => s.symbol === symbol);
  if (!known) throw Errors.notFound(`Unknown stock symbol "${symbol}".`);
  ok(res, { stock: known });
});
