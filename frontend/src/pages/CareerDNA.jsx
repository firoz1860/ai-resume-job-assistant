import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { careerApi } from '../services/api.js';

const initial = { fullName: '', education: '', skills: '', projects: '', experience: '', targetRole: '', dreamCompany: '', resumeText: '' };

export default function CareerDNA() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { setResult(await careerApi.analyze(form)); } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 py-8 md:py-12"><div className="max-w-6xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1.5">AI Career DNA Scanner</h1>
      <p className="text-sm text-muted mb-8">Analyze strengths, gaps, roles, and a 30-day action plan.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <form onSubmit={submit} className="card p-5 sm:p-6 space-y-4">
          {['fullName', 'education', 'skills', 'projects', 'experience', 'targetRole', 'dreamCompany'].map((name) => <input key={name} name={name} value={form[name]} onChange={set} placeholder={name.replace(/([A-Z])/g, ' $1')} className="form-input" />)}
          <textarea name="resumeText" value={form.resumeText} onChange={set} rows={6} placeholder="Current resume text" className="form-textarea" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full justify-center" disabled={loading}>{loading ? 'Scanning...' : 'Scan Career DNA'}</button>
        </form>
        {result && <div className="card p-5 sm:p-6 space-y-5">
          <div><p className="text-xs text-muted uppercase font-semibold">Career Strength</p><p className="text-5xl font-extrabold text-accent">{result.careerStrengthScore}</p></div>
          {['bestFitRoles', 'strengths', 'weakAreas', 'missingSkills', 'resumeImprovements', 'projectImprovements', 'actionPlan'].map((key) => <div key={key}><p className="text-xs text-muted uppercase font-semibold mb-2">{key.replace(/([A-Z])/g, ' $1')}</p><div className="flex flex-col gap-2">{(result[key] || []).map((item, index) => <span key={`${key}-${index}`} className="bg-surface border border-border rounded-lg px-3 py-2 text-sm">{item}</span>)}</div></div>)}
        </div>}
      </div>
    </div></main><Footer /></div>
  );
}
