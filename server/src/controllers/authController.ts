import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, Errors } from '../utils/apiResponse';
import { signToken } from '../services/authService';

function serializeUser(user: { _id: unknown; name: string; email: string; lastSeenAt: Date | null }) {
  return { id: String(user._id), name: user.name, email: user.email, lastSeenAt: user.lastSeenAt };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw Errors.conflict('An account with that email already exists.', 'EMAIL_TAKEN');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

  const token = signToken(String(user._id));
  ok(res, { user: serializeUser(user), token }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw Errors.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw Errors.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  const token = signToken(String(user._id));
  ok(res, { user: serializeUser(user), token });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw Errors.notFound('User not found');
  ok(res, { user: serializeUser(user) });
});
