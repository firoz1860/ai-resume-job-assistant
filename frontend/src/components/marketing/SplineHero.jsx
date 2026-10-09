import { Component, Suspense, lazy, useEffect, useState } from 'react';

/**
 * SplineHero — optional 3D hero scene with a production-quality fallback.
 *
 * The scene is supplied entirely by ONE environment variable:
 *
 *     VITE_SPLINE_SCENE_URL=https://prod.spline.design/<id>/scene.splinecode
 *
 * When it is unset (the default — no scene ships with the repo) nothing from
 * the Spline runtime is imported and the static `fallback` is shown. The
 * runtime is only lazy-loaded when a URL is present, reduced motion is off,
 * and the viewport is roomy enough to justify a WebGL canvas. On any load
 * error the fallback is shown instead. The canvas is decorative and
 * pointer-events-none, so it never captures scroll or covers the CTAs, and no
 * account/resume data is ever passed into it.
 */

const SCENE_URL = import.meta.env.VITE_SPLINE_SCENE_URL;

const Spline = SCENE_URL ? lazy(() => import('@splinetool/react-spline')) : null;

class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Keep the hero usable; surface the reason for debugging only.
    if (import.meta.env.DEV) console.warn('[SplineHero] scene failed to load:', error);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default function SplineHero({ fallback }) {
  const [canRender3D, setCanRender3D] = useState(false);

  useEffect(() => {
    if (!SCENE_URL) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const roomy = window.matchMedia('(min-width: 768px)').matches;
    const okConnection = !navigator.connection?.saveData;
    if (!reduce && roomy && okConnection) setCanRender3D(true);
  }, []);

  // No scene configured, constrained device, or reduced motion → static art.
  if (!SCENE_URL || !canRender3D || !Spline) return fallback;

  return (
    <SceneBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        {/* pointer-events-none: decorative, never blocks scroll or CTAs. */}
        <div className="pointer-events-none h-full w-full" aria-hidden="true">
          <Spline scene={SCENE_URL} style={{ width: '100%', height: '100%' }} />
        </div>
      </Suspense>
    </SceneBoundary>
  );
}
