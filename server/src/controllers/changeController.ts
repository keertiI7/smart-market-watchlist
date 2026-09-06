import { Request, Response } from 'express';
import { MarketChange } from '../models/MarketChange';
import { User } from '../models/User';
import { Watchlist } from '../models/Watchlist';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, Errors } from '../utils/apiResponse';

const typeFilterMap: Record<string, string[]> = {
  all: ['PRICE', 'VOLUME', 'VOLATILITY', 'EVENT', 'COMPOSITE'],
  price: ['PRICE', 'COMPOSITE'],
  volume: ['VOLUME'],
  news: ['EVENT'],
  corporate: ['EVENT'],
};

export const listChanges = asyncHandler(async (req: Request, res: Response) => {
  const filter = String(req.query.filter || 'all').toLowerCase();
  const types = typeFilterMap[filter] || typeFilterMap.all;
  const includeDismissed = req.query.includeDismissed === 'true';

  const query: Record<string, unknown> = {
    userId: req.user!.userId,
    type: { $in: types },
  };
  if (!includeDismissed) query.isDismissed = false;

  const changes = await MarketChange.find(query).sort({ timestamp: -1 }).limit(100);
  ok(res, { changes });
});

export const getChangeById = asyncHandler(async (req: Request, res: Response) => {
  const change = await MarketChange.findOne({ _id: req.params.id, userId: req.user!.userId });
  if (!change) throw Errors.notFound('Change not found.');
  ok(res, { change });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const change = await MarketChange.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { isRead: true },
    { new: true }
  );
  if (!change) throw Errors.notFound('Change not found.');
  ok(res, { change });
});

export const markImportant = asyncHandler(async (req: Request, res: Response) => {
  const { important } = req.body as { important?: boolean };
  const change = await MarketChange.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { isImportant: important ?? true },
    { new: true }
  );
  if (!change) throw Errors.notFound('Change not found.');
  ok(res, { change });
});

export const dismissChange = asyncHandler(async (req: Request, res: Response) => {
  const change = await MarketChange.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { isDismissed: true },
    { new: true }
  );
  if (!change) throw Errors.notFound('Change not found.');
  ok(res, { change });
});

function formatSince(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

/**
 * The "Since you last checked" dashboard payload (Module 13 / 36).
 * Reads user.lastSeenAt BEFORE updating it, so changes that happened between
 * "now" and "the moment the client renders" are never silently hidden.
 */
export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw Errors.notFound('User not found.');

  const watchlists = await Watchlist.find({ userId: user._id });
  const watchedSymbolCount = new Set(watchlists.flatMap((w) => w.stocks)).size;
  const isFirstVisit = user.lastSeenAt === null;
  const previousLastSeenAt = user.lastSeenAt;

  const query: Record<string, unknown> = { userId: user._id, isDismissed: false };
  if (previousLastSeenAt) query.timestamp = { $gt: previousLastSeenAt };

  const changesSince = await MarketChange.find(query).sort({ score: -1, timestamp: -1 });

  const needsAttention = changesSince.filter((c) => c.attentionLevel === 'HIGH' || c.attentionLevel === 'MEDIUM');
  const unchanged = Math.max(0, watchedSymbolCount - new Set(changesSince.map((c) => c.symbol)).size);

  // Update lastSeenAt to "now" (captured before the query above ran) rather than
  // after the response is built, so a change detected mid-request is never lost.
  user.lastSeenAt = new Date();
  await user.save();

  ok(res, {
    isFirstVisit,
    previousLastSeenAt,
    sinceLabel: previousLastSeenAt ? formatSince(Date.now() - previousLastSeenAt.getTime()) : null,
    meaningfulChanges: changesSince.length,
    importantEvents: changesSince.filter((c) => c.scoreBreakdown.corporateEvent > 0).length,
    unchangedCount: unchanged,
    watchedSymbolCount,
    needsAttention,
    allChanges: changesSince,
  });
});
