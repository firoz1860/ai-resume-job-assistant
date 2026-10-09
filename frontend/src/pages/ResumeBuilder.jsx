import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { Icon } from '../components/Reveal.jsx';
import { applicationsApi, profileApi, resumeApi } from '../services/api.js';
import { useToast } from '../components/ToastProvider.jsx';
import { useAuth } from '../context/AuthContext.jsx';

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
    <section className="border-t border-border pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
      <h3 className="text-xs font-extrabold uppercase tracking-wide text-ink mb-2">{title}</h3>
      {children}
    </section>
  );
}

export default function ResumeBuilder() {
  const { notify } = useToast();
  const { user } = useAuth();
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
          // CareerProfile has no name/email — those live on the auth user.
          fullName: profile.name || user?.name || '',
          email: profile.email || user?.email || '',
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
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8 print:hidden">
            <div>
              <span className="eyebrow-pill mb-2">
                <Icon name="doc" className="w-3.5 h-3.5 text-forest-700" />
                Resume Builder
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Build a job-ready resume</h1>
              <p className="text-sm text-sage-600 mt-1">Uses your saved profile, then lets you edit and export as PDF from the browser print dialog.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button onClick={saveToProfile} className="btn-secondary text-sm">Save to Profile</button>
              <button onClick={saveVersion} className="btn-secondary text-sm">Save Version</button>
              <button onClick={() => setForm(empty)} className="btn-secondary text-sm">Clear</button>
              <button onClick={printResume} className="btn-primary text-sm">
                <Icon name="doc" className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-card text-sm text-red-700 print:hidden">{error}</div>
          )}
          {saved && (
            <div className="mb-5 p-3 bg-forest-50 border border-border rounded-card text-sm text-forest-700 print:hidden">Resume data saved to profile.</div>
          )}

          {/* CSS-only Edit/Preview toggle (mobile) + two-column editor/preview (desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
            {/* Radios drive the mobile view; sr-only keeps them out of layout flow */}
            <input type="radio" name="rb-view" id="rb-edit" defaultChecked className="peer/edit sr-only" aria-label="Show resume editor" />
            <input type="radio" name="rb-view" id="rb-preview" className="peer/preview sr-only" aria-label="Show resume preview" />

            <div className="col-span-full lg:hidden flex gap-1 p-1 rounded-xl border border-border bg-white print:hidden
                            peer-checked/edit:[&_.tab-edit]:bg-lime peer-checked/edit:[&_.tab-edit]:text-forest-800
                            peer-checked/preview:[&_.tab-preview]:bg-lime peer-checked/preview:[&_.tab-preview]:text-forest-800">
              <label htmlFor="rb-edit" className="tab-edit flex-1 text-center text-sm font-semibold py-2 rounded-lg cursor-pointer text-sage-600 transition-colors">Edit</label>
              <label htmlFor="rb-preview" className="tab-preview flex-1 text-center text-sm font-semibold py-2 rounded-lg cursor-pointer text-sage-600 transition-colors">Preview</label>
            </div>

            {/* Editor column */}
            <div className="rb-editor space-y-6 peer-checked/preview:hidden lg:!block print:hidden">
              <section className="card p-5 sm:p-6">
                <div className="border-b border-border pb-5 mb-5">
                  <h2 className="font-bold text-ink">Resume Upload Parser</h2>
                  <p className="text-sm text-sage-600 mt-1">Upload PDF/DOCX/TXT or paste resume text to extract skills, education, projects, experience, links, and summary.</p>
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    <input type="file" accept=".pdf,.docx,.txt" onChange={(event) => setResumeFile(event.target.files?.[0] || null)} className="form-input" aria-label="Upload resume file" />
                    <textarea value={resumeText} onChange={(event) => setResumeText(event.target.value)} rows={3} className="form-textarea" placeholder="Or paste resume text here" aria-label="Paste resume text" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button type="button" onClick={parseUpload} disabled={parsing || (!resumeFile && !resumeText.trim())} className="btn-primary text-sm">{parsing ? 'Parsing...' : 'Parse Resume'}</button>
                      <button type="button" onClick={applyParsedToProfile} disabled={!parsed} className="btn-secondary text-sm">Apply to Profile</button>
                    </div>
                  </div>
                  {parsed && (
                    <div className="mt-4 bg-surface border border-border rounded-card p-3">
                      <p className="text-xs font-bold text-sage-500 uppercase">Extracted Keywords</p>
                      <p className="text-sm text-ink mt-1 break-words">{(parsed.keywords || []).join(', ') || 'No keywords found'}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="font-bold text-ink">Resume Data</h2>
                    <p className="text-sm text-sage-500">Completeness: {score}%</p>
                  </div>
                  <div className="w-20 h-2 bg-surface rounded-full overflow-hidden shrink-0" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label="Resume completeness">
                    <div className="h-full bg-forest rounded-full" style={{ width: `${score}%` }} />
                  </div>
                </div>
                {loading ? (
                  <p className="text-sm text-sage-500">Loading profile data...</p>
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
                      <input key={name} name={name} value={form[name]} onChange={set} placeholder={label} aria-label={label} className="form-input" />
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
                      <textarea key={name} name={name} value={form[name]} onChange={set} rows={4} placeholder={label} aria-label={label} className="form-textarea md:col-span-2" />
                    ))}
                  </div>
                )}
              </section>

              <section className="card p-5 sm:p-6">
                <h2 className="font-bold text-ink mb-2">Job-Specific Versioning</h2>
                <p className="text-sm text-sage-600 mb-4">Save resume versions against tracked jobs and approve bullet changes before adding them.</p>
                <label htmlFor="rb-application" className="form-label">Linked application</label>
                <select id="rb-application" value={selectedApplicationId} onChange={(event) => setSelectedApplicationId(event.target.value)} className="form-select mb-3">
                  <option value="">No selected application</option>
                  {applications.map((item) => <option key={item.id} value={item.id}>{item.role} - {item.companyName}</option>)}
                </select>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button type="button" onClick={buildDiff} className="btn-secondary text-sm">Show AI Diff Approval</button>
                  <button type="button" onClick={saveVersion} className="btn-primary text-sm">Save For This Job</button>
                </div>
                {diff && (
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <div className="bg-surface border border-border rounded-card p-3"><p className="text-xs font-bold text-sage-500 uppercase">Original</p><p className="text-sm mt-1 text-ink break-words">{diff.original || 'No original bullet selected.'}</p></div>
                    <div className="bg-forest-50 border border-border rounded-card p-3"><p className="text-xs font-bold text-forest-700 uppercase">Improved</p><p className="text-sm mt-1 text-ink break-words">{diff.improved || 'No improved bullet selected.'}</p></div>
                    <p className="text-sm text-sage-600 break-words">Keywords added: {(diff.keywordsAdded || []).join(', ') || 'None'} | {diff.reason}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={acceptDiff} className="btn-primary text-sm">Accept</button>
                      <button type="button" onClick={() => setDiff(null)} className="btn-secondary text-sm">Reject</button>
                    </div>
                  </div>
                )}
                <div className="mt-5">
                  <h3 className="text-sm font-bold text-ink mb-2">Saved Versions</h3>
                  <div className="space-y-2 max-h-52 overflow-auto">
                    {versions.length === 0 && <p className="text-sm text-sage-500">No saved resume versions yet.</p>}
                    {versions.map((version) => (
                      <button key={version.id} type="button" onClick={() => setForm({ ...empty, ...(version.sections || {}) })} className="w-full text-left bg-surface border border-border rounded-card p-3 hover:border-forest-300 transition-colors">
                        <span className="block text-sm font-semibold text-ink">{version.title}</span>
                        <span className="block text-xs text-sage-500">{version.companyName || 'General'} | {version.targetRole || 'ATS resume'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Preview column — kept clean/neutral so nothing decorative bleeds into the export */}
            <article className="rb-preview hidden peer-checked/preview:block lg:!block bg-white border border-border shadow-card rounded-card p-6 sm:p-8 print:shadow-none print:border-0 print:rounded-none print:p-0 lg:sticky lg:top-24">
              <header className="border-b border-border pb-5 mb-5">
                <h2 className="text-3xl font-extrabold text-ink break-words">{form.fullName || 'Your Name'}</h2>
                <p className="text-base font-semibold text-forest-700 mt-1 break-words">{form.headline || 'Target Role'}</p>
                <p className="text-xs text-sage-500 mt-2 break-words">
                  {[form.email, form.phone, form.location].filter(Boolean).join(' | ') || 'email | phone | location'}
                </p>
                {!!form.links && <p className="text-xs text-sage-500 mt-1 break-words">{splitLines(form.links).join(' | ')}</p>}
              </header>

              <ResumeSection title="Summary">
                <p className="text-sm leading-relaxed text-sage-600 whitespace-pre-wrap break-words">{form.summary || 'Add a concise summary focused on target role, strongest skills, and measurable proof.'}</p>
              </ResumeSection>

              <ResumeSection title="Skills">
                <div className="flex flex-wrap gap-2">
                  {String(form.skills || '').split(/,|\n/).map((skill) => skill.trim()).filter(Boolean).map((skill) => (
                    <span key={skill} className="text-xs font-semibold border border-border rounded-full px-2.5 py-1 text-sage-600 break-words">{skill}</span>
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
                  <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed text-sage-600">
                    {(splitLines(value).length ? splitLines(value) : [`Add ${title.toLowerCase()} details.`]).map((line) => <li key={line} className="break-words">{line}</li>)}
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
