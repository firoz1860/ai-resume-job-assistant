import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthVisual from '../components/AuthVisual.jsx';
import Wordmark from '../components/marketing/Wordmark.jsx';

export default function Login() {
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
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
    <div className="flex min-h-screen flex-col bg-ivory lg:grid lg:grid-cols-2">
      <AuthVisual mode="login" />

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <Link to="/" aria-label="CareerOS AI home" className="mb-8 inline-block lg:hidden">
            <Wordmark size="nav" />
          </Link>

          <div className="panel p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Welcome back</h2>
            <p className="mt-1 text-sm text-sage-600">Sign in to your career workspace.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {location.state?.accountCreated && (
                <p className="rounded-xl border border-forest-200 bg-forest-50 p-3 text-sm text-forest-700">
                  Account created. Sign in with the same credentials to continue.
                </p>
              )}
              <div>
                <label htmlFor="login-email" className="form-label">Email address</label>
                <input id="login-email" name="email" type="email" value={form.email} onChange={set} placeholder="you@example.com" className="form-input" autoComplete="email" required />
              </div>
              <div>
                <label htmlFor="login-password" className="form-label">Password</label>
                <input id="login-password" name="password" type="password" value={form.password} onChange={set} placeholder="Your password" className="form-input" autoComplete="current-password" required />
              </div>
              {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <button type="button" onClick={continueAsGuest} className="btn-secondary w-full justify-center py-3" disabled={loading}>
                Continue as guest
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-sage-600">
              No account?{' '}
              <Link to="/signup" className="font-semibold text-forest-700 hover:underline">Create your workspace</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
