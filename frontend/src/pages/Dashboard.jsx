import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { Reveal, Icon } from '../components/Reveal.jsx';
import { dashboardApi } from '../services/api.js';

const fallbackData = {
  stats: [
    { label: 'Career Score', value: '0%', help: 'Run Career DNA to calculate' },
    { label: 'Generated', value: '0', help: 'Application assets' },
    { label: 'Applications', value: '0', help: 'Tracked roles' },
    { label: 'Practice', value: '0', help: 'Interview sessions' },
  ],
  progress: [
    { label: 'Profile analyzed', value: 0 },
    { label: 'Job matched', value: 0 },
    { label: 'Content generated', value: 0 },
    { label: 'Interview practiced', value: 0 },
    { label: 'Applications tracked', value: 0 },
  ],
  recentActivities: [],
  lastInterview: null,
  followUpsDue: [],
  nextActions: [
    { label: 'Complete your profile', href: '/profile', help: 'Add skills, projects, and target role.' },
    { label: 'Analyze a job', href: '/job-analyzer', help: 'Compare your profile with a real job description.' },
    { label: 'Start interview practice', href: '/voice-interview', help: 'Get scored practice and feedback.' },
  ],
};

const actions = [
  ['Career DNA', '/career-dna', 'sparkle'],
  ['Career Intelligence', '/career-intelligence', 'chart'],
  ['Career Vault', '/career-vault', 'shield'],
  ['Resume Builder', '/resume-builder', 'doc'],
  ['Analyze Job', '/job-analyzer', 'target'],
  ['Mock Interview', '/interview-room', 'users'],
  ['Voice Interview', '/voice-interview', 'mic'],
  ['Roadmap', '/roadmap', 'route'],
];

const statIcons = { 'Career Score': 'chart', Generated: 'doc', Applications: 'match', Practice: 'mic' };

export default function Dashboard() {
  const [data, setData] = useState(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = () => {
    let active = true;
    setIsLoading(true);
    dashboardApi.stats()
      .then((stats) => {
        if (active) setData({ ...fallbackData, ...stats });
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load dashboard stats.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  };

  useEffect(() => {
    return loadStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <PageHeader
            icon="chart"
            eyebrow="Command center"
            title="CareerOS AI Dashboard"
            subtitle="Your career command center for analysis, applications, interviews, and growth."
          >
            <Link to="/applications" className="btn-gradient text-sm">
              <Icon name="match" className="w-4 h-4" /> Track Application
            </Link>
          </PageHeader>

          {error && <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 mb-6">
            <section className="relative overflow-hidden card p-6 bg-navy-900 text-white border-navy-900">
              <div className="absolute -right-8 -bottom-10 w-48 h-48 bg-brand-gradient opacity-25 blur-3xl rounded-full" />
              <p className="relative text-xs font-bold uppercase tracking-wide text-blue-200 mb-2">Next Best Action</p>
              <h2 className="relative text-xl font-bold mb-4 font-display">Move your job search forward today</h2>
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3">
                {(data.nextActions || fallbackData.nextActions).map((action) => (
                  <Link key={action.href} to={action.href} className="group rounded-xl bg-white/10 border border-white/10 p-4 hover:bg-white/20 transition-colors">
                    <p className="font-semibold text-sm flex items-center justify-between">
                      {action.label}
                      <Icon name="bolt" className="w-4 h-4 text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">{action.help}</p>
                  </Link>
                ))}
              </div>
              <div className="relative mt-4 flex flex-col sm:flex-row gap-2">
                <Link to="/career-vault" className="btn-secondary text-sm bg-white/10 border-white/20 text-white hover:bg-white/20">Search Career Vault</Link>
                <Link to="/resume-builder" className="btn-secondary text-sm bg-white/10 border-white/20 text-white hover:bg-white/20">Build Resume</Link>
                <Link to="/applications" className="btn-primary text-sm">Track Application</Link>
              </div>
            </section>

            <section className="card p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-bold text-ink flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 grid place-items-center"><Icon name="history" className="w-4 h-4" /></span>
                    Follow-ups Due
                  </h2>
                  <p className="text-xs text-muted mt-1">Applications that need attention now.</p>
                </div>
                <Link to="/applications" className="text-xs font-semibold text-accent">Open tracker</Link>
              </div>
              {data.followUpsDue?.length ? (
                <div className="space-y-3">
                  {data.followUpsDue.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-3 bg-surface">
                      <p className="text-sm font-semibold text-ink">{item.companyName || 'Company'}</p>
                      <p className="text-xs text-muted">{item.role || 'Role'} - due {item.followUpDate || 'today'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted bg-surface border border-border rounded-lg p-4">No due follow-ups. Keep your pipeline current.</p>
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {data.stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 70}>
                <div className="card-gradient p-5 h-full">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide">{stat.label}</p>
                    <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent grid place-items-center">
                      <Icon name={statIcons[stat.label] || 'sparkle'} className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-brand-gradient mt-2 font-display">{isLoading ? '…' : stat.value}</p>
                  <p className="text-xs text-muted mt-1">{stat.help}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="card p-6">
              <h2 className="font-bold text-ink mb-4">Career Progress</h2>
              {data.progress.map((item) => (
                <div key={item.label} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-sm mb-1"><span>{item.label}</span><span className="font-semibold text-navy-900">{isLoading ? '--' : `${item.value}%`}</span></div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden"><div className="h-full bg-brand-gradient rounded-full transition-all duration-700" style={{ width: `${isLoading ? 0 : item.value}%` }} /></div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="font-bold text-ink mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-2.5">
                  {actions.map(([label, href, icon]) => (
                    <Link key={href} to={href} className="group flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-border bg-white hover:bg-surface hover:border-accent/30 transition-colors">
                      <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent grid place-items-center shrink-0 transition-transform group-hover:scale-110">
                        <Icon name={icon} className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-semibold text-ink flex-1">{label}</span>
                      <span className="text-muted group-hover:text-accent transition-colors">→</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-bold text-ink mb-4">Recent Activity</h2>
                {data.recentActivities.length ? (
                  <div className="space-y-3">
                    {data.recentActivities.map((activity) => (
                      <div key={`${activity.type}-${activity.title}-${activity.date}`} className="border border-border rounded-lg p-3 bg-surface">
                        <p className="text-xs font-semibold text-accent uppercase">{activity.type}</p>
                        <p className="text-sm font-medium text-ink">{activity.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No recent activity yet. Start an interview or add an application.</p>
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
