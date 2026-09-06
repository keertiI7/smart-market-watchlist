import { Schema, model, Document, Types } from 'mongoose';

export interface IStock extends Document {
  _id: Types.ObjectId;
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
}

const stockSchema = new Schema<IStock>({
  symbol: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  name: { type: String, required: true },
  exchange: { type: String, required: true, default: 'NSE' },
  sector: { type: String, required: true, default: 'General' },
});

stockSchema.index({ name: 'text', symbol: 'text' });

export const Stock = model<IStock>('Stock', stockSchema);
