import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
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
  ['Career DNA', '/career-dna'],
  ['Career Intelligence', '/career-intelligence'],
  ['Analyze Job', '/job-analyzer'],
  ['Mock Interview', '/interview-room'],
  ['Voice Interview', '/voice-interview'],
  ['Roadmap', '/roadmap'],
];

export default function Dashboard() {
  const [data, setData] = useState(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
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
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">CareerOS AI Dashboard</h1>
            <p className="text-sm text-muted mt-1">Your career command center for analysis, applications, interviews, and growth.</p>
          </div>

          {error && <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 mb-6">
            <section className="card p-6 bg-navy-900 text-white border-navy-900">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-2">Next Best Action</p>
              <h2 className="text-xl font-bold mb-4">Move your job search forward today</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(data.nextActions || fallbackData.nextActions).map((action) => (
                  <a key={action.href} href={action.href} className="rounded-lg bg-white/10 border border-white/10 p-4 hover:bg-white/20 transition-colors">
                    <p className="font-semibold text-sm">{action.label}</p>
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">{action.help}</p>
                  </a>
                ))}
              </div>
            </section>

            <section className="card p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-bold text-ink">Follow-ups Due</h2>
                  <p className="text-xs text-muted mt-1">Applications that need attention now.</p>
                </div>
                <a href="/applications" className="text-xs font-semibold text-accent">Open tracker</a>
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
            {data.stats.map((stat) => (
              <div key={stat.label} className="card p-5">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-extrabold text-navy-900 mt-2">{isLoading ? '...' : stat.value}</p>
                <p className="text-xs text-muted mt-1">{stat.help}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="card p-6">
              <h2 className="font-bold text-ink mb-4">Career Progress</h2>
              {data.progress.map((item) => (
                <div key={item.label} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-sm mb-1"><span>{item.label}</span><span>{isLoading ? '--' : `${item.value}%`}</span></div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden"><div className="h-full bg-accent transition-all" style={{ width: `${isLoading ? 0 : item.value}%` }} /></div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="font-bold text-ink mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-3">
                  {actions.map(([label, href]) => (
                    <a key={href} href={href} className="btn-secondary justify-between">{label}<span>-&gt;</span></a>
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
