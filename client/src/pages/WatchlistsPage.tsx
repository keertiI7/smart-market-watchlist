import { FormEvent, useEffect, useState } from 'react';
import { Watchlist, StockSummary } from '../types';
import {
  fetchWatchlists,
  createWatchlist,
  renameWatchlist,
  deleteWatchlist,
  addStock,
  removeStock,
} from '../services/watchlistApi';
import { StockSearchInput } from '../components/StockSearchInput';
import { getErrorMessage } from '../services/api';

export function WatchlistsPage() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  async function load() {
    setLoading(true);
    try {
      setWatchlists(await fetchWatchlists());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const w = await createWatchlist(newName.trim());
      setWatchlists((prev) => [...prev, w]);
      setNewName('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteWatchlist(id);
      setWatchlists((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleRenameSubmit(id: string) {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      const updated = await renameWatchlist(id, renameValue.trim());
      setWatchlists((prev) => prev.map((w) => (w._id === id ? updated : w)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRenamingId(null);
    }
  }

  async function handleAddStock(watchlistId: string, stock: StockSummary) {
    try {
      const updated = await addStock(watchlistId, stock.symbol);
      setWatchlists((prev) => prev.map((w) => (w._id === watchlistId ? updated : w)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleRemoveStock(watchlistId: string, symbol: string) {
    try {
      const updated = await removeStock(watchlistId, symbol);
      setWatchlists((prev) => prev.map((w) => (w._id === watchlistId ? updated : w)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <div className="p-8 text-ink-muted">Loading watchlists…</div>;

  return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-2xl text-ink">Watchlists</h1>
      <p className="text-ink-muted mt-1">Organize the stocks you track into one or more lists.</p>

      {error && <p className="mt-4 text-sm text-signal-high">{error}</p>}

      <form onSubmit={handleCreate} className="mt-6 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New watchlist name…"
          className="flex-1 rounded-md border border-base-border bg-base-overlay px-3 py-2 text-sm text-ink focus-ring"
        />
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dim transition-colors focus-ring"
        >
          Create
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {watchlists.length === 0 && (
          <p className="text-ink-muted text-sm">No watchlists yet — create your first one above.</p>
        )}

        {watchlists.map((w) => (
          <div key={w._id} className="rounded-lg border border-base-border p-4">
            <div className="flex items-center justify-between gap-3">
              {renamingId === w._id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(w._id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(w._id)}
                  className="rounded-md border border-base-border bg-base-overlay px-2 py-1 text-sm text-ink focus-ring"
                />
              ) : (
                <h2 className="font-display text-lg text-ink">{w.name}</h2>
              )}
              <div className="flex gap-3 text-xs">
                <button
                  onClick={() => {
                    setRenamingId(w._id);
                    setRenameValue(w.name);
                  }}
                  className="text-ink-muted hover:text-ink transition-colors focus-ring rounded"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(w._id)}
                  className="text-ink-muted hover:text-signal-high transition-colors focus-ring rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-3">
              <StockSearchInput onSelect={(stock) => handleAddStock(w._id, stock)} placeholder="Add a stock…" />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {w.stocks.length === 0 && <span className="text-xs text-ink-faint">No stocks added yet.</span>}
              {w.stocks.map((symbol) => (
                <span
                  key={symbol}
                  className="inline-flex items-center gap-1.5 rounded-full border border-base-border bg-base-overlay px-3 py-1 text-xs text-ink"
                >
                  {symbol}
                  <button
                    onClick={() => handleRemoveStock(w._id, symbol)}
                    className="text-ink-faint hover:text-signal-high transition-colors focus-ring rounded"
                    aria-label={`Remove ${symbol}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
