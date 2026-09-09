import { Icon } from './Reveal.jsx';

/**
 * PageHeader — premium gradient banner used across authenticated pages
 * for a consistent, professional header. Optional icon (icon-set name),
 * eyebrow, title, subtitle, and an actions area (children, right-aligned).
 */
export default function PageHeader({ icon, eyebrow, title, subtitle, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy-900 text-white p-6 sm:p-8 mb-8 shadow-soft">
      <div className="absolute inset-0 aurora-layer opacity-70" />
      <div className="absolute inset-0 bg-dots opacity-30" />
      <div className="absolute -right-10 -top-10 w-52 h-52 bg-brand-gradient opacity-25 blur-3xl rounded-full" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-start gap-4 min-w-0">
          {icon && (
            <span className="w-12 h-12 rounded-xl glass grid place-items-center shrink-0">
              <Icon name={icon} className="w-6 h-6 text-white" />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <span className="eyebrow-pill bg-white/10 text-white/80 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {eyebrow}
              </span>
            )}
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-white/70 text-sm sm:text-base mt-1.5 leading-relaxed">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
      </div>
    </div>
  );
}
