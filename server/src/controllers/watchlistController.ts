import { Request, Response } from 'express';
import { Watchlist } from '../models/Watchlist';
import { Stock } from '../models/Stock';
import { STOCK_UNIVERSE } from '../services/marketData/stockUniverse';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, Errors } from '../utils/apiResponse';

async function ensureOwnedWatchlist(userId: string, watchlistId: string) {
  const watchlist = await Watchlist.findOne({ _id: watchlistId, userId });
  if (!watchlist) throw Errors.notFound('Watchlist not found.');
  return watchlist;
}

export const listWatchlists = asyncHandler(async (req: Request, res: Response) => {
  const watchlists = await Watchlist.find({ userId: req.user!.userId }).sort({ createdAt: 1 });
  ok(res, { watchlists });
});

export const createWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  const watchlist = await Watchlist.create({ userId: req.user!.userId, name, stocks: [] });
  ok(res, { watchlist }, 201);
});

export const renameWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const watchlist = await ensureOwnedWatchlist(req.user!.userId, req.params.id);
  const { name } = req.body as { name?: string };
  if (name) watchlist.name = name;
  await watchlist.save();
  ok(res, { watchlist });
});

export const deleteWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const watchlist = await ensureOwnedWatchlist(req.user!.userId, req.params.id);
  await watchlist.deleteOne();
  ok(res, { deleted: true });
});

export const addStockToWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const watchlist = await ensureOwnedWatchlist(req.user!.userId, req.params.id);
  const { symbol } = req.body as { symbol: string };
  const upper = symbol.toUpperCase();

  const known = STOCK_UNIVERSE.find((s) => s.symbol === upper);
  if (!known) throw Errors.badRequest(`Unknown stock symbol "${upper}".`, 'UNKNOWN_SYMBOL');

  // Keep a lightweight Stock document around too (spec's Stock collection),
  // even though the watchlist itself only stores symbols.
  await Stock.updateOne(
    { symbol: upper },
    { $setOnInsert: { symbol: upper, name: known.name, exchange: known.exchange, sector: known.sector } },
    { upsert: true }
  );

  if (!watchlist.stocks.includes(upper)) {
    watchlist.stocks.push(upper);
    await watchlist.save();
  }
  ok(res, { watchlist });
});

export const removeStockFromWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const watchlist = await ensureOwnedWatchlist(req.user!.userId, req.params.id);
  const symbol = req.params.symbol.toUpperCase();
  watchlist.stocks = watchlist.stocks.filter((s) => s !== symbol);
  await watchlist.save();
  ok(res, { watchlist });
});
