import { Schema, model, Document, Types } from 'mongoose';

export type AttentionLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
export type ChangeType = 'PRICE' | 'VOLUME' | 'VOLATILITY' | 'EVENT' | 'COMPOSITE';

export interface IScoreBreakdown {
  priceSignificance: number;
  volumeAnomaly: number;
  volatilityAnomaly: number;
  corporateEvent: number;
}

export interface IMarketChange extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  symbol: string;
  type: ChangeType;
  oldValue: number;
  newValue: number;
  changePercent: number;
  score: number;
  scoreBreakdown: IScoreBreakdown;
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
  timestamp: Date;
}

const marketChangeSchema = new Schema<IMarketChange>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  symbol: { type: String, required: true, uppercase: true },
  type: { type: String, enum: ['PRICE', 'VOLUME', 'VOLATILITY', 'EVENT', 'COMPOSITE'], required: true },
  oldValue: { type: Number, required: true },
  newValue: { type: Number, required: true },
  changePercent: { type: Number, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  scoreBreakdown: {
    priceSignificance: { type: Number, default: 0 },
    volumeAnomaly: { type: Number, default: 0 },
    volatilityAnomaly: { type: Number, default: 0 },
    corporateEvent: { type: Number, default: 0 },
  },
  attentionLevel: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW', 'NONE'], required: true },
  reasons: { type: [String], default: [] },
  explanation: {
    observed: { type: [String], default: [] },
    possibleExplanation: { type: String, default: null },
    confidence: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW', null], default: null },
    aiGenerated: { type: Boolean, default: false },
  },
  isRead: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
  isDismissed: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now, required: true },
});

marketChangeSchema.index({ userId: 1, timestamp: -1 });
marketChangeSchema.index({ userId: 1, symbol: 1, timestamp: -1 });

export const MarketChange = model<IMarketChange>('MarketChange', marketChangeSchema);
