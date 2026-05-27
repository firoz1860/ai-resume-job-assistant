import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardApi } from '../services/api.js';

const previewStats = [
  ['Career Score', '78%'],
  ['Applications', '24'],
  ['Practice', '6'],
  ['Follow-ups', '3'],
];

function DashboardPreview({ dashboard, isAuthenticated, loading }) {
  const stats = useMemo(() => {
    if (!dashboard?.stats?.length) return previewStats;
    const map = Object.fromEntries(dashboard.stats.map((item) => [item.label, item.value]));
    return [
      ['Career Score', map['Career Score'] || '0%'],
      ['Applications', map.Applications || '0'],
      ['Practice', map.Practice || '0'],
      ['Generated', map.Generated || '0'],
    ];
  }, [dashboard]);

  const nextAction = dashboard?.nextActions?.[0];
  const followUps = dashboard?.followUpsDue?.length || 0;
  const progressValue = Number(String(stats[0][1]).replace('%', '')) || 0;
  const progressWidth = isAuthenticated ? `${Math.max(6, Math.min(100, progressValue))}%` : '78%';

  return (
    <div className="relative">
      <div className="absolute -inset-2 sm:-inset-4 bg-accent/20 blur-3xl rounded-full" />
      <div className="relative bg-white text-ink rounded-xl border border-white/20 shadow-card-hover overflow-hidden">
        <div className="bg-navy-900 text-white px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">{isAuthenticated ? 'Your CareerOS AI' : 'CareerOS AI'}</p>
            <p className="font-bold">{isAuthenticated ? 'Live Career Dashboard' : 'Job Search Command Center'}</p>
          </div>
          <span className="text-xs bg-emerald-400/15 text-emerald-200 border border-emerald-300/20 rounded-full px-2.5 py-1">{isAuthenticated ? 'Live' : 'Preview'}</span>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(([label, value]) => (
              <div key={label} className="bg-surface border border-border rounded-lg p-3">
                <p className="text-xs text-muted">{label}</p>
                <p className="text-2xl font-extrabold text-navy-900">{loading ? '...' : value}</p>
              </div>
            ))}
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-sm font-bold">Next best action</p>
              <span className="text-xs text-accent font-semibold">Today</span>
            </div>
            <p className="text-sm text-muted">
              {nextAction?.help || nextAction?.label || (isAuthenticated ? 'Your next action will appear after dashboard data loads.' : 'Send follow-up to 3 companies and practice one backend interview.')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700">{isAuthenticated ? 'Follow-ups' : 'Job Match'}</p>
              <p className="text-sm text-blue-900 mt-1">{isAuthenticated ? `${followUps} due now` : 'Node.js role match: 82%'}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-700">{isAuthenticated ? 'Last Interview' : 'Interview Weakness'}</p>
              <p className="text-sm text-amber-900 mt-1">{dashboard?.lastInterview ? `${dashboard.lastInterview.type}: ${dashboard.lastInterview.score}%` : 'Explain system tradeoffs.'}</p>
            </div>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: progressWidth }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setDashboard(null);
      return () => { active = false; };
    }
    setDashboardLoading(true);
    dashboardApi.stats()
      .then((data) => { if (active) setDashboard(data); })
      .catch(() => { if (active) setDashboard(null); })
      .finally(() => { if (active) setDashboardLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  return (
    <section className="bg-navy-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24 grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI career copilot for job seekers
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-5">
            CareerOS AI
          </h1>

          <p className="text-white/72 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
            Tailor resumes, track applications, practice voice interviews, analyze skill gaps, and improve job readiness from one secure career workspace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            <Link to="/dashboard" className="btn-primary px-6 py-3 text-base justify-center">
              Open Dashboard
            </Link>
            <Link to="/voice-interview" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition-colors border border-white/10">
              Start Voice Interview
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-10 text-white/65 text-sm max-w-xl">
            {[['10+', 'Career tools'], ['20 min', 'Voice interview'], ['JWT', 'Secure data']].map(([num, label]) => (
              <div key={label} className="border border-white/10 rounded-lg p-3 bg-white/5">
                <span className="block text-white text-xl font-bold">{num}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <DashboardPreview dashboard={dashboard} isAuthenticated={isAuthenticated} loading={authLoading || dashboardLoading} />
      </div>
    </section>
  );
}
