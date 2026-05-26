import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { intelligenceApi } from '../services/api.js';

function Panel({ title, subtitle, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="font-bold text-ink">{title}</h2>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Chips({ items = [] }) {
  if (!items.length) return <p className="text-sm text-muted">No data yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={String(item)} className="text-xs font-semibold bg-surface border border-border rounded-lg px-2.5 py-1">
          {String(item)}
        </span>
      ))}
    </div>
  );
}

function ScoreBar({ label, score, note }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div className="border border-border rounded-lg p-3 bg-surface">
      <div className="flex justify-between gap-3 text-sm font-semibold text-ink">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden mt-2">
        <div className="h-full bg-accent rounded-full" style={{ width: `${value}%` }} />
      </div>
      {note && <p className="text-xs text-muted mt-2">{note}</p>}
    </div>
  );
}

function List({ items = [] }) {
  if (!items.length) return <p className="text-sm text-muted">No items yet.</p>;
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="text-sm bg-surface border border-border rounded-lg p-3">
          {String(item)}
        </div>
      ))}
    </div>
  );
}

export default function CareerIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobPost, setJobPost] = useState('');
  const [jobInspect, setJobInspect] = useState(null);
  const [checkingJob, setCheckingJob] = useState(false);

  useEffect(() => {
    let active = true;
    intelligenceApi.overview()
      .then((overview) => { if (active) setData(overview); })
      .catch((err) => { if (active) setError(err.message || 'Unable to load career intelligence.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const inspectJob = async (e) => {
    e.preventDefault();
    if (!jobPost.trim()) return;
    setCheckingJob(true);
    try {
      setJobInspect(await intelligenceApi.inspectJob({ jobPost }));
    } catch (err) {
      setJobInspect({ scamRisk: 'Error', recommendation: err.message || 'Unable to inspect job post.', redFlags: [] });
    } finally {
      setCheckingJob(false);
    }
  };

  const vault = data?.careerVault;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wide text-accent mb-2">Career Operating System</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">Career Intelligence Hub</h1>
            <p className="text-sm text-muted mt-1">Dynamic insights from your profile, applications, generated content, roadmaps, job matches, and interviews.</p>
          </div>

          {loading && <div className="card p-8 text-sm text-muted">Loading career intelligence...</div>}
          {!loading && error && <div className="card p-5 bg-red-50 border-red-200 text-sm text-red-700">{error}</div>}

          {!loading && !error && data?.fallback && (
            <div className="card p-8 text-sm text-muted">Career intelligence needs MongoDB connection to read saved profile, interviews, applications, and generated content.</div>
          )}

          {!loading && !error && data && !data.fallback && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {data.reportCards.map((card) => (
                  <ScoreBar key={card.label} label={card.label} score={card.score} note={card.note} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
                <Panel title="Career Vault" subtitle="Your saved career memory used by the intelligence layer.">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {Object.entries(vault.assets).map(([key, value]) => (
                      <div key={key} className="bg-surface border border-border rounded-lg p-3">
                        <p className="text-xs text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-2xl font-extrabold text-navy-900">{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted mb-3">Target role: <span className="font-semibold text-ink">{vault.targetRole}</span></p>
                  <Chips items={vault.savedSkills} />
                </Panel>

                <Panel title="Application Readiness" subtitle="Checks before applying to serious roles.">
                  <ScoreBar label="Readiness" score={data.applicationReadiness.score} />
                  <div className="mt-4 space-y-2">
                    {data.applicationReadiness.checks.map((check) => (
                      <div key={check.label} className="flex items-center justify-between text-sm border border-border rounded-lg p-2.5 bg-surface">
                        <span>{check.label}</span>
                        <span className={check.done ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{check.done ? 'Done' : 'Pending'}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Panel title="ATS Resume Tailor" subtitle="Based on your latest job analysis.">
                  <ScoreBar label="Latest match" score={data.atsTailor.latestMatchScore} />
                  <p className="text-xs font-semibold text-muted uppercase mt-4 mb-2">Keywords to add</p>
                  <Chips items={data.atsTailor.keywordsToAdd} />
                  <p className="text-sm bg-surface border border-border rounded-lg p-3 mt-4">{data.atsTailor.summarySuggestion}</p>
                </Panel>

                <Panel title="Skill Gap Projects" subtitle="Turn missing skills into proof projects.">
                  <div className="space-y-3">
                    {data.skillGapProjects.length ? data.skillGapProjects.map((item) => (
                      <div key={item.skill} className="bg-surface border border-border rounded-lg p-3">
                        <p className="font-semibold text-ink text-sm">{item.skill}</p>
                        <p className="text-sm text-muted mt-1">{item.project}</p>
                        <p className="text-xs text-accent font-semibold mt-2">{item.proof}</p>
                      </div>
                    )) : <p className="text-sm text-muted">Run Job Analyzer to discover skill-gap projects.</p>}
                  </div>
                </Panel>

                <Panel title="Voice Speech Analytics" subtitle="Computed from saved interview messages.">
                  {Object.entries(data.speechAnalytics).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-3 text-sm border-b border-border py-2 last:border-0">
                      <span className="text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-semibold text-ink">{String(value)}</span>
                    </div>
                  ))}
                </Panel>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Panel title="Application Analytics" subtitle="Calculated from your saved application pipeline.">
                  <ScoreBar label="Response rate" score={data.applicationAnalytics?.responseRate || 0} />
                  <div className="mt-3"><ScoreBar label="Offer rate" score={data.applicationAnalytics?.offerRate || 0} /></div>
                  <p className="text-sm text-muted mt-3">Best source: <span className="font-semibold text-ink">{data.applicationAnalytics?.bestSource || 'Not enough data'}</span></p>
                  <p className="text-sm bg-surface border border-border rounded-lg p-3 mt-3">{data.rejectionPattern}</p>
                </Panel>

                <Panel title="Resume Tailoring Diff" subtitle="Uses saved application resume before/after bullets.">
                  <div className="space-y-3">
                    {data.resumeTailoringDiff?.length ? data.resumeTailoringDiff.map((item) => (
                    <div key={`${item.companyName}-${item.role}`} className="bg-surface border border-border rounded-lg p-3 min-w-0">
                        <p className="text-sm font-semibold text-ink">{item.companyName} - {item.role}</p>
                        <p className="text-xs text-muted mt-2">Before: {item.before}</p>
                        <p className="text-xs text-muted mt-1">After: {item.after}</p>
                        <div className="mt-2"><Chips items={item.addedKeywords} /></div>
                        <p className="text-xs text-accent font-semibold mt-2">{item.atsImpact}</p>
                      </div>
                    )) : <p className="text-sm text-muted">Add resume before/after bullets in Application Tracker.</p>}
                  </div>
                </Panel>

                <Panel title="Resume Proof Scores" subtitle="Checks project proof, metrics, stack, and outcome evidence.">
                  <div className="space-y-3">
                    {data.proofScores?.length ? data.proofScores.map((item) => (
                      <ScoreBar key={`${item.companyName}-${item.role}`} label={`${item.companyName} - ${item.role}`} score={item.score} />
                    )) : <p className="text-sm text-muted">Add applications to calculate proof scores.</p>}
                  </div>
                </Panel>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
                <Panel title="Job Red Flag Detector" subtitle="Paste any job post to detect scam signals and match fit.">
                  <form onSubmit={inspectJob} className="space-y-3">
                    <textarea value={jobPost} onChange={(e) => setJobPost(e.target.value)} rows={7} className="form-textarea" placeholder="Paste job post, recruiter message, or job description..." />
                    <button className="btn-primary w-full justify-center" disabled={checkingJob}>{checkingJob ? 'Checking...' : 'Inspect Job Post'}</button>
                  </form>
                  {jobInspect && (
                    <div className="mt-4 bg-surface border border-border rounded-lg p-4">
                      <p className="text-sm font-bold text-ink">Risk: {jobInspect.scamRisk}</p>
                      <p className="text-sm text-muted mt-1">{jobInspect.recommendation}</p>
                      <div className="mt-3"><Chips items={jobInspect.redFlags || []} /></div>
                      {jobInspect.match && <div className="mt-4"><ScoreBar label="Profile match" score={jobInspect.match.score} /></div>}
                    </div>
                  )}
                </Panel>

                <Panel title="Interview Moment Replay" subtitle="Review where points were gained or lost.">
                  <div className="space-y-3">
                    {data.interviewReplay.length ? data.interviewReplay.map((item, index) => (
                      <div key={`${item.question}-${index}`} className="bg-surface border border-border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-ink">{item.question}</p>
                          <span className="text-xs font-bold text-accent">{item.score}/10</span>
                        </div>
                        <p className="text-sm text-muted mt-2">{item.feedback}</p>
                        <p className="text-xs text-ink mt-2">{item.betterAnswer}</p>
                      </div>
                    )) : <p className="text-sm text-muted">Complete interviews to unlock replay insights.</p>}
                  </div>
                </Panel>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Panel title="Behavioral Story Library">
                  <div className="space-y-3">
                    {data.behavioralStories.map((story) => (
                      <div key={story.type} className="bg-surface border border-border rounded-lg p-3">
                        <p className="text-sm font-semibold text-ink">{story.type}</p>
                        <p className="text-sm text-muted mt-1">{story.prompt}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Referral Finder">
                  <List items={data.referralFinder.searchQueries} />
                  <p className="text-sm bg-surface border border-border rounded-lg p-3 mt-3">{data.referralFinder.message}</p>
                  {data.referralFinder.contacts?.length ? (
                    <div className="mt-3 space-y-2">
                      {data.referralFinder.contacts.map((contact) => (
                    <div key={`${contact.companyName}-${contact.name}`} className="text-xs bg-surface border border-border rounded-lg p-2 min-w-0">
                          <p className="font-semibold text-ink">{contact.name} - {contact.companyName}</p>
                          <p className="text-muted">{contact.email || contact.linkedIn || 'Contact saved'}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Panel>

                <Panel title="Salary Coach">
                  <List items={data.salaryCoach.scripts} />
                  <div className="mt-3"><Chips items={data.salaryCoach.negotiationChecklist} /></div>
                </Panel>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Panel title="Job Search Agent">
                  <p className="text-sm text-muted mb-3">Target: <span className="font-semibold text-ink">{data.jobSearchAgent.targetRole}</span></p>
                  <Chips items={data.jobSearchAgent.searchQueries} />
                  <div className="mt-4"><List items={data.jobSearchAgent.dailyPlan} /></div>
                </Panel>

                <Panel title="Portfolio Analyzer">
                  <Chips items={data.portfolioAnalyzer.projectKeywords} />
                  <div className="mt-4"><List items={data.portfolioAnalyzer.improvements} /></div>
                </Panel>

                <Panel title="Weakness Practice Mode">
                  <div className="space-y-3">
                    {data.weaknessPractice.map((item) => (
                      <div key={item.weakness} className="bg-surface border border-border rounded-lg p-3">
                        <p className="text-sm font-semibold text-ink">{item.weakness}</p>
                        <p className="text-sm text-muted mt-1">{item.drill}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6">
                <Panel title="Company Prep" subtitle="Generated from dream company and latest application data.">
                  <p className="text-sm text-muted mb-3">Company: <span className="font-semibold text-ink">{data.companyPrep.targetCompany}</span></p>
                  <List items={data.companyPrep.prepTasks} />
                </Panel>

                <Panel title="Application Timeline" subtitle="Next actions from saved application records.">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.applicationTimeline?.length ? data.applicationTimeline.map((item) => (
                      <div key={`${item.companyName}-${item.role}-${item.status}`} className="bg-surface border border-border rounded-lg p-3 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                          <div>
                            <p className="text-sm font-semibold text-ink">{item.companyName}</p>
                            <p className="text-xs text-muted">{item.role}</p>
                          </div>
                          <span className="text-xs font-bold text-accent">{item.status}</span>
                        </div>
                        <p className="text-xs text-muted mt-2">Source: {item.source} | Priority: {item.priority}</p>
                        <p className="text-xs font-semibold text-ink mt-2">Next: {item.nextAction}</p>
                      </div>
                    )) : <p className="text-sm text-muted">No application timeline yet.</p>}
                  </div>
                </Panel>
              </div>

              <Panel title="Career Timeline" subtitle="Recent career activity across the whole platform.">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.careerTimeline.length ? data.careerTimeline.map((event) => (
                    <div key={`${event.type}-${event.title}-${event.date}`} className="bg-surface border border-border rounded-lg p-3">
                      <p className="text-xs font-bold text-accent uppercase">{event.type}</p>
                      <p className="text-sm font-semibold text-ink mt-1">{event.title}</p>
                      <p className="text-xs text-muted mt-1">{event.date ? new Date(event.date).toLocaleString() : ''}</p>
                    </div>
                  )) : <p className="text-sm text-muted">No timeline activity yet.</p>}
                </div>
              </Panel>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
