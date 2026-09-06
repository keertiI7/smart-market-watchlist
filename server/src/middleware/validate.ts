import { Request, Response, NextFunction } from 'express';
import { Errors } from '../utils/apiResponse';

type Rule = { field: string; required?: boolean; type?: 'string' | 'number' | 'array'; minLength?: number };

/**
 * Deliberately dependency-free request validator. Good enough for a hackathon
 * scope without pulling in zod/joi - keeps the install footprint small.
 */
export function validateBody(rules: Rule[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const rule of rules) {
      const value = req.body?.[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        next(Errors.badRequest(`"${rule.field}" is required.`, 'VALIDATION_ERROR'));
        return;
      }
      if (value === undefined || value === null) continue;

      if (rule.type === 'string' && typeof value !== 'string') {
        next(Errors.badRequest(`"${rule.field}" must be a string.`, 'VALIDATION_ERROR'));
        return;
      }
      if (rule.type === 'number' && typeof value !== 'number') {
        next(Errors.badRequest(`"${rule.field}" must be a number.`, 'VALIDATION_ERROR'));
        return;
      }
      if (rule.type === 'array' && !Array.isArray(value)) {
        next(Errors.badRequest(`"${rule.field}" must be an array.`, 'VALIDATION_ERROR'));
        return;
      }
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        next(
          Errors.badRequest(`"${rule.field}" must be at least ${rule.minLength} characters.`, 'VALIDATION_ERROR')
        );
        return;
      }
    }
    next();
  };
}
