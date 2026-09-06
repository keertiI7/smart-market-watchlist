import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { MarketChange } from '../models/MarketChange';
import { Watchlist } from '../models/Watchlist';
import { STOCK_UNIVERSE } from '../services/marketData/stockUniverse';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';

const ATTENTION_LEVELS = ['HIGH', 'MEDIUM', 'LOW', 'NONE'] as const;
const TREND_DAYS = 14;

export const getAnalyticsOverview = asyncHandler(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.userId);
  const baseMatch = { userId, isDismissed: false };

  const [avgScoreResult, attentionRaw, mostFlaggedRaw, topMoversRaw, watchlists, scoreTrendRaw] =
    await Promise.all([
      MarketChange.aggregate([{ $match: baseMatch }, { $group: { _id: null, avgScore: { $avg: '$score' } } }]),

      MarketChange.aggregate([{ $match: baseMatch }, { $group: { _id: '$attentionLevel', count: { $sum: 1 } } }]),

      MarketChange.aggregate([
        { $match: baseMatch },
        { $group: { _id: '$symbol', count: { $sum: 1 }, avgScore: { $avg: '$score' } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),

      MarketChange.aggregate([
        { $match: baseMatch },
        { $addFields: { absChange: { $abs: '$changePercent' } } },
        { $sort: { absChange: -1 } },
        { $limit: 5 },
        { $project: { symbol: 1, changePercent: 1, score: 1, attentionLevel: 1, timestamp: 1 } },
      ]),

      Watchlist.find({ userId }).lean(),

      MarketChange.aggregate([
        { $match: { ...baseMatch, timestamp: { $gte: new Date(Date.now() - TREND_DAYS * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            avgScore: { $avg: '$score' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  const attentionBreakdown = Object.fromEntries(ATTENTION_LEVELS.map((level) => [level, 0])) as Record<
    (typeof ATTENTION_LEVELS)[number],
    number
  >;
  for (const row of attentionRaw) {
    if (row._id in attentionBreakdown) attentionBreakdown[row._id as keyof typeof attentionBreakdown] = row.count;
  }

  // Sector exposure is derived from the static stock catalogue against whatever
  // symbols the user actually watches - no extra Mongo round-trip needed.
  const watchedSymbols = Array.from(new Set(watchlists.flatMap((w) => w.stocks)));
  const sectorCounts = new Map<string, number>();
  for (const symbol of watchedSymbols) {
    const info = STOCK_UNIVERSE.find((s) => s.symbol === symbol);
    const sector = info?.sector || 'Other';
    sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1);
  }
  const sectorBreakdown = Array.from(sectorCounts.entries()).map(([sector, count]) => ({ sector, count }));

  ok(res, {
    totalWatchedStocks: watchedSymbols.length,
    totalChanges: attentionRaw.reduce((sum, r) => sum + r.count, 0),
    averageScore: avgScoreResult[0]?.avgScore ?? 0,
    attentionBreakdown,
    mostFlaggedStock: mostFlaggedRaw[0]
      ? { symbol: mostFlaggedRaw[0]._id, count: mostFlaggedRaw[0].count, avgScore: mostFlaggedRaw[0].avgScore }
      : null,
    topMovers: topMoversRaw,
    sectorBreakdown,
    scoreTrend: scoreTrendRaw.map((r) => ({ date: r._id, avgScore: r.avgScore, count: r.count })),
  });
});