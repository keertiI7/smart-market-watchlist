import { DataStatus } from '../types';
import { timeAgo } from '../utils/format';

const CONFIG: Record<DataStatus, { dot: string; label: string }> = {
  LIVE: { dot: 'bg-signal-low', label: 'Live' },
  DELAYED: { dot: 'bg-signal-medium', label: 'Delayed' },
  STALE: { dot: 'bg-signal-medium', label: 'Stale' },
  UNAVAILABLE: { dot: 'bg-signal-high', label: 'Data unavailable' },
};

export function DataFreshness({ status, timestamp }: { status: DataStatus; timestamp?: string }) {
  const c = CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} aria-hidden />
      {c.label}
      {timestamp && status !== 'UNAVAILABLE' && <span>· Updated {timeAgo(timestamp)}</span>}
    </span>
  );
}
