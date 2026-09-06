import { CHANGE_ENGINE_CONFIG as CFG } from './config';
import { dailyVolatilityPercent, percentChange, scaleClamped } from './statistics';
import { AttentionLevel } from '../../models/MarketChange';
import { EventType } from '../../models/Event';

export interface EngineInput {
  symbol: string;
  previousPrice: number;
  currentPrice: number;
  currentVolume: number;
  averageVolume: number;
  /** Prior close prices, oldest -> newest, used to derive this stock's own normal volatility. Excludes currentPrice. */
  priceHistory: number[];
  /** Corporate/news events for this symbol within the lookback window. */
  recentEvents: { type: EventType; title: string; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }[];
}

export interface EngineResult {
  changePercent: number;
  score: number;
  attentionLevel: AttentionLevel;
  isMeaningful: boolean;
  breakdown: {
    priceSignificance: number;
    volumeAnomaly: number;
    volatilityAnomaly: number;
    corporateEvent: number;
  };
  reasons: string[];
  observed: string[];
  possibleExplanation: string | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  normalVolatilityPercent: number;
  volumeRatio: number;
}

function attentionLevelForScore(score: number): AttentionLevel {
  const t = CFG.attentionThresholds;
  if (score >= t.high) return 'HIGH';
  if (score >= t.medium) return 'MEDIUM';
  if (score >= t.low) return 'LOW';
  return 'NONE';
}

/**
 * Deterministic, fully explainable scoring function (spec sections 10-12, 37).
 * No AI or randomness here - AI (if enabled) only phrases a summary of the
 * numbers this function already produced (see aiExplainer.ts).
 */
export function evaluateChange(input: EngineInput): EngineResult {
  const changePercent = percentChange(input.previousPrice, input.currentPrice);
  const absChange = Math.abs(changePercent);

  const normalVolatilityPercent =
    dailyVolatilityPercent(input.priceHistory) ?? CFG.defaultNormalVolatilityPercent;

  // --- A. Price significance (out of weights.priceSignificance) ---
  const priceMultiple = normalVolatilityPercent > 0 ? absChange / normalVolatilityPercent : absChange;
  const priceSignificance = scaleClamped(
    priceMultiple,
    0.5, // below half a "normal move" -> no points
    CFG.priceSignificanceSaturationMultiple,
    CFG.weights.priceSignificance
  );

  // --- B. Volume anomaly (out of weights.volumeAnomaly) ---
  const volumeRatio = input.averageVolume > 0 ? input.currentVolume / input.averageVolume : 1;
  const volumeAnomaly = scaleClamped(
    volumeRatio,
    CFG.volumeRatioFloor,
    CFG.volumeRatioSaturation,
    CFG.weights.volumeAnomaly
  );

  // --- C. Volatility anomaly (out of weights.volatilityAnomaly) ---
  // Distinct from price significance: this rewards "unusual FOR THIS STOCK"
  // using a steeper curve, so a normally-jumpy stock isn't flagged for a move
  // that's actually typical for it.
  const volatilityMultiple = normalVolatilityPercent > 0 ? absChange / normalVolatilityPercent : absChange;
  const volatilityAnomaly = scaleClamped(volatilityMultiple, 1, CFG.volatilitySaturationMultiple, CFG.weights.volatilityAnomaly);

  // --- D/E. Corporate events (out of weights.corporateEvent) ---
  let corporateEvent = 0;
  let topEvent: EngineInput['recentEvents'][number] | null = null;
  for (const event of input.recentEvents) {
    const points = CFG.eventPoints[event.type] ?? 0;
    if (points > corporateEvent) {
      corporateEvent = points;
      topEvent = event;
    }
  }
  corporateEvent = Math.min(corporateEvent, CFG.weights.corporateEvent);

  const score = Math.round(
    Math.min(100, priceSignificance + volumeAnomaly + volatilityAnomaly + corporateEvent)
  );

  const attentionLevel = attentionLevelForScore(score);
  const isMeaningful = score >= CFG.attentionThresholds.low;

  // --- Explainability (spec sections 15, 37) ---
  const reasons: string[] = [];
  const observed: string[] = [];

  if (priceSignificance > 0) {
    observed.push(
      `Price ${changePercent >= 0 ? 'rose' : 'fell'} ${absChange.toFixed(1)}%, vs a normal daily move of ~${normalVolatilityPercent.toFixed(1)}% for this stock.`
    );
    reasons.push('Price movement significantly above normal');
  }
  if (volumeAnomaly > 0) {
    observed.push(`Volume is ${volumeRatio.toFixed(1)}x its recent average.`);
    reasons.push(`Volume is ${volumeRatio.toFixed(1)}x historical average`);
  }
  if (volatilityAnomaly > 0 && priceSignificance === 0) {
    reasons.push('Unusually large movement versus this stock\'s normal volatility');
  }
  if (topEvent) {
    observed.push(`${topEvent.title}.`);
    reasons.push(`${formatEventType(topEvent.type)} detected`);
  }
  if (reasons.length === 0) {
    reasons.push('No significant deviation from normal trading pattern');
  }

  let possibleExplanation: string | null = null;
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' | null = null;
  if (topEvent) {
    possibleExplanation = `${formatEventType(topEvent.type)} may be contributing to the price movement.`;
    confidence = topEvent.confidence;
  } else if (volumeAnomaly > CFG.weights.volumeAnomaly * 0.6 && priceSignificance > 0) {
    possibleExplanation = 'Unusually heavy trading alongside the price move suggests a market-wide reaction, though the exact cause is not confirmed.';
    confidence = 'LOW';
  }

  return {
    changePercent,
    score,
    attentionLevel,
    isMeaningful,
    breakdown: {
      priceSignificance: Math.round(priceSignificance),
      volumeAnomaly: Math.round(volumeAnomaly),
      volatilityAnomaly: Math.round(volatilityAnomaly),
      corporateEvent: Math.round(corporateEvent),
    },
    reasons,
    observed,
    possibleExplanation,
    confidence,
    normalVolatilityPercent,
    volumeRatio,
  };
}

function formatEventType(type: EventType): string {
  const map: Record<EventType, string> = {
    EARNINGS: 'Earnings announcement',
    DIVIDEND: 'Dividend announcement',
    STOCK_SPLIT: 'Stock split',
    MERGER_ACQUISITION: 'Merger/acquisition news',
    CORPORATE_ANNOUNCEMENT: 'Major corporate announcement',
    REGULATORY: 'Regulatory event',
    NEWS: 'Major news',
  };
  return map[type];
}
