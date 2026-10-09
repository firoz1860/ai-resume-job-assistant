import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Wordmark from './marketing/Wordmark.jsx';
import SplineHero from './marketing/SplineHero.jsx';
import HeroComposition from './marketing/HeroComposition.jsx';

/**
 * Hero — editorial opening for the public homepage.
 *
 * The oversized wordmark is the morph source (data-brand-anchor="hero"); it is
 * decorative (aria-hidden) because the navbar holds the real accessible home
 * link. The product visual is a Spline scene when configured, otherwise the
 * HTML HeroComposition — no private account data is loaded here.
 */
export default function Hero() {
  const { isAuthenticated } = useAuth();

  const primary = isAuthenticated
    ? { label: 'Open your dashboard', to: '/dashboard' }
    : { label: 'Create your workspace', to: '/signup' };

  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="absolute inset-0 aurora-layer" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:py-24">
        {/* ── Copy column ─────────────────────────────────── */}
        <div>
          {/* Oversized wordmark — morphs into the navbar on scroll (decorative). */}
          <div data-brand-anchor="hero" className="mb-8 inline-block">
            <Wordmark size="hero" />
          </div>

          <p className="eyebrow-pill mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" />
            One workspace for your whole job search
          </p>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Your next career move,
            <br className="hidden sm:block" /> in one clear workspace.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-sage-600">
            Build a stronger resume, understand each role, track applications, and practice
            interviews—with your career information connected in one place.
          </p>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-sage-600">
            Your resume is in one folder, applications are in a spreadsheet, and interview notes are
            somewhere else. CareerOS&nbsp;AI brings the work together so you know what to do next.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to={primary.to} className="btn-primary text-base">
              {primary.label}
            </Link>
            <a href="#how-it-works" className="btn-secondary text-base">
              See how it works
            </a>
          </div>

          <p className="mt-6 text-sm text-sage-600">
            Private by default. Your profile and history stay in your account, and AI keys stay on
            the server—never in the browser.
          </p>
        </div>

        {/* ── Visual column ───────────────────────────────── */}
        <div className="relative">
          {/* Reserve height so the Spline canvas can't shift layout while loading. */}
          <div className="relative min-h-[26rem] sm:min-h-[30rem]">
            <SplineHero fallback={<div className="grid h-full place-items-center"><HeroComposition /></div>} />
          </div>
        </div>
      </div>
    </section>
  );
}
