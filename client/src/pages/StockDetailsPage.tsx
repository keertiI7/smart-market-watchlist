import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Quote, MarketSnapshotPoint, EventItem, MarketChange } from '../types';
import { getQuote, getHistory, getEvents, fetchChanges } from '../services/marketApi';
import { getErrorMessage } from '../services/api';
import { DataFreshness } from '../components/DataFreshness';
import { ChangeCard } from '../components/ChangeCard';
import { formatInr, formatPercent, formatCompactNumber, timeAgo } from '../utils/format';

export function StockDetailsPage() {
  const { symbol = '' } = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<MarketSnapshotPoint[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [changes, setChanges] = useState<MarketChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [q, h, e, c] = await Promise.all([
          getQuote(symbol).catch(() => null),
          getHistory(symbol).catch(() => []),
          getEvents(symbol).catch(() => []),
          fetchChanges('all').catch(() => []),
        ]);
        if (cancelled) return;
        setQuote(q);
        setHistory(h);
        setEvents(e);
        setChanges(c.filter((change) => change.symbol === symbol));
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
  }, [symbol]);

  if (loading) return <div className="p-8 text-ink-muted">Loading {symbol}…</div>;

  const changePercent = quote ? ((quote.price - quote.previousClose) / quote.previousClose) * 100 : 0;
  const chartData = history.map((h) => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: h.price,
  }));

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="font-display text-3xl text-ink">{symbol}</h1>
        {quote && <DataFreshness status={quote.status} timestamp={quote.timestamp} />}
      </div>

      {error && <p className="mt-3 text-sm text-signal-high">{error}</p>}

      {quote ? (
        <>
          <div className="mt-4 flex items-baseline gap-4">
            <span className="font-mono text-4xl text-ink">{formatInr(quote.price)}</span>
            <span className={`font-mono text-lg ${changePercent >= 0 ? 'text-signal-low' : 'text-signal-high'}`}>
              {formatPercent(changePercent)}
            </span>
          </div>

          <div className="mt-8 rounded-lg border border-base-border p-4 h-64">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262E38" />
                  <XAxis dataKey="time" stroke="#5B6472" fontSize={12} tickLine={false} />
                  <YAxis stroke="#5B6472" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: '#161B22', border: '1px solid #262E38', borderRadius: 8 }}
                    labelStyle={{ color: '#8B93A1' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#4F8CFF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-ink-faint">
                Not enough history yet — check back after the next snapshot cycle.
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-ink-faint text-xs">Day range</div>
              <div className="text-ink font-mono mt-0.5">
                {formatInr(quote.low)} – {formatInr(quote.high)}
              </div>
            </div>
            <div>
              <div className="text-ink-faint text-xs">Volume</div>
              <div className="text-ink font-mono mt-0.5">{formatCompactNumber(quote.volume)}</div>
            </div>
            <div>
              <div className="text-ink-faint text-xs">Average volume</div>
              <div className="text-ink font-mono mt-0.5">{formatCompactNumber(quote.averageVolume)}</div>
            </div>
            <div>
              <div className="text-ink-faint text-xs">Market status</div>
              <div className="text-ink mt-0.5">{quote.marketStatus.replace('_', ' ')}</div>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-ink-muted text-sm">Market data for {symbol} is currently unavailable.</p>
      )}

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-wide text-ink-faint mb-3">Meaningful changes</h2>
        {changes.length === 0 ? (
          <p className="text-sm text-ink-muted">No meaningful changes recorded for {symbol} yet.</p>
        ) : (
          <div className="space-y-3">
            {changes.map((c) => (
              <ChangeCard key={c._id} change={c} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-wide text-ink-faint mb-3">News &amp; events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-ink-muted">No recent events for {symbol}.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((e) => (
              <li key={e._id} className="rounded-lg border border-base-border p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink">{e.title}</span>
                  <span className="text-ink-faint text-xs">{timeAgo(e.timestamp)}</span>
                </div>
                <p className="text-ink-muted text-sm mt-1">{e.description}</p>
                <span className="text-xs text-ink-faint mt-1 inline-block">
                  {e.type.replace('_', ' ')} · {e.confidence.toLowerCase()} confidence
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
