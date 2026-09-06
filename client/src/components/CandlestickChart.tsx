import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

function CandleShape(props: any) {
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload as Candle;
  if (high === low) return null;

  const isUp = close >= open;
  const color = isUp ? 'rgb(var(--color-signal-low))' : 'rgb(var(--color-signal-high))';
  const priceToY = (price: number) => y + ((high - price) / (high - low)) * height;

  const bodyTop = priceToY(Math.max(open, close));
  const bodyBottom = priceToY(Math.min(open, close));
  const bodyHeight = Math.max(1.5, bodyBottom - bodyTop);
  const wickX = x + width / 2;
  const bodyX = x + width * 0.22;
  const bodyWidth = width * 0.56;

  return (
    <g>
      <line x1={wickX} x2={wickX} y1={y} y2={y + height} stroke={color} strokeWidth={1.5} />
      <rect x={bodyX} y={bodyTop} width={bodyWidth} height={bodyHeight} fill={color} rx={1} />
    </g>
  );
}

export function CandlestickChart({ data }: { data: Candle[] }) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-ink-faint">
        Not enough history yet for candles.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-base-border))" />
        <XAxis dataKey="time" stroke="rgb(var(--color-ink-faint))" fontSize={11} tickLine={false} />
        <YAxis stroke="rgb(var(--color-ink-faint))" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{
            background: 'rgb(var(--color-base-raised))',
            border: '1px solid rgb(var(--color-base-border))',
            borderRadius: 8,
            color: 'rgb(var(--color-ink))',
          }}
          formatter={(_value: unknown, _name: unknown, item: any) => {
            const c = item.payload as Candle;
            return [`O ${c.open} · H ${c.high} · L ${c.low} · C ${c.close}`, ''];
          }}
        />
        <Bar dataKey={(d: Candle) => [d.low, d.high]} shape={<CandleShape />} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}