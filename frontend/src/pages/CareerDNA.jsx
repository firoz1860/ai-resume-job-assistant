import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import { Icon, Reveal } from '../components/Reveal.jsx';
import { careerApi } from '../services/api.js';

const initial = { fullName: '', education: '', skills: '', projects: '', experience: '', targetRole: '', dreamCompany: '', resumeText: '' };

const fieldLabels = {
  fullName: 'Full name',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  experience: 'Experience',
  targetRole: 'Target role',
  dreamCompany: 'Dream company',
};

// Result groups split into what the scan surfaces as strengths vs. gaps vs. AI recommendations.
const resultGroups = [
  {
    heading: 'Strengths & fit',
    kind: 'calculated',
    keys: [
      ['bestFitRoles', 'Best-fit roles', 'target'],
      ['strengths', 'Strengths', 'check'],
    ],
  },
  {
    heading: 'Gaps to close',
    kind: 'calculated',
    keys: [
      ['weakAreas', 'Weak areas', 'shield'],
      ['missingSkills', 'Missing skills', 'bolt'],
    ],
  },
  {
    heading: 'Recommendations',
    kind: 'ai',
    keys: [
      ['resumeImprovements', 'Resume improvements', 'doc'],
      ['projectImprovements', 'Project improvements', 'rocket'],
      ['actionPlan', '30-day action plan', 'route'],
    ],
  },
];

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

  const hasStrength = result && (result.careerStrengthScore !== null && result.careerStrengthScore !== undefined && result.careerStrengthScore !== '' && !Number.isNaN(Number(result.careerStrengthScore)));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <PageHeader
            icon="sparkle"
            eyebrow="Career DNA"
            title="AI Career DNA Scanner"
            subtitle="Analyze your strengths, gaps, best-fit roles, and a 30-day action plan."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <form onSubmit={submit} className="card p-5 sm:p-6 space-y-4 lg:sticky lg:top-24">
              <div>
                <h2 className="font-semibold text-ink">Your inputs</h2>
                <p className="text-sm text-sage-600 mt-1">The more detail you add, the sharper the analysis.</p>
              </div>
              {['fullName', 'education', 'skills', 'projects', 'experience', 'targetRole', 'dreamCompany'].map((name) => (
                <div key={name}>
                  <label htmlFor={name} className="form-label">{fieldLabels[name]}</label>
                  <input id={name} name={name} value={form[name]} onChange={set} placeholder={fieldLabels[name]} className="form-input" />
                </div>
              ))}
              <div>
                <label htmlFor="resumeText" className="form-label">Current resume text</label>
                <textarea id="resumeText" name="resumeText" value={form.resumeText} onChange={set} rows={6} placeholder="Paste your current resume text" className="form-textarea" />
              </div>
              {error && (
                <div role="alert" className="rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <p className="font-semibold">Scan failed</p>
                  <p className="mt-1">{error}</p>
                  <p className="mt-1 text-red-600/80">Your inputs are kept. Try scanning again.</p>
                </div>
              )}
              <button className="btn-primary w-full" disabled={loading}>{loading ? 'Scanning...' : 'Scan Career DNA'}</button>
            </form>

            <div className="space-y-5">
              {loading && (
                <div className="card p-4"><Loader message="Scanning your career DNA..." /></div>
              )}

              {!loading && result && (
                <>
                  <Reveal as="div" className="card p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">Career strength</p>
                        {hasStrength ? (
                          <p className="text-5xl font-bold text-forest-700 font-display mt-1">{result.careerStrengthScore}</p>
                        ) : (
                          <p className="text-lg font-semibold text-sage-600 mt-2">Not available yet</p>
                        )}
                      </div>
                      <span className="badge bg-forest-50 text-forest-700 border border-forest-100">
                        <Icon name="chart" className="h-3.5 w-3.5" />
                        Calculated
                      </span>
                    </div>
                  </Reveal>

                  {resultGroups.map((group, gi) => (
                    <Reveal as="section" delay={gi * 60} key={group.heading} className="card p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                        <h2 className="font-semibold text-ink">{group.heading}</h2>
                        {group.kind === 'ai' ? (
                          <span className="badge bg-lime text-forest-800"><Icon name="sparkle" className="h-3.5 w-3.5" />Suggested</span>
                        ) : (
                          <span className="badge bg-forest-50 text-forest-700 border border-forest-100"><Icon name="check" className="h-3.5 w-3.5" />Calculated</span>
                        )}
                      </div>
                      <div className="space-y-5">
                        {group.keys.map(([key, label, icon]) => (
                          <div key={key}>
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sage-600 mb-2">
                              <Icon name={icon} className="h-4 w-4 text-forest-700" />
                              {label}
                            </p>
                            {(result[key] || []).length ? (
                              <div className="flex flex-col gap-2">
                                {(result[key] || []).map((item, index) => (
                                  <span key={`${key}-${index}`} className="bg-surface border border-border rounded-card px-3 py-2 text-sm text-ink">{item}</span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-sage-600">Nothing surfaced here yet.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </Reveal>
                  ))}
                </>
              )}

              {!loading && !result && (
                <div className="card p-10 text-center">
                  <div className="w-14 h-14 rounded-panel bg-forest-50 grid place-items-center mx-auto mb-4"><Icon name="sparkle" className="h-6 w-6 text-forest-700" /></div>
                  <h3 className="font-semibold text-ink">Your Career DNA report will appear here</h3>
                  <p className="text-sm text-sage-600 mt-1 max-w-sm mx-auto">Fill in the form and run a scan to see strengths, gaps, best-fit roles, and a 30-day plan.</p>
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
