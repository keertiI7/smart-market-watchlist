import { Request, Response } from 'express';
import { runDemoSimulation } from '../services/demoService';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/apiResponse';

export const simulate = asyncHandler(async (req: Request, res: Response) => {
  const result = await runDemoSimulation(req.user!.userId);
  ok(res, result);
});
