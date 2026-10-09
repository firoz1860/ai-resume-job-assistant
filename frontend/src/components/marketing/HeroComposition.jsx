import { useEffect, useRef } from 'react';

/**
 * HeroComposition — the finished, code-built hero visual for CareerOS AI.
 *
 * An original layered product illustration: a résumé panel, an application
 * pipeline panel raised in front of it, and a floating interview-practice
 * panel, arranged around a small CareerOS emblem. Pure HTML + CSS perspective
 * + lightweight SVG — renders immediately, no WebGL or third-party scene.
 *
 * Motion (desktop, fine pointer, motion allowed only): a staggered entrance,
 * a slow ≤6px float per panel, a ≤3° pointer tilt, and a small scroll
 * parallax — each on its own wrapper so no two animate the same transform.
 * All continuous motion pauses offscreen or when the tab is hidden, and is
 * disabled entirely under prefers-reduced-motion. The whole illustration is
 * decorative: meaningful copy stays as real text, shapes are aria-hidden, and
 * nothing inside is a real clickable control.
 */

/* ── Panels ───────────────────────────────────────────────── */
function ResumePanel() {
  return (
    <article className="w-full rounded-panel border border-border bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">Your experience, clearly presented.</p>
        <span className="eyebrow-pill !px-2 !py-0.5 text-[10px]">Example</span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sage-400">Skills</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {['Node.js', 'React', 'PostgreSQL', 'Docker'].map((s) => (
              <span key={s} className="rounded-full border border-border bg-ivory px-2 py-0.5 text-[11px] text-ink">{s}</span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sage-400">Experience</p>
          <div className="mt-1.5 rounded-lg border border-lime-300 bg-lime-50 p-2.5">
            <p className="text-[11px] font-semibold text-forest-800">Backend Engineer · Northwind</p>
            <p className="mt-0.5 text-[11px] leading-snug text-forest-700">
              Cut checkout latency 40% by batching inventory reads.
            </p>
          </div>
          <div className="mt-1.5 h-2 w-4/5 rounded-full bg-ivory" aria-hidden="true" />
          <div className="mt-1.5 h-2 w-2/3 rounded-full bg-ivory" aria-hidden="true" />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sage-400">Projects</p>
          <div className="mt-1.5 h-2 w-3/4 rounded-full bg-ivory" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

function ApplicationPanel() {
  const stages = [['Saved', false], ['Applied', false], ['Interview', true]];
  return (
    <article className="w-full rounded-panel border border-border bg-white p-4 shadow-lift">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">Applications</p>
        <span className="rounded-full bg-forest-50 px-2 py-0.5 text-[10px] font-semibold text-forest-700">Follow-up planned</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {stages.map(([label, active]) => (
          <div
            key={label}
            className={`rounded-lg px-2 py-1.5 text-center text-[10px] font-semibold ${
              active ? 'bg-lime text-forest-800' : 'bg-ivory text-sage-600'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-border p-2.5">
        <p className="text-[11px] font-semibold text-ink">Backend Engineer</p>
        <p className="text-[10px] text-sage-600">Northwind · remote</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-forest" aria-hidden="true" />
          <span className="text-[10px] text-sage-600">Interview stage</span>
        </div>
      </div>
    </article>
  );
}

function InterviewPanel() {
  return (
    <article className="w-full rounded-panel border border-border bg-white p-4 shadow-lift">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ink">Practice your next conversation.</p>
        <span className="eyebrow-pill !px-2 !py-0.5 text-[10px]">Interview preview</span>
      </div>

      <p className="mt-3 rounded-lg bg-ivory px-3 py-2 text-[11px] leading-snug text-ink">
        “Tell me about a time you improved a slow system.”
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-white" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        {/* Decorative waveform — static; practice is not recording. */}
        <svg viewBox="0 0 120 24" className="h-6 flex-1" aria-hidden="true" preserveAspectRatio="none">
          {[6, 12, 8, 16, 10, 20, 9, 14, 7, 18, 11, 15, 8, 13, 6].map((h, i) => (
            <rect key={i} x={i * 8 + 2} y={12 - h / 2} width="3" height={h} rx="1.5" fill="#153D2B" opacity={0.25 + (h / 20) * 0.5} />
          ))}
        </svg>
      </div>
    </article>
  );
}

function Emblem({ className = '' }) {
  // Original CareerOS mark: layered rounded squares + an orbital ring/dot.
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <rect x="26" y="26" width="68" height="68" rx="20" fill="#153D2B" opacity="0.12" transform="rotate(-10 60 60)" />
      <rect x="32" y="32" width="56" height="56" rx="17" fill="#153D2B" />
      <circle cx="60" cy="60" r="34" fill="none" stroke="#D4ED8A" strokeWidth="2.5" opacity="0.9" />
      <circle cx="60" cy="26" r="5" fill="#D4ED8A" />
      <path d="M48 62h20M48 54h24M48 70h14" stroke="#F5F4EE" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

/* ── Composition ──────────────────────────────────────────── */
export default function HeroComposition() {
  const sceneRef = useRef(null);
  const tiltRef = useRef(null);
  // One parallax wrapper per depth layer (slowest background → fastest accent).
  const bgRef = useRef(null);
  const emblemRef = useRef(null);
  const resumeRef = useRef(null);
  const appRef = useRef(null);
  const interviewRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const tilt = tiltRef.current;
    if (!scene || !tilt) return undefined;

    // Depth layers, slowest → fastest. The differing travel (px) is what reads
    // as depth. All driven by ONE scheduler; each on its own wrapper so scroll
    // parallax never overwrites pointer tilt / entrance / float.
    const layers = [
      [bgRef, 8],
      [emblemRef, 15],
      [resumeRef, 19],
      [appRef, 25],
      [interviewRef, 30],
    ];

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    const desktop = window.matchMedia('(min-width: 768px)');

    let rafTilt = 0;
    let rafScroll = 0;
    let listening = false;
    let pointerBound = false;
    let visible = false; // tracked from the IntersectionObserver

    const resetTransforms = () => {
      tilt.style.transform = 'rotateX(0deg) rotateY(0deg)';
      for (const [ref] of layers) {
        if (ref.current) ref.current.style.transform = 'translateY(0px)';
      }
    };

    const onPointerMove = (e) => {
      if (rafTilt) return;
      rafTilt = requestAnimationFrame(() => {
        rafTilt = 0;
        const r = scene.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
        const py = (e.clientY - r.top) / r.height - 0.5;
        const ry = Math.max(-3, Math.min(3, px * 6));
        const rx = Math.max(-3, Math.min(3, -py * 6));
        tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    };
    const onPointerLeave = () => {
      if (rafTilt) cancelAnimationFrame(rafTilt);
      rafTilt = 0;
      tilt.style.transform = 'rotateX(0deg) rotateY(0deg)';
    };
    const onScroll = () => {
      if (rafScroll) return;
      rafScroll = requestAnimationFrame(() => {
        rafScroll = 0;
        // Measure the UNtransformed scene (never the moving layers) to avoid
        // feedback/jitter. Section-relative progress in [-1, 1]: 0 when the
        // scene is centred, so movement is bounded and reverses naturally.
        const r = scene.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const center = r.top + r.height / 2;
        const p = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2 + r.height / 2)));
        for (const [ref, amt] of layers) {
          const el = ref.current;
          if (el) el.style.transform = `translateY(${(p * amt).toFixed(1)}px)`;
        }
      });
    };

    // Motion runs only when EVERY condition holds.
    const canMove = () =>
      visible && !reduce.matches && desktop.matches && !document.hidden;

    const bindPointer = () => {
      if (pointerBound || !finePointer.matches) return;
      scene.addEventListener('pointermove', onPointerMove);
      scene.addEventListener('pointerleave', onPointerLeave);
      pointerBound = true;
    };
    const unbindPointer = () => {
      if (!pointerBound) return;
      scene.removeEventListener('pointermove', onPointerMove);
      scene.removeEventListener('pointerleave', onPointerLeave);
      pointerBound = false;
    };

    const addMotion = () => {
      if (listening) return;
      listening = true;
      scene.classList.remove('hero-paused');
      bindPointer();
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    };
    const removeMotion = (pause) => {
      listening = false;
      unbindPointer();
      window.removeEventListener('scroll', onScroll);
      if (rafTilt) cancelAnimationFrame(rafTilt);
      if (rafScroll) cancelAnimationFrame(rafScroll);
      rafTilt = rafScroll = 0;
      resetTransforms(); // reset BOTH tilt and parallax
      if (pause) scene.classList.add('hero-paused');
    };

    const sync = () => {
      if (canMove()) addMotion();
      else removeMotion(true);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(scene);

    const onVisibility = () => sync();
    document.addEventListener('visibilitychange', onVisibility);

    // Pointer capability can change (e.g. a tablet docking a mouse): rebind.
    const onPointerPref = () => {
      if (!listening) return;
      unbindPointer();
      bindPointer();
    };

    reduce.addEventListener('change', sync);
    desktop.addEventListener('change', sync);
    finePointer.addEventListener('change', onPointerPref);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reduce.removeEventListener('change', sync);
      desktop.removeEventListener('change', sync);
      finePointer.removeEventListener('change', onPointerPref);
      removeMotion(false);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      data-hero-scene=""
      className="relative mx-auto w-full max-w-lg"
      style={{ perspective: '1200px' }}
    >
      {/* faint grid texture (slowest parallax layer) — enlarged so its ≤8px
          travel never exposes an edge. */}
      <div ref={bgRef} data-parallax="bg" className="pointer-events-none absolute -inset-5 -z-10 bg-grid opacity-[0.35] will-change-transform" aria-hidden="true" />
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-lime/25 blur-3xl" aria-hidden="true" />

      {/* tilt wraps the whole illustration (pointer rotate); parallax lives on
          the individual depth layers inside it. */}
      <div ref={tiltRef} className="hero-tilt will-change-transform" style={{ transformStyle: 'preserve-3d' }}>

        {/* ── Desktop / tablet: layered composition ── */}
        <div className="relative hidden h-[30rem] md:block">
          {/* emblem — centred via wrapper, parallaxed on the inner element */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div ref={emblemRef} data-parallax="emblem" className="will-change-transform"><Emblem className="h-40 w-40 opacity-90" /></div>
          </div>

          <div ref={resumeRef} data-parallax="resume" className="absolute left-0 top-4 w-[62%] will-change-transform">
            <div className="hero-rise" style={{ '--rise-delay': '60ms' }}>
              <div className="hero-float" style={{ '--float-dur': '7.5s' }}>
                <div style={{ transform: 'rotate(-4deg)' }}><ResumePanel /></div>
              </div>
            </div>
          </div>

          <div ref={appRef} data-parallax="app" className="absolute right-0 top-24 w-[52%] will-change-transform">
            <div className="hero-rise" style={{ '--rise-delay': '200ms' }}>
              <div className="hero-float" style={{ '--float-dur': '6.5s', '--float-delay': '400ms' }}>
                <div style={{ transform: 'rotate(3deg)' }}><ApplicationPanel /></div>
              </div>
            </div>
          </div>

          <div ref={interviewRef} data-parallax="interview" className="absolute bottom-0 left-[16%] w-[52%] will-change-transform">
            <div className="hero-rise" style={{ '--rise-delay': '340ms' }}>
              <div className="hero-float" style={{ '--float-dur': '8s', '--float-delay': '800ms' }}>
                <div style={{ transform: 'rotate(-2deg)' }}><InterviewPanel /></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile: compact stacked composition (no parallax) ── */}
        <div className="space-y-3 md:hidden">
          <div className="hero-rise" style={{ '--rise-delay': '40ms' }}><ResumePanel /></div>
          <div className="grid grid-cols-1 gap-3 xs:grid-cols-2">
            <div className="hero-rise" style={{ '--rise-delay': '160ms' }}><ApplicationPanel /></div>
            <div className="hero-rise" style={{ '--rise-delay': '260ms' }}><InterviewPanel /></div>
          </div>
        </div>

      </div>
    </div>
  );
}
