// import { FormEvent, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { getErrorMessage } from '../services/api';

// export function LoginPage() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setSubmitting(true);
//     try {
//       await login(email, password);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center px-6">
//       <div className="w-full max-w-sm">
//         <Link to="/" className="font-display text-lg text-ink">
//           Smart Watchlist
//         </Link>
//         <h1 className="font-display text-2xl text-ink mt-6">Welcome back</h1>
//         <p className="text-ink-muted text-sm mt-1">Log in to see what's changed since you last checked.</p>

//         <form onSubmit={handleSubmit} className="mt-6 space-y-4">
//           <div>
//             <label className="block text-sm text-ink-muted mb-1" htmlFor="email">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full rounded-md border border-base-border bg-base-overlay px-3 py-2 text-sm text-ink focus-ring"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-ink-muted mb-1" htmlFor="password">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full rounded-md border border-base-border bg-base-overlay px-3 py-2 text-sm text-ink focus-ring"
//             />
//           </div>

//           {error && <p className="text-sm text-signal-high">{error}</p>}

//           <button
//             type="submit"
//             disabled={submitting}
//             className="w-full rounded-md bg-brand px-4 py-2.5 text-white font-medium hover:bg-brand-dim transition-colors focus-ring disabled:opacity-60"
//           >
//             {submitting ? 'Logging in…' : 'Log in'}
//           </button>
//         </form>

//         <p className="text-sm text-ink-muted mt-6">
//           New here?{' '}
//           <Link to="/register" className="text-brand hover:underline focus-ring rounded">
//             Create an account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }




import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { ChartBackground } from '../components/ChartBackground';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <ChartBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-xl border border-base-border bg-base-raised/90 backdrop-blur-sm p-8">
          <Link to="/" className="font-display text-lg text-ink">
            Smart Watchlist
          </Link>
          <h1 className="font-display text-2xl text-ink mt-6">Welcome back</h1>
          <p className="text-ink-muted text-sm mt-1">Log in to see what's changed since you last checked.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-ink-muted mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-base-border bg-base-overlay px-3 py-2 text-sm text-ink focus-ring"
              />
            </div>
            <div>
              <label className="block text-sm text-ink-muted mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-base-border bg-base-overlay px-3 py-2 text-sm text-ink focus-ring"
              />
            </div>

            {error && <p className="text-sm text-signal-high">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-brand px-4 py-2.5 text-white font-medium hover:bg-brand-dim transition-colors focus-ring disabled:opacity-60"
            >
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-ink-muted mt-6">
            New here?{' '}
            <Link to="/register" className="text-brand hover:underline focus-ring rounded">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}