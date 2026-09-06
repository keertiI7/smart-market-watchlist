import { connectDB, disconnectDB } from '../config/db';
import { Stock } from '../models/Stock';
import { STOCK_UNIVERSE } from '../services/marketData/stockUniverse';

async function seed() {
  await connectDB();

  for (const s of STOCK_UNIVERSE) {
    await Stock.updateOne(
      { symbol: s.symbol },
      { $set: { symbol: s.symbol, name: s.name, exchange: s.exchange, sector: s.sector } },
      { upsert: true }
    );
  }

  // eslint-disable-next-line no-console
  console.log(`[seed] upserted ${STOCK_UNIVERSE.length} stocks.`);
  await disconnectDB();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] failed:', err);
  process.exit(1);
});
