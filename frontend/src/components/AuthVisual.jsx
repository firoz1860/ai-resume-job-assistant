export default function AuthVisual({ mode = 'login' }) {
  const title = mode === 'signup' ? 'Start with CareerOS AI' : 'CareerOS AI';
  const subtitle = mode === 'signup'
    ? 'Build a secure profile and let your career workspace learn from every application.'
    : 'Return to your job-search command center with applications, interviews, and insights in one place.';

  return (
    <div className="hidden lg:flex bg-navy-900 text-white p-12 flex-col justify-center relative overflow-hidden">
      <div className="absolute inset-0 auth-grid opacity-35" />
      <div className="absolute top-12 right-12 w-36 h-36 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute bottom-16 left-10 w-44 h-44 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative z-10 max-w-xl">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-3">Secure career workspace</p>
        <h1 className="text-4xl font-extrabold mb-4">{title}</h1>
        <p className="text-white/70 text-lg leading-relaxed mb-10">{subtitle}</p>

        <div className="auth-scene">
          <div className="auth-orb">
            <span>AI</span>
          </div>

          <div className="auth-card auth-card-one">
            <p className="text-xs text-white/55">Career Score</p>
            <p className="text-3xl font-extrabold">82%</p>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-3">
              <div className="h-full w-4/5 bg-accent rounded-full" />
            </div>
          </div>

          <div className="auth-card auth-card-two">
            <p className="text-xs text-white/55">Voice Interview</p>
            <p className="font-bold mt-1">Score 8/10</p>
            <div className="auth-wave mt-4">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="auth-card auth-card-three">
            <p className="text-xs text-white/55">Applications</p>
            <p className="font-bold mt-1">3 follow-ups due</p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-10 text-sm">
          {['Resume', 'Interview', 'Tracker'].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/75">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
