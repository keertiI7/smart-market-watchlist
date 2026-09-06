import { useEffect, useState } from 'react';
import { MarketChange } from '../types';
import { fetchChanges, markChangeRead, markChangeImportant, dismissChange } from '../services/marketApi';
import { ChangeCard } from '../components/ChangeCard';
import { getErrorMessage } from '../services/api';

const FILTERS: { key: 'all' | 'price' | 'volume' | 'news' | 'corporate'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'price', label: 'Price' },
  { key: 'volume', label: 'Volume' },
  { key: 'news', label: 'News' },
  { key: 'corporate', label: 'Corporate events' },
];

export function ChangeFeedPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [changes, setChanges] = useState<MarketChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(f: typeof filter) {
    setLoading(true);
    setError(null);
    try {
      setChanges(await fetchChanges(f));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function updateLocal(id: string, patch: Partial<MarketChange>) {
    setChanges((prev) => prev.map((c) => (c._id === id ? { ...c, ...patch } : c)));
  }

  async function handleMarkRead(id: string) {
    updateLocal(id, { isRead: true });
    try {
      await markChangeRead(id);
    } catch {
      /* best-effort */
    }
  }

  async function handleMarkImportant(id: string, important: boolean) {
    updateLocal(id, { isImportant: important });
    try {
      await markChangeImportant(id, important);
    } catch {
      /* best-effort */
    }
  }

  async function handleDismiss(id: string) {
    setChanges((prev) => prev.filter((c) => c._id !== id));
    try {
      await dismissChange(id);
    } catch {
      /* best-effort */
    }
  }

  return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-2xl text-ink">Change feed</h1>
      <p className="text-ink-muted mt-1">Every meaningful move detected across your watchlists.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors focus-ring ${
              filter === f.key
                ? 'bg-brand text-white'
                : 'border border-base-border text-ink-muted hover:text-ink hover:border-ink-faint'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-signal-high">{error}</p>}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-ink-muted text-sm">Loading…</p>}
        {!loading && changes.length === 0 && (
          <p className="text-ink-muted text-sm">No changes here yet. Try simulating market activity from the dashboard.</p>
        )}
        {changes.map((change) => (
          <ChangeCard
            key={change._id}
            change={change}
            showActions
            onMarkRead={handleMarkRead}
            onMarkImportant={handleMarkImportant}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  );
}
