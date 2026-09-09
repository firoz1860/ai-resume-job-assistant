import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
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
            <button onClick={restoreSaved} className="btn-secondary text-sm bg-white/10 border-white/20 text-white hover:bg-white/20">Load Saved</button>
          </PageHeader>

          {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          {saved && <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">Profile saved. Form cleared for the next entry.</div>}

          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
            <aside className="card-gradient p-5 sm:p-6 lg:sticky lg:top-24">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Profile Completion</p>
              <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-brand-gradient mt-2 font-display">{profileCompletion}%</p>
              <div className="h-2.5 bg-surface rounded-full overflow-hidden mt-3">
                <div className="h-full bg-brand-gradient rounded-full transition-all duration-700" style={{ width: `${profileCompletion}%` }} />
              </div>
              <p className="text-sm text-muted mt-4">Saved profile data powers Career Intelligence, job matching, voice interviews, and generated content.</p>
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between border border-border rounded-lg p-3 bg-surface"><span className="text-muted">Target role</span><strong className="text-ink">{savedProfile.targetRole || 'Not set'}</strong></div>
                <div className="flex justify-between border border-border rounded-lg p-3 bg-surface"><span className="text-muted">Dream company</span><strong className="text-ink">{savedProfile.dreamCompany || 'Not set'}</strong></div>
                <div className="flex justify-between border border-border rounded-lg p-3 bg-surface"><span className="text-muted">Job type</span><strong className="text-ink">{savedProfile.jobType || 'Not set'}</strong></div>
              </div>
            </aside>

            <form onSubmit={save} className="space-y-6">
              {loading && <div className="card p-8 text-sm text-muted">Loading profile...</div>}

              {!loading && sections.map((section) => (
                <section key={section.title} className="card p-5 sm:p-6">
                  <div className="mb-5">
                    <h2 className="font-bold text-ink">{section.title}</h2>
                    <p className="text-sm text-muted mt-1">{section.help}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.fields.map(([name, label]) => (
                      <input
                        key={name}
                        name={name}
                        value={profile[name] || ''}
                        onChange={set}
                        placeholder={label}
                        className="form-input"
                      />
                    ))}
                  </div>
                </section>
              ))}

              {!loading && (
                <section className="card p-5 sm:p-6 space-y-4">
                  <div>
                    <h2 className="font-bold text-ink">Resume and Proof</h2>
                    <p className="text-sm text-muted mt-1">Paste resume text and major achievements for better AI personalization.</p>
                  </div>
                  <textarea name="resumeText" value={profile.resumeText || ''} onChange={set} rows={7} placeholder="Resume text" className="form-textarea" />
                  <textarea name="achievements" value={profile.achievements || ''} onChange={set} rows={4} placeholder="Achievements, awards, metrics, hackathons, leadership, open-source contributions" className="form-textarea" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button className="btn-gradient justify-center" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
                    <button type="button" onClick={() => setProfile(emptyProfile)} className="btn-secondary justify-center">Clear Form</button>
                  </div>
                </section>
              )}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
