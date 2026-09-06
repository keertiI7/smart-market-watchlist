// All of these are deliberately centralized and named, per the assignment's
// "make it configurable" requirement (Module 11). Tune them here - nothing
// else in the codebase hard-codes a scoring number.
export const CHANGE_ENGINE_CONFIG = {
  weights: {
    priceSignificance: 35,
    volumeAnomaly: 25,
    volatilityAnomaly: 20,
    corporateEvent: 20,
  },

  // Used when a stock has no snapshot history yet to compute its own volatility from.
  defaultNormalVolatilityPercent: 1.4,

  // Price significance reaches full points once |change%| is this many multiples
  // of the stock's normal daily volatility.
  priceSignificanceSaturationMultiple: 4,

  // Volume ratio (current / average) mapped onto the volume-anomaly points.
  volumeRatioFloor: 1.2, // below this ratio -> 0 points
  volumeRatioSaturation: 4.0, // at/above this ratio -> full points

  // Volatility anomaly compares |change%| against normal volatility using a
  // steeper curve than price significance, to specifically reward "this is
  // unusual for THIS stock" rather than "this is a big number in general".
  volatilitySaturationMultiple: 3,

  // Corporate event points by event type (already 0-20, i.e. pre-scaled to the
  // corporateEvent weight above).
  eventPoints: {
    EARNINGS: 20,
    MERGER_ACQUISITION: 20,
    STOCK_SPLIT: 16,
    REGULATORY: 14,
    DIVIDEND: 10,
    CORPORATE_ANNOUNCEMENT: 12,
    NEWS: 6,
  } as Record<string, number>,

  // How far back an event still counts as "explaining" a change.
  eventLookbackHours: 24,

  attentionThresholds: {
    high: 80,
    medium: 50,
    low: 20,
  },
};
