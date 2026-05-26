import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { jobAnalyzerApi } from '../services/api.js';

const initial = { profileText: '', resumeText: '', jobDescription: '', targetCompany: '', targetRole: '' };

export default function JobAnalyzer() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e) => { e.preventDefault(); setLoading(true); try { setResult(await jobAnalyzerApi.analyze(form)); } finally { setLoading(false); } };
  return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 py-8 md:py-12"><div className="max-w-6xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1.5">Job Description Match Analyzer</h1>
      <p className="text-sm text-muted mb-8">Compare profile and resume against a role, then generate application direction.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <form onSubmit={submit} className="card p-5 sm:p-6 space-y-4">
          <input name="targetRole" value={form.targetRole} onChange={set} placeholder="Target role" className="form-input" />
          <input name="targetCompany" value={form.targetCompany} onChange={set} placeholder="Target company" className="form-input" />
          <textarea name="profileText" value={form.profileText} onChange={set} rows={4} placeholder="Profile text" className="form-textarea" />
          <textarea name="resumeText" value={form.resumeText} onChange={set} rows={4} placeholder="Resume text" className="form-textarea" />
          <textarea name="jobDescription" value={form.jobDescription} onChange={set} rows={7} placeholder="Job description" className="form-textarea" />
          <button className="btn-primary w-full justify-center" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Job'}</button>
        </form>
        {result && <div className="card p-5 sm:p-6 space-y-5">
          <div><p className="text-xs text-muted uppercase font-semibold">Match Score</p><p className="text-5xl font-extrabold text-accent">{result.matchPercentage}%</p></div>
          {['matchedSkills', 'missingSkills', 'importantKeywords', 'resumeKeywordsToAdd'].map((key) => <div key={key}><p className="text-xs text-muted uppercase font-semibold mb-2">{key.replace(/([A-Z])/g, ' $1')}</p><div className="flex flex-wrap gap-2">{result[key].map((item) => <span key={item} className="bg-surface border border-border rounded-lg px-2.5 py-1 text-xs">{item}</span>)}</div></div>)}
          {['customResumeSummary', 'customCoverLetter', 'recruiterMessage', 'finalRecommendation'].map((key) => <div key={key}><p className="text-xs text-muted uppercase font-semibold mb-2">{key.replace(/([A-Z])/g, ' $1')}</p><p className="text-sm bg-surface border border-border rounded-lg p-3 leading-relaxed">{result[key]}</p></div>)}
        </div>}
      </div>
    </div></main><Footer /></div>
  );
}
