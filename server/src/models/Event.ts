import { Schema, model, Document, Types } from 'mongoose';

export type EventType =
  | 'EARNINGS'
  | 'DIVIDEND'
  | 'STOCK_SPLIT'
  | 'MERGER_ACQUISITION'
  | 'CORPORATE_ANNOUNCEMENT'
  | 'REGULATORY'
  | 'NEWS';

export interface IEvent extends Document {
  _id: Types.ObjectId;
  symbol: string;
  type: EventType;
  title: string;
  description: string;
  source: string;
  timestamp: Date;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

const eventSchema = new Schema<IEvent>({
  symbol: { type: String, required: true, uppercase: true, index: true },
  type: {
    type: String,
    enum: ['EARNINGS', 'DIVIDEND', 'STOCK_SPLIT', 'MERGER_ACQUISITION', 'CORPORATE_ANNOUNCEMENT', 'REGULATORY', 'NEWS'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  source: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  confidence: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
});

eventSchema.index({ symbol: 1, timestamp: -1 });

export const Event = model<IEvent>('Event', eventSchema);
