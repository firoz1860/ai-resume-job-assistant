import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';

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
  const host = useRef(null);
  const [canRender3D, setCanRender3D] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!SCENE_URL) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const roomy = window.matchMedia('(min-width: 768px)');
    const update = () => setCanRender3D(!reduce.matches && roomy.matches && !navigator.connection?.saveData);
    update();
    reduce.addEventListener('change', update);
    roomy.addEventListener('change', update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (host.current) observer.observe(host.current);
    return () => {
      observer.disconnect();
      reduce.removeEventListener('change', update);
      roomy.removeEventListener('change', update);
    };
  }, []);

  const active = Boolean(SCENE_URL && Spline && canRender3D && visible && !failed);
  useEffect(() => {
    setLoaded(false);
    if (!active) return;
  }, [active]);
  useEffect(() => {
    if (!active || loaded) return;
    const timer = setTimeout(() => setFailed(true), 20000);
    return () => clearTimeout(timer);
  }, [active, loaded]);

  return (
    <div ref={host} className="relative h-full w-full">
      {(!active || !loaded) && fallback}
      {active && (
        <SceneBoundary fallback={fallback}>
          <Suspense fallback={null}>
            <div className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" style={{ visibility: loaded ? 'visible' : 'hidden' }}>
              <Spline scene={SCENE_URL} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} style={{ width: '100%', height: '100%' }} />
            </div>
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
