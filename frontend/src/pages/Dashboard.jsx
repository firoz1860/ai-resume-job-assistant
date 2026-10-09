import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { Reveal, Icon } from '../components/Reveal.jsx';
import { dashboardApi } from '../services/api.js';

// Static labels + guidance only. Numeric values are shown ONLY after a
// successful load, so a failed request can never masquerade as "0".
const statLabels = [
  { label: 'Career Score', help: 'Run Career DNA to calculate', icon: 'chart' },
  { label: 'Generated', help: 'Application assets', icon: 'doc' },
  { label: 'Applications', help: 'Tracked roles', icon: 'match' },
  { label: 'Practice', help: 'Interview sessions', icon: 'mic' },
];

const progressLabels = [
  'Profile analyzed',
  'Job matched',
  'Content generated',
  'Interview practiced',
  'Applications tracked',
];

const defaultNextActions = [
  { label: 'Complete your profile', href: '/profile', help: 'Add skills, projects, and a target role.' },
  { label: 'Analyze a job', href: '/job-analyzer', help: 'Compare your profile with a real job description.' },
  { label: 'Start interview practice', href: '/voice-interview', help: 'Get scored practice and feedback.' },
];

const quickActions = [
  ['Career DNA', '/career-dna', 'sparkle'],
  ['Career Intelligence', '/career-intelligence', 'chart'],
  ['Career Vault', '/career-vault', 'shield'],
  ['Resume Builder', '/resume-builder', 'doc'],
  ['Analyze Job', '/job-analyzer', 'target'],
  ['Mock Interview', '/interview-room', 'users'],
  ['Voice Interview', '/voice-interview', 'mic'],
  ['Roadmap', '/roadmap', 'route'],
];

function valueByLabel(data, label) {
  const found = data?.stats?.find((s) => s.label === label);
  return found ? found.value : null;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = () => {
    let active = true;
    setIsLoading(true);
    setError('');
    dashboardApi.stats()
      .then((stats) => {
        if (!active) return;
        setData(stats);
        setLoaded(true);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load your dashboard.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  };

  useEffect(() => loadStats(), []);

  const nextActions = (loaded && data?.nextActions?.length) ? data.nextActions : defaultNextActions;
  const followUps = data?.followUpsDue || [];
  const progress = data?.progress || [];
  const recent = data?.recentActivities || [];

  // How to render a numeric cell depending on load state.
  const renderValue = (value) => {
    if (isLoading) return <span className="inline-block h-7 w-16 animate-pulse rounded bg-ivory" aria-hidden="true" />;
    if (!loaded) return <span className="text-sage-600">—</span>;
    return <span>{value ?? '—'}</span>;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PageHeader
            icon="chart"
            eyebrow="Overview"
            title="Dashboard"
            subtitle="What to do next, your pipeline at a glance, and recent activity."
          >
            <Link to="/applications" className="btn-primary text-sm">
              <Icon name="match" className="h-4 w-4" /> Track application
            </Link>
          </PageHeader>

          {error && (
            <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 sm:flex-row sm:items-center">
              <span>{error} Your numbers aren’t shown until they load successfully.</span>
              <button onClick={loadStats} className="btn-secondary px-3 py-1.5 text-xs">Retry</button>
            </div>
          )}

          {/* Next best action + follow-ups */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="relative overflow-hidden rounded-panel bg-forest p-6 text-white">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime/25 blur-3xl" aria-hidden="true" />
              <p className="relative text-xs font-semibold uppercase tracking-wider text-lime">Do this next</p>
              <h2 className="relative mt-2 font-display text-xl font-bold">Move your job search forward today</h2>
              <div className="relative mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {nextActions.map((action) => (
                  <Link key={action.href} to={action.href} className="group rounded-card border border-white/10 bg-white/10 p-4 transition-colors hover:bg-white/15">
                    <p className="flex items-center justify-between text-sm font-semibold">
                      {action.label}
                      <Icon name="bolt" className="h-4 w-4 text-lime opacity-0 transition-opacity group-hover:opacity-100" />
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/70">{action.help}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="card p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-semibold text-ink">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-forest-50 text-forest-700"><Icon name="history" className="h-4 w-4" /></span>
                    Follow-ups due
                  </h2>
                  <p className="mt-1 text-xs text-sage-600">Applications that need attention now.</p>
                </div>
                <Link to="/applications" className="text-xs font-semibold text-forest-700 hover:underline">Open tracker</Link>
              </div>
              {isLoading ? (
                <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-card bg-ivory" />)}</div>
              ) : !loaded ? (
                <p className="rounded-card border border-border bg-ivory p-4 text-sm text-sage-600">Couldn’t load follow-ups.</p>
              ) : followUps.length ? (
                <div className="space-y-3">
                  {followUps.map((item) => (
                    <div key={item.id} className="rounded-card border border-border bg-ivory p-3">
                      <p className="text-sm font-semibold text-ink">{item.companyName || 'Company'}</p>
                      <p className="text-xs text-sage-600">{item.role || 'Role'} · due {item.followUpDate || 'today'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-card border border-border bg-ivory p-4 text-sm text-sage-600">No follow-ups due. Your pipeline is current.</p>
              )}
            </section>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {statLabels.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 60}>
                <div className="card h-full p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">{stat.label}</p>
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-forest-50 text-forest-700">
                      <Icon name={stat.icon} className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-2 font-display text-3xl font-extrabold text-ink">
                    {renderValue(valueByLabel(data, stat.label))}
                  </p>
                  <p className="mt-1 text-xs text-sage-600">{stat.help}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Progress */}
            <div className="card p-6">
              <h2 className="mb-4 font-semibold text-ink">Career progress</h2>
              {isLoading ? (
                <div className="space-y-4">{progressLabels.map((l) => <div key={l} className="h-6 animate-pulse rounded bg-ivory" />)}</div>
              ) : !loaded ? (
                <p className="rounded-card border border-border bg-ivory p-4 text-sm text-sage-600">Progress is unavailable right now. Retry to load it.</p>
              ) : (
                (progress.length ? progress : progressLabels.map((label) => ({ label, value: 0 }))).map((item) => (
                  <div key={item.label} className="mb-4 last:mb-0">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-ink">{item.label}</span>
                      <span className="font-semibold text-forest-700">{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-ivory">
                      <div className="h-full rounded-full bg-forest transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, item.value))}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="mb-4 font-semibold text-ink">Quick actions</h2>
                <div className="grid grid-cols-1 gap-2.5">
                  {quickActions.map(([label, href, icon]) => (
                    <Link key={href} to={href} className="group flex items-center gap-3 rounded-card border border-border bg-white px-3.5 py-2.5 transition-colors hover:border-forest-300 hover:bg-forest-50">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700">
                        <Icon name={icon} className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm font-semibold text-ink">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="mb-4 font-semibold text-ink">Recent activity</h2>
                {isLoading ? (
                  <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-card bg-ivory" />)}</div>
                ) : !loaded ? (
                  <p className="text-sm text-sage-600">Couldn’t load recent activity.</p>
                ) : recent.length ? (
                  <div className="space-y-3">
                    {recent.map((activity) => (
                      <div key={`${activity.type}-${activity.title}-${activity.date}`} className="rounded-card border border-border bg-ivory p-3">
                        <p className="text-xs font-semibold uppercase text-forest-700">{activity.type}</p>
                        <p className="text-sm font-medium text-ink">{activity.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-sage-600">No activity yet. Start an interview or add an application.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
