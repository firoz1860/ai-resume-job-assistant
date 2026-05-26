import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { applicationsApi } from '../services/api.js';

const empty = {
  companyName: '',
  role: '',
  jobLink: '',
  status: 'Saved',
  appliedDate: '',
  followUpDate: '',
  notes: '',
  generatedContent: '',
  recruiterName: '',
  recruiterEmail: '',
  recruiterLinkedIn: '',
  source: '',
  priority: 'Medium',
  lastContactDate: '',
  companyResearch: '',
  projectEvidence: '',
  resumeBefore: '',
  resumeAfter: '',
  jobDescription: '',
};

const statuses = ['Saved', 'Applied', 'Interview', 'Rejected', 'Offer'];
const statusStyles = {
  Saved: 'bg-slate-100 text-slate-700 border-slate-200',
  Applied: 'bg-blue-50 text-blue-700 border-blue-200',
  Interview: 'bg-amber-50 text-amber-700 border-amber-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  Offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const templates = {
  followUp: 'Hi, I wanted to follow up on my application and check if there are any updates I can provide.',
  thankYou: 'Hi, thank you for the interview opportunity. I enjoyed learning about the role and remain very interested.',
  referral: 'Hi, I am exploring this role and noticed your experience at the company. I would be grateful for any guidance.',
  salary: 'I am flexible and would like to understand the complete role scope and compensation range first.',
  rejection: 'Thank you for the update. I appreciate the opportunity and would be grateful for any feedback for improvement.',
  recruiterReply: 'Thanks for reaching out. I am interested in learning more about the role, team, and interview process.',
};

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function isFollowUpDue(item) {
  if (!item.followUpDate || ['Rejected', 'Offer'].includes(item.status)) return false;
  return item.followUpDate <= new Date().toISOString().slice(0, 10);
}

