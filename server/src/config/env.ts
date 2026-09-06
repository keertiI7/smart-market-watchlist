import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongodbUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/smart-market-watchlist'),

  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  marketDataProvider: (process.env.MARKET_DATA_PROVIDER || 'mock') as 'mock' | 'real',
  marketDataApiKey: process.env.MARKET_DATA_API_KEY || '',
  newsApiKey: process.env.NEWS_API_KEY || '',

  aiApiKey: process.env.AI_API_KEY || '',
  aiApiUrl: process.env.AI_API_URL || 'https://api.anthropic.com/v1/messages',

  snapshotIntervalMinutes: parseInt(process.env.SNAPSHOT_INTERVAL_MINUTES || '5', 10),
};
