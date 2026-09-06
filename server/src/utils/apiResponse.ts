import { Response } from 'express';

export function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const Errors = {
  badRequest: (message: string, code = 'BAD_REQUEST') => new ApiError(400, code, message),
  unauthorized: (message = 'Unauthorized', code = 'UNAUTHORIZED') => new ApiError(401, code, message),
  forbidden: (message = 'Forbidden', code = 'FORBIDDEN') => new ApiError(403, code, message),
  notFound: (message = 'Resource not found', code = 'NOT_FOUND') => new ApiError(404, code, message),
  conflict: (message: string, code = 'CONFLICT') => new ApiError(409, code, message),
  tooMany: (message = 'Too many requests', code = 'RATE_LIMITED') => new ApiError(429, code, message),
  server: (message = 'Something went wrong', code = 'SERVER_ERROR') => new ApiError(500, code, message),
  marketUnavailable: (message = 'Market data is currently unavailable.') =>
    new ApiError(503, 'MARKET_DATA_UNAVAILABLE', message),
};
