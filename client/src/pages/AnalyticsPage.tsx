import { useEffect, useMemo, useState } from 'react';
import { IndexOverviewCard } from '../components/IndexOverviewCard';
import { IndexSummary } from '../types';
import { fetchIndices } from '../services/marketApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AnalyticsOverview, Quote, Watchlist, MarketSnapshotPoint } from '../types';
import { fetchAnalyticsOverview } from '../services/analyticsApi';
import { fetchWatchlists } from '../services/watchlistApi';
import { getQuote, getHistory } from '../services/marketApi';
import { getErrorMessage } from '../services/api';
import { AttentionBadge } from '../components/AttentionBadge';
import { CandlestickChart, Candle } from '../components/CandlestickChart';
import { formatPercent, timeAgo } from '../utils/format';
import { Link } from 'react-router-dom';

const ATTENTION_COLORS: Record<string, string> = {
  HIGH: 'rgb(var(--color-signal-high))',
  MEDIUM: 'rgb(var(--color-signal-medium))',
  LOW: 'rgb(var(--color-signal-low))',
  NONE: 'rgb(var(--color-signal-none))',
};

const SECTOR_COLORS = ['#4F8CFF', '#3FBF83', '#E8A23F', '#E8543F', '#8B5CF6', '#22D3EE', '#F472B6'];

