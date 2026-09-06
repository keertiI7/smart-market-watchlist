import { AttentionLevel } from '../types';

export function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
    value
  );
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function attentionColor(level: AttentionLevel): string {
  switch (level) {
    case 'HIGH':
      return 'text-signal-high';
    case 'MEDIUM':
      return 'text-signal-medium';
    case 'LOW':
      return 'text-signal-low';
    default:
      return 'text-ink-faint';
  }
}

export function attentionBg(level: AttentionLevel): string {
  switch (level) {
    case 'HIGH':
      return 'bg-signal-high/10 border-signal-high/30';
    case 'MEDIUM':
      return 'bg-signal-medium/10 border-signal-medium/30';
    case 'LOW':
      return 'bg-signal-low/10 border-signal-low/30';
    default:
      return 'bg-base-overlay border-base-border';
  }
}

export function attentionDot(level: AttentionLevel): string {
  switch (level) {
    case 'HIGH':
      return 'bg-signal-high';
    case 'MEDIUM':
      return 'bg-signal-medium';
    case 'LOW':
      return 'bg-signal-low';
    default:
      return 'bg-ink-faint';
  }
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
