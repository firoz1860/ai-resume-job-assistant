/**
 * HeroComposition — the hero's product visual, built from real interface
 * panels (resume, applications, interviews) in accessible HTML. Doubles as
 * the Spline fallback. All numbers are illustrative, so the panel is labelled
 * "Example workspace" and never reflects a real account.
 */

function Bar({ label, value, width }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-sage-600">{label}</span>
        <span className="font-semibold text-ink">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-ivory overflow-hidden">
        <div className="h-full rounded-full bg-forest" style={{ width }} />
      </div>
    </div>
  );
}

export default function HeroComposition() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-lime/40 blur-2xl" aria-hidden="true" />

      {/* Primary panel — next action + readiness */}
      <div className="panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow-pill">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" />
            Example workspace
          </span>
          <span className="text-xs font-medium text-sage-600">Tuesday</span>
        </div>

        <div className="mt-4 rounded-card border border-border bg-forest text-white p-4">
          <p className="text-xs text-white/70">Do this next</p>
          <p className="mt-1 font-semibold">Tailor your resume for the Backend Engineer role at Northwind</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/15 px-2.5 py-1">3 skills to add</span>
            <span className="rounded-full bg-lime px-2.5 py-1 font-semibold text-forest-800">Match 71%</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-card border border-border p-3">
            <p className="text-2xl font-bold text-ink">12</p>
            <p className="text-xs text-sage-600">Applications tracked</p>
          </div>
          <div className="rounded-card border border-border p-3">
            <p className="text-2xl font-bold text-ink">2</p>
            <p className="text-xs text-sage-600">Follow-ups due</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Bar label="Resume evidence" value="8 of 11 skills" width="72%" />
          <Bar label="Interview practice" value="Last score 7/10" width="70%" />
        </div>
      </div>

      {/* Floating pipeline chip — top right */}
      <div className="absolute -right-3 -top-4 hidden rounded-card border border-border bg-white p-3 shadow-card-hover sm:block">
        <p className="text-[11px] font-semibold text-sage-600">Pipeline</p>
        <div className="mt-2 flex items-center gap-1.5">
          {['Saved', 'Applied', 'Interview'].map((s, i) => (
            <span
              key={s}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                i === 2 ? 'bg-lime text-forest-800' : 'bg-ivory text-sage-600'
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Floating interview chip — bottom left */}
      <div className="absolute -bottom-5 -left-3 hidden rounded-card border border-border bg-white p-3 shadow-card-hover sm:block">
        <p className="text-[11px] font-semibold text-sage-600">Interview feedback</p>
        <p className="mt-1 max-w-[12rem] text-xs text-ink">
          “Lead with the impact, then the metric.”
        </p>
      </div>
    </div>
  );
}
