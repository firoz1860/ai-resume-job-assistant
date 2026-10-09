import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthVisual from '../components/AuthVisual.jsx';
import Wordmark from '../components/marketing/Wordmark.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(form);
      // signup() already authenticates (stores token + user), so go straight
      // to the app instead of asking the user to log in again.
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ivory lg:grid lg:grid-cols-2">
      <AuthVisual mode="signup" />

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md">
          <Link to="/" aria-label="CareerOS AI home" className="mb-8 inline-block lg:hidden">
            <Wordmark size="nav" />
          </Link>

          <div className="panel p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Create your workspace</h2>
            <p className="mt-1 text-sm text-sage-600">One private place for your whole job search.</p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="signup-name" className="form-label">Full name</label>
                <input id="signup-name" name="name" value={form.name} onChange={set} placeholder="Your name" className="form-input" autoComplete="name" required />
              </div>
              <div>
                <label htmlFor="signup-email" className="form-label">Email address</label>
                <input id="signup-email" name="email" type="email" value={form.email} onChange={set} placeholder="you@example.com" className="form-input" autoComplete="email" required />
              </div>
              <div>
                <label htmlFor="signup-password" className="form-label">Password</label>
                <input id="signup-password" name="password" type="password" value={form.password} onChange={set} placeholder="At least 6 characters" className="form-input" autoComplete="new-password" required minLength={6} />
              </div>
              {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? 'Creating workspace…' : 'Create workspace'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-sage-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-forest-700 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
