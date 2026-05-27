import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CommandPalette from './CommandPalette.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const toolsRef = useRef(null);
  const toolsBtnRef = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const primaryLinks = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Intelligence', to: '/career-intelligence' },
    { label: 'Vault', to: '/career-vault' },
    { label: 'Generator', to: '/generator' },
    { label: 'Voice', to: '/voice-interview' },
    { label: 'Applications', to: '/applications' },
  ];

  const toolLinks = [
    { label: 'Career DNA', to: '/career-dna' },
    { label: 'Job Analyzer', to: '/job-analyzer' },
    { label: 'Resume Builder', to: '/resume-builder' },
    { label: 'Admin', to: '/admin' },
    { label: 'Content Library', to: '/content-library' },
    { label: 'Matcher', to: '/matcher' },
    { label: 'Text Interview', to: '/interview-room' },
    { label: 'Interview History', to: '/interview-history' },
    { label: 'Voice History', to: '/voice-interview-history' },
    { label: 'Roadmap', to: '/roadmap' },
    { label: 'Profile', to: '/profile' },
    { label: 'About', to: '/about' },
  ];

  const bottomTabs = [
    { label: 'Home', to: '/dashboard' },
    { label: 'AI', to: '/career-intelligence' },
    { label: 'Vault', to: '/career-vault' },
    { label: 'Voice', to: '/voice-interview' },
    { label: 'Jobs', to: '/applications' },
  ];

  const isToolsActive = toolLinks.some((link) => pathname === link.to);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    setToolsOpen(false);
    setCommandOpen(false);
    navigate('/login', { replace: true });
  };

  // Body class so CSS applies bottom-nav padding to <main> on auth pages
  useEffect(() => {
    if (isAuthenticated) {
      document.body.classList.add('has-bottom-nav');
    } else {
      document.body.classList.remove('has-bottom-nav');
    }
    return () => document.body.classList.remove('has-bottom-nav');
  }, [isAuthenticated]);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setToolsOpen(false);
    setCommandOpen(false);
  }, [pathname]);

  // Close tools dropdown on outside click / Escape
  useEffect(() => {
    const onPointerDown = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setToolsOpen(false);
        setCommandOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Determine if tools dropdown should open left or right to stay in viewport
  const [toolsLeft, setToolsLeft] = useState(false);
  useEffect(() => {
    if (!toolsOpen || !toolsBtnRef.current) return;
    const rect = toolsBtnRef.current.getBoundingClientRect();
    setToolsLeft(rect.right + 256 > window.innerWidth);
  }, [toolsOpen]);

  return (
    <>
      {/* ── Top header bar ─────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-navy-900 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M5 7h10M5 11h10M5 15h6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="18" cy="10" r="3" fill="#2563EB" opacity="0.85"/>
                <path d="M18 8.5v3M16.5 10h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-navy-900 text-base lg:text-lg whitespace-nowrap">
              CareerOS<span className="text-accent">AI</span>
            </span>
          </Link>

          {/* ── Desktop nav (lg = 1024px+) ─────────────────── */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 min-w-0 mx-2 xl:mx-4">
            {primaryLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                  pathname === l.to
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                {l.label}
              </Link>
            ))}

            {/* Tools dropdown */}
            <div ref={toolsRef} className="relative shrink-0">
              <button
                ref={toolsBtnRef}
                onClick={() => setToolsOpen((v) => !v)}
                className={`px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isToolsActive || toolsOpen
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                Tools
                <svg className={`w-3 h-3 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {toolsOpen && (
                <div
                  className={`absolute top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-card-hover p-2 animate-fade-in z-[200] ${
                    toolsLeft ? 'left-0' : 'right-0'
                  }`}
                  style={{ maxHeight: 'calc(100vh - 5rem)', overflowY: 'auto' }}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold text-muted uppercase tracking-wide">Tools</p>
                    <button
                      type="button"
                      onClick={() => setToolsOpen(false)}
                      className="w-6 h-6 rounded-md text-muted hover:text-ink hover:bg-surface text-sm leading-none"
                      aria-label="Close tools menu"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-0.5">
                    {toolLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setToolsOpen(false)}
                        className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          pathname === l.to ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface'
                        }`}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* ── Desktop right actions ───────────────────────── */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            {isAuthenticated && (
              <button
                onClick={() => setCommandOpen(true)}
                className="inline-flex items-center gap-1.5 px-2 xl:px-3 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-muted hover:text-ink hover:bg-white transition-colors whitespace-nowrap"
              >
                Search
                <span className="hidden xl:inline border border-border bg-white rounded px-1 py-0.5 text-[10px]">⌘K</span>
              </button>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-secondary text-xs xl:text-sm px-3 xl:px-4 py-2 whitespace-nowrap">
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn-primary text-xs xl:text-sm px-3 xl:px-4 py-2 whitespace-nowrap">
                Login
              </Link>
            )}
          </div>

          {/* ── Mobile hamburger (hidden lg+) ──────────────── */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg text-ink hover:text-accent hover:bg-surface transition-colors shrink-0 ml-2"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>

        {/* ── Mobile slide-down menu (hidden lg+) ────────────── */}
        {open && (
          <div
            className="lg:hidden border-t border-border bg-white animate-fade-in"
            style={{ maxHeight: 'calc(100dvh - 4rem)', overflowY: 'auto' }}
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 pb-6 space-y-4">
              {isAuthenticated && (
                <button
                  onClick={() => { setCommandOpen(true); setOpen(false); }}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-left text-sm font-semibold text-muted flex items-center justify-between"
                >
                  <span>Search actions</span>
                  <span className="border border-border bg-white rounded px-1.5 py-0.5 text-[10px]">⌘K</span>
                </button>
              )}

              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 px-1">Main</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {primaryLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname === l.to ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface'
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 px-1">Tools</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {toolLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname === l.to ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface'
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="btn-secondary text-sm w-full justify-center">
                    Logout
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-primary text-sm w-full justify-center">
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Mobile bottom tab bar (hidden lg+, only when authenticated) ── */}
      {/* IMPORTANT: rendered as a sibling of <header>, NOT inside it.     */}
      {/* Placing fixed children inside a sticky ancestor breaks fixed      */}
      {/* positioning in some browsers and DevTools responsive mode.        */}
      {isAuthenticated && (
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-border"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          aria-label="Mobile navigation"
        >
          <div className="grid grid-cols-5 px-1 py-1">
            {bottomTabs.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center py-2 rounded-lg text-[11px] font-semibold transition-colors ${
                  pathname === to ? 'text-accent bg-accent/10' : 'text-muted hover:text-ink'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <CommandPalette open={commandOpen} onOpen={() => setCommandOpen(true)} onClose={() => setCommandOpen(false)} />
    </>
  );
}
