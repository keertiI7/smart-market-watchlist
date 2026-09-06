import { api } from './api';
import { Watchlist } from '../types';

export async function fetchWatchlists() {
  const res = await api.get<{ success: true; data: { watchlists: Watchlist[] } }>('/watchlists');
  return res.data.data.watchlists;
}

export async function createWatchlist(name: string) {
  const res = await api.post<{ success: true; data: { watchlist: Watchlist } }>('/watchlists', { name });
  return res.data.data.watchlist;
}

export async function renameWatchlist(id: string, name: string) {
  const res = await api.patch<{ success: true; data: { watchlist: Watchlist } }>(`/watchlists/${id}`, { name });
  return res.data.data.watchlist;
}

export async function deleteWatchlist(id: string) {
  await api.delete(`/watchlists/${id}`);
}

export async function addStock(watchlistId: string, symbol: string) {
  const res = await api.post<{ success: true; data: { watchlist: Watchlist } }>(
    `/watchlists/${watchlistId}/stocks`,
    { symbol }
  );
  return res.data.data.watchlist;
}

export async function removeStock(watchlistId: string, symbol: string) {
  const res = await api.delete<{ success: true; data: { watchlist: Watchlist } }>(
    `/watchlists/${watchlistId}/stocks/${symbol}`
  );
  return res.data.data.watchlist;
}
