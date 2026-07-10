import { useState, type FormEvent } from 'react';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import { loginAdmin, isAdminAuthenticated, logoutAdmin } from '../lib/auth';

export default function Admin() {
  const [authed, setAuthed] = useState(() => typeof window !== 'undefined' && isAdminAuthenticated());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (loginAdmin(password)) {
        setAuthed(true);
      } else {
        setError('Incorrect password.');
      }
      setLoading(false);
    }, 300);
  };

  if (authed) {
    return <AdminDashboard onLogout={() => { logoutAdmin(); setAuthed(false); }} />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Lock className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="mt-1 text-sm text-gray-500">Enter your password to manage pincode data</p>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Logging in...</> : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
