import { Types } from 'mongoose';
import { mockMarketDataProvider } from './marketData/mockMarketDataProvider';
import { recordSnapshotAndDetectChanges } from './snapshotService';
import { MarketChange } from '../models/MarketChange';
import { Event } from '../models/Event';
import { Watchlist } from '../models/Watchlist';

interface ScenarioStock {
  symbol: string;
  priceChangePercent: number;
  volumeMultiplier: number;
  event?: { type: 'EARNINGS' | 'CORPORATE_ANNOUNCEMENT'; title: string; description: string };
}

// A fixed, presentation-friendly scenario matching the spec's demo flow (Module 39):
// one high-attention crash-on-volume, one medium-attention earnings pop, one
// stock that stays quiet. Judges see three distinct outcomes in one click.
const DEFAULT_SCENARIO: ScenarioStock[] = [
  { symbol: 'RELIANCE', priceChangePercent: -5.4, volumeMultiplier: 3.2 },
  {
    symbol: 'TCS',
    priceChangePercent: 3.2,
    volumeMultiplier: 1.8,
    event: {
      type: 'EARNINGS',
      title: 'TCS reports quarterly earnings',
      description: 'Quarterly results announced ahead of market open, beating analyst estimates.',
    },
  },
  { symbol: 'HDFCBANK', priceChangePercent: 0.3, volumeMultiplier: 1.0 },
];

export interface DemoRunResult {
  stocksAnalyzed: number;
  meaningfulChanges: number;
  requireAttention: number;
  changes: unknown[];
}

/**
 * Runs the scenario through the REAL snapshot + change-detection pipeline - no
 * separate "fake" demo UI or shortcut logic (spec requirement, section 20).
 * Uses the mock provider directly (even if MARKET_DATA_PROVIDER=real) because a
 * live vendor can't be told to produce a reproducible -5.4% move on demand;
 * everything downstream of the quote is identical to production.
 */
export async function runDemoSimulation(userId: string): Promise<DemoRunResult> {
  const userObjectId = new Types.ObjectId(userId);

  // Make sure the demo stocks are actually on a watchlist for this user so the
  // dashboard has something to show afterwards.
  const symbols = DEFAULT_SCENARIO.map((s) => s.symbol);
  const existing = await Watchlist.findOne({ userId: userObjectId, name: 'Demo Watchlist' });
  if (existing) {
    existing.stocks = Array.from(new Set([...existing.stocks, ...symbols]));
    await existing.save();
  } else {
    await Watchlist.create({ userId: userObjectId, name: 'Demo Watchlist', stocks: symbols });
  }

  // Ensure every demo symbol already has at least one baseline snapshot, so the
  // shock below has something to compare against instead of being treated as a
  // "first snapshot ever" (which the engine intentionally never scores).
  for (const stock of DEFAULT_SCENARIO) {
    const baseline = await mockMarketDataProvider.getQuote(stock.symbol);
    await recordSnapshotAndDetectChanges(baseline);
  }

  for (const stock of DEFAULT_SCENARIO) {
    if (stock.event) {
      await Event.create({
        symbol: stock.symbol,
        type: stock.event.type,
        title: stock.event.title,
        description: stock.event.description,
        source: 'demo-simulation',
        timestamp: new Date(),
        confidence: 'HIGH',
      });
    }
    mockMarketDataProvider.queueShock(stock.symbol, {
      priceChangePercent: stock.priceChangePercent,
      volumeMultiplier: stock.volumeMultiplier,
    });
  }

  const changeIdsBefore = new Set(
    (await MarketChange.find({ userId: userObjectId }).select('_id').lean()).map((c) => String(c._id))
  );

  for (const stock of DEFAULT_SCENARIO) {
    const quote = await mockMarketDataProvider.getQuote(stock.symbol);
    await recordSnapshotAndDetectChanges(quote);
  }

  const freshChanges = await MarketChange.find({ userId: userObjectId })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();
  const newOnes = freshChanges.filter((c) => !changeIdsBefore.has(String(c._id)));

  return {
    stocksAnalyzed: DEFAULT_SCENARIO.length,
    meaningfulChanges: newOnes.length,
    requireAttention: newOnes.filter((c) => c.attentionLevel === 'HIGH' || c.attentionLevel === 'MEDIUM').length,
    changes: newOnes,
  };
}