function words(text = '') {
  return String(text).toLowerCase().replace(/[^\w\s.+#-]/g, ' ').split(/\s+/).filter((word) => word.length > 2);
}

function uniqueKeywords(text = '', limit = 10) {
  return [...new Set(words(text))].slice(0, limit);
}

function resumeDiff(item) {
  const before = words(item.resumeBefore);
  const after = words(item.resumeAfter);
  const added = [...new Set(after.filter((word) => !before.includes(word)))].slice(0, 10);
  return {
    before: item.resumeBefore || 'Paste old resume bullet here.',
    after: item.resumeAfter || 'Paste improved resume bullet here.',
    added,
    impact: added.length ? `Added ${added.length} stronger keyword${added.length === 1 ? '' : 's'}.` : 'Add before and after bullets to see keyword improvement.',
  };
}

function timeline(item) {
  return [
    { label: 'Saved', done: Boolean(item.createdAt), date: item.createdAt },
    { label: 'Applied', done: Boolean(item.appliedDate) || ['Applied', 'Interview', 'Rejected', 'Offer'].includes(item.status), date: item.appliedDate },
    { label: 'Follow-up ready', done: Boolean(item.followUpDate), date: item.followUpDate },
    { label: 'Interview', done: ['Interview', 'Offer'].includes(item.status), date: item.lastContactDate },
    { label: item.status === 'Offer' ? 'Offer' : item.status === 'Rejected' ? 'Rejected' : 'Decision pending', done: ['Offer', 'Rejected'].includes(item.status), date: item.updatedAt },
  ];
}

function proofScore(item) {
  const text = [item.generatedContent, item.projectEvidence, item.resumeAfter, item.notes].join(' ').toLowerCase();
  const checks = [
    ['Project proof', Boolean(item.projectEvidence)],
    ['Metric or number', /\d|percent|%|users|reduced|increased|improved/.test(text)],
    ['Tech stack', /react|node|mongodb|java|python|api|sql|aws|docker|express/.test(text)],
    ['Outcome', /built|launched|deployed|optimized|secured|automated|improved/.test(text)],
    ['Link available', Boolean(item.jobLink || item.recruiterLinkedIn)],
  ];
  return { score: Math.round((checks.filter(([, done]) => done).length / checks.length) * 100), checks };
}

function successAnalytics(items) {
  const applied = items.filter((item) => ['Applied', 'Interview', 'Rejected', 'Offer'].includes(item.status)).length;
  const interviews = items.filter((item) => ['Interview', 'Offer'].includes(item.status)).length;
  const offers = items.filter((item) => item.status === 'Offer').length;
  const rejected = items.filter((item) => item.status === 'Rejected').length;
  return {
    responseRate: applied ? Math.round((interviews / applied) * 100) : 0,
    offerRate: interviews ? Math.round((offers / interviews) * 100) : 0,
    rejectionRate: applied ? Math.round((rejected / applied) * 100) : 0,
  };
}

function rejectionPattern(items) {
  const rejected = items.filter((item) => item.status === 'Rejected');
  if (rejected.length < 2) return 'Not enough rejection data yet.';
  const missingEvidence = rejected.filter((item) => !item.projectEvidence && !item.generatedContent).length;
  if (missingEvidence >= Math.ceil(rejected.length / 2)) return 'Pattern: rejected applications have weak proof. Add project evidence and tailored content.';
  return 'Pattern: review match quality, timing, and referral strategy for rejected roles.';
}

function companyBrief(item) {
  const skills = uniqueKeywords(item.jobDescription || item.notes || item.role, 6);
  return [
    `${item.companyName || 'This company'} needs a candidate for ${item.role || 'this role'}.`,
    `Likely focus areas: ${skills.length ? skills.join(', ') : 'role requirements, team fit, and delivery impact'}.`,
    `Ask about team goals, tech stack, success metrics, and interview process.`,
  ];
}

function interviewPrep(item) {
  return [
    `Explain why you want ${item.role || 'this role'} at ${item.companyName || 'this company'}.`,
    `Walk through a project that proves ${uniqueKeywords(item.jobDescription || item.generatedContent, 3).join(', ') || 'your required skills'}.`,
    'Prepare one STAR story for challenge, teamwork, failure, and learning fast.',
    'Prepare salary, availability, and notice period answers.',
  ];
}

function nextAction(item) {
  if (isFollowUpDue(item)) return 'Send follow-up today.';
  if (item.status === 'Saved') return 'Tailor resume and apply.';
  if (item.status === 'Applied') return 'Prepare follow-up and referral message.';
  if (item.status === 'Interview') return 'Run interview prep and send thank-you email after interview.';
  if (item.status === 'Rejected') return 'Log reason and improve weak proof.';
  if (item.status === 'Offer') return 'Prepare salary negotiation script.';
  return 'Update application details.';
}

function StatCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted uppercase font-semibold">{label}</p>
      <p className="text-2xl font-bold text-ink mt-1">{value}</p>
    </div>
  );
}

