import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { Icon } from '../components/Reveal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { profileApi } from '../services/api.js';

const emptyProfile = {
  education: '',
  skills: '',
  projects: '',
  experience: '',
  targetRole: '',
  dreamCompany: '',
  resumeText: '',
  phone: '',
  location: '',
  portfolioUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  preferredLocation: '',
  jobType: '',
  expectedSalary: '',
  noticePeriod: '',
  certifications: '',
  achievements: '',
  languages: '',
  availability: '',
};

const sections = [
  {
    title: 'Core Career Profile',
    icon: 'target',
    help: 'Used by Career Intelligence, job matching, roadmap, and interviews.',
    fields: [
      ['education', 'Education'],
      ['skills', 'Current skills'],
      ['projects', 'Projects'],
      ['experience', 'Experience'],
      ['targetRole', 'Target role'],
      ['dreamCompany', 'Dream company'],
    ],
  },
  {
    title: 'Contact and Online Presence',
    icon: 'users',
    help: 'Useful for resume, recruiter messages, and application tracking.',
    fields: [
      ['phone', 'Phone'],
      ['location', 'Current location'],
      ['portfolioUrl', 'Portfolio URL'],
      ['githubUrl', 'GitHub URL'],
      ['linkedinUrl', 'LinkedIn URL'],
      ['languages', 'Languages'],
    ],
  },
  {
    title: 'Job Preferences',
    icon: 'match',
    help: 'Helps AI create better application answers and recruiter messages.',
    fields: [
      ['preferredLocation', 'Preferred location'],
      ['jobType', 'Job type: remote, hybrid, onsite, internship'],
      ['expectedSalary', 'Expected salary'],
      ['noticePeriod', 'Notice period'],
      ['availability', 'Availability'],
      ['certifications', 'Certifications'],
    ],
  },
];

function cleanProfile(data = {}) {
  return Object.keys(emptyProfile).reduce((next, key) => {
    next[key] = data[key] || '';
    return next;
  }, {});
}

function completion(profile) {
  const total = Object.keys(emptyProfile).length;
  const filled = Object.values(profile).filter((value) => String(value || '').trim()).length;
  return Math.round((filled / total) * 100);
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const profileCompletion = useMemo(() => completion(savedProfile), [savedProfile]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = cleanProfile(await profileApi.get());
      setProfile(data);
      setSavedProfile(data);
    } catch (err) {
      setError(err.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const set = (e) => {
    setSaved(false);
    setProfile((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = cleanProfile(await profileApi.update(profile));
      setSavedProfile(updated);
      setProfile(emptyProfile);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const restoreSaved = () => {
    setProfile(savedProfile);
    setSaved(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <PageHeader
            icon="users"
            eyebrow="Career profile"
            title="Profile"
            subtitle={user?.email || 'Your saved career data powers every AI feature.'}
          >
            <button onClick={restoreSaved} className="btn-secondary text-sm bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30">Load Saved</button>
          </PageHeader>

          {error && (
            <div role="alert" className="mb-5 flex gap-2 rounded-card border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <Icon name="shield" className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}
          {saved && (
            <div role="status" className="mb-5 flex gap-2 rounded-card border border-forest-200 bg-forest-50 p-3.5 text-sm text-forest-700">
              <Icon name="check" className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Profile saved. The form was cleared for your next entry — use <strong>Load Saved</strong> to edit what you stored.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
            <aside className="card p-5 sm:p-6 lg:sticky lg:top-24">
              <p className="text-xs font-semibold text-sage-600 uppercase tracking-wide">Profile completion</p>
              <p className="text-4xl font-bold text-forest-700 mt-2 font-display">{profileCompletion}%</p>
              <div className="h-2.5 bg-surface rounded-full overflow-hidden mt-3" role="progressbar" aria-valuenow={profileCompletion} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-forest rounded-full transition-all duration-700" style={{ width: `${profileCompletion}%` }} />
              </div>
              <p className="text-sm text-sage-600 mt-4 leading-relaxed">Saved profile data powers Career Intelligence, job matching, voice interviews, and generated content.</p>
              <div className="mt-5 space-y-2 text-sm">
                {[
                  ['Target role', savedProfile.targetRole],
                  ['Dream company', savedProfile.dreamCompany],
                  ['Job type', savedProfile.jobType],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 border border-border rounded-card p-3 bg-surface">
                    <span className="text-sage-600">{label}</span>
                    <strong className={value ? 'text-ink text-right' : 'text-sage-500 text-right'}>{value || 'Not set'}</strong>
                  </div>
                ))}
              </div>
            </aside>

            <form onSubmit={save} className="space-y-6">
              {loading && (
                <div className="card p-6">
                  <div className="flex items-center gap-3 text-sm text-sage-600">
                    <span className="relative w-5 h-5 shrink-0">
                      <span className="absolute inset-0 rounded-full border-2 border-forest-100" />
                      <span className="absolute inset-0 rounded-full border-2 border-forest border-t-transparent animate-spin" />
                    </span>
                    Loading your profile...
                  </div>
                </div>
              )}

              {!loading && sections.map((section) => (
                <section key={section.title} className="card p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-9 h-9 rounded-card bg-forest-50 text-forest-700 grid place-items-center shrink-0">
                      <Icon name={section.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-ink">{section.title}</h2>
                      <p className="text-sm text-sage-600 mt-0.5">{section.help}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map(([name, label]) => (
                      <div key={name}>
                        <label htmlFor={`profile-${name}`} className="form-label">{label}</label>
                        <input
                          id={`profile-${name}`}
                          name={name}
                          value={profile[name] || ''}
                          onChange={set}
                          placeholder={label}
                          className="form-input"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {!loading && (
                <section className="card p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-card bg-forest-50 text-forest-700 grid place-items-center shrink-0">
                      <Icon name="doc" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-ink">Resume and Proof</h2>
                      <p className="text-sm text-sage-600 mt-0.5">Paste resume text and major achievements for better AI personalization.</p>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="profile-resumeText" className="form-label">Resume text</label>
                    <textarea id="profile-resumeText" name="resumeText" value={profile.resumeText || ''} onChange={set} rows={7} placeholder="Paste your full resume text" className="form-textarea" />
                  </div>
                  <div>
                    <label htmlFor="profile-achievements" className="form-label">Achievements</label>
                    <textarea id="profile-achievements" name="achievements" value={profile.achievements || ''} onChange={set} rows={4} placeholder="Achievements, awards, metrics, hackathons, leadership, open-source contributions" className="form-textarea" />
                  </div>
                </section>
              )}

              {!loading && (
                <div className="sticky bottom-4 z-10">
                  <div className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-soft">
                    <p className="text-sm text-sage-600">Review your entries, then save to update your career data.</p>
                    <div className="flex gap-3 shrink-0">
                      <button type="button" onClick={() => setProfile(emptyProfile)} className="btn-secondary">Clear Form</button>
                      <button className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : (<><Icon name="check" className="h-4 w-4" />Save Profile</>)}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
