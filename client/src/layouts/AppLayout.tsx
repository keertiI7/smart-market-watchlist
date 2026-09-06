// import { NavLink, Outlet, useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { LayoutDashboard, Bell, BarChart3, ListChecks, Settings, LogOut, TrendingUp, Sun, Moon } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { fetchIndices } from '../services/marketApi';
// import { IndexSummary } from '../types';

// function useTheme() {
//   const [theme, setTheme] = useState<'light' | 'dark'>(() => {
//     if (typeof window === 'undefined') return 'dark';
//     const stored = localStorage.getItem('smw_theme');
//     return stored === 'light' || stored === 'dark' ? stored : 'dark';
//   });

//   useEffect(() => {
//     // Our CSS variables in index.css default to dark in :root and override
//     // under a `.light` class - so toggle `light`, not `dark`, on <html>.
//     document.documentElement.classList.toggle('light', theme === 'light');
//     document.documentElement.style.colorScheme = theme;
//     localStorage.setItem('smw_theme', theme);
//   }, [theme]);

//   return { theme, toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')) };
// }

// const NAV_ITEMS = [
//   { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
//   { to: '/changes', label: 'Change feed', icon: Bell },
//   { to: '/analytics', label: 'Analytics', icon: BarChart3 },
//   { to: '/watchlists', label: 'Watchlists', icon: ListChecks },
//   { to: '/settings', label: 'Settings', icon: Settings },
// ];

// export function AppLayout() {
//   const { user, logout } = useAuth();
//   const { theme, toggleTheme } = useTheme();
//   const navigate = useNavigate();
//   const [indices, setIndices] = useState<IndexSummary[]>([]);

//   useEffect(() => {
//     fetchIndices().then(setIndices).catch(() => setIndices([]));
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row">
//       <aside className="md:w-64 shrink-0 md:h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-base-border bg-base-raised flex md:flex-col">
//         <div className="p-5">
//           <div className="flex items-center gap-2">
//             <TrendingUp className="h-6 w-6 text-brand" />
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="font-display text-2xl tracking-tight text-ink focus-ring rounded"
//             >
//               Smart Watchlist
//             </button>
//           </div>

//           {/* Market-flavored strip: real NIFTY 50 / NIFTY BANK data via stock-nse-india */}
//           {indices.length > 0 && (
//             <div className="mt-4 rounded-md border border-base-border bg-base-overlay/60 px-3 py-2 text-xs space-y-1">
//               {indices.map((idx) => (
//                 <div key={idx.name} className="flex items-center justify-between">
//                   <span className="text-ink-faint">{idx.name}</span>
//                   <span className="flex items-center gap-1.5 font-mono">
//                     <span className="text-ink-muted">{idx.value.toLocaleString('en-IN')}</span>
//                     <span className={idx.change >= 0 ? 'text-signal-low' : 'text-signal-high'}>
//                       {idx.change >= 0 ? '+' : ''}
//                       {idx.change.toFixed(2)}%
//                     </span>
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <nav className="flex md:flex-col px-3 gap-1 overflow-x-auto md:overflow-visible pb-3 md:pb-0 md:flex-1">
//           {NAV_ITEMS.map((item) => {
//             const Icon = item.icon;
//             return (
//               <NavLink
//                 key={item.to}
//                 to={item.to}
//                 className={({ isActive }) =>
//                   `flex items-center gap-2.5 whitespace-nowrap md:whitespace-normal px-3 py-2 rounded-md text-sm transition-colors focus-ring border-l-2 ${
//                     isActive
//                       ? 'bg-base-overlay text-ink border-brand'
//                       : 'text-ink-muted hover:text-ink hover:bg-base-overlay/60 border-transparent'
//                   }`
//                 }
//               >
//                 <Icon className="h-4 w-4 shrink-0" />
//                 {item.label}
//               </NavLink>
//             );
//           })}
//         </nav>

//         <div className="hidden md:flex md:flex-col gap-3 p-5 border-t border-base-border">
//           <button
//             onClick={toggleTheme}
//             className="flex items-center gap-2.5 text-sm text-ink-muted hover:text-ink transition-colors focus-ring rounded px-1 py-1 self-start"
//           >
//             {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//             {theme === 'dark' ? 'Light mode' : 'Dark mode'}
//           </button>

//           <div className="flex items-center gap-2.5">
//             <div className="h-8 w-8 rounded-full bg-brand/20 text-brand flex items-center justify-center text-sm font-medium shrink-0">
//               {user?.name?.charAt(0).toUpperCase()}
//             </div>
//             <div className="min-w-0">
//               <div className="text-sm text-ink truncate">{user?.name}</div>
//               <div className="text-xs text-ink-faint truncate">{user?.email}</div>
//             </div>
//           </div>
//           <button
//             onClick={() => {
//               logout();
//               navigate('/login');
//             }}
//             className="flex items-center gap-2 text-xs text-ink-faint hover:text-signal-high transition-colors focus-ring rounded"
//           >
//             <LogOut className="h-3.5 w-3.5" />
//             Log out
//           </button>
//         </div>
//       </aside>

//       <main className="flex-1 min-w-0">
//         <Outlet />
//       </main>
//     </div>
//   );
// }






import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Bell, BarChart3, ListChecks, Settings, LogOut, TrendingUp, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchIndices } from '../services/marketApi';
import { IndexSummary } from '../types';

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('smw_theme');
    return stored === 'light' || stored === 'dark' ? stored : 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('smw_theme', theme);
  }, [theme]);

  return { theme, toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')) };
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/changes', label: 'Change feed', icon: Bell },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/watchlists', label: 'Watchlists', icon: ListChecks },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [indices, setIndices] = useState<IndexSummary[]>([]);

  useEffect(() => {
    fetchIndices().then(setIndices).catch(() => setIndices([]));
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 shrink-0 md:h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-base-border bg-base-raised flex md:flex-col">
        <div className="p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-brand" />
            <button
              onClick={() => navigate('/dashboard')}
              className="font-display text-2xl tracking-tight text-ink focus-ring rounded"
            >
              Smart Watchlist
            </button>
          </div>

          {indices.length > 0 && (
            <div className="mt-4 rounded-md border border-base-border bg-base-overlay/60 px-3 py-2 text-xs space-y-1">
              {indices.map((idx) => (
                <div key={idx.name} className="flex items-center justify-between">
                  <span className="text-ink-faint">{idx.name}</span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="text-ink-muted">{idx.value.toLocaleString('en-IN')}</span>
                    <span className={idx.change >= 0 ? 'text-signal-low' : 'text-signal-high'}>
                      {idx.change >= 0 ? '+' : ''}
                      {idx.change.toFixed(2)}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <nav className="flex md:flex-col px-3 gap-1 overflow-x-auto md:overflow-visible pb-3 md:pb-0 md:flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 whitespace-nowrap md:whitespace-normal px-3 py-2 rounded-md text-sm transition-colors focus-ring border-l-2 ${
                    isActive
                      ? 'bg-base-overlay text-ink border-brand'
                      : 'text-ink-muted hover:text-ink hover:bg-base-overlay/60 border-transparent'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden md:flex md:flex-col gap-3 p-5 border-t border-base-border">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2.5 text-sm text-ink-muted hover:text-ink transition-colors focus-ring rounded px-1 py-1 self-start"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-brand/20 text-brand flex items-center justify-center text-sm font-medium shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-ink truncate">{user?.name}</div>
              <div className="text-xs text-ink-faint truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2 text-xs text-ink-faint hover:text-signal-high transition-colors focus-ring rounded"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}