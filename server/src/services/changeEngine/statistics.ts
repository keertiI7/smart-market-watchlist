/** Percent change from one price to another. */
export function percentChange(oldValue: number, newValue: number): number {
  if (!oldValue) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Standard deviation of daily percent-change, from a series of prices ordered
 * oldest -> newest. Used as the stock's own "normal movement" baseline instead
 * of a single fixed threshold for every stock (spec section 10A).
 */
export function dailyVolatilityPercent(pricesOldToNew: number[]): number | null {
  if (pricesOldToNew.length < 3) return null;

  const changes: number[] = [];
  for (let i = 1; i < pricesOldToNew.length; i++) {
    changes.push(percentChange(pricesOldToNew[i - 1], pricesOldToNew[i]));
  }

  const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
  const variance = changes.reduce((a, b) => a + (b - mean) ** 2, 0) / changes.length;
  return Math.sqrt(variance);
}

/** Linearly scales `value` from [floor, ceiling] onto [0, maxPoints], clamped. */
export function scaleClamped(value: number, floor: number, ceiling: number, maxPoints: number): number {
  if (ceiling <= floor) return value >= ceiling ? maxPoints : 0;
  const ratio = (value - floor) / (ceiling - floor);
  return Math.max(0, Math.min(1, ratio)) * maxPoints;
}
