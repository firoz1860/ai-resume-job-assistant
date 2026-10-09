import { Icon } from './Reveal.jsx';

/**
 * PageHeader — the standard header for authenticated workspace pages.
 *
 * Light and restrained to match the workspace (dense, readable) rather than
 * the marketing surface. Same props as before (icon, eyebrow, title,
 * subtitle, children) so pages don't need to change how they call it.
 */
export default function PageHeader({ icon, eyebrow, title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        {icon && (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700">
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-forest-500">{eyebrow}</p>
          )}
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-sage-600">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{children}</div>}
    </div>
  );
}
