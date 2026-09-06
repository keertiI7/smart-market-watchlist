import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../src/app';
import { recordSnapshotAndDetectChanges } from '../src/services/snapshotService';
import { MarketSnapshot } from '../src/models/MarketSnapshot';
import { MarketChange } from '../src/models/MarketChange';
import { User } from '../src/models/User';
import { Watchlist } from '../src/models/Watchlist';

let mongo: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

describe('Auth flow', () => {
  it('registers, then logs in, then fetches the current user', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Keerti',
      email: 'keerti@example.com',
      password: 'password123',
    });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.user.email).toBe('keerti@example.com');

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'keerti@example.com',
      password: 'password123',
    });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.token;
    expect(typeof token).toBe('string');

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.name).toBe('Keerti');
  });

  it('rejects login with a wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Keerti',
      email: 'keerti2@example.com',
      password: 'password123',
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'keerti2@example.com', password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects a protected route with no token', async () => {
    const res = await request(app).get('/api/watchlists');
    expect(res.status).toBe(401);
  });
});

describe('Snapshot service edge cases', () => {
  it('does not create a MarketChange on the very first snapshot for a symbol', async () => {
    const result = await recordSnapshotAndDetectChanges({
      symbol: 'FIRSTTEST',
      price: 100,
      previousClose: 100,
      high: 100,
      low: 100,
      volume: 1_000_000,
      averageVolume: 1_000_000,
      timestamp: new Date(),
      source: 'test',
      status: 'LIVE',
      marketStatus: 'OPEN',
    });

    expect(result.changesForUsers).toBe(0);
    const snapshotCount = await MarketSnapshot.countDocuments({ symbol: 'FIRSTTEST' });
    expect(snapshotCount).toBe(1);
  });

  it('creates a MarketChange for a watching user when a second snapshot is a meaningful move', async () => {
    const user = await User.create({ name: 'Watcher', email: 'watcher@example.com', passwordHash: 'x' });
    await Watchlist.create({ userId: user._id, name: 'My List', stocks: ['SHOCKTEST'] });

    await recordSnapshotAndDetectChanges({
      symbol: 'SHOCKTEST',
      price: 100,
      previousClose: 100,
      high: 100,
      low: 100,
      volume: 1_000_000,
      averageVolume: 1_000_000,
      timestamp: new Date(),
      source: 'test',
      status: 'LIVE',
      marketStatus: 'OPEN',
    });

    const result = await recordSnapshotAndDetectChanges({
      symbol: 'SHOCKTEST',
      price: 94.5, // -5.5%
      previousClose: 100,
      high: 100,
      low: 94.5,
      volume: 3_500_000, // 3.5x average
      averageVolume: 1_000_000,
      timestamp: new Date(),
      source: 'test',
      status: 'LIVE',
      marketStatus: 'OPEN',
    });

    expect(result.changesForUsers).toBe(1);
    const changes = await MarketChange.find({ userId: user._id });
    expect(changes).toHaveLength(1);
    expect(changes[0].attentionLevel).toBe('HIGH');
  });

  it('skips change detection gracefully when the quote is UNAVAILABLE-shaped (missing data)', async () => {
    const result = await recordSnapshotAndDetectChanges({
      symbol: 'STALETEST',
      price: 0,
      previousClose: 0,
      high: 0,
      low: 0,
      volume: 0,
      averageVolume: 0,
      timestamp: new Date(),
      source: 'test',
      status: 'UNAVAILABLE',
      marketStatus: 'UNAVAILABLE',
    });

    // Still stores the snapshot for audit purposes, but produces no changes since
    // there is nothing meaningful to compare (zero previous price, zero volume).
    expect(result.created).toBe(true);
    expect(result.changesForUsers).toBe(0);
  });
});
