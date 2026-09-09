import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { dashboardApi } from '../services/api.js';
import { AnimatedCounter, Icon } from './Reveal.jsx';

const previewStats = [
  ['Career Score', '78%'],
  ['Applications', '24'],
  ['Practice', '6'],
  ['Follow-ups', '3'],
];

const ROTATING = ['resumes', 'applications', 'voice interviews', 'skill gaps', 'follow-ups'];

function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const id = setInterval(() => setI((v) => (v + 1) % ROTATING.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <span key={i} className="text-gradient-light inline-block animate-pop-in">
      {ROTATING[i]}
    </span>
  );
}

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
    <div className="relative animate-floaty">
      {/* Glow behind the panel */}
      <div className="absolute -inset-6 bg-brand-gradient opacity-30 blur-3xl rounded-[2rem]" />
      <div className="relative rounded-2xl border border-white/15 shadow-soft overflow-hidden bg-white text-ink">
        <div className="bg-navy-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex gap-1.5">
              <i className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <i className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <i className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </span>
            <div>
              <p className="text-[11px] text-white/60 leading-none">{isAuthenticated ? 'Your CareerOS AI' : 'CareerOS AI'}</p>
              <p className="font-semibold text-sm mt-0.5">{isAuthenticated ? 'Live Career Dashboard' : 'Job Search Command Center'}</p>
            </div>
          </div>
          <span className="text-[11px] bg-emerald-400/15 text-emerald-200 border border-emerald-300/20 rounded-full px-2.5 py-1 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            {isAuthenticated ? 'Live' : 'Preview'}
          </span>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(([label, value]) => (
              <div key={label} className="bg-surface border border-border rounded-xl p-3">
                <p className="text-xs text-muted">{label}</p>
                <p className="text-2xl font-extrabold text-navy-900 font-display">{loading ? '…' : value}</p>
              </div>
            ))}
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-bold flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-accent/10 text-accent grid place-items-center"><Icon name="bolt" className="w-3.5 h-3.5" /></span>
                Next best action
              </p>
              <span className="text-xs text-accent font-semibold">Today</span>
            </div>
            <p className="text-sm text-muted">
              {nextAction?.help || nextAction?.label || (isAuthenticated ? 'Your next action will appear after dashboard data loads.' : 'Send follow-up to 3 companies and practice one backend interview.')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700">{isAuthenticated ? 'Follow-ups' : 'Job Match'}</p>
              <p className="text-sm text-blue-900 mt-1">{isAuthenticated ? `${followUps} due now` : 'Node.js role match: 82%'}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700">{isAuthenticated ? 'Last Interview' : 'Interview Weakness'}</p>
              <p className="text-sm text-amber-900 mt-1">{dashboard?.lastInterview ? `${dashboard.lastInterview.type}: ${dashboard.lastInterview.score}%` : 'Explain system tradeoffs.'}</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted mb-1.5">
              <span>Career readiness</span>
              <span className="font-semibold text-navy-900">{progressWidth}</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-brand-gradient rounded-full transition-all duration-700" style={{ width: progressWidth }} />
            </div>
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
    <section className="relative bg-navy-900 text-white overflow-hidden">
      {/* Animated aurora + grid backdrop */}
      <div className="absolute inset-0 aurora-layer animate-aurora-shift" />
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-navy-900/0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-28 grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-12 items-center">
        <div className="animate-slide-up">
          <div className="eyebrow-pill glass text-white/85 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            AI career copilot for job seekers
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-5">
            Your entire job search,<br className="hidden sm:block" />
            <span className="text-gradient-light">one intelligent OS</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl leading-snug mb-4 min-h-[2rem]">
            Master your <RotatingWord /> — in one place.
          </p>

          <p className="text-white/60 text-base leading-relaxed mb-8 max-w-2xl">
            Tailor resumes, track applications, practice voice interviews, analyze skill gaps,
            and improve job readiness from one secure career workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <Link to="/dashboard" className="btn-gradient text-base flex-1 sm:flex-none">
              Open Dashboard
              <Icon name="rocket" className="w-4 h-4" />
            </Link>
            <Link to="/voice-interview" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass text-white font-semibold text-base hover:bg-white/15 transition-colors">
              <Icon name="mic" className="w-4 h-4" />
              Start Voice Interview
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-9 sm:mt-11 max-w-xl">
            {[['10', '+', 'Career tools'], ['20', ' min', 'Voice interview'], ['100', '%', 'Private & secure']].map(([num, suffix, label]) => (
              <div key={label} className="glass rounded-xl p-3.5">
                <span className="block text-white text-2xl font-bold font-display">
                  <AnimatedCounter value={num} suffix={suffix} />
                </span>
                <span className="text-white/60 text-xs sm:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <DashboardPreview dashboard={dashboard} isAuthenticated={isAuthenticated} loading={authLoading || dashboardLoading} />
      </div>
    </section>
  );
}
