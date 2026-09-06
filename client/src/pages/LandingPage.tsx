







// import { Link } from 'react-router-dom';
// import { TickerTape } from '../components/TickerTape';
// import { ChartBackground } from '../components/ChartBackground';

// const FEED_EXAMPLE = [
//   { symbol: 'RELIANCE', name: 'Reliance Industries', change: '-5.4%', detail: 'Volume 3.2x average', level: 'HIGH' as const },
//   { symbol: 'TCS', name: 'Tata Consultancy Services', change: '+3.2%', detail: 'Earnings announcement', level: 'MEDIUM' as const },
//   { symbol: 'INFY', name: 'Infosys', change: '+0.2%', detail: 'No meaningful change', level: 'NONE' as const },
// ];

// const LEVEL_STYLE: Record<string, string> = {
//   HIGH: 'text-signal-high',
//   MEDIUM: 'text-signal-medium',
//   NONE: 'text-ink-faint',
// };

// const LEVEL_DOT: Record<string, string> = {
//   HIGH: 'bg-signal-high',
//   MEDIUM: 'bg-signal-medium',
//   NONE: 'bg-ink-faint',
// };

// export function LandingPage() {
//   return (
//     <div className="relative min-h-screen">
//       <ChartBackground />

//       <div className="relative z-10">
//         <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
//           <span className="font-display text-2xl tracking-tight">Smart Watchlist</span>
//           <nav className="flex items-center gap-4 text-sm">
//             <Link to="/login" className="text-ink-muted hover:text-ink transition-colors focus-ring rounded">
//               Log in
//             </Link>
//             <Link
//               to="/register"
//               className="rounded-md bg-brand px-3.5 py-1.5 text-white hover:bg-brand-dim transition-colors focus-ring"
//             >
//               Get started
//             </Link>
//           </nav>
//         </header>

//         <TickerTape />

//         {/* Hero */}
//         <section className="relative max-w-5xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-14 items-center">
//           <div
//             className="animate-glow pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
//             aria-hidden
//           />

//           <div>
//             <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] text-ink">
//               Don't just watch your stocks.
//               <br />
//               Know what changed.
//             </h1>
//             <p className="mt-6 text-ink-muted text-lg max-w-md">
//               Your intelligent market watchlist that tells you what actually deserves your attention — and
//               what's safe to ignore.
//             </p>
//             <div className="mt-8 flex flex-wrap gap-3">
//               <Link
//                 to="/register"
//                 className="rounded-md bg-brand px-5 py-2.5 text-white font-medium hover:bg-brand-dim transition-colors focus-ring"
//               >
//                 Get started
//               </Link>
//               <Link
//                 to="/register?demo=1"
//                 className="rounded-md border border-base-border px-5 py-2.5 text-ink hover:border-ink-faint transition-colors focus-ring"
//               >
//                 Try demo
//               </Link>
//             </div>
//           </div>