const tooltipStyle = {
  background: 'rgb(var(--color-base-raised))',
  border: '1px solid rgb(var(--color-base-border))',
  borderRadius: 8,
  color: 'rgb(var(--color-ink))',
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-base-border p-4">
      <div className="text-xs text-ink-faint uppercase tracking-wide">{label}</div>
      <div className="font-display text-2xl text-ink mt-1">{value}</div>
      {sub && <div className="text-xs text-ink-muted mt-0.5">{sub}</div>}
    </div>
  );
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [candlesLoading, setCandlesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indices, setIndices] = useState<IndexSummary[]>([]);

  const watchedSymbols = useMemo(
    () => Array.from(new Set(watchlists.flatMap((w) => w.stocks))),
    [watchlists]
  );

  useEffect(() => {
    fetchIndices().then(setIndices).catch(() => setIndices([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [overview, lists] = await Promise.all([fetchAnalyticsOverview(), fetchWatchlists()]);
        if (cancelled) return;
        setData(overview);
        setWatchlists(lists);

        const symbols = Array.from(new Set(lists.flatMap((w) => w.stocks)));
        const results = await Promise.allSettled(symbols.map((s) => getQuote(s)));
        const map: Record<string, Quote> = {};
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') map[symbols[i]] = r.value;
        });
        if (cancelled) return;
        setQuotes(map);
        if (symbols.length > 0) setSelectedSymbol(symbols[0]);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedSymbol) return;
    let cancelled = false;
    async function loadCandles() {
      setCandlesLoading(true);
      try {
        const history = await getHistory(selectedSymbol, 40);
        if (cancelled) return;
        const mapped: Candle[] = (history as MarketSnapshotPoint[]).map((h: any, i, arr) => ({
          time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open: i === 0 ? h.previousClose ?? h.price : arr[i - 1].price,
          close: h.price,
          high: h.high ?? h.price,
          low: h.low ?? h.price,
        }));
        setCandles(mapped);
      } catch {
        if (!cancelled) setCandles([]);
      } finally {
        if (!cancelled) setCandlesLoading(false);
      }
    }
    loadCandles();
    return () => {
      cancelled = true;
    };
  }, [selectedSymbol]);

  if (loading) return <div className="p-8 text-ink-muted">Crunching your watchlist…</div>;
  if (error) return <div className="p-8 text-signal-high text-sm">{error}</div>;
  if (!data) return null;

  const attentionData = Object.entries(data.attentionBreakdown).map(([level, count]) => ({ level, count }));
  const sectorData = data.sectorBreakdown;

  const statusData = watchedSymbols
    .filter((s) => quotes[s])
    .map((s) => {
      const q = quotes[s];
      const changePercent = ((q.price - q.previousClose) / q.previousClose) * 100;
      return { symbol: s, changePercent };
    });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-2xl text-ink">Analytics</h1>
      <p className="text-ink-muted mt-1">A statistical view across everything detected in your watchlists.</p>

      {indices.length > 0 && (
        <section className="mt-6 grid md:grid-cols-2 gap-4">
          {indices.map((idx) => (
            <IndexOverviewCard key={idx.name} index={idx} />
          ))}
        </section>
      )}

      {data.totalChanges === 0 && statusData.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-base-border p-8 text-center">
          <p className="text-ink-muted">No data yet — add stocks to a watchlist and simulate some market changes.</p>
          <Link to="/dashboard" className="inline-block mt-3 text-sm text-brand hover:underline focus-ring rounded">
            Go to dashboard
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Watched stocks" value={String(data.totalWatchedStocks)} />
            <StatCard label="Total changes" value={String(data.totalChanges)} />
            <StatCard label="Average score" value={data.averageScore.toFixed(0)} sub="out of 100" />
            <StatCard
              label="Most flagged"
              value={data.mostFlaggedStock?.symbol ?? '—'}
              sub={data.mostFlaggedStock ? `${data.mostFlaggedStock.count} times` : undefined}
            />
          </div>

          {statusData.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xs uppercase tracking-wide text-ink-faint mb-3">Current watchlist status</h2>
              <div className="rounded-lg border border-base-border p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-base-border))" />
                    <XAxis dataKey="symbol" stroke="rgb(var(--color-ink-faint))" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="rgb(var(--color-ink-faint))"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatPercent(v)} />
                    <Bar dataKey="changePercent" radius={[4, 4, 4, 4]}>
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.symbol}
                          fill={entry.changePercent >= 0 ? 'rgb(var(--color-signal-low))' : 'rgb(var(--color-signal-high))'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {watchedSymbols.length > 0 && (
            <section className="mt-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs uppercase tracking-wide text-ink-faint">Market candles</h2>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="rounded-md border border-base-border bg-base-overlay px-2 py-1 text-xs text-ink focus-ring"
                >
                  {watchedSymbols.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg border border-base-border p-4 h-64">
                {candlesLoading ? (
                  <div className="h-full flex items-center justify-center text-sm text-ink-faint">Loading candles…</div>
                ) : (
                  <CandlestickChart data={candles} />
                )}
              </div>
              <p className="text-xs text-ink-faint mt-2">
                Each candle reflects one snapshot cycle, not true intraday ticks.
              </p>
            </section>
          )}

          {data.scoreTrend.length > 1 && (
            <section className="mt-10">
              <h2 className="text-xs uppercase tracking-wide text-ink-faint mb-3">Score trend (last 14 days)</h2>
              <div className="rounded-lg border border-base-border p-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-base-border))" />
                    <XAxis dataKey="date" stroke="rgb(var(--color-ink-faint))" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgb(var(--color-ink-faint))" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="avgScore" stroke="rgb(var(--color-brand))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          <div className="mt-10 grid md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-xs uppercase tracking-wide text-ink-faint mb-3">Attention breakdown</h2>
              <div className="rounded-lg border border-base-border p-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attentionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-base-border))" />
                    <XAxis dataKey="level" stroke="rgb(var(--color-ink-faint))" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgb(var(--color-ink-faint))" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {attentionData.map((entry) => (
                        <Cell key={entry.level} fill={ATTENTION_COLORS[entry.level]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {sectorData.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-wide text-ink-faint mb-3">Sector exposure</h2>
                <div className="rounded-lg border border-base-border p-4 h-56 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sectorData} dataKey="count" nameKey="sector" outerRadius={70} label={(e) => e.sector}>
                        {sectorData.map((entry, i) => (
                          <Cell key={entry.sector} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </div>

          {data.topMovers.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xs uppercase tracking-wide text-ink-faint mb-3">Biggest movers</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.topMovers.map((m, i) => (
                  <Link
                    key={i}
                    to={`/stocks/${m.symbol}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-base-border px-4 py-3 hover:border-brand/40 hover:bg-base-raised transition-colors focus-ring"
                  >
                    <div>
                      <div className="text-ink font-medium">{m.symbol}</div>
                      <div className="text-xs text-ink-faint">{timeAgo(m.timestamp)}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono ${m.changePercent >= 0 ? 'text-signal-low' : 'text-signal-high'}`}>
                        {formatPercent(m.changePercent)}
                      </div>
                      <AttentionBadge level={m.attentionLevel} score={m.score} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}