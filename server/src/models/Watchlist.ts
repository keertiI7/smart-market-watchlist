import { Schema, model, Document, Types } from 'mongoose';

export interface IWatchlist extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  stocks: string[]; // stock symbols
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    stocks: { type: [String], default: [] },
  },
  { timestamps: true }
);

watchlistSchema.index({ userId: 1, name: 1 });

export const Watchlist = model<IWatchlist>('Watchlist', watchlistSchema);
