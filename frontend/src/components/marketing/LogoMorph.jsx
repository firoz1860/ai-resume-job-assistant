import { useEffect, useRef, useState } from 'react';
import Wordmark from './Wordmark.jsx';

/**
 * LogoMorph — the hero→navbar wordmark transition (homepage only).
 *
 * Principle (from the "logo scroll" reference): an oversized CareerOS wordmark
 * sits in the hero and, during the first screen of scrolling, scales and
 * travels into the navbar brand slot, then docks as the compact navbar logo.
 *
 * Mechanics kept honest and jank-free:
 *  - Reads the REAL source (hero) and destination (navbar) boxes from the DOM
 *    via [data-brand-anchor] — no hard-coded coordinates.
 *  - Animates a single fixed, aria-hidden clone with transform only (translate
 *    + scale); never animates layout properties.
 *  - The navbar's own <Link> stays the accessible home link; it simply fades
 *    in as the clone hands off, so keyboard/screen-reader users always have it.
 *  - Disabled (clone not rendered) under reduced motion or below lg, where the
 *    hero shows its wordmark statically and the navbar shows its own.
 *
 * Rendered once by the homepage.
 */
export default function LogoMorph() {
  const cloneRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia('(min-width: 1024px)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    let raf = 0;
    let measured = null; // { source, dest, distance, scaleStart }
    let active = false;
    let disposed = false;

    // Track every scheduled frame so delayed callbacks can't run after unmount.
    const pending = new Set();
    const schedule = (fn) => {
      const id = requestAnimationFrame(() => {
        pending.delete(id);
        if (!disposed) fn();
      });
      pending.add(id);
    };

    const heroEl = () => document.querySelector('[data-brand-anchor="hero"]');
    const navEl = () => document.querySelector('[data-brand-anchor="nav"]');

    const clearInline = () => {
      const h = heroEl();
      const n = navEl();
      if (h) h.style.visibility = '';
      if (n) n.style.opacity = '';
    };

    const measure = () => {
      const h = heroEl();
      const n = navEl();
      if (!h || !n) return false;
      const hr = h.getBoundingClientRect();
      const nr = n.getBoundingClientRect();
      if (hr.width < 2 || nr.width < 2) return false;
      const source = {
        left: hr.left + window.scrollX,
        top: hr.top + window.scrollY,
        width: hr.width,
      };
      const dest = { left: nr.left, top: nr.top, width: nr.width };
      measured = {
        source,
        dest,
        distance: Math.max(1, source.top - dest.top),
        scaleStart: source.width / dest.width,
      };
      return true;
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const render = () => {
      raf = 0;
      if (disposed) return;
      const clone = cloneRef.current;
      if (!clone || !measured) return;
      const { source, dest, distance, scaleStart } = measured;
      const p = clamp01(window.scrollY / distance);

      const x = lerp(source.left - window.scrollX, dest.left, p);
      const y = lerp(source.top - window.scrollY, dest.top, p);
      const scale = lerp(scaleStart, 1, p);

      clone.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      clone.style.opacity = String(1 - clamp01((p - 0.85) / 0.15));

      const n = navEl();
      if (n) n.style.opacity = String(clamp01((p - 0.6) / 0.4));
    };

    const onScroll = () => {
      if (!active) return;
      if (!raf) raf = requestAnimationFrame(render);
    };

    const start = () => {
      if (disposed || active) return;
      if (!mqDesktop.matches || mqReduce.matches) return;
      if (!measure()) return;
      active = true;
      setEnabled(true);
      const h = heroEl();
      if (h) h.style.visibility = 'hidden'; // clone is the visible brand now
      schedule(render);
      window.addEventListener('scroll', onScroll, { passive: true });
    };

    const stop = () => {
      active = false;
      setEnabled(false);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      clearInline();
    };

    const refresh = () => {
      if (disposed) return;
      if (!mqDesktop.matches || mqReduce.matches) {
        stop();
        return;
      }
      if (!active) {
        start();
      } else if (measure()) {
        render();
      }
    };

    schedule(start);
    // When fonts finish, widths shift — remeasure and re-render even if the
    // morph is already active (start() alone would early-exit).
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) schedule(refresh);
      });
    }
    window.addEventListener('load', refresh);
    window.addEventListener('resize', refresh);
    mqDesktop.addEventListener('change', refresh);
    mqReduce.addEventListener('change', refresh);

    return () => {
      disposed = true;
      pending.forEach((id) => cancelAnimationFrame(id));
      pending.clear();
      window.removeEventListener('load', refresh);
      window.removeEventListener('resize', refresh);
      mqDesktop.removeEventListener('change', refresh);
      mqReduce.removeEventListener('change', refresh);
      stop();
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={cloneRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] origin-top-left will-change-transform"
      style={{ transform: 'translate3d(-9999px,0,0)' }}
    >
      <Wordmark size="nav" />
    </div>
  );
}
