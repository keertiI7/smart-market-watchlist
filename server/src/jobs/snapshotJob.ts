import { env } from '../config/env';
import { marketDataProvider } from '../services/marketData';
import { getAllWatchedSymbols, recordSnapshotAndDetectChanges } from '../services/snapshotService';

let timer: ReturnType<typeof setInterval> | null = null;

async function runOnce(): Promise<void> {
  const symbols = await getAllWatchedSymbols();
  if (symbols.length === 0) return;

  for (const symbol of symbols) {
    try {
      const quote = await marketDataProvider.getQuote(symbol);
      if (quote.status === 'UNAVAILABLE') continue; // external API failure -> skip, don't crash the job
      await recordSnapshotAndDetectChanges(quote);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[snapshotJob] failed for ${symbol}:`, err);
    }
  }
}

/** Does NOT depend on any browser being open (spec Module 33). */
export function startSnapshotJob(): void {
  if (timer) return;
  const intervalMs = Math.max(1, env.snapshotIntervalMinutes) * 60 * 1000;
  // Run once shortly after boot, then on the configured interval.
  setTimeout(() => void runOnce(), 5000);
  timer = setInterval(() => void runOnce(), intervalMs);
  // eslint-disable-next-line no-console
  console.log(`[snapshotJob] scheduled every ${env.snapshotIntervalMinutes}m`);
}

export function stopSnapshotJob(): void {
  if (timer) clearInterval(timer);
  timer = null;
}

export const __testables = { runOnce };
