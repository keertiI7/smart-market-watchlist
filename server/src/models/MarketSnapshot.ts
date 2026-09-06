import { Schema, model, Document, Types } from 'mongoose';

export type DataStatus = 'LIVE' | 'DELAYED' | 'STALE' | 'UNAVAILABLE';

export interface IMarketSnapshot extends Document {
  _id: Types.ObjectId;
  symbol: string;
  price: number;
  previousClose: number;
  high: number;
  low: number;
  volume: number;
  averageVolume: number;
  timestamp: Date;
  source: string;
  status: DataStatus;
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'POST_MARKET' | 'UNAVAILABLE';
}

// Deliberately NOT embedded in Stock - this collection can grow unbounded,
// so it lives on its own with an index tuned for "latest snapshot per symbol" reads.
const marketSnapshotSchema = new Schema<IMarketSnapshot>({
  symbol: { type: String, required: true, uppercase: true, index: true },
  price: { type: Number, required: true },
  previousClose: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  volume: { type: Number, required: true },
  averageVolume: { type: Number, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  source: { type: String, required: true },
  status: {
    type: String,
    enum: ['LIVE', 'DELAYED', 'STALE', 'UNAVAILABLE'],
    default: 'LIVE',
  },
  marketStatus: {
    type: String,
    enum: ['OPEN', 'CLOSED', 'PRE_MARKET', 'POST_MARKET', 'UNAVAILABLE'],
    default: 'OPEN',
  },
});

// Fast "give me history for this symbol, newest first"
marketSnapshotSchema.index({ symbol: 1, timestamp: -1 });

export const MarketSnapshot = model<IMarketSnapshot>('MarketSnapshot', marketSnapshotSchema);
