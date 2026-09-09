import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { roadmapApi } from '../services/api.js';

export default function Roadmap() {
  const [form, setForm] = useState({ currentSkills: '', targetRole: '', timePerDay: '1 hour', duration: '4 weeks', level: 'Beginner' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { setResult(await roadmapApi.create(form)); }
    catch (err) { setError(err.message || 'Unable to create roadmap. Please try again.'); }
    finally { setLoading(false); }
  };
  return <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 py-8 md:py-12"><div className="max-w-6xl mx-auto px-4 sm:px-6">
    <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1.5">Skill Roadmap Generator</h1><p className="text-sm text-muted mb-8">Create a focused learning plan for your target role.</p>
    <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
      <form onSubmit={submit} className="card p-5 sm:p-6 space-y-4">
        <input name="currentSkills" value={form.currentSkills} onChange={set} placeholder="Current skills" className="form-input" />
        <input name="targetRole" value={form.targetRole} onChange={set} placeholder="Target role" className="form-input" />
        <input name="timePerDay" value={form.timePerDay} onChange={set} placeholder="Available time per day" className="form-input" />
        <select name="duration" value={form.duration} onChange={set} className="form-select">{['2 weeks', '4 weeks', '8 weeks'].map((x) => <option key={x}>{x}</option>)}</select>
        <select name="level" value={form.level} onChange={set} className="form-select">{['Beginner', 'Intermediate', 'Advanced'].map((x) => <option key={x}>{x}</option>)}</select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full justify-center" disabled={loading}>{loading ? 'Creating...' : 'Create Roadmap'}</button>
      </form>
      <div className="space-y-4">{result ? (result.plan || []).map((week) => <div key={week.week} className="card p-5"><p className="text-xs text-muted uppercase font-semibold">Week {week.week}</p><h2 className="font-bold text-ink mb-2">{week.focus}</h2><div className="flex flex-wrap gap-2 mb-3">{(week.topics || []).map((t, index) => <span key={`${week.week}-${t}-${index}`} className="text-xs border border-border rounded-lg px-2 py-1">{t}</span>)}</div>{(week.dailyTasks || []).map((task, index) => <p key={`${week.week}-${index}`} className="text-sm bg-surface border border-border rounded-lg p-2 mb-2">{task}</p>)}<p className="text-sm font-semibold text-accent">{week.miniProject}</p></div>) : <div className="card p-6 text-sm text-muted">Your roadmap timeline will appear here.</div>}</div>
    </div>
  </div></main><Footer /></div>;
}
