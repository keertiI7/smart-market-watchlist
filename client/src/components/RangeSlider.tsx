export function RangeSlider({
  low,
  high,
  value,
  lowLabel,
  highLabel,
}: {
  low: number;
  high: number;
  value: number;
  lowLabel: string;
  highLabel: string;
}) {
  const pct = high > low ? Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100)) : 50;

  return (
    <div>
      <div className="relative h-1.5 rounded-full bg-base-border">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-ink border-2 border-base-raised shadow"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs">
        <span className="text-ink-faint">{lowLabel}</span>
        <span className="text-ink-faint">{highLabel}</span>
      </div>
    </div>
  );
}