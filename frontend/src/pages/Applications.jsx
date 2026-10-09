import useDialogFocus from '../hooks/useDialogFocus.js';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import { Icon, Reveal } from '../components/Reveal.jsx';
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
const dateFields = {
  Saved: [
    { name: 'followUpDate', label: 'Reminder date', help: 'Optional reminder before you apply.' },
  ],
  Applied: [
    { name: 'appliedDate', label: 'Applied date', help: 'When you submitted the application.' },
    { name: 'followUpDate', label: 'Follow-up date', help: 'Next follow-up reminder.' },
  ],
  Interview: [
    { name: 'appliedDate', label: 'Applied date', help: 'When you submitted the application.' },
    { name: 'lastContactDate', label: 'Interview/contact date', help: 'Latest recruiter or interview contact.' },
    { name: 'followUpDate', label: 'Next follow-up date', help: 'Reminder for thank-you or next check-in.' },
  ],
  Rejected: [
    { name: 'appliedDate', label: 'Applied date', help: 'When you submitted the application.' },
    { name: 'lastContactDate', label: 'Decision date', help: 'When you received the update.' },
  ],
  Offer: [
    { name: 'appliedDate', label: 'Applied date', help: 'When you submitted the application.' },
    { name: 'lastContactDate', label: 'Offer date', help: 'When you received the offer.' },
    { name: 'followUpDate', label: 'Response deadline', help: 'Optional date to respond or negotiate.' },
  ],
};
// Restrained stage chips — Saved=sage/ivory, Applied=forest-50, Interview=lime
// (dark text), Rejected=red, Offer=solid forest.
const statusStyles = {
  Saved: 'bg-surface text-sage-600 border-border',
  Applied: 'bg-forest-50 text-forest-700 border-forest-100',
  Interview: 'bg-lime text-forest-800 border-lime-400',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  Offer: 'bg-forest text-white border-forest-700',
};

