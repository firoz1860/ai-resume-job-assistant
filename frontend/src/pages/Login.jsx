import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthVisual from '../components/AuthVisual.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await login(form); navigate('/dashboard'); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-surface px-4 py-8 lg:p-0">
    <AuthVisual mode="login" />
    <form onSubmit={submit} className="max-w-md w-full mx-auto self-center card p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-ink mb-1">Login</h2><p className="text-sm text-muted mb-6">Continue to your career dashboard.</p>
      <input name="email" value={form.email} onChange={set} placeholder="Email" className="form-input mb-3" />
      <input name="password" type="password" value={form.password} onChange={set} placeholder="Password" className="form-input mb-3" />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button className="btn-primary w-full justify-center" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      <p className="text-sm text-muted mt-4">No account? <Link to="/signup" className="text-accent font-semibold">Create one</Link></p>
    </form>
  </div>;
}
