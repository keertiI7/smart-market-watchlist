export type AttentionLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type ChangeType = 'PRICE' | 'VOLUME' | 'VOLATILITY' | 'EVENT' | 'COMPOSITE';
export type DataStatus = 'LIVE' | 'DELAYED' | 'STALE' | 'UNAVAILABLE';
export type MarketStatus = 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'POST_MARKET' | 'UNAVAILABLE';

export interface User {
  id: string;
  name: string;
  email: string;
  lastSeenAt: string | null;
}

export interface Watchlist {
  _id: string;
  userId: string;
  name: string;
  stocks: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StockSummary {
  symbol: string;
  name: string;
  exchange: string;
  sector?: string;
}

export interface Quote {
  symbol: string;
  price: number;
  previousClose: number;
  high: number;
  low: number;
  volume: number;
  averageVolume: number;
  timestamp: string;
  source: string;
  status: DataStatus;
  marketStatus: MarketStatus;
}

export interface ScoreBreakdown {
  priceSignificance: number;
  volumeAnomaly: number;
  volatilityAnomaly: number;
  corporateEvent: number;
}

export interface MarketChange {
  _id: string;
  userId: string;
  symbol: string;
  type: ChangeType;
  oldValue: number;
  newValue: number;
  changePercent: number;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  attentionLevel: AttentionLevel;
  reasons: string[];
  explanation: {
    observed: string[];
    possibleExplanation: string | null;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW' | null;
    aiGenerated: boolean;
  };
  isRead: boolean;
  isImportant: boolean;
  isDismissed: boolean;
  timestamp: string;
}

export interface DashboardSummary {
  isFirstVisit: boolean;
  previousLastSeenAt: string | null;
  sinceLabel: string | null;
  meaningfulChanges: number;
  importantEvents: number;
  unchangedCount: number;
  watchedSymbolCount: number;
  needsAttention: MarketChange[];
  allChanges: MarketChange[];
}

export interface MarketSnapshotPoint {
  price: number;
  volume: number;
  timestamp: string;
}

export interface EventItem {
  _id: string;
  symbol: string;
  type: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}
export interface TopMover {
  symbol: string;
  changePercent: number;
  score: number;
  attentionLevel: AttentionLevel;
  timestamp: string;
}

export interface SectorBreakdownEntry {
  sector: string;
  count: number;
}

export interface ScoreTrendPoint {
  date: string;
  avgScore: number;
  count: number;
}

export interface AnalyticsOverview {
  totalWatchedStocks: number;
  totalChanges: number;
  averageScore: number;
  attentionBreakdown: Record<AttentionLevel, number>;
  mostFlaggedStock: { symbol: string; count: number; avgScore: number } | null;
  topMovers: TopMover[];
  sectorBreakdown: SectorBreakdownEntry[];
  scoreTrend: ScoreTrendPoint[];
}

export interface IndexSummary {
  name: string;
  value: number;
  change: number;
  changeAbsolute: number;
  open: number;
  previousClose: number;
  dayLow: number;
  dayHigh: number;
  weekLow52: number;
  weekHigh52: number;
  asOf: string | null;
}