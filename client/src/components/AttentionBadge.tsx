import { AttentionLevel } from '../types';
import { attentionColor, attentionDot } from '../utils/format';

const LABEL: Record<AttentionLevel, string> = {
  HIGH: 'High attention',
  MEDIUM: 'Medium attention',
  LOW: 'Low attention',
  NONE: 'Safe to ignore',
};

export function AttentionBadge({ level, score }: { level: AttentionLevel; score?: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${attentionColor(level)}`}>
      <span className={`h-2 w-2 rounded-full ${attentionDot(level)}`} aria-hidden />
      {LABEL[level]}
      {typeof score === 'number' && <span className="text-ink-faint font-mono text-xs">· {score}</span>}
    </span>
  );
}
