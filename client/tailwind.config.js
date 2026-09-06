/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: 'rgb(var(--color-base) / <alpha-value>)',
          raised: 'rgb(var(--color-base-raised) / <alpha-value>)',
          overlay: 'rgb(var(--color-base-overlay) / <alpha-value>)',
          border: 'rgb(var(--color-base-border) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          faint: 'rgb(var(--color-ink-faint) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          dim: 'rgb(var(--color-brand-dim) / <alpha-value>)',
        },
        signal: {
          high: 'rgb(var(--color-signal-high) / <alpha-value>)',
          medium: 'rgb(var(--color-signal-medium) / <alpha-value>)',
          low: 'rgb(var(--color-signal-low) / <alpha-value>)',
          none: 'rgb(var(--color-signal-none) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};