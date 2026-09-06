import { Link } from 'react-router-dom';
import { MarketChange } from '../types';
import { formatPercent, timeAgo, attentionBg } from '../utils/format';
import { AttentionBadge } from './AttentionBadge';

interface Props {
  change: MarketChange;
  onMarkRead?: (id: string) => void;
  onMarkImportant?: (id: string, important: boolean) => void;
  onDismiss?: (id: string) => void;
  showActions?: boolean;
}

export function ChangeCard({ change, onMarkRead, onMarkImportant, onDismiss, showActions }: Props) {
  const isUp = change.changePercent >= 0;

  return (
    <div className={`rounded-lg border p-4 ${attentionBg(change.attentionLevel)}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/stocks/${change.symbol}`}
            className="font-display text-lg text-ink hover:text-brand transition-colors focus-ring rounded"
            onClick={() => onMarkRead?.(change._id)}
          >
            {change.symbol}
          </Link>
          <div className={`font-mono text-2xl mt-0.5 ${isUp ? 'text-signal-low' : 'text-signal-high'}`}>
            {isUp ? '↑' : '↓'} {formatPercent(change.changePercent)}
          </div>
          <div className="mt-1">
            <AttentionBadge level={change.attentionLevel} score={change.score} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-ink-faint">{timeAgo(change.timestamp)}</div>
          {!change.isRead && <div className="mt-1 text-[10px] uppercase tracking-wide text-brand">New</div>}
        </div>
      </div>

      {change.reasons.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-ink-muted">
          {change.reasons.slice(0, 3).map((reason, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-ink-faint">•</span>
              {reason}
            </li>
          ))}
        </ul>
      )}

      {showActions && (
        <div className="mt-3 flex gap-2 text-xs">
          <button
            onClick={() => onMarkRead?.(change._id)}
            className="focus-ring rounded px-2 py-1 border border-base-border text-ink-muted hover:text-ink hover:border-ink-faint transition-colors"
          >
            Mark read
          </button>
          <button
            onClick={() => onMarkImportant?.(change._id, !change.isImportant)}
            className="focus-ring rounded px-2 py-1 border border-base-border text-ink-muted hover:text-ink hover:border-ink-faint transition-colors"
          >
            {change.isImportant ? 'Unmark important' : 'Important'}
          </button>
          <button
            onClick={() => onDismiss?.(change._id)}
            className="focus-ring rounded px-2 py-1 border border-base-border text-ink-muted hover:text-ink hover:border-ink-faint transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