export default function Applications() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState('');
  const [followUp, setFollowUp] = useState(null);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [importText, setImportText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const set = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await applicationsApi.list());
    } catch (err) {
      setError(err.message || 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const analytics = useMemo(() => successAnalytics(items), [items]);
  const filteredItems = useMemo(() => {
    const text = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = activeStatus === 'All' || item.status === activeStatus;
      const haystack = [item.companyName, item.role, item.notes, item.generatedContent, item.recruiterName, item.source].filter(Boolean).join(' ').toLowerCase();
      return matchesStatus && (!text || haystack.includes(text));
    });
  }, [items, query, activeStatus]);

  const stats = useMemo(() => ({
    Total: items.length,
    Applied: items.filter((item) => item.status === 'Applied').length,
    Interview: items.filter((item) => item.status === 'Interview').length,
    Offer: items.filter((item) => item.status === 'Offer').length,
    Due: items.filter(isFollowUpDue).length,
  }), [items]);

  const resetForm = () => {
    setForm(empty);
    setEditingId('');
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) await applicationsApi.update(editingId, form);
      else await applicationsApi.create(form);
      resetForm();
      await load();
    } catch (err) {
      setError(err.message || 'Unable to save application.');
    } finally {
      setSaving(false);
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm(Object.keys(empty).reduce((next, key) => ({ ...next, [key]: item[key] || empty[key] }), {}));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    setError('');
    try {
      await applicationsApi.remove(id);
      setItems((current) => current.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err.message || 'Unable to delete application.');
    }
  };

  const moveStatus = async (item, status) => {
    setError('');
    try {
      const updated = await applicationsApi.update(item.id, { ...item, status });
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      if (selected?.id === item.id) setSelected(updated);
    } catch (err) {
      setError(err.message || 'Unable to update status.');
    }
  };

  const generateFollowUp = async (item) => {
    setError('');
    try {
      const data = await applicationsApi.followUp(item.id);
      setFollowUp({ application: item, message: data.message });
      setCopied(false);
    } catch (err) {
      setError(err.message || 'Unable to generate follow-up.');
    }
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text || '');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const importJob = () => {
    const lines = importText.split('\n').map((line) => line.trim()).filter(Boolean);
    const url = lines.find((line) => /^https?:\/\//i.test(line)) || '';
    const first = lines.find((line) => !/^https?:\/\//i.test(line)) || '';
    const [rolePart, companyPart] = first.split(/\bat\b|\-|,/i).map((part) => part?.trim());
    setForm((current) => ({
      ...current,
      role: rolePart || current.role,
      companyName: companyPart || current.companyName,
      jobLink: url || current.jobLink,
      jobDescription: importText,
      source: current.source || 'Imported',
    }));
  };

  const selectedProof = selected ? proofScore(selected) : null;
  const selectedDiff = selected ? resumeDiff(selected) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1.5">Application Intelligence Tracker</h1>
              <p className="text-sm text-muted">Track roles, contacts, resume changes, prep, reminders, and outcomes from one workspace.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full lg:w-auto">
              <button onClick={() => window.print()} className="btn-secondary text-sm justify-center">Export PDF</button>
              <button onClick={load} className="btn-secondary text-sm justify-center">Refresh</button>
            </div>
          </div>

          {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
            {Object.entries(stats).map(([label, value]) => <StatCard key={label} label={label} value={value} />)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="card p-4"><p className="text-xs text-muted uppercase font-semibold">Response Rate</p><p className="text-2xl font-bold text-ink">{analytics.responseRate}%</p></div>
            <div className="card p-4"><p className="text-xs text-muted uppercase font-semibold">Offer Rate</p><p className="text-2xl font-bold text-ink">{analytics.offerRate}%</p></div>
            <div className="card p-4"><p className="text-xs text-muted uppercase font-semibold">Rejection Pattern</p><p className="text-sm font-semibold text-ink mt-1">{rejectionPattern(items)}</p></div>
            <div className="card p-4"><p className="text-xs text-muted uppercase font-semibold">Chrome Extension Ready</p><p className="text-sm font-semibold text-ink mt-1">Paste job text now. Extension can later fill this same form.</p></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.4fr] gap-6 items-start">
            <section className="space-y-5 xl:sticky xl:top-24">
              <div className="card p-5 sm:p-6">
                <h2 className="font-bold text-ink mb-2">Job Link Import</h2>
                <p className="text-xs text-muted mb-3">Paste a job link or job post. It fills role, company, link, and JD where possible.</p>
                <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={4} className="form-textarea" placeholder="Frontend Developer at Company&#10;https://example.com/job&#10;Job description..." />
                <button type="button" onClick={importJob} className="btn-secondary w-full justify-center mt-3">Import Into Form</button>
              </div>

              <form onSubmit={save} className="card p-5 sm:p-6 space-y-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h2 className="font-bold text-ink">{editingId ? 'Edit Application' : 'Add Application'}</h2>
                    <p className="text-xs text-muted mt-1">Company and role are required.</p>
                  </div>
                  {editingId && <button type="button" onClick={resetForm} className="text-xs font-semibold text-accent">Cancel</button>}
                </div>

                <input name="companyName" value={form.companyName} onChange={set} placeholder="Company name" className="form-input" required />
                <input name="role" value={form.role} onChange={set} placeholder="Role" className="form-input" required />
                <input name="jobLink" value={form.jobLink} onChange={set} placeholder="Job link" className="form-input" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select name="status" value={form.status} onChange={set} className="form-select">{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                  <select name="priority" value={form.priority} onChange={set} className="form-select">{['Low', 'Medium', 'High'].map((value) => <option key={value}>{value}</option>)}</select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="date" name="appliedDate" value={form.appliedDate} onChange={set} className="form-input" />
                  <input type="date" name="followUpDate" value={form.followUpDate} onChange={set} className="form-input" />
                </div>
                <input type="date" name="lastContactDate" value={form.lastContactDate} onChange={set} className="form-input" />
                <input name="source" value={form.source} onChange={set} placeholder="Source: LinkedIn, Naukri, Referral, Company site" className="form-input" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input name="recruiterName" value={form.recruiterName} onChange={set} placeholder="Recruiter/contact name" className="form-input" />
                  <input name="recruiterEmail" value={form.recruiterEmail} onChange={set} placeholder="Recruiter email" className="form-input" />
                </div>
                <input name="recruiterLinkedIn" value={form.recruiterLinkedIn} onChange={set} placeholder="Recruiter LinkedIn URL" className="form-input" />
                <textarea name="jobDescription" value={form.jobDescription} onChange={set} rows={4} placeholder="Job description" className="form-textarea" />
                <textarea name="notes" value={form.notes} onChange={set} rows={3} placeholder="Notes, interview round, salary details..." className="form-textarea" />
                <textarea name="companyResearch" value={form.companyResearch} onChange={set} rows={3} placeholder="Company research brief" className="form-textarea" />
                <textarea name="projectEvidence" value={form.projectEvidence} onChange={set} rows={3} placeholder="Project evidence: problem, stack, impact, links" className="form-textarea" />
                <textarea name="resumeBefore" value={form.resumeBefore} onChange={set} rows={2} placeholder="Original resume bullet" className="form-textarea" />
                <textarea name="resumeAfter" value={form.resumeAfter} onChange={set} rows={2} placeholder="Tailored resume bullet" className="form-textarea" />
                <textarea name="generatedContent" value={form.generatedContent} onChange={set} rows={4} placeholder="Generated cover letter, recruiter message, email, or why-company answer" className="form-textarea" />
                <button className="btn-primary w-full justify-center" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Application' : 'Add Application'}</button>
              </form>
            </section>

            <section className="space-y-5">
              <div className="card p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, role, notes, recruiter..." className="form-input" />
                  <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)} className="form-select md:w-48">
                    <option>All</option>
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </div>
              </div>

              {loading && <div className="card p-8 text-sm text-muted">Loading applications...</div>}
              {!loading && filteredItems.length === 0 && <div className="card p-8 text-center"><p className="font-semibold text-ink">No applications found</p><p className="text-sm text-muted mt-1">Add your first application or clear filters.</p></div>}

              {!loading && filteredItems.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {statuses.map((status) => {
                    const statusItems = filteredItems.filter((item) => item.status === status);
                    return (
                      <div key={status} className="card p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="font-bold text-ink">{status}</h2>
                          <span className={`text-xs font-bold border rounded-full px-2.5 py-1 ${statusStyles[status]}`}>{statusItems.length}</span>
                        </div>
                        <div className="space-y-3 min-h-20">
                          {statusItems.length === 0 && <p className="text-sm text-muted bg-surface border border-border rounded-lg p-3">No applications in this stage.</p>}
                          {statusItems.map((item) => (
                            <article key={item.id} className="bg-surface border border-border rounded-lg p-4 hover:border-accent/30 transition-colors">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <p className="font-semibold text-ink truncate">{item.companyName}</p>
                                    {isFollowUpDue(item) && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 shrink-0">Due</span>}
                                    {item.priority === 'High' && <span className="text-[10px] font-bold bg-red-100 text-red-700 rounded-full px-2 py-0.5 shrink-0">High</span>}
                                  </div>
                                  <p className="text-sm text-muted truncate">{item.role}</p>
                                  <p className="text-xs text-muted mt-1">{item.source || 'No source'} | {nextAction(item)}</p>
                                </div>
                                <select value={item.status} onChange={(e) => moveStatus(item, e.target.value)} className="text-xs border border-border rounded-lg px-2 py-1 bg-white max-w-32">
                                  {statuses.map((option) => <option key={option}>{option}</option>)}
                                </select>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-muted">
                                <p>Applied: <span className="text-ink">{formatDate(item.appliedDate)}</span></p>
                                <p>Follow-up: <span className="text-ink">{formatDate(item.followUpDate)}</span></p>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-4">
                                {item.jobLink && <a href={item.jobLink} target="_blank" rel="noreferrer" className="text-xs font-semibold text-accent">Open Job</a>}
                                <button onClick={() => setSelected(item)} className="text-xs font-semibold text-ink">View Intelligence</button>
                                <button onClick={() => edit(item)} className="text-xs font-semibold text-ink">Edit</button>
                                <button onClick={() => generateFollowUp(item)} className="text-xs font-semibold text-accent">Follow-up</button>
                                <button onClick={() => remove(item.id)} className="text-xs font-semibold text-red-600">Delete</button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {followUp && (
                <div className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div><h2 className="font-bold text-ink">Follow-up Message</h2><p className="text-xs text-muted">{followUp.application.companyName} - {followUp.application.role}</p></div>
                    <button onClick={() => copyText(followUp.message)} className="btn-secondary text-sm px-4 py-2">{copied ? 'Copied' : 'Copy'}</button>
                  </div>
                  <div className="whitespace-pre-wrap text-sm bg-surface border border-border rounded-lg p-4 leading-relaxed">{followUp.message}</div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-[70] bg-navy-900/35 backdrop-blur-sm flex justify-end" onMouseDown={() => setSelected(null)}>
          <aside className="w-full sm:max-w-3xl bg-white h-full shadow-card-hover overflow-auto" onMouseDown={(event) => event.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div><p className="text-xs font-bold text-accent uppercase tracking-wide">Application Intelligence</p><h2 className="text-xl font-bold text-ink mt-1">{selected.companyName}</h2><p className="text-sm text-muted">{selected.role}</p></div>
              <button onClick={() => setSelected(null)} className="btn-secondary text-sm px-3 py-2 w-full sm:w-auto">Close</button>
            </div>
            <div className="p-4 sm:p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Proof Score" value={`${selectedProof.score}%`} />
                <StatCard label="Priority" value={selected.priority || 'Medium'} />
                <StatCard label="Status" value={selected.status} />
                <StatCard label="Next" value={isFollowUpDue(selected) ? 'Due' : 'Ready'} />
              </div>

              <section className="card p-4">
                <h3 className="font-bold text-ink mb-3">Application Timeline</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  {timeline(selected).map((step) => <div key={step.label} className={`border rounded-lg p-3 ${step.done ? 'bg-accent/10 border-accent/20' : 'bg-surface border-border'}`}><p className="text-sm font-semibold text-ink">{step.label}</p><p className="text-xs text-muted mt-1">{formatDate(step.date)}</p></div>)}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4"><h3 className="font-bold text-ink mb-3">Resume Tailoring Diff</h3><p className="text-xs text-muted uppercase">Before</p><p className="text-sm bg-surface border border-border rounded-lg p-3 mb-3">{selectedDiff.before}</p><p className="text-xs text-muted uppercase">After</p><p className="text-sm bg-surface border border-border rounded-lg p-3">{selectedDiff.after}</p><p className="text-xs text-accent font-semibold mt-3">{selectedDiff.impact}</p></div>
                <div className="card p-4"><h3 className="font-bold text-ink mb-3">Resume Proof Score</h3>{selectedProof.checks.map(([label, done]) => <div key={label} className="flex justify-between text-sm border-b border-border py-2 last:border-0"><span>{label}</span><span className={done ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{done ? 'Done' : 'Missing'}</span></div>)}</div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4"><h3 className="font-bold text-ink mb-3">Company Research Brief</h3>{companyBrief(selected).map((line) => <p key={line} className="text-sm bg-surface border border-border rounded-lg p-3 mb-2">{line}</p>)}</div>
                <div className="card p-4"><h3 className="font-bold text-ink mb-3">Interview Prep From This Job</h3>{interviewPrep(selected).map((line) => <p key={line} className="text-sm bg-surface border border-border rounded-lg p-3 mb-2">{line}</p>)}</div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4"><h3 className="font-bold text-ink mb-3">Referral CRM</h3><p className="text-sm text-muted">Contact: <span className="text-ink font-semibold">{selected.recruiterName || 'Not set'}</span></p><p className="text-sm text-muted">Email: <span className="text-ink font-semibold">{selected.recruiterEmail || 'Not set'}</span></p><p className="text-sm text-muted">LinkedIn: <span className="text-ink font-semibold break-all">{selected.recruiterLinkedIn || 'Not set'}</span></p><p className="text-sm text-muted">Last contact: <span className="text-ink font-semibold">{formatDate(selected.lastContactDate)}</span></p></div>
                <div className="card p-4"><h3 className="font-bold text-ink mb-3">AI Why This Company</h3><p className="text-sm bg-surface border border-border rounded-lg p-3">I am interested in {selected.companyName || 'this company'} because the {selected.role || 'role'} aligns with my skills and gives me a chance to contribute through practical project experience while learning from the team.</p></div>
              </section>

              <section className="card p-4">
                <h3 className="font-bold text-ink mb-3">Email Template Center</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(templates).map(([name, text]) => <button key={name} onClick={() => copyText(text)} className="text-left bg-surface border border-border rounded-lg p-3 text-sm hover:border-accent/30"><span className="block font-semibold text-ink capitalize">{name.replace(/([A-Z])/g, ' $1')}</span><span className="block text-muted mt-1">{text}</span></button>)}
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4"><h3 className="font-bold text-ink mb-3">LinkedIn Optimizer</h3><p className="text-sm bg-surface border border-border rounded-lg p-3">Headline: {selected.role || 'Developer'} | Building projects with measurable impact | Open to opportunities</p><p className="text-sm bg-surface border border-border rounded-lg p-3 mt-2">DM: Hi, I am exploring {selected.role || 'developer'} roles at {selected.companyName || 'your company'} and would value any guidance.</p></div>
                <div className="card p-4"><h3 className="font-bold text-ink mb-3">Real Interview Simulation Mode</h3><div className="flex flex-wrap gap-2">{['Strict interviewer', 'Fresher friendly', 'System design', 'Project deep dive', 'HR salary round'].map((mode) => <span key={mode} className="text-xs font-semibold bg-surface border border-border rounded-lg px-2.5 py-1">{mode}</span>)}</div></div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4"><h3 className="font-bold text-ink mb-3">Job Search Strategy Board</h3>{['Apply to 3 high-fit jobs', 'Send 2 referral messages', 'Tailor one resume bullet', 'Practice one weak interview area'].map((line) => <p key={line} className="text-sm bg-surface border border-border rounded-lg p-3 mb-2">{line}</p>)}</div>
                <div className="card p-4"><h3 className="font-bold text-ink mb-3">Project Evidence Locker</h3><div className="text-sm bg-surface border border-border rounded-lg p-3 whitespace-pre-wrap min-h-28">{selected.projectEvidence || 'Add problem, architecture, tech stack, challenges, metrics, GitHub link, and live link.'}</div></div>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => edit(selected)} className="btn-secondary justify-center">Edit</button>
                <button onClick={() => generateFollowUp(selected)} className="btn-primary justify-center">Generate Follow-up</button>
              </div>
            </div>
          </aside>
        </div>
      )}
      <Footer />
    </div>
  );
}
