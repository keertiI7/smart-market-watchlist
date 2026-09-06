import { useAuth } from '../context/AuthContext';
import { useCallback, useEffect, useState } from 'react';
import { DashboardSummary, Quote, Watchlist } from '../types';
import { fetchDashboardSummary, getQuote, markChangeRead, runDemoSimulation } from '../services/marketApi';
import { fetchWatchlists } from '../services/watchlistApi';
import { ChangeCard } from '../components/ChangeCard';
import { DataFreshness } from '../components/DataFreshness';
import { formatInr, formatPercent } from '../utils/format';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../services/api';
import { ChevronRight } from 'lucide-react';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, lists] = await Promise.all([fetchDashboardSummary(), fetchWatchlists()]);
      setSummary(summaryData);
      setWatchlists(lists);

      const allSymbols = Array.from(new Set(lists.flatMap((w) => w.stocks)));
      const results = await Promise.allSettled(allSymbols.map((s) => getQuote(s)));
      const map: Record<string, Quote> = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') map[allSymbols[i]] = r.value;
      });
      setQuotes(map);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSimulate() {
    setSimulating(true);
    try {
      await runDemoSimulation();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSimulating(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-ink-muted">Loading your briefing…</div>;
  }

  const allSymbols = Array.from(new Set(watchlists.flatMap((w) => w.stocks)));

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink">
            {greeting()}, {capitalize(user?.name?.split(' ')[0] ?? '')}!
          </h1>
          {summary?.isFirstVisit ? (
            <p className="text-ink-muted mt-1 max-w-md">
              Welcome! We're learning your watchlist. Meaningful changes will appear here after enough market data
              is collected — try the simulation below to see it in action right away.
            </p>
          ) : (
            <p className="text-ink-muted mt-1">
              You last checked {summary?.sinceLabel} ago.{' '}
              {summary && summary.meaningfulChanges > 0
                ? `${summary.meaningfulChanges} meaningful change${summary.meaningfulChanges === 1 ? '' : 's'} since then.`
                : 'Nothing meaningful has moved since then.'}
            </p>
          )}
        </div>
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="rounded-md border border-base-border px-4 py-2 text-sm text-ink hover:border-brand hover:text-brand transition-colors focus-ring disabled:opacity-60"
        >
          {simulating ? 'Simulating…' : 'Simulate market changes'}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-signal-high">{error}</p>}

      {summary && summary.needsAttention.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs uppercase tracking-wide text-ink-faint mb-3">Needs your attention</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {summary.needsAttention.map((change) => (
              <ChangeCard key={change._id} change={change} onMarkRead={markChangeRead} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs uppercase tracking-wide text-ink-faint">Your watchlist</h2>
          <Link to="/watchlists" className="text-xs text-brand hover:underline focus-ring rounded">
            Manage watchlists
          </Link>
        </div>
        <p className="text-xs text-ink-faint mb-3">Click any stock for its chart, meaningful changes and news.</p>

        {allSymbols.length === 0 ? (
          <div className="rounded-lg border border-dashed border-base-border p-8 text-center">
            <p className="text-ink-muted">You haven't added any stocks yet.</p>
            <Link
              to="/watchlists"
              className="inline-block mt-3 rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-dim transition-colors focus-ring"
            >
              Add your first stock
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {allSymbols.map((symbol) => {
              const q = quotes[symbol];
              return (
                <Link
                  key={symbol}
                  to={`/stocks/${symbol}`}
                  className="group flex items-center justify-between gap-4 rounded-lg border border-base-border px-4 py-3.5 hover:border-brand/40 hover:bg-base-raised transition-colors focus-ring"
                >
                  <div>
                    <div className="text-ink font-medium">{symbol}</div>
                    {q && <DataFreshness status={q.status} timestamp={q.timestamp} />}
                  </div>
                  <div className="flex items-center gap-3">
                    {q ? (
                      <div className="text-right">
                        <div className="font-mono text-ink">{formatInr(q.price)}</div>
                        <div
                          className={`text-sm font-mono ${
                            q.price >= q.previousClose ? 'text-signal-low' : 'text-signal-high'
                          }`}
                        >
                          {formatPercent(((q.price - q.previousClose) / q.previousClose) * 100)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-faint">Unavailable</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-ink-faint group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}