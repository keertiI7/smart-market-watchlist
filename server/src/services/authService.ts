import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export function signToken(userId: string): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ userId }, env.jwtSecret, options);
}
