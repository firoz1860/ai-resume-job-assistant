import { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import { Icon, Reveal } from '../components/Reveal.jsx';
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
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <PageHeader
            icon="route"
            eyebrow="Learning plan"
            title="Skill Roadmap Generator"
            subtitle="Create a focused, week-by-week learning plan for your target role."
          />

          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
            <form onSubmit={submit} className="card p-5 sm:p-6 space-y-4 lg:sticky lg:top-24">
              <div>
                <h2 className="font-semibold text-ink">Plan details</h2>
                <p className="text-sm text-sage-600 mt-1">Tell us where you are and where you want to go.</p>
              </div>
              <div>
                <label htmlFor="currentSkills" className="form-label">Current skills</label>
                <input id="currentSkills" name="currentSkills" value={form.currentSkills} onChange={set} placeholder="e.g. HTML, CSS, basic JavaScript" className="form-input" />
              </div>
              <div>
                <label htmlFor="targetRole" className="form-label">Target role</label>
                <input id="targetRole" name="targetRole" value={form.targetRole} onChange={set} placeholder="e.g. Frontend Engineer" className="form-input" />
              </div>
              <div>
                <label htmlFor="timePerDay" className="form-label">Available time per day</label>
                <input id="timePerDay" name="timePerDay" value={form.timePerDay} onChange={set} placeholder="e.g. 1 hour" className="form-input" />
              </div>
              <div>
                <label htmlFor="duration" className="form-label">Duration</label>
                <select id="duration" name="duration" value={form.duration} onChange={set} className="form-select">{['2 weeks', '4 weeks', '8 weeks'].map((x) => <option key={x}>{x}</option>)}</select>
              </div>
              <div>
                <label htmlFor="level" className="form-label">Level</label>
                <select id="level" name="level" value={form.level} onChange={set} className="form-select">{['Beginner', 'Intermediate', 'Advanced'].map((x) => <option key={x}>{x}</option>)}</select>
              </div>
              {error && (
                <div role="alert" className="rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <p className="font-semibold">Could not create roadmap</p>
                  <p className="mt-1">{error}</p>
                  <p className="mt-1 text-red-600/80">Your inputs are kept. Adjust if needed and try again.</p>
                </div>
              )}
              <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating...' : 'Create Roadmap'}</button>
            </form>

            <div className="space-y-4">
              {loading && (
                <div className="card p-4"><Loader message="Building your learning roadmap..." /></div>
              )}

              {!loading && result && (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge bg-lime text-forest-800">
                      <Icon name="sparkle" className="h-3.5 w-3.5" />
                      AI-generated plan
                    </span>
                    <span className="text-sm text-sage-600">Review and adapt it to your own pace.</span>
                  </div>
                  {(result.plan || []).length ? (result.plan || []).map((week, wi) => (
                    <Reveal as="div" delay={wi * 60} key={week.week} className="card p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-9 h-9 rounded-card bg-forest-50 text-forest-700 grid place-items-center shrink-0 font-semibold text-sm">{week.week}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">Week {week.week}</p>
                          <h2 className="font-semibold text-ink">{week.focus}</h2>
                        </div>
                      </div>
                      {!!(week.topics || []).length && (
                        <div className="flex flex-wrap gap-2 mb-3">{(week.topics || []).map((t, index) => <span key={`${week.week}-${t}-${index}`} className="badge bg-forest-50 text-forest-700 border border-forest-100">{t}</span>)}</div>
                      )}
                      <div className="space-y-2">
                        {(week.dailyTasks || []).map((task, index) => (
                          <p key={`${week.week}-${index}`} className="flex gap-2 text-sm text-ink bg-surface border border-border rounded-card p-2.5">
                            <Icon name="check" className="h-4 w-4 text-forest-700 shrink-0 mt-0.5" />
                            <span>{task}</span>
                          </p>
                        ))}
                      </div>
                      {week.miniProject && (
                        <div className="mt-3 flex gap-2 rounded-card border border-forest-100 bg-forest-50 p-3">
                          <Icon name="rocket" className="h-4 w-4 text-forest-700 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-forest-700">Mini project</p>
                            <p className="text-sm text-ink mt-0.5">{week.miniProject}</p>
                          </div>
                        </div>
                      )}
                    </Reveal>
                  )) : (
                    <div className="card p-10 text-center">
                      <div className="w-14 h-14 rounded-panel bg-forest-50 grid place-items-center mx-auto mb-4"><Icon name="route" className="h-6 w-6 text-forest-700" /></div>
                      <h3 className="font-semibold text-ink">No weeks returned</h3>
                      <p className="text-sm text-sage-600 mt-1 max-w-sm mx-auto">The generator did not return any milestones. Try a different target role or duration.</p>
                    </div>
                  )}
                </>
              )}

              {!loading && !result && (
                <div className="card p-10 text-center">
                  <div className="w-14 h-14 rounded-panel bg-forest-50 grid place-items-center mx-auto mb-4"><Icon name="route" className="h-6 w-6 text-forest-700" /></div>
                  <h3 className="font-semibold text-ink">Your roadmap will appear here</h3>
                  <p className="text-sm text-sage-600 mt-1 max-w-sm mx-auto">Fill in your current skills and target role, then create a plan to see a week-by-week timeline.</p>
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
