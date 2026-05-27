import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { applicationsApi, profileApi, resumeApi } from '../services/api.js';
import { useToast } from '../components/ToastProvider.jsx';

const empty = {
  fullName: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  links: '',
  summary: '',
  skills: '',
  experience: '',
  projects: '',
  education: '',
  achievements: '',
  certifications: '',
};

function splitLines(text = '') {
  return String(text).split('\n').map((line) => line.trim()).filter(Boolean);
}

function ResumeSection({ title, children }) {
  if (!children) return null;
  return (
    <section className="border-t border-slate-200 pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
      <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 mb-2">{title}</h3>
      {children}
    </section>
  );
}

export default function ResumeBuilder() {
  const { notify } = useToast();
  const [form, setForm] = useState(empty);
  const [applications, setApplications] = useState([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [versions, setVersions] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      profileApi.get(),
      applicationsApi.list().catch(() => []),
      resumeApi.versions().catch(() => []),
    ])
      .then(([profile = {}, appItems, versionItems]) => {
        if (!active) return;
        setForm({
          ...empty,
          fullName: profile.name || '',
          headline: profile.targetRole || '',
          phone: profile.phone || '',
          location: profile.location || profile.preferredLocation || '',
          links: [profile.linkedinUrl, profile.githubUrl, profile.portfolioUrl].filter(Boolean).join('\n'),
          summary: profile.resumeText || '',
          skills: profile.skills || '',
          experience: profile.experience || '',
          projects: profile.projects || '',
          education: profile.education || '',
          achievements: profile.achievements || '',
          certifications: profile.certifications || '',
        });
        setApplications(appItems);
        setVersions(versionItems);
      })
      .catch((err) => setError(err.message || 'Unable to load profile.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const score = useMemo(() => {
    const filled = Object.values(form).filter((value) => String(value || '').trim()).length;
    return Math.round((filled / Object.keys(empty).length) * 100);
  }, [form]);

  const set = (event) => {
    setSaved(false);
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveToProfile = async () => {
    setError('');
    try {
      await profileApi.update({
        phone: form.phone,
        location: form.location,
        targetRole: form.headline,
        resumeText: form.summary,
        skills: form.skills,
        experience: form.experience,
        projects: form.projects,
        education: form.education,
        achievements: form.achievements,
        certifications: form.certifications,
      });
      setSaved(true);
      notify('Resume data saved.');
    } catch (err) {
      setError(err.message || 'Unable to save resume data.');
      notify('Unable to save resume data.', 'error');
    }
  };

  const printResume = () => window.print();
  const selectedApplication = applications.find((item) => item.id === selectedApplicationId);

  const parseUpload = async () => {
    setError('');
    setParsing(true);
    try {
      const data = await resumeApi.parse({ file: resumeFile, text: resumeText });
      setParsed(data);
      setForm((current) => ({
        ...current,
        summary: data.summary || current.summary,
        skills: data.skills || current.skills,
        experience: data.experience || current.experience,
        projects: data.projects || current.projects,
        education: data.education || current.education,
        achievements: data.achievements || current.achievements,
        certifications: data.certifications || current.certifications,
        links: data.links || current.links,
      }));
      notify('Resume parsed and loaded into the builder.');
    } catch (err) {
      setError(err.message || 'Unable to parse resume.');
      notify('Unable to parse resume.', 'error');
    } finally {
      setParsing(false);
    }
  };

  const applyParsedToProfile = async () => {
    if (!parsed?.rawText) return;
    try {
      await resumeApi.applyParsed({ rawText: parsed.rawText });
      notify('Parsed resume applied to profile.');
    } catch (err) {
      setError(err.message || 'Unable to apply parsed resume.');
      notify('Unable to apply parsed resume.', 'error');
    }
  };

  const saveVersion = async () => {
    setError('');
    try {
      const version = await resumeApi.saveVersion({
        title: selectedApplication ? `${selectedApplication.role} - ${selectedApplication.companyName}` : form.headline || 'ATS Resume',
        targetRole: selectedApplication?.role || form.headline,
        companyName: selectedApplication?.companyName || '',
        applicationId: selectedApplication?.id,
        sections: form,
      });
      setVersions((current) => [version, ...current]);
      notify('Resume version saved.');
    } catch (err) {
      setError(err.message || 'Unable to save resume version.');
      notify('Unable to save resume version.', 'error');
    }
  };

  const buildDiff = async () => {
    try {
      const data = await resumeApi.diff({
        original: selectedApplication?.resumeBefore || form.experience,
        improved: selectedApplication?.resumeAfter || form.projects,
      });
      setDiff(data);
    } catch (err) {
      setError(err.message || 'Unable to build resume diff.');
    }
  };

  const acceptDiff = () => {
    if (!diff?.improved) return;
    setForm((current) => ({ ...current, experience: `${current.experience}\n${diff.improved}`.trim() }));
    setDiff(null);
    notify('Resume bullet accepted.');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8 print:hidden">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-accent mb-2">Resume Builder</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink">Build a job-ready resume</h1>
              <p className="text-sm text-muted mt-1">Uses your saved profile, then lets you edit and export as PDF from the browser print dialog.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button onClick={saveToProfile} className="btn-secondary text-sm">Save to Profile</button>
              <button onClick={saveVersion} className="btn-secondary text-sm">Save Version</button>
              <button onClick={printResume} className="btn-primary text-sm">Export PDF</button>
              <button onClick={() => setForm(empty)} className="btn-secondary text-sm">Clear</button>
            </div>
          </div>

          {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 print:hidden">{error}</div>}
          {saved && <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 print:hidden">Resume data saved to profile.</div>}

          <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] xl:grid-rows-[auto_auto] gap-6 items-start">
            <section className="card p-5 sm:p-6 print:hidden">
              <div className="border-b border-border pb-5 mb-5">
                <h2 className="font-bold text-ink">Resume Upload Parser</h2>
                <p className="text-sm text-muted mt-1">Upload PDF/DOCX/TXT or paste resume text to extract skills, education, projects, experience, links, and summary.</p>
                <div className="grid grid-cols-1 gap-3 mt-4">
                  <input type="file" accept=".pdf,.docx,.txt" onChange={(event) => setResumeFile(event.target.files?.[0] || null)} className="form-input" aria-label="Upload resume file" />
                  <textarea value={resumeText} onChange={(event) => setResumeText(event.target.value)} rows={3} className="form-textarea" placeholder="Or paste resume text here" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button type="button" onClick={parseUpload} disabled={parsing || (!resumeFile && !resumeText.trim())} className="btn-primary text-sm">{parsing ? 'Parsing...' : 'Parse Resume'}</button>
                    <button type="button" onClick={applyParsedToProfile} disabled={!parsed} className="btn-secondary text-sm">Apply to Profile</button>
                  </div>
                </div>
                {parsed && (
                  <div className="mt-4 bg-surface border border-border rounded-lg p-3">
                    <p className="text-xs font-bold text-muted uppercase">Extracted Keywords</p>
                    <p className="text-sm text-ink mt-1">{(parsed.keywords || []).join(', ') || 'No keywords found'}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-bold text-ink">Resume Data</h2>
                  <p className="text-sm text-muted">Completeness: {score}%</p>
                </div>
                <div className="w-20 h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${score}%` }} />
                </div>
              </div>
              {loading ? (
                <p className="text-sm text-muted">Loading profile data...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ['fullName', 'Full name'],
                    ['headline', 'Target role / headline'],
                    ['email', 'Email'],
                    ['phone', 'Phone'],
                    ['location', 'Location'],
                    ['links', 'Links, one per line'],
                  ].map(([name, label]) => (
                    <input key={name} name={name} value={form[name]} onChange={set} placeholder={label} className="form-input" />
                  ))}
                  {[
                    ['summary', 'Professional summary'],
                    ['skills', 'Skills'],
                    ['experience', 'Experience'],
                    ['projects', 'Projects'],
                    ['education', 'Education'],
                    ['achievements', 'Achievements'],
                    ['certifications', 'Certifications'],
                  ].map(([name, label]) => (
                    <textarea key={name} name={name} value={form[name]} onChange={set} rows={4} placeholder={label} className="form-textarea md:col-span-2" />
                  ))}
                </div>
              )}
            </section>

            <section className="card p-5 sm:p-6 print:hidden xl:col-start-1">
              <h2 className="font-bold text-ink mb-2">Job-Specific Versioning</h2>
              <p className="text-sm text-muted mb-4">Save resume versions against tracked jobs and approve bullet changes before adding them.</p>
              <select value={selectedApplicationId} onChange={(event) => setSelectedApplicationId(event.target.value)} className="form-select mb-3">
                <option value="">No selected application</option>
                {applications.map((item) => <option key={item.id} value={item.id}>{item.role} - {item.companyName}</option>)}
              </select>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button type="button" onClick={buildDiff} className="btn-secondary text-sm">Show AI Diff Approval</button>
                <button type="button" onClick={saveVersion} className="btn-primary text-sm">Save For This Job</button>
              </div>
              {diff && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="bg-surface border border-border rounded-lg p-3"><p className="text-xs font-bold text-muted uppercase">Original</p><p className="text-sm mt-1">{diff.original || 'No original bullet selected.'}</p></div>
                  <div className="bg-surface border border-border rounded-lg p-3"><p className="text-xs font-bold text-muted uppercase">Improved</p><p className="text-sm mt-1">{diff.improved || 'No improved bullet selected.'}</p></div>
                  <p className="text-sm text-muted">Keywords added: {(diff.keywordsAdded || []).join(', ') || 'None'} | {diff.reason}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={acceptDiff} className="btn-primary text-sm">Accept</button>
                    <button type="button" onClick={() => setDiff(null)} className="btn-secondary text-sm">Reject</button>
                  </div>
                </div>
              )}
              <div className="mt-5">
                <h3 className="text-sm font-bold text-ink mb-2">Saved Versions</h3>
                <div className="space-y-2 max-h-52 overflow-auto">
                  {versions.length === 0 && <p className="text-sm text-muted">No saved resume versions yet.</p>}
                  {versions.map((version) => (
                    <button key={version.id} type="button" onClick={() => setForm({ ...empty, ...(version.sections || {}) })} className="w-full text-left bg-surface border border-border rounded-lg p-3">
                      <span className="block text-sm font-semibold text-ink">{version.title}</span>
                      <span className="block text-xs text-muted">{version.companyName || 'General'} | {version.targetRole || 'ATS resume'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <article className="bg-white border border-border shadow-card rounded-xl p-6 sm:p-8 xl:col-start-2 xl:row-start-1 xl:row-span-2 print:shadow-none print:border-0 print:rounded-none print:p-0">
              <header className="border-b border-slate-200 pb-5 mb-5">
                <h2 className="text-3xl font-extrabold text-slate-950">{form.fullName || 'Your Name'}</h2>
                <p className="text-base font-semibold text-blue-700 mt-1">{form.headline || 'Target Role'}</p>
                <p className="text-xs text-slate-600 mt-2">
                  {[form.email, form.phone, form.location].filter(Boolean).join(' | ') || 'email | phone | location'}
                </p>
                {!!form.links && <p className="text-xs text-slate-600 mt-1">{splitLines(form.links).join(' | ')}</p>}
              </header>

              <ResumeSection title="Summary">
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{form.summary || 'Add a concise summary focused on target role, strongest skills, and measurable proof.'}</p>
              </ResumeSection>

              <ResumeSection title="Skills">
                <div className="flex flex-wrap gap-2">
                  {String(form.skills || '').split(/,|\n/).map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                    <span key={skill} className="text-xs font-semibold border border-slate-200 rounded-full px-2.5 py-1 text-slate-700">{skill}</span>
                  ))}
                </div>
              </ResumeSection>

              {[
                ['Experience', form.experience],
                ['Projects', form.projects],
                ['Education', form.education],
                ['Achievements', form.achievements],
                ['Certifications', form.certifications],
              ].map(([title, value]) => (
                <ResumeSection key={title} title={title}>
                  <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-slate-700">
                    {(splitLines(value).length ? splitLines(value) : [`Add ${title.toLowerCase()} details.`]).map((line) => <li key={line}>{line}</li>)}
                  </ul>
                </ResumeSection>
              ))}
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