//           <div className="relative rounded-xl border border-base-border bg-base-raised/90 backdrop-blur-sm p-5">
//             <div className="flex items-center justify-between mb-4">
//               <span className="text-xs uppercase tracking-wide text-ink-faint">Since you last checked</span>
//               <span className="flex items-center gap-1.5">
//                 <span className="h-1.5 w-1.5 rounded-full bg-signal-low animate-pulse" aria-hidden />
//                 <span className="text-[10px] text-ink-faint uppercase tracking-wide">Live</span>
//               </span>
//             </div>
//             <div className="space-y-4">
//               {FEED_EXAMPLE.map((item) => (
//                 <div key={item.symbol} className="flex items-start justify-between gap-4">
//                   <div>
//                     <div className="text-sm text-ink">{item.name}</div>
//                     <div className={`font-mono text-xl mt-0.5 ${LEVEL_STYLE[item.level]}`}>{item.change}</div>
//                     <div className="text-xs text-ink-muted mt-0.5">{item.detail}</div>
//                   </div>
//                   <div className="flex items-center gap-1.5 shrink-0 mt-1">
//                     <span className={`h-2 w-2 rounded-full ${LEVEL_DOT[item.level]}`} />
//                     <span className={`text-xs ${LEVEL_STYLE[item.level]}`}>
//                       {item.level === 'NONE' ? 'Safe to ignore' : `${item.level.charAt(0)}${item.level.slice(1).toLowerCase()} attention`}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* How it works */}
//         <section className="max-w-5xl mx-auto px-6 py-16 border-t border-base-border/70 bg-base/60 backdrop-blur-sm">
//           <h2 className="font-display text-2xl text-ink mb-8">How it works</h2>
//           <div className="grid sm:grid-cols-4 gap-6 text-sm">
//             {[
//               { title: 'Watch', body: 'Build a watchlist of the stocks you care about.' },
//               { title: 'Compare', body: 'We snapshot the market and compare it to your last visit.' },
//               { title: 'Score', body: 'Price, volume, volatility and events are scored 0–100.' },
//               { title: 'Explain', body: 'Every flagged move comes with the reasons behind it.' },
//             ].map((step) => (
//               <div key={step.title} className="border-t border-base-border pt-4">
//                 <div className="text-ink font-medium">{step.title}</div>
//                 <div className="text-ink-muted mt-1">{step.body}</div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* The one differentiator section - replaces the old duplicate prose block */}
//         <section className="max-w-5xl mx-auto px-6 py-16 border-t border-base-border/70 bg-base/60 backdrop-blur-sm">
//           <div className="max-w-2xl mb-10">
//             <h2 className="font-display text-2xl text-ink">A normal watchlist shows prices.</h2>
//             <p className="mt-3 text-ink-muted">
//               We compare today's market against the state you last saw, score how unusual each move really is
//               for that stock, and show the reasoning — not just a verdict.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 gap-10">
//             <div>
//               <h3 className="font-display text-xl text-ink mb-3">A normal watchlist says</h3>
//               <div className="rounded-lg border border-base-border bg-base-raised p-4 font-mono text-sm text-ink-muted space-y-1 transition-transform hover:-translate-y-1">
//                 <div>TCS &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;₹3842 &nbsp;+2.8%</div>
//                 <div>RELIANCE &nbsp;₹1245 &nbsp;-5.4%</div>
//                 <div>HDFC &nbsp;&nbsp;&nbsp;&nbsp;₹1762 &nbsp;+0.4%</div>
//               </div>
//             </div>
//             <div>
//               <h3 className="font-display text-xl text-ink mb-3">Smart Watchlist says</h3>
//               <div className="rounded-lg border border-signal-high/30 bg-signal-high/10 p-4 text-sm space-y-2 transition-transform hover:-translate-y-1">
//                 <div className="text-ink font-medium">You have 3 things to know</div>
//                 <div className="text-ink-muted">
//                   <span className="text-signal-high">● Reliance</span> dropped 5.4% on 3.2x volume — high attention
//                 </div>
//                 <div className="text-ink-muted">
//                   <span className="text-signal-medium">● TCS</span> moved 3.2% on an earnings event — medium attention
//                 </div>
//                 <div className="text-ink-muted">
//                   <span className="text-ink-faint">● HDFC</span> no meaningful change — safe to ignore for now
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* CTA */}
//         <section className="max-w-5xl mx-auto px-6 py-20 border-t border-base-border/70 bg-base/60 backdrop-blur-sm text-center">
//           <h2 className="font-display text-3xl text-ink">A watchlist shouldn't make you watch more.</h2>
//           <p className="text-ink-muted mt-3">It should help you know what matters.</p>
//           <Link
//             to="/register"
//             className="inline-block mt-8 rounded-md bg-brand px-6 py-3 text-white font-medium hover:bg-brand-dim transition-colors focus-ring"
//           >
//             Get started free
//           </Link>
//         </section>

//         <footer className="border-t border-base-border/70 bg-base/80 backdrop-blur-sm">
//           <div className="max-w-5xl mx-auto px-6 py-8 text-xs text-ink-faint flex flex-wrap justify-between gap-3">
//             <span>Smart Market Watchlist — built for CODE 2026</span>
//             <span>Market data simulated for demo purposes</span>
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// }




import { Link } from 'react-router-dom';
import { TickerTape } from '../components/TickerTape';
import { ChartBackground } from '../components/ChartBackground';
import { ThemeToggle } from '../context/ThemeToggle';

const FEED_EXAMPLE = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', change: '-5.4%', detail: 'Volume 3.2x average', level: 'HIGH' as const },
  { symbol: 'TCS', name: 'Tata Consultancy Services', change: '+3.2%', detail: 'Earnings announcement', level: 'MEDIUM' as const },
  { symbol: 'INFY', name: 'Infosys', change: '+0.2%', detail: 'No meaningful change', level: 'NONE' as const },
];

const LEVEL_STYLE: Record<string, string> = {
  HIGH: 'text-signal-high',
  MEDIUM: 'text-signal-medium',
  NONE: 'text-ink-faint',
};

const LEVEL_DOT: Record<string, string> = {
  HIGH: 'bg-signal-high',
  MEDIUM: 'bg-signal-medium',
  NONE: 'bg-ink-faint',
};

