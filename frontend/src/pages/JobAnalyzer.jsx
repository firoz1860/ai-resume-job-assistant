import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Loader from '../components/Loader.jsx';
import { Icon } from '../components/Reveal.jsx';
import { jobAnalyzerApi } from '../services/api.js';

const initial = { profileText: '', resumeText: '', jobDescription: '', targetCompany: '', targetRole: '' };

// Defined at module scope so its identity is stable across re-renders
// (a component defined inside the page would remount inputs and drop focus).
function Field({ id, label, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="form-label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-sage-500">{hint}</p>}
    </div>
  );
}

const SKILL_SECTIONS = [
  { key: 'matchedSkills', title: 'Supporting skills (evidence found)', tone: 'good' },
  { key: 'missingSkills', title: 'Missing evidence (not found in your profile)', tone: 'warn' },
  { key: 'importantKeywords', title: 'Important keywords in this role', tone: 'neutral' },
  { key: 'resumeKeywordsToAdd', title: 'Keywords worth adding to your resume', tone: 'neutral' },
];

const TEXT_SECTIONS = [
  ['customResumeSummary', 'Suggested resume summary'],
  ['customCoverLetter', 'Draft cover letter'],
  ['recruiterMessage', 'Draft recruiter message'],
  ['finalRecommendation', 'Final recommendation'],
];

const CHIP_TONES = {
  good: 'bg-forest-50 border-border text-forest-700',
  warn: 'bg-amber-50 border-amber-200 text-amber-800',
  neutral: 'bg-surface border-border text-ink',
};

export default function JobAnalyzer() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { setResult(await jobAnalyzerApi.analyze(form)); }
    catch (err) { setError(err.message || 'Unable to analyze the job. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <span className="eyebrow-pill mb-2">
              <Icon name="target" className="w-3.5 h-3.5 text-forest-700" />
              Analyzer
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1.5">Job Description Match Analyzer</h1>
            <p className="text-sm text-sage-600">Compare your profile and resume against a role to see evidence-based overlap, then generate application direction.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Input area */}
            <form onSubmit={submit} className="card p-5 sm:p-6 space-y-4">
              <p className="eyebrow-pill">
                <Icon name="doc" className="w-3.5 h-3.5 text-forest-700" />
                The role & your background
              </p>
              <Field id="ja-targetRole" label="Target role">
                <input id="ja-targetRole" name="targetRole" value={form.targetRole} onChange={set} placeholder="e.g. Frontend Developer" className="form-input" />
              </Field>
              <Field id="ja-targetCompany" label="Target company">
                <input id="ja-targetCompany" name="targetCompany" value={form.targetCompany} onChange={set} placeholder="e.g. Acme Inc." className="form-input" />
              </Field>
              <Field id="ja-profileText" label="Profile text">
                <textarea id="ja-profileText" name="profileText" value={form.profileText} onChange={set} rows={4} placeholder="Paste your profile / bio" className="form-textarea" />
              </Field>
              <Field id="ja-resumeText" label="Resume text">
                <textarea id="ja-resumeText" name="resumeText" value={form.resumeText} onChange={set} rows={4} placeholder="Paste your resume text" className="form-textarea" />
              </Field>
              <Field id="ja-jobDescription" label="Job description (source)" hint="Paste the real posting for the most accurate match.">
                <textarea id="ja-jobDescription" name="jobDescription" value={form.jobDescription} onChange={set} rows={7} placeholder="Paste the full job description" className="form-textarea" />
              </Field>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-card">
                  <p className="text-sm font-semibold text-red-700">Analysis failed</p>
                  <p className="text-sm text-red-700/90 mt-0.5">{error}</p>
                  <p className="text-xs text-red-700/80 mt-1">Your input is kept — press Analyze to try again.</p>
                </div>
              )}
              <button className="btn-primary w-full justify-center" disabled={loading}>
                {loading ? (<><Icon name="history" className="w-4 h-4 animate-spin" />Analyzing...</>) : (<><Icon name="target" className="w-4 h-4" />Analyze Job</>)}
              </button>
            </form>

            {/* Results area */}
            <div className="lg:sticky lg:top-24">
              {loading && (
                <div className="card min-h-[420px] flex items-center justify-center">
                  <Loader message="Analyzing your match..." />
                </div>
              )}

              {!loading && result && (
                <div className="card p-5 sm:p-6 space-y-6 animate-fade-in">
                  <div>
                    <p className="text-xs text-sage-500 uppercase font-semibold tracking-wide">Profile Match</p>
                    <div className="flex items-end gap-2 mt-1">
                      <p className="text-5xl font-extrabold text-forest-700 leading-none">{result.matchPercentage}%</p>
                    </div>
                    <p className="text-xs text-sage-500 mt-2 leading-relaxed">
                      Evidence-based overlap between your profile and this role — not a prediction of being hired.
                    </p>
                    <div className="h-2 bg-surface rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-forest rounded-full transition-all" style={{ width: `${result.matchPercentage}%` }} />
                    </div>
                  </div>

                  {SKILL_SECTIONS.map(({ key, title, tone }) => (
                    <div key={key}>
                      <p className="text-xs text-sage-500 uppercase font-semibold tracking-wide mb-2">{title}</p>
                      {(result[key] || []).length ? (
                        <div className="flex flex-wrap gap-2">
                          {(result[key] || []).map((item, index) => (
                            <span key={`${key}-${index}`} className={`border rounded-lg px-2.5 py-1 text-xs font-medium break-words ${CHIP_TONES[tone]}`}>{item}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-sage-500">None found.</p>
                      )}
                    </div>
                  ))}

                  {TEXT_SECTIONS.map(([key, title]) => (
                    <div key={key}>
                      <p className="text-xs text-sage-500 uppercase font-semibold tracking-wide mb-2">{title}</p>
                      <p className="text-sm text-ink bg-surface border border-border rounded-card p-3 leading-relaxed whitespace-pre-wrap break-words">{result[key]}</p>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !result && (
                <div className="card min-h-[420px] p-6 flex flex-col justify-center text-center">
                  <div className="w-14 h-14 rounded-card bg-forest-50 border border-border grid place-items-center mx-auto mb-4">
                    <Icon name="target" className="w-6 h-6 text-forest-700" />
                  </div>
                  <h2 className="text-lg font-bold text-ink mb-2">Your match report appears here</h2>
                  <p className="text-sm text-sage-600 leading-relaxed max-w-sm mx-auto">
                    Add the role and your background, then run the analysis to see supporting skills, missing evidence, and tailored application drafts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
