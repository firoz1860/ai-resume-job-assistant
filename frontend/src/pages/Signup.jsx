import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthVisual from '../components/AuthVisual.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await signup(form); navigate('/dashboard'); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-surface px-4 py-8 lg:p-0">
    <AuthVisual mode="signup" />
    <form onSubmit={submit} className="max-w-md w-full mx-auto self-center card p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-ink mb-1">Create account</h2><p className="text-sm text-muted mb-6">Your private AI career workspace.</p>
      <input name="name" value={form.name} onChange={set} placeholder="Name" className="form-input mb-3" />
      <input name="email" value={form.email} onChange={set} placeholder="Email" className="form-input mb-3" />
      <input name="password" type="password" value={form.password} onChange={set} placeholder="Password, min 6 chars" className="form-input mb-3" />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button className="btn-primary w-full justify-center" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</button>
      <p className="text-sm text-muted mt-4">Already have an account? <Link to="/login" className="text-accent font-semibold">Login</Link></p>
    </form>
  </div>;
}
