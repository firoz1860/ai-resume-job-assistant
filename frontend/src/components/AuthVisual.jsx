import Wordmark from './marketing/Wordmark.jsx';

/**
 * AuthVisual — decorative forest panel beside the login/signup forms.
 * Mirrors the marketing identity (forest + lime + ivory) with a small,
 * illustrative composition. All figures are illustrative, not account data.
 */
export default function AuthVisual({ mode = 'login' }) {
  const title = mode === 'signup' ? 'Start with CareerOS AI' : 'Welcome back';
  const subtitle = mode === 'signup'
    ? 'Build a profile once, then tailor applications and practice interviews from one workspace.'
    : 'Your applications, interview practice, and insights are waiting in one place.';

  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-forest p-12 text-white lg:flex">
      <div className="absolute inset-0 auth-grid opacity-30" aria-hidden="true" />
      <div className="absolute -right-10 top-16 h-40 w-40 rounded-full bg-lime/25 blur-3xl" aria-hidden="true" />

      <div className="relative z-10">
        <div className="[&_*]:!text-white">
          <Wordmark size="nav" />
        </div>
      </div>

      <div className="relative z-10 max-w-md">
        <h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-white/75">{subtitle}</p>

        <div className="auth-scene mt-10" aria-hidden="true">
          <div className="auth-orb"><span>AI</span></div>

          <div className="auth-card auth-card-one">
            <p className="text-xs text-white/60">Resume evidence</p>
            <p className="mt-1 text-2xl font-extrabold">8 / 11</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-3/4 rounded-full bg-lime" />
            </div>
          </div>

          <div className="auth-card auth-card-two">
            <p className="text-xs text-white/60">Voice interview</p>
            <p className="mt-1 font-bold">Last score 7/10</p>
            <div className="auth-wave mt-4"><span /><span /><span /><span /></div>
          </div>

          <div className="auth-card auth-card-three">
            <p className="text-xs text-white/60">Applications</p>
            <p className="mt-1 font-bold">2 follow-ups due</p>
            <div className="mt-4 grid grid-cols-3 gap-2"><i /><i /><i /></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-3 text-sm">
        {['Resume', 'Interviews', 'Tracker'].map((item) => (
          <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/80">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
