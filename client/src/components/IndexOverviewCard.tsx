import { IndexSummary } from '../types';
import { RangeSlider } from './RangeSlider';
import { timeAgo } from '../utils/format';

export function IndexOverviewCard({ index }: { index: IndexSummary }) {
  const isUp = index.change >= 0;

  return (
    <div className="rounded-lg border border-base-border p-5">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="font-display text-lg text-ink">{index.name}</h3>
        {index.asOf && <span className="text-xs text-ink-faint">As on {index.asOf}</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-3">
        <span className="font-mono text-3xl text-ink">{index.value.toLocaleString('en-IN')}</span>
        <span className={`font-mono text-sm ${isUp ? 'text-signal-low' : 'text-signal-high'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(index.changeAbsolute).toFixed(2)} ({isUp ? '+' : ''}
          {index.change.toFixed(2)}%)
        </span>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-6">
        <div>
          <div className="text-xs text-ink-faint mb-2">Day range</div>
          <RangeSlider
            low={index.dayLow}
            high={index.dayHigh}
            value={index.value}
            lowLabel={index.dayLow.toLocaleString('en-IN')}
            highLabel={index.dayHigh.toLocaleString('en-IN')}
          />
        </div>
        <div>
          <div className="text-xs text-ink-faint mb-2">52 week range</div>
          <RangeSlider
            low={index.weekLow52}
            high={index.weekHigh52}
            value={index.value}
            lowLabel={index.weekLow52.toLocaleString('en-IN')}
            highLabel={index.weekHigh52.toLocaleString('en-IN')}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-ink-faint">Open </span>
          <span className="text-ink font-mono">{index.open.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-ink-faint">Prev close </span>
          <span className="text-ink font-mono">{index.previousClose.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}