import { Types } from 'mongoose';
import { MarketSnapshot } from '../models/MarketSnapshot';
import { MarketChange, ChangeType } from '../models/MarketChange';
import { Watchlist } from '../models/Watchlist';
import { Event } from '../models/Event';
import { MarketQuote } from './marketData/marketDataProvider';
import { evaluateChange } from './changeEngine';
import { CHANGE_ENGINE_CONFIG } from './changeEngine/config';

const HISTORY_LOOKBACK = 30;

function pickChangeType(breakdown: { priceSignificance: number; volumeAnomaly: number; volatilityAnomaly: number; corporateEvent: number }): ChangeType {
  if (breakdown.corporateEvent >= Math.max(breakdown.priceSignificance, breakdown.volumeAnomaly, breakdown.volatilityAnomaly)) {
    return breakdown.corporateEvent > 0 ? 'EVENT' : 'COMPOSITE';
  }
  if (breakdown.volumeAnomaly >= breakdown.priceSignificance && breakdown.volumeAnomaly >= breakdown.volatilityAnomaly) {
    return 'VOLUME';
  }
  if (breakdown.priceSignificance >= breakdown.volatilityAnomaly) {
    return 'PRICE';
  }
  return 'VOLATILITY';
}

/**
 * Stores a fresh MarketSnapshot for `symbol` and, if a previous snapshot exists,
 * runs the meaningful-change engine and writes a MarketChange for every user
 * currently watching that symbol. Shared by the background job (Module 33) and
 * the demo/simulate endpoint (Module 20) - identical pipeline either way.
 */
export async function recordSnapshotAndDetectChanges(quote: MarketQuote): Promise<{
  created: boolean;
  changesForUsers: number;
}> {
  const symbol = quote.symbol.toUpperCase();

  const previousSnapshot = await MarketSnapshot.findOne({ symbol }).sort({ timestamp: -1 });

  await MarketSnapshot.create({
    symbol,
    price: quote.price,
    previousClose: quote.previousClose,
    high: quote.high,
    low: quote.low,
    volume: quote.volume,
    averageVolume: quote.averageVolume,
    timestamp: quote.timestamp,
    source: quote.source,
    status: quote.status,
    marketStatus: quote.marketStatus,
  });

  // First-ever snapshot for this symbol: nothing to compare against yet
  // (spec Module 35 - avoid misleading "no changes" comparisons).
  if (!previousSnapshot) {
    return { created: true, changesForUsers: 0 };
  }

  const history = await MarketSnapshot.find({ symbol })
    .sort({ timestamp: -1 })
    .limit(HISTORY_LOOKBACK)
    .select('price')
    .lean();
  const priceHistoryOldToNew = history.map((h) => h.price).reverse();

  const since = new Date(Date.now() - CHANGE_ENGINE_CONFIG.eventLookbackHours * 60 * 60 * 1000);
  const recentEvents = await Event.find({ symbol, timestamp: { $gte: since } }).lean();

  const result = evaluateChange({
    symbol,
    previousPrice: previousSnapshot.price,
    currentPrice: quote.price,
    currentVolume: quote.volume,
    averageVolume: quote.averageVolume,
    priceHistory: priceHistoryOldToNew,
    recentEvents: recentEvents.map((e) => ({ type: e.type, title: e.title, confidence: e.confidence })),
  });

  if (!result.isMeaningful) {
    return { created: true, changesForUsers: 0 };
  }

  const watchers = await Watchlist.find({ stocks: symbol }).distinct('userId');
  if (watchers.length === 0) {
    return { created: true, changesForUsers: 0 };
  }

  const docs = (watchers as Types.ObjectId[]).map((userId) => ({
    userId,
    symbol,
    type: pickChangeType(result.breakdown),
    oldValue: previousSnapshot.price,
    newValue: quote.price,
    changePercent: result.changePercent,
    score: result.score,
    scoreBreakdown: result.breakdown,
    attentionLevel: result.attentionLevel,
    reasons: result.reasons,
    explanation: {
      observed: result.observed,
      possibleExplanation: result.possibleExplanation,
      confidence: result.confidence,
      aiGenerated: false,
    },
    timestamp: quote.timestamp,
  }));

  await MarketChange.insertMany(docs);

  return { created: true, changesForUsers: watchers.length };
}

/** All distinct symbols currently sitting in at least one watchlist. */
export async function getAllWatchedSymbols(): Promise<string[]> {
  return Watchlist.distinct('stocks');
}
