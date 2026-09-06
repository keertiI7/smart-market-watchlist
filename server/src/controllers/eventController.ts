import { Request, Response } from 'express';
import { Event } from '../models/Event';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';

export const getEventsForSymbol = asyncHandler(async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const events = await Event.find({ symbol }).sort({ timestamp: -1 }).limit(50);
  ok(res, { symbol, events });
});
