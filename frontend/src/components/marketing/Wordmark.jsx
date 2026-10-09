/**
 * Wordmark — the CareerOS brand lockup (mark + text).
 *
 * Used in three places that must stay pixel-identical so the hero→navbar
 * logo morph lands cleanly: the marketing navbar, the oversized hero
 * wordmark, and the animated morph clone. Keep the markup here only.
 */
export function BrandMark({ className = 'h-9 w-9' }) {
  return (
    <span
      className={`${className} inline-grid place-items-center rounded-xl bg-forest text-white shrink-0`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[55%] w-[55%]">
        {/* stacked "career records" + a lime status dot */}
        <path d="M5 7.5h9M5 12h9M5 16.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17.5" cy="16" r="2.4" fill="#D4ED8A" />
      </svg>
    </span>
  );
}

/**
 * @param {'nav'|'hero'} size  nav = compact navbar lockup; hero = oversized.
 */
export default function Wordmark({ size = 'nav', className = '' }) {
  const isHero = size === 'hero';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark className={isHero ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-9 w-9'} />
      <span
        className={`font-display font-bold tracking-tight text-ink leading-none ${
          isHero ? 'text-4xl sm:text-5xl' : 'text-lg'
        }`}
      >
        CareerOS<span className="text-forest-500"> AI</span>
      </span>
    </span>
  );
}
