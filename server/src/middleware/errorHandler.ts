import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiResponse';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}` },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ success: false, error: { code: err.code, message: err.message } });
    return;
  }

  // Mongoose validation errors
  if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: (err as Error).message },
    });
    return;
  }

  // Mongo duplicate key
  if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
    res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_KEY', message: 'A record with that value already exists.' },
    });
    return;
  }

  // Never leak internals/stack traces in production logs or responses.
  if (env.nodeEnv !== 'test') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(500).json({
    success: false,
    error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' },
  });
}
