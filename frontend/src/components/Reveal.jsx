import { useEffect, useRef, useState } from 'react';

/**
 * useInView — lightweight IntersectionObserver hook (no dependencies).
 * Returns [ref, inView]. Fires once by default.
 */
export function useInView({ threshold = 0.15, rootMargin = '0px 0px -8% 0px', once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/**
 * Reveal — fades + slides its children into view on scroll.
 * `delay` (ms) staggers grouped items. `as` picks the wrapper element.
 */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div', ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * AnimatedCounter — counts from 0 to `value` once scrolled into view.
 * Preserves a prefix/suffix (e.g. "%", "+", "min").
 */
export function AnimatedCounter({ value, duration = 1400, prefix = '', suffix = '', className = '' }) {
  const [ref, inView] = useInView();
  const [display, setDisplay] = useState(0);
  const target = Number(String(value).replace(/[^0-9.]/g, '')) || 0;

  useEffect(() => {
    if (!inView) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}

/* ── Icon set ─────────────────────────────────────────────────
   Minimal, consistent 24x24 stroke icons. Usage: <Icon name="chart" /> */
const PATHS = {
  chart: <path d="M4 19V5m5 14V9m5 10v-6m5 6V7" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M9.5 12h5M9.5 15.5h5" />
    </>
  ),
  match: <path d="M8 7H5a3 3 0 0 0 0 6h3m8-6h3a3 3 0 0 1 0 6h-3M9 10h6" />,
  route: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h6a4 4 0 0 0 4-4V8" />
    </>
  ),
  shield: <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" />,
  history: <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v3h3M12 8v4l3 2" />,
  key: (
    <>
      <circle cx="8" cy="12" r="3.5" />
      <path d="M11.5 12H20l-2 2m2-2-2-2" />
    </>
  ),
  sparkle: <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  bolt: <path d="M13 3 4 14h6l-1 7 9-11h-6z" />,
  rocket: (
    <>
      <path d="M5 15c-1 2-1 4-1 4s2 0 4-1m6.5-11.5a8 8 0 0 1 2 6.5c-2 3-6 5-6 5l-4-4s2-4 5-6a8 8 0 0 1 3-1.5z" />
      <circle cx="14.5" cy="9.5" r="1.3" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 6a3 3 0 0 1 0 6m5 8c0-2-1.5-3.5-4-4" />
    </>
  ),
};

export function Icon({ name, className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.sparkle}
    </svg>
  );
}
