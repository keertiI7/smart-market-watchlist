import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-10 max-w-lg">
      <h1 className="font-display text-2xl text-ink">Settings</h1>

      <div className="mt-6 rounded-lg border border-base-border p-4">
        <div className="text-xs text-ink-faint">Name</div>
        <div className="text-ink mt-0.5">{user?.name}</div>
        <div className="text-xs text-ink-faint mt-3">Email</div>
        <div className="text-ink mt-0.5">{user?.email}</div>
      </div>

      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="mt-6 rounded-md border border-base-border px-4 py-2 text-sm text-ink hover:border-signal-high hover:text-signal-high transition-colors focus-ring"
      >
        Log out
      </button>
    </div>
  );
}
