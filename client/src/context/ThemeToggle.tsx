import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  /** 'full' shows icon + label (sidebar style), 'icon' shows just the icon in a round button (headers). */
  variant?: 'full' | 'icon';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'full') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center gap-2.5 text-sm text-ink-muted hover:text-ink transition-colors focus-ring rounded px-1 py-1 self-start ${className}`}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`h-9 w-9 flex items-center justify-center rounded-md border border-base-border text-ink-muted hover:text-ink hover:border-ink-faint transition-colors focus-ring ${className}`}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}