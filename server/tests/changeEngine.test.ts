import { evaluateChange } from '../src/services/changeEngine';

// A quiet, low-volatility price history so "normal" is well defined.
const STABLE_HISTORY = [100, 100.3, 99.8, 100.1, 100.2, 99.9, 100.0, 100.1];

describe('evaluateChange - meaningful change engine', () => {
  it('does not flag a tiny price move with normal volume as meaningful', () => {
    const result = evaluateChange({
      symbol: 'TEST',
      previousPrice: 100,
      currentPrice: 100.2, // 0.2%
      currentVolume: 1_000_000,
      averageVolume: 1_000_000,
      priceHistory: STABLE_HISTORY,
      recentEvents: [],
    });

    expect(result.isMeaningful).toBe(false);
    expect(result.attentionLevel).toBe('NONE');
  });

  it('flags a large price drop with a big volume spike as HIGH attention', () => {
    const result = evaluateChange({
      symbol: 'TEST',
      previousPrice: 100,
      currentPrice: 94.8, // -5.2%
      currentVolume: 4_500_000,
      averageVolume: 1_000_000, // 4.5x - saturates the volume-anomaly score
      priceHistory: STABLE_HISTORY,
      recentEvents: [],
    });

    expect(result.isMeaningful).toBe(true);
    expect(result.attentionLevel).toBe('HIGH');
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.reasons.some((r) => r.toLowerCase().includes('volume'))).toBe(true);
  });

  it('treats a small move with no volume anomaly and no event as not meaningful', () => {
    const result = evaluateChange({
      symbol: 'TEST',
      previousPrice: 100,
      currentPrice: 100.3, // +0.3%
      currentVolume: 1_000_000,
      averageVolume: 1_000_000,
      priceHistory: STABLE_HISTORY,
      recentEvents: [],
    });

    expect(result.isMeaningful).toBe(false);
  });

  it('boosts the score and attention level when a corporate event is present', () => {
    const withoutEvent = evaluateChange({
      symbol: 'TEST',
      previousPrice: 100,
      currentPrice: 102.5,
      currentVolume: 1_400_000,
      averageVolume: 1_000_000,
      priceHistory: STABLE_HISTORY,
      recentEvents: [],
    });

    const withEvent = evaluateChange({
      symbol: 'TEST',
      previousPrice: 100,
      currentPrice: 102.5,
      currentVolume: 1_400_000,
      averageVolume: 1_000_000,
      priceHistory: STABLE_HISTORY,
      recentEvents: [{ type: 'EARNINGS', title: 'Company reports earnings', confidence: 'HIGH' }],
    });

    expect(withEvent.score).toBeGreaterThan(withoutEvent.score);
    expect(withEvent.possibleExplanation).toMatch(/earnings/i);
    expect(withEvent.confidence).toBe('HIGH');
  });

  it('never presents an inferred cause as a confirmed fact when there is no event', () => {
    const result = evaluateChange({
      symbol: 'TEST',
      previousPrice: 100,
      currentPrice: 94.8,
      currentVolume: 3_100_000,
      averageVolume: 1_000_000,
      priceHistory: STABLE_HISTORY,
      recentEvents: [],
    });

    if (result.possibleExplanation) {
      expect(result.confidence).not.toBe('HIGH');
    }
  });

  it('falls back to a default normal volatility when there is no price history (first snapshot case)', () => {
    const result = evaluateChange({
      symbol: 'TEST',
      previousPrice: 100,
      currentPrice: 99.9,
      currentVolume: 1_000_000,
      averageVolume: 1_000_000,
      priceHistory: [], // e.g. brand-new symbol
      recentEvents: [],
    });

    expect(result.normalVolatilityPercent).toBeGreaterThan(0);
    expect(result.isMeaningful).toBe(false);
  });

  it('handles zero average volume without throwing (edge case: zero volume)', () => {
    expect(() =>
      evaluateChange({
        symbol: 'TEST',
        previousPrice: 100,
        currentPrice: 105,
        currentVolume: 500_000,
        averageVolume: 0,
        priceHistory: STABLE_HISTORY,
        recentEvents: [],
      })
    ).not.toThrow();
  });

  it('handles a zero previous price without throwing (edge case: missing/invalid data)', () => {
    expect(() =>
      evaluateChange({
        symbol: 'TEST',
        previousPrice: 0,
        currentPrice: 105,
        currentVolume: 500_000,
        averageVolume: 500_000,
        priceHistory: [],
        recentEvents: [],
      })
    ).not.toThrow();
  });
});
