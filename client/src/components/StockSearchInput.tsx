import { useEffect, useRef, useState } from 'react';
import { StockSummary } from '../types';
import { searchStocks } from '../services/marketApi';

interface Props {
  onSelect: (stock: StockSummary) => void;
  placeholder?: string;
}

export function StockSearchInput({ onSelect, placeholder }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSummary[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    // Debounce so we don't hit the API on every keystroke (spec Module 6).
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await searchStocks(query);
        setResults(r);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder || 'Search stocks…'}
        className="w-full rounded-md border border-base-border bg-base-overlay px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus-ring"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-base-border bg-base-raised shadow-lg max-h-64 overflow-auto">
          {results.map((r) => (
            <li key={r.symbol}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(r);
                  setQuery('');
                  setResults([]);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-base-overlay transition-colors"
              >
                <div className="text-sm text-ink">{r.symbol}</div>
                <div className="text-xs text-ink-muted">
                  {r.name} · {r.exchange}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
