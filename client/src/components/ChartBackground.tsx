// function pseudoRandom(seed: number): number {
//   const x = Math.sin(seed * 12.9898) * 43758.5453;
//   return x - Math.floor(x);
// }

// const CANDLES = Array.from({ length: 56 }).map((_, i) => {
//   const r = pseudoRandom(i + 1);
//   const r2 = pseudoRandom(i + 99);
//   return {
//     height: 18 + r * 110,
//     isUp: r2 > 0.48,
//     delay: (r * 5).toFixed(2),
//   };
// });

// const LINE_PATH =
//   'M0,320 L40,300 L80,330 L120,260 L160,280 L200,200 L240,230 L280,150 L320,190 L360,120 L400,160 L440,110 L480,140 L520,80 L560,120 L600,90 L640,140 L680,100 L720,150 L760,110 L800,170 L840,130 L880,190 L920,150 L960,210 L1000,170 L1040,220 L1080,180 L1120,230 L1160,190 L1200,240 L1240,200 L1280,250 L1320,210 L1360,260 L1400,220';

// export function ChartBackground() {
//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
//       <div className="absolute inset-0 bg-gradient-to-b from-base via-base to-base-raised/40" />

//       <div className="absolute bottom-0 left-0 right-0 h-[38vh] flex items-end justify-between px-2 opacity-80">
//         {CANDLES.map((c, i) => (
//           <div
//             key={i}
//             className="animate-candle w-[1.4%] rounded-t-sm"
//             style={{
//               height: `${c.height}px`,
//               background: c.isUp ? '#3FBF83' : '#E8543F',
//               animationDelay: `${c.delay}s`,
//             }}
//           />
//         ))}
//       </div>

//       <svg
//         className="absolute top-0 left-0 w-full h-[55vh] opacity-30"
//         viewBox="0 0 1400 400"
//         preserveAspectRatio="none"
//       >
//         <defs>
//           <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
//             <stop offset="0%" stopColor="#4F8CFF" stopOpacity="0" />
//             <stop offset="15%" stopColor="#4F8CFF" stopOpacity="1" />
//             <stop offset="85%" stopColor="#4F8CFF" stopOpacity="1" />
//             <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0" />
//           </linearGradient>
//         </defs>
//         <path d={LINE_PATH} fill="none" stroke="url(#lineGrad)" strokeWidth="2" className="animate-draw-line" />
//       </svg>

//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(14,17,22,0.55)_55%,rgba(14,17,22,0.92)_100%)]" />
//     </div>
//   );
// }



function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const CANDLES = Array.from({ length: 56 }).map((_, i) => {
  const r = pseudoRandom(i + 1);
  const r2 = pseudoRandom(i + 99);
  return {
    height: 18 + r * 110,
    isUp: r2 > 0.48,
    delay: (r * 5).toFixed(2),
  };
});

const LINE_PATH =
  'M0,320 L40,300 L80,330 L120,260 L160,280 L200,200 L240,230 L280,150 L320,190 L360,120 L400,160 L440,110 L480,140 L520,80 L560,120 L600,90 L640,140 L680,100 L720,150 L760,110 L800,170 L840,130 L880,190 L920,150 L960,210 L1000,170 L1040,220 L1080,180 L1120,230 L1160,190 L1200,240 L1240,200 L1280,250 L1320,210 L1360,260 L1400,220';

export function ChartBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-base via-base to-base-raised/40" />

      <div className="absolute bottom-0 left-0 right-0 h-[38vh] flex items-end justify-between px-2 opacity-80">
        {CANDLES.map((c, i) => (
          <div
            key={i}
            className="animate-candle w-[1.4%] rounded-t-sm"
            style={{
              height: `${c.height}px`,
              background: c.isUp ? 'rgb(var(--color-signal-low))' : 'rgb(var(--color-signal-high))',
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>

      <svg
        className="absolute top-0 left-0 w-full h-[55vh] opacity-30"
        viewBox="0 0 1400 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--color-brand))" stopOpacity="0" />
            <stop offset="15%" stopColor="rgb(var(--color-brand))" stopOpacity="1" />
            <stop offset="85%" stopColor="rgb(var(--color-brand))" stopOpacity="1" />
            <stop offset="100%" stopColor="rgb(var(--color-brand))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={LINE_PATH} fill="none" stroke="url(#lineGrad)" strokeWidth="2" className="animate-draw-line" />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgb(var(--color-base) / 0.55) 55%, rgb(var(--color-base) / 0.92) 100%)',
        }}
      />
    </div>
  );
}