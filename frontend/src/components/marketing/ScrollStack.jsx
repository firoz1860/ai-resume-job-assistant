import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * ScrollStack — the signature card-stack scroll interaction (desktop).
 *
 * Structure is plain CSS sticky: each card pins just below the header and the
 * next card scrolls up to cover it. A single rAF scroll handler adds the
 * finishing touch — the covered card recedes (scale 1 → 0.95, a small lift,
 * a touch of dim) based on how far the next card has risen. No second pinning
 * system, no GSAP: one owner of scroll, measured from live card geometry.
 *
 * Below lg, or under reduced motion, stacking is disabled and the cards read
 * as ordinary stacked panels in normal document flow.
 *
 * @param {Array<{step,title,body,capabilities,cta,visual}>} items  exactly the
 *   panels to render, in order.
 * @param {number} topOffset  sticky pin distance from the top (header height).
 */
export default function ScrollStack({ items, topOffset = 96 }) {
  const cardRefs = useRef([]);
  const [stacking, setStacking] = useState(false);
  // When a control inside a covered card gets keyboard focus we bring that card
  // forward so the focused control is never hidden behind a later card.
  const [focusIdx, setFocusIdx] = useState(null);
  const focusedRef = useRef(null);
  const renderRef = useRef(() => {});

  useEffect(() => {
    const mqDesktop = window.matchMedia('(min-width: 1024px)');
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let on = false;

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const render = () => {
      raf = 0;
      if (!on) return;
      const cards = cardRefs.current.filter(Boolean);
      cards.forEach((card, i) => {
        const inner = card.firstElementChild;
        if (!inner) return;
        // A focused card is shown in full (no recede) and raised in the JSX.
        if (i === focusedRef.current || i === cards.length - 1) {
          inner.style.transform = '';
          inner.style.opacity = '';
          return;
        }
        const next = cards[i + 1];
        if (!next) return;
        // Coverage = how close the next card's top is to this card's pin line,
        // measured over roughly one card height of travel.
        const nextTop = next.getBoundingClientRect().top;
        const range = card.getBoundingClientRect().height || 1;
        const coverage = clamp01((topOffset + range - nextTop) / range);
        const scale = 1 - 0.05 * coverage;
        const lift = -10 * coverage;
        inner.style.transform = `translateY(${lift}px) scale(${scale})`;
        inner.style.opacity = String(1 - 0.28 * coverage);
      });
    };
    renderRef.current = render;

    const onScroll = () => {
      if (on && !raf) raf = requestAnimationFrame(render);
    };

    const reset = () => {
      cardRefs.current.filter(Boolean).forEach((card) => {
        const inner = card.firstElementChild;
        if (inner) {
          inner.style.transform = '';
          inner.style.opacity = '';
        }
      });
    };

    const refresh = () => {
      const fits = cardRefs.current.filter(Boolean).every((card, i) =>
        card.getBoundingClientRect().height + topOffset + i * 14 + 24 <= window.innerHeight);
      const want = mqDesktop.matches && !mqReduce.matches && fits;
      if (want === on) {
        if (on) render();
        return;
      }
      on = want;
      setStacking(want);
      if (on) {
        window.addEventListener('scroll', onScroll, { passive: true });
        requestAnimationFrame(render);
      } else {
        window.removeEventListener('scroll', onScroll);
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        reset();
      }
    };

    const observer = new ResizeObserver(refresh);
    cardRefs.current.filter(Boolean).forEach(card => observer.observe(card));
    refresh();
    window.addEventListener('resize', refresh);
    mqDesktop.addEventListener('change', refresh);
    mqReduce.addEventListener('change', refresh);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', onScroll);
      mqDesktop.removeEventListener('change', refresh);
      mqReduce.removeEventListener('change', refresh);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [topOffset, items.length]);

  return (
    <div className="relative">
      {items.map((item, i) => (
        <div
          key={item.step}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className={stacking ? 'sticky pb-6' : 'mb-6 last:mb-0'}
          style={stacking ? { top: `${topOffset + i * 14}px`, zIndex: focusIdx === i ? 50 : i + 1 } : undefined}
          onFocus={() => {
            if (!stacking) return;
            focusedRef.current = i;
            setFocusIdx(i);
            renderRef.current();
          }}
          onBlur={(e) => {
            if (!stacking) return;
            if (e.currentTarget.contains(e.relatedTarget)) return;
            focusedRef.current = null;
            setFocusIdx(null);
            renderRef.current();
          }}
        >
          {/* inner wrapper carries the recede transform so sticky `top` is untouched */}
          <article className="panel overflow-hidden will-change-transform">
            <div className="grid gap-0 md:grid-cols-2">
              {/* Text column */}
              <div className="p-6 sm:p-9 lg:p-11">
                <span className="font-display text-sm font-semibold text-forest-500">
                  {item.step}
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-sage-600">{item.body}</p>

                <ul className="mt-6 space-y-2.5">
                  {item.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime text-forest-800">
                        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                          <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {cap}
                    </li>
                  ))}
                </ul>

                <Link to={item.cta.to} className="btn-primary mt-7">
                  {item.cta.label}
                </Link>
              </div>

              {/* Visual column */}
              <div className="relative bg-ivory p-6 sm:p-9">
                <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
                <div className="relative grid h-full place-items-center">{item.visual}</div>
              </div>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
