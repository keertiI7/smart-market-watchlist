import { env } from '../../config/env';
import { MarketDataProvider } from './marketDataProvider';
import { mockMarketDataProvider } from './mockMarketDataProvider';
import { RealMarketDataProvider } from './realMarketDataProvider';

let provider: MarketDataProvider;

if (env.marketDataProvider === 'real' && env.marketDataApiKey) {
  provider = new RealMarketDataProvider();
} else {
  // Falls back to mock automatically if "real" was requested but no API key was
  // set, so the app never hard-fails just because a vendor key is missing.
  provider = mockMarketDataProvider;
}

export const marketDataProvider: MarketDataProvider = provider;
export { mockMarketDataProvider } from './mockMarketDataProvider';
export * from './marketDataProvider';
