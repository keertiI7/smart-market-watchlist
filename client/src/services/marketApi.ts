
import { api } from './api';
import { StockSummary, Quote, MarketChange, DashboardSummary, MarketSnapshotPoint, EventItem, IndexSummary } from '../types';

export async function fetchIndices() {
  const res = await api.get<{ success: true; data: { indices: IndexSummary[] } }>('/market/indices/summary');
  return res.data.data.indices;
}

export async function searchStocks(query: string) {
  if (!query.trim()) return [];
  const res = await api.get<{ success: true; data: { results: StockSummary[] } }>('/stocks/search', {
    params: { q: query },
  });
  return res.data.data.results;
}

export async function getStock(symbol: string) {
  const res = await api.get<{ success: true; data: { stock: StockSummary } }>(`/stocks/${symbol}`);
  return res.data.data.stock;
}

export async function getQuote(symbol: string) {
  const res = await api.get<{ success: true; data: { quote: Quote } }>(`/market/${symbol}`);
  return res.data.data.quote;
}

export async function getHistory(symbol: string, limit = 60) {
  const res = await api.get<{ success: true; data: { symbol: string; history: MarketSnapshotPoint[] } }>(
    `/market/${symbol}/history`,
    { params: { limit } }
  );
  return res.data.data.history;
}

export async function getEvents(symbol: string) {
  const res = await api.get<{ success: true; data: { events: EventItem[] } }>(`/events/${symbol}`);
  return res.data.data.events;
}

type ChangeFilter = 'all' | 'price' | 'volume' | 'news' | 'corporate';

export async function fetchChanges(filter: ChangeFilter = 'all') {
  const res = await api.get<{ success: true; data: { changes: MarketChange[] } }>('/changes', {
    params: { filter },
  });
  return res.data.data.changes;
}

export async function markChangeRead(id: string) {
  await api.patch(`/changes/${id}/read`);
}

export async function markChangeImportant(id: string, important: boolean) {
  await api.patch(`/changes/${id}/important`, { important });
}

export async function dismissChange(id: string) {
  await api.patch(`/changes/${id}/dismiss`);
}

export async function fetchDashboardSummary() {
  const res = await api.get<{ success: true; data: DashboardSummary }>('/changes/dashboard-summary');
  return res.data.data;
}

export async function runDemoSimulation() {
  const res = await api.post<{
    success: true;
    data: { stocksAnalyzed: number; meaningfulChanges: number; requireAttention: number; changes: MarketChange[] };
  }>('/demo/simulate');
  return res.data.data;
}