export function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <ChartBackground />

      <div className="relative z-10">
        <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="font-display text-2xl tracking-tight">Smart Watchlist</span>
          <nav className="flex items-center gap-4 text-sm">
          <Link to="/login" className="text-ink-muted hover:text-ink transition-colors focus-ring rounded">
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-brand px-3.5 py-1.5 text-white hover:bg-brand-dim transition-colors focus-ring"
          >
            Get started
          </Link>
          <ThemeToggle />
        </nav>
        </header>

        <TickerTape />

        {/* Hero */}
        <section className="relative max-w-5xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-14 items-center">
          <div
            className="animate-glow pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
            aria-hidden
          />

          <div>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] text-ink">
              Don't just watch your stocks.
              <br />
              Know what changed.
            </h1>
            <p className="mt-6 text-ink-muted text-lg max-w-md">
              Your intelligent market watchlist that tells you what actually deserves your attention — and
              what's safe to ignore.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-md bg-brand px-5 py-2.5 text-white font-medium hover:bg-brand-dim transition-colors focus-ring"
              >
                Get started
              </Link>
              <Link
                to="/register?demo=1"
                className="rounded-md border border-base-border px-5 py-2.5 text-ink hover:border-ink-faint transition-colors focus-ring"
              >
                Try demo
              </Link>
            </div>
          </div>

          <div className="relative rounded-xl border border-base-border bg-base-raised/90 backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wide text-ink-faint">Since you last checked</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-low animate-pulse" aria-hidden />
                <span className="text-[10px] text-ink-faint uppercase tracking-wide">Live</span>
              </span>
            </div>
            <div className="space-y-4">
              {FEED_EXAMPLE.map((item) => (
                <div key={item.symbol} className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-ink">{item.name}</div>
                    <div className={`font-mono text-xl mt-0.5 ${LEVEL_STYLE[item.level]}`}>{item.change}</div>
                    <div className="text-xs text-ink-muted mt-0.5">{item.detail}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 mt-1">
                    <span className={`h-2 w-2 rounded-full ${LEVEL_DOT[item.level]}`} />
                    <span className={`text-xs ${LEVEL_STYLE[item.level]}`}>
                      {item.level === 'NONE' ? 'Safe to ignore' : `${item.level.charAt(0)}${item.level.slice(1).toLowerCase()} attention`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-base-border/70 bg-base/60 backdrop-blur-sm">
          <h2 className="font-display text-2xl text-ink mb-8">How it works</h2>
          <div className="grid sm:grid-cols-4 gap-6 text-sm">
            {[
              { title: 'Watch', body: 'Build a watchlist of the stocks you care about.' },
              { title: 'Compare', body: 'We snapshot the market and compare it to your last visit.' },
              { title: 'Score', body: 'Price, volume, volatility and events are scored 0–100.' },
              { title: 'Explain', body: 'Every flagged move comes with the reasons behind it.' },
            ].map((step) => (
              <div key={step.title} className="border-t border-base-border pt-4">
                <div className="text-ink font-medium">{step.title}</div>
                <div className="text-ink-muted mt-1">{step.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* The one differentiator section */}
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-base-border/70 bg-base/60 backdrop-blur-sm">
          <div className="max-w-2xl mb-10">
            <h2 className="font-display text-2xl text-ink">A normal watchlist shows prices.</h2>
            <p className="mt-3 text-ink-muted">
              We compare today's market against the state you last saw, score how unusual each move really is
              for that stock, and show the reasoning — not just a verdict.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-display text-xl text-ink mb-3">A normal watchlist says</h3>
              <div className="rounded-lg border border-base-border bg-base-raised p-4 font-mono text-sm text-ink-muted space-y-1 transition-transform hover:-translate-y-1">
                <div>TCS &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;₹3842 &nbsp;+2.8%</div>
                <div>RELIANCE &nbsp;₹1245 &nbsp;-5.4%</div>
                <div>HDFC &nbsp;&nbsp;&nbsp;&nbsp;₹1762 &nbsp;+0.4%</div>
              </div>
            </div>
            <div>
              <h3 className="font-display text-xl text-ink mb-3">Smart Watchlist says</h3>
              <div className="rounded-lg border border-signal-high/30 bg-signal-high/10 p-4 text-sm space-y-2 transition-transform hover:-translate-y-1">
                <div className="text-ink font-medium">You have 3 things to know</div>
                <div className="text-ink-muted">
                  <span className="text-signal-high">● Reliance</span> dropped 5.4% on 3.2x volume — high attention
                </div>
                <div className="text-ink-muted">
                  <span className="text-signal-medium">● TCS</span> moved 3.2% on an earnings event — medium attention
                </div>
                <div className="text-ink-muted">
                  <span className="text-ink-faint">● HDFC</span> no meaningful change — safe to ignore for now
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 py-20 border-t border-base-border/70 bg-base/60 backdrop-blur-sm text-center">
          <h2 className="font-display text-3xl text-ink">A watchlist shouldn't make you watch more.</h2>
          <p className="text-ink-muted mt-3">It should help you know what matters.</p>
          <Link
            to="/register"
            className="inline-block mt-8 rounded-md bg-brand px-6 py-3 text-white font-medium hover:bg-brand-dim transition-colors focus-ring"
          >
            Get started free
          </Link>
        </section>

        <footer className="border-t border-base-border/70 bg-base/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-8 text-xs text-ink-faint flex flex-wrap justify-between gap-3">
            <span>Smart Market Watchlist — built for CODE 2026</span>
            <span>Market data simulated for demo purposes</span>
          </div>
        </footer>
      </div>
    </div>
  );
}