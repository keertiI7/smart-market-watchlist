import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { startSnapshotJob } from './jobs/snapshotJob';

async function main() {
  await connectDB();

  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`);
    // eslint-disable-next-line no-console
    console.log(`[server] market data provider: ${env.marketDataProvider}`);
  });

  startSnapshotJob();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] fatal startup error:', err);
  process.exit(1);
});
