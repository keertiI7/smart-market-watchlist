import { Request, Response } from 'express';
import { marketDataProvider } from '../services/marketData';
import { MarketSnapshot } from '../models/MarketSnapshot';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, Errors } from '../utils/apiResponse';
import { NseIndia } from 'stock-nse-india';

const nseIndia = new NseIndia();

function extractIndexSummary(raw: any) {
  const m = raw?.metadata;
  return {
    value: m?.last ?? 0,
    change: m?.percChange ?? 0,
    changeAbsolute: m?.change ?? 0,
    open: m?.open ?? 0,
    previousClose: m?.previousClose ?? 0,
    dayLow: m?.low ?? 0,
    dayHigh: m?.high ?? 0,
    weekLow52: m?.yearLow ?? 0,
    weekHigh52: m?.yearHigh ?? 0,
    asOf: m?.timeVal ?? null,
  };
}

export const getIndices = asyncHandler(async (req: Request, res: Response) => {
  try {
    const [nifty50, niftyBank] = await Promise.all([
      nseIndia.getEquityStockIndices('NIFTY 50'),
      nseIndia.getEquityStockIndices('NIFTY BANK'),
    ]);

    ok(res, {
      indices: [
        { name: 'NIFTY 50', ...extractIndexSummary(nifty50) },
        { name: 'NIFTY BANK', ...extractIndexSummary(niftyBank) },
      ],
    });
  } catch (err) {
    console.error('[getIndices] failed:', err);
    ok(res, { indices: [] });
  }
});
export const getQuote = asyncHandler(async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const quote = await marketDataProvider.getQuote(symbol);

  if (quote.status === 'UNAVAILABLE') {
    // Graceful degradation instead of a raw 500 (spec Module 21/44): the API
    // still returns 200-shaped data the UI can render an "unavailable" state from,
    // but flags it clearly so nothing gets mistaken for a live price.
    throw Errors.marketUnavailable(`Market data for ${symbol} is currently unavailable.`);
  }

  ok(res, { quote });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const limit = Math.min(200, parseInt(String(req.query.limit || '60'), 10));

  const history = await MarketSnapshot.find({ symbol })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

  ok(res, { symbol, history: history.reverse() });
});