const templates = {
  followUp: 'Hi, I wanted to follow up on my application and check if there are any updates I can provide.',
  thankYou: 'Hi, thank you for the interview opportunity. I enjoyed learning about the role and remain very interested.',
  referral: 'Hi, I am exploring this role and noticed your experience at the company. I would be grateful for any guidance.',
  salary: 'I am flexible and would like to understand the complete role scope and compensation range first.',
  rejection: 'Thank you for the update. I appreciate the opportunity and would be grateful for any feedback for improvement.',
  recruiterReply: 'Thanks for reaching out. I am interested in learning more about the role, team, and interview process.',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeDateInput(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return 'Not set';
  const normalized = normalizeDateInput(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function isFollowUpDue(item) {
  if (!item.followUpDate || ['Rejected', 'Offer'].includes(item.status)) return false;
  return normalizeDateInput(item.followUpDate) <= todayISO();
}

function visibleDateFields(status) {
  return dateFields[status] || dateFields.Saved;
}

function dateSummary(item) {
  return visibleDateFields(item.status).map((field) => ({
    label: field.label.replace(' date', ''),
    value: item[field.name],
  }));
}

function applyStatusDates(data, status) {
  const next = {
    ...data,
    status,
    appliedDate: normalizeDateInput(data.appliedDate),
    followUpDate: normalizeDateInput(data.followUpDate),
    lastContactDate: normalizeDateInput(data.lastContactDate),
  };
  const today = todayISO();

  if (['Applied', 'Interview', 'Rejected', 'Offer'].includes(status) && !next.appliedDate) {
    next.appliedDate = today;
  }
  if (['Interview', 'Rejected', 'Offer'].includes(status) && !next.lastContactDate) {
    next.lastContactDate = today;
  }
  if (['Applied', 'Interview'].includes(status) && !next.followUpDate) {
    next.followUpDate = addDaysISO(status === 'Interview' ? 2 : 7);
  }
  if (status === 'Rejected') {
    next.followUpDate = '';
  }

  return next;
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
      <p className="text-xs text-sage-600 uppercase font-semibold tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-ink mt-1 font-display">{value}</p>
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
  // Presentational-only: controls visibility of the Add/Edit form drawer.
  // No API, data, or business logic depends on this flag.
  const [formOpen, setFormOpen] = useState(false);
  const formDialogRef = useDialogFocus(formOpen);
  const detailDialogRef = useDialogFocus(Boolean(selected) && !formOpen);

  const set = (e) => {
    const { name, value } = e.target;
    setForm((current) => {
      if (name !== 'status') return { ...current, [name]: value };
      return applyStatusDates(current, value);
    });
  };

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

  // Presentational-only: close any open drawer on Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setFormOpen(false);
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    const payload = {
      ...form,
      appliedDate: normalizeDateInput(form.appliedDate),
      followUpDate: normalizeDateInput(form.followUpDate),
      lastContactDate: normalizeDateInput(form.lastContactDate),
    };
    try {
      if (editingId) await applicationsApi.update(editingId, payload);
      else await applicationsApi.create(payload);
      resetForm();
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err.message || 'Unable to save application.');
    } finally {
      setSaving(false);
    }
  };

  const edit = (item) => {
    setEditingId(item.id);
    setForm(Object.keys(empty).reduce((next, key) => ({
      ...next,
      [key]: ['appliedDate', 'followUpDate', 'lastContactDate'].includes(key)
        ? normalizeDateInput(item[key])
        : item[key] || empty[key],
    }), {}));
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
      const updated = await applicationsApi.update(item.id, applyStatusDates(item, status));
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
          <PageHeader
            icon="match"
            eyebrow="Pipeline"
            title="Application Intelligence Tracker"
            subtitle="Track roles, contacts, resume changes, prep, reminders, and outcomes from one workspace."
          >
            <button onClick={() => { resetForm(); setFormOpen(true); }} className="btn-lime text-sm">
              <Icon name="sparkle" className="w-4 h-4" />
              Add Application
            </button>
            <button onClick={() => window.print()} className="btn-secondary text-sm bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30">Export PDF</button>
            <button onClick={load} className="btn-secondary text-sm bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30">Refresh</button>
          </PageHeader>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" role="alert">
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <button onClick={load} className="btn-secondary text-sm px-4 py-2 shrink-0">Retry</button>
            </div>
          )}

          <Reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            {Object.entries(stats).map(([label, value]) => <StatCard key={label} label={label} value={value} />)}
          </Reveal>

          <Reveal delay={60} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="card p-4"><p className="text-xs text-sage-600 uppercase font-semibold tracking-wide">Response Rate</p><p className="text-2xl font-bold text-ink mt-1">{analytics.responseRate}%</p></div>
            <div className="card p-4"><p className="text-xs text-sage-600 uppercase font-semibold tracking-wide">Offer Rate</p><p className="text-2xl font-bold text-ink mt-1">{analytics.offerRate}%</p></div>
            <div className="card p-4"><p className="text-xs text-sage-600 uppercase font-semibold tracking-wide">Rejection Pattern</p><p className="text-sm font-semibold text-ink mt-1 leading-relaxed">{rejectionPattern(items)}</p></div>
            <div className="card p-4"><p className="text-xs text-sage-600 uppercase font-semibold tracking-wide">Quick Capture</p><p className="text-sm font-semibold text-ink mt-1 leading-relaxed">Open Add Application and paste a job post to auto-fill role, company, and link.</p></div>
          </Reveal>

          <div className="card p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <div>
                <label htmlFor="pipeline-search" className="sr-only">Search applications</label>
                <input id="pipeline-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, role, notes, recruiter..." className="form-input" />
              </div>
              <div>
                <label htmlFor="pipeline-filter" className="sr-only">Filter by stage</label>
                <select id="pipeline-filter" value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)} className="form-select md:w-48">
                  <option>All</option>
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="card">
              <Loader message="Loading applications..." />
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="card p-10 sm:p-14 text-center">
              <span className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-100 grid place-items-center mx-auto mb-4">
                <Icon name="match" className="w-7 h-7 text-forest-700" />
              </span>
              <h2 className="font-bold text-ink text-lg">No applications yet</h2>
              <p className="text-sm text-sage-600 mt-1 max-w-sm mx-auto">Add your first role to build your pipeline across Saved, Applied, Interview, Rejected, and Offer.</p>
              <button onClick={() => { resetForm(); setFormOpen(true); }} className="btn-primary mt-5">Add your first application</button>
            </div>
          )}

          {!loading && !error && items.length > 0 && filteredItems.length === 0 && (
            <div className="card p-10 text-center">
              <h2 className="font-bold text-ink">No applications match your filters</h2>
              <p className="text-sm text-sage-600 mt-1">Try a different search term or clear the stage filter.</p>
              <button onClick={() => { setQuery(''); setActiveStatus('All'); }} className="btn-secondary mt-4">Clear filters</button>
            </div>
          )}

          {!loading && filteredItems.length > 0 && (
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto table-scroll pb-2">
              <div className="flex gap-4" role="list" aria-label="Application pipeline">
                {statuses.map((status) => {
                  const statusItems = filteredItems.filter((item) => item.status === status);
                  return (
                    <div key={status} role="listitem" className="card p-4 w-[280px] shrink-0 xl:w-auto xl:flex-1 xl:min-w-0 self-start">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-ink">{status}</h2>
                        <span className={`text-xs font-bold border rounded-full px-2.5 py-1 ${statusStyles[status]}`}>{statusItems.length}</span>
                      </div>
                      <div className="space-y-3 min-h-20">
                        {statusItems.length === 0 && <p className="text-sm text-sage-600 bg-surface border border-border rounded-card p-3">No applications in this stage.</p>}
                        {statusItems.map((item) => (
                          <article key={item.id} className="bg-white border border-border rounded-card p-4 hover:border-forest-300 hover:shadow-card transition-all">
                            <div className="flex flex-col gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                  <p className="font-semibold text-ink truncate">{item.companyName}</p>
                                  {isFollowUpDue(item) && <span className="text-[10px] font-bold bg-lime text-forest-800 rounded-full px-2 py-0.5 shrink-0">Due</span>}
                                  {item.priority === 'High' && <span className="text-[10px] font-bold bg-forest-50 text-forest-700 border border-forest-100 rounded-full px-2 py-0.5 shrink-0">High</span>}
                                </div>
                                <p className="text-sm text-sage-600 truncate">{item.role}</p>
                                <p className="text-xs text-sage-500 mt-1">{item.source || 'No source'} | {nextAction(item)}</p>
                              </div>
                              <div>
                                <label htmlFor={`status-${item.id}`} className="sr-only">Change stage for {item.companyName}</label>
                                <select id={`status-${item.id}`} value={item.status} onChange={(e) => moveStatus(item, e.target.value)} className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/30">
                                  {statuses.map((option) => <option key={option}>{option}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-1 mt-3 text-xs text-sage-600">
                              {dateSummary(item).map((entry) => (
                                <p key={entry.label}>{entry.label}: <span className="text-ink font-medium">{formatDate(entry.value)}</span></p>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4 pt-3 border-t border-border">
                              {item.jobLink && <a href={item.jobLink} target="_blank" rel="noreferrer" className="text-xs font-semibold text-forest-700 hover:underline">Open Job</a>}
                              <button onClick={() => setSelected(item)} className="text-xs font-semibold text-ink hover:underline">View Intelligence</button>
                              <button onClick={() => { edit(item); setSelected(null); setFormOpen(true); }} className="text-xs font-semibold text-ink hover:underline">Edit</button>
                              <button onClick={() => generateFollowUp(item)} className="text-xs font-semibold text-forest-700 hover:underline">Follow-up</button>
                              <button onClick={() => remove(item.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {followUp && (
            <div className="card p-5 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div><h2 className="font-bold text-ink">Follow-up Message</h2><p className="text-xs text-sage-600">{followUp.application.companyName} - {followUp.application.role}</p></div>
                <button onClick={() => copyText(followUp.message)} className="btn-secondary text-sm px-4 py-2">{copied ? 'Copied' : 'Copy'}</button>
              </div>
              <div className="whitespace-pre-wrap text-sm bg-surface border border-border rounded-card p-4 leading-relaxed">{followUp.message}</div>
            </div>
          )}
        </div>
      </main>

      {formOpen && (
        <div className="fixed inset-0 z-[80] bg-forest-900/40 backdrop-blur-sm flex justify-end" onMouseDown={() => setFormOpen(false)}>
          <aside
            role="dialog"
            aria-modal="true"
            ref={formDialogRef}
            tabIndex={-1}
            aria-label={editingId ? 'Edit application' : 'Add application'}
            className="w-full sm:max-w-xl bg-white h-full shadow-card-hover overflow-y-auto overflow-x-hidden"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border p-4 sm:p-5 flex items-start justify-between gap-3 z-10">
              <div className="min-w-0">
                <p className="text-xs font-bold text-forest-700 uppercase tracking-wide">Application</p>
                <h2 className="text-xl font-bold text-ink mt-1">{editingId ? 'Edit Application' : 'Add Application'}</h2>
                <p className="text-sm text-sage-600">Company and role are required.</p>
              </div>
              <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary text-sm px-3 py-2 shrink-0" aria-label="Close form">Close</button>
            </div>

            <div className="p-4 sm:p-5 space-y-5">
              <div className="card p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="doc" className="w-5 h-5 text-forest-700" />
                  <h3 className="font-bold text-ink">Job Link Import</h3>
                </div>
                <p className="text-xs text-sage-600 mb-3">Paste a job link or job post. It fills role, company, link, and JD where possible.</p>
                <label htmlFor="import-text" className="sr-only">Job post to import</label>
                <textarea id="import-text" value={importText} onChange={(e) => setImportText(e.target.value)} rows={4} className="form-textarea" placeholder="Paste role, company, job link, and job description..." />
                <button type="button" onClick={importJob} className="btn-secondary w-full justify-center mt-3">Import Into Form</button>
              </div>

              <form onSubmit={save} className="space-y-5">
                {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
                <section className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-sage-600">Basics</h3>
                  <div>
                    <label htmlFor="companyName" className="form-label">Company name</label>
                    <input id="companyName" autoFocus name="companyName" value={form.companyName} onChange={set} placeholder="Company name" className="form-input" required />
                  </div>
                  <div>
                    <label htmlFor="role" className="form-label">Role</label>
                    <input id="role" name="role" value={form.role} onChange={set} placeholder="Role" className="form-input" required />
                  </div>
                  <div>
                    <label htmlFor="jobLink" className="form-label">Job link</label>
                    <input id="jobLink" name="jobLink" value={form.jobLink} onChange={set} placeholder="https://..." className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="source" className="form-label">Source</label>
                    <input id="source" name="source" value={form.source} onChange={set} placeholder="LinkedIn, Naukri, Referral, Company site" className="form-input" />
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-sage-600">Stage &amp; dates</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="status" className="form-label">Stage</label>
                      <select id="status" name="status" value={form.status} onChange={set} className="form-select">{statuses.map((status) => <option key={status}>{status}</option>)}</select>
                    </div>
                    <div>
                      <label htmlFor="priority" className="form-label">Priority</label>
                      <select id="priority" name="priority" value={form.priority} onChange={set} className="form-select">{['Low', 'Medium', 'High'].map((value) => <option key={value}>{value}</option>)}</select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {visibleDateFields(form.status).map((field) => (
                      <label key={field.name} className="block">
                        <span className="form-label">{field.label}</span>
                        <input type="date" name={field.name} value={form[field.name]} onChange={set} className="form-input" />
                        <span className="block text-[11px] text-sage-500 mt-1">{field.help}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-sage-600">Contacts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="recruiterName" className="form-label">Recruiter / contact name</label>
                      <input id="recruiterName" name="recruiterName" value={form.recruiterName} onChange={set} placeholder="Recruiter/contact name" className="form-input" />
                    </div>
                    <div>
                      <label htmlFor="recruiterEmail" className="form-label">Recruiter email</label>
                      <input id="recruiterEmail" name="recruiterEmail" value={form.recruiterEmail} onChange={set} placeholder="Recruiter email" className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="recruiterLinkedIn" className="form-label">Recruiter LinkedIn URL</label>
                    <input id="recruiterLinkedIn" name="recruiterLinkedIn" value={form.recruiterLinkedIn} onChange={set} placeholder="Recruiter LinkedIn URL" className="form-input" />
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-sage-600">Content &amp; evidence</h3>
                  <div>
                    <label htmlFor="jobDescription" className="form-label">Job description</label>
                    <textarea id="jobDescription" name="jobDescription" value={form.jobDescription} onChange={set} rows={4} placeholder="Job description" className="form-textarea" />
                  </div>
                  <div>
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <textarea id="notes" name="notes" value={form.notes} onChange={set} rows={3} placeholder="Notes, interview round, salary details..." className="form-textarea" />
                  </div>
                  <div>
                    <label htmlFor="companyResearch" className="form-label">Company research brief</label>
                    <textarea id="companyResearch" name="companyResearch" value={form.companyResearch} onChange={set} rows={3} placeholder="Company research brief" className="form-textarea" />
                  </div>
                  <div>
                    <label htmlFor="projectEvidence" className="form-label">Project evidence</label>
                    <textarea id="projectEvidence" name="projectEvidence" value={form.projectEvidence} onChange={set} rows={3} placeholder="Project evidence: problem, stack, impact, links" className="form-textarea" />
                  </div>
                  <div>
                    <label htmlFor="resumeBefore" className="form-label">Original resume bullet</label>
                    <textarea id="resumeBefore" name="resumeBefore" value={form.resumeBefore} onChange={set} rows={2} placeholder="Original resume bullet" className="form-textarea" />
                  </div>
                  <div>
                    <label htmlFor="resumeAfter" className="form-label">Tailored resume bullet</label>
                    <textarea id="resumeAfter" name="resumeAfter" value={form.resumeAfter} onChange={set} rows={2} placeholder="Tailored resume bullet" className="form-textarea" />
                  </div>
                  <div>
                    <label htmlFor="generatedContent" className="form-label">Generated content</label>
                    <textarea id="generatedContent" name="generatedContent" value={form.generatedContent} onChange={set} rows={4} placeholder="Generated cover letter, recruiter message, email, or why-company answer" className="form-textarea" />
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  {editingId && <button type="button" onClick={resetForm} className="btn-secondary justify-center sm:flex-1">Cancel edit</button>}
                  <button className="btn-primary justify-center sm:flex-1" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Application' : 'Add Application'}</button>
                </div>
              </form>
            </div>
          </aside>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[70] bg-forest-900/40 backdrop-blur-sm flex justify-end" onMouseDown={() => setSelected(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            ref={detailDialogRef}
            tabIndex={-1}
            aria-label={`Application intelligence for ${selected.companyName}`}
            className="w-full sm:max-w-2xl lg:max-w-3xl bg-white h-full shadow-card-hover overflow-y-auto overflow-x-hidden"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 z-10">
              <div className="min-w-0"><p className="text-xs font-bold text-forest-700 uppercase tracking-wide">Application Intelligence</p><h2 className="text-xl font-bold text-ink mt-1 truncate">{selected.companyName}</h2><p className="text-sm text-sage-600 truncate">{selected.role}</p></div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-bold border rounded-full px-2.5 py-1 ${statusStyles[selected.status]}`}>{selected.status}</span>
                <button onClick={() => setSelected(null)} className="btn-secondary text-sm px-3 py-2" aria-label="Close details">Close</button>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-8">
              {/* ── Overview ─────────────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="chart" className="w-5 h-5 text-forest-700" />
                  <h3 className="font-bold text-ink text-lg">Overview</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Proof Score" value={`${selectedProof.score}%`} />
                  <StatCard label="Priority" value={selected.priority || 'Medium'} />
                  <StatCard label="Status" value={selected.status} />
                  <StatCard label="Next" value={isFollowUpDue(selected) ? 'Due' : 'Ready'} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-4"><h4 className="font-bold text-ink mb-3">Company Research Brief</h4>{companyBrief(selected).map((line) => <p key={line} className="text-sm bg-surface border border-border rounded-card p-3 mb-2 last:mb-0">{line}</p>)}</div>
                  <div className="card p-4"><h4 className="font-bold text-ink mb-3">AI Why This Company</h4><p className="text-sm bg-surface border border-border rounded-card p-3">I am interested in {selected.companyName || 'this company'} because the {selected.role || 'role'} aligns with my skills and gives me a chance to contribute through practical project experience while learning from the team.</p></div>
                </div>
                <div className="card p-4"><h4 className="font-bold text-ink mb-3">Job Search Strategy Board</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{['Apply to 3 high-fit jobs', 'Send 2 referral messages', 'Tailor one resume bullet', 'Practice one weak interview area'].map((line) => <p key={line} className="text-sm bg-surface border border-border rounded-card p-3">{line}</p>)}</div></div>
              </section>

              {/* ── Contacts ─────────────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="users" className="w-5 h-5 text-forest-700" />
                  <h3 className="font-bold text-ink text-lg">Contacts</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-4"><h4 className="font-bold text-ink mb-3">Referral CRM</h4><p className="text-sm text-sage-600">Contact: <span className="text-ink font-semibold">{selected.recruiterName || 'Not set'}</span></p><p className="text-sm text-sage-600">Email: <span className="text-ink font-semibold break-all">{selected.recruiterEmail || 'Not set'}</span></p><p className="text-sm text-sage-600">LinkedIn: <span className="text-ink font-semibold break-all">{selected.recruiterLinkedIn || 'Not set'}</span></p><p className="text-sm text-sage-600">Last contact: <span className="text-ink font-semibold">{formatDate(selected.lastContactDate)}</span></p></div>
                  <div className="card p-4"><h4 className="font-bold text-ink mb-3">LinkedIn Optimizer</h4><p className="text-sm bg-surface border border-border rounded-card p-3">Headline: {selected.role || 'Developer'} | Building projects with measurable impact | Open to opportunities</p><p className="text-sm bg-surface border border-border rounded-card p-3 mt-2">DM: Hi, I am exploring {selected.role || 'developer'} roles at {selected.companyName || 'your company'} and would value any guidance.</p></div>
                </div>
                <div className="card p-4">
                  <h4 className="font-bold text-ink mb-3">Email Template Center</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(templates).map(([name, text]) => <button key={name} onClick={() => copyText(text)} className="text-left bg-surface border border-border rounded-card p-3 text-sm hover:border-forest-300 transition-colors"><span className="block font-semibold text-ink capitalize">{name.replace(/([A-Z])/g, ' $1')}</span><span className="block text-sage-600 mt-1">{text}</span></button>)}
                  </div>
                </div>
              </section>

              {/* ── Resume Changes ───────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="doc" className="w-5 h-5 text-forest-700" />
                  <h3 className="font-bold text-ink text-lg">Resume Changes</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-4"><h4 className="font-bold text-ink mb-3">Resume Tailoring Diff</h4><p className="text-xs text-sage-600 uppercase font-semibold">Before</p><p className="text-sm bg-surface border border-border rounded-card p-3 mb-3 mt-1">{selectedDiff.before}</p><p className="text-xs text-sage-600 uppercase font-semibold">After</p><p className="text-sm bg-surface border border-border rounded-card p-3 mt-1">{selectedDiff.after}</p><p className="text-xs text-forest-700 font-semibold mt-3">{selectedDiff.impact}</p></div>
                  <div className="card p-4"><h4 className="font-bold text-ink mb-3">Resume Proof Score</h4>{selectedProof.checks.map(([label, done]) => <div key={label} className="flex justify-between items-center text-sm border-b border-border py-2 last:border-0"><span>{label}</span><span className={done ? 'text-forest-700 font-semibold' : 'text-sage-400 font-semibold'}>{done ? 'Done' : 'Missing'}</span></div>)}</div>
                </div>
                <div className="card p-4"><h4 className="font-bold text-ink mb-3">Project Evidence Locker</h4><div className="text-sm bg-surface border border-border rounded-card p-3 whitespace-pre-wrap min-h-28">{selected.projectEvidence || 'Add problem, architecture, tech stack, challenges, metrics, GitHub link, and live link.'}</div></div>
              </section>

              {/* ── Preparation ──────────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="mic" className="w-5 h-5 text-forest-700" />
                  <h3 className="font-bold text-ink text-lg">Preparation</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-4"><h4 className="font-bold text-ink mb-3">Interview Prep From This Job</h4>{interviewPrep(selected).map((line) => <p key={line} className="text-sm bg-surface border border-border rounded-card p-3 mb-2 last:mb-0">{line}</p>)}</div>
                  <div className="card p-4"><h4 className="font-bold text-ink mb-3">Real Interview Simulation Mode</h4><div className="flex flex-wrap gap-2">{['Strict interviewer', 'Fresher friendly', 'System design', 'Project deep dive', 'HR salary round'].map((mode) => <span key={mode} className="text-xs font-semibold bg-surface border border-border rounded-lg px-2.5 py-1">{mode}</span>)}</div></div>
                </div>
              </section>

              {/* ── Timeline ─────────────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon name="history" className="w-5 h-5 text-forest-700" />
                  <h3 className="font-bold text-ink text-lg">Timeline</h3>
                </div>
                <div className="card p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    {timeline(selected).map((step) => <div key={step.label} className={`border rounded-card p-3 ${step.done ? 'bg-forest-50 border-forest-100' : 'bg-surface border-border'}`}><p className="text-sm font-semibold text-ink">{step.label}</p><p className="text-xs text-sage-600 mt-1">{formatDate(step.date)}</p></div>)}
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                <button onClick={() => { edit(selected); setSelected(null); setFormOpen(true); }} className="btn-secondary justify-center">Edit</button>
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
