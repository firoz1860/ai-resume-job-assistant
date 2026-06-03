import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthVisual from '../components/AuthVisual.jsx';

export default function Login() {
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = async () => {
    setLoading(true);
    setError('');
    try {
      await guestLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Guest login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-surface">
      {/* Visual panel — hidden on mobile, left side on desktop */}
      <div className="hidden lg:flex">
        <AuthVisual mode="login" />
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-navy-900 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M5 7h10M5 11h10M5 15h6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="18" cy="10" r="3" fill="#2563EB" opacity="0.85"/>
                <path d="M18 8.5v3M16.5 10h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-navy-900 text-lg">CareerOS<span className="text-accent">AI</span></span>
          </div>

          <div className="card p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink mb-1">Welcome back</h2>
            <p className="text-sm text-muted mb-6">Continue to your career dashboard.</p>

            <form onSubmit={submit} className="space-y-3">
              <input name="email" type="email" value={form.email} onChange={set} placeholder="Email address" className="form-input" autoComplete="email" required />
              <input name="password" type="password" value={form.password} onChange={set} placeholder="Password" className="form-input" autoComplete="current-password" required />
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? 'Logging in…' : 'Login'}
              </button>
              <button type="button" onClick={continueAsGuest} className="btn-secondary w-full justify-center py-3" disabled={loading}>
                Continue as Guest
              </button>
            </form>

            <p className="text-sm text-muted mt-5 text-center">
              No account?{' '}
              <Link to="/signup" className="text-accent font-semibold hover:underline">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
