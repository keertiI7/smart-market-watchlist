interface TickerStock {
  symbol: string;
  price: number;
  change: number;
}

const TICKER_STOCKS: TickerStock[] = [
  { symbol: 'RELIANCE', price: 1245.5, change: -5.4 },
  { symbol: 'TCS', price: 3842.5, change: 3.2 },
  { symbol: 'HDFCBANK', price: 1762.0, change: 0.4 },
  { symbol: 'INFY', price: 1810.2, change: 0.2 },
  { symbol: 'ICICIBANK', price: 1204.8, change: 1.1 },
  { symbol: 'HINDUNILVR', price: 2456.3, change: -0.6 },
  { symbol: 'SBIN', price: 832.4, change: 2.3 },
  { symbol: 'BHARTIARTL', price: 1598.9, change: -1.8 },
  { symbol: 'ITC', price: 468.7, change: 0.5 },
  { symbol: 'LT', price: 3567.1, change: 1.6 },
  { symbol: 'MARUTI', price: 12480.0, change: -2.1 },
  { symbol: 'WIPRO', price: 524.6, change: 0.9 },
];

function TickerItem({ stock }: { stock: TickerStock }) {
  const isUp = stock.change >= 0;
  return (
    <div className="flex items-center gap-2.5 px-6 shrink-0 border-r border-base-border/60">
      <span className="text-sm font-medium text-ink-muted">{stock.symbol}</span>
      <span className="font-mono text-sm text-ink">
        ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
      <span
        className={`font-mono text-sm flex items-center gap-0.5 ${
          isUp ? 'text-signal-low' : 'text-signal-high'
        }`}
      >
        <span aria-hidden>{isUp ? '▲' : '▼'}</span>
        {Math.abs(stock.change).toFixed(1)}%
      </span>
    </div>
  );
}

export function TickerTape() {
  const doubled = [...TICKER_STOCKS, ...TICKER_STOCKS];

  return (
    <div className="relative border-y border-base-border bg-base-raised/60 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-1.5 bg-base-raised px-3 border-r border-base-border">
        <span className="h-1.5 w-1.5 rounded-full bg-signal-low animate-pulse" aria-hidden />
        <span className="text-[10px] uppercase tracking-wider text-ink-faint font-medium">Live</span>
      </div>
      <div className="flex w-max animate-ticker py-2.5 pl-20">
        {doubled.map((s, i) => (
          <TickerItem key={i} stock={s} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-base to-transparent" />
    </div>
  );
}