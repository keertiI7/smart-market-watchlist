import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import watchlistRoutes from './routes/watchlistRoutes';
import stockRoutes from './routes/stockRoutes';
import marketRoutes from './routes/marketRoutes';
import changeRoutes from './routes/changeRoutes';
import eventRoutes from './routes/eventRoutes';
import demoRoutes from './routes/demoRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json());
  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  // Generic rate limit - protects auth + write endpoints from abuse without
  // needing Redis for a hackathon-scale deployment.
  app.use(
    '/api/',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

  app.use('/api/auth', authRoutes);
  app.use('/api/watchlists', watchlistRoutes);
  app.use('/api/stocks', stockRoutes);
  app.use('/api/market', marketRoutes);
  app.use('/api/changes', changeRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/demo', demoRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
