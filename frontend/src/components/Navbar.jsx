import useDialogFocus from '../hooks/useDialogFocus.js';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CommandPalette from './CommandPalette.jsx';
import Wordmark from './marketing/Wordmark.jsx';
import { Icon } from './Reveal.jsx';

// ── Workspace navigation model ───────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: 'chart' },
      { label: 'Career Intelligence', to: '/career-intelligence', icon: 'sparkle' },
    ],
  },
  {
    label: 'Prepare',
    items: [
      { label: 'Profile', to: '/profile', icon: 'users' },
      { label: 'Career DNA', to: '/career-dna', icon: 'sparkle' },
      { label: 'Career Vault', to: '/career-vault', icon: 'shield' },
      { label: 'Resume Builder', to: '/resume-builder', icon: 'doc' },
      { label: 'Generator', to: '/generator', icon: 'bolt' },
      { label: 'Content Library', to: '/content-library', icon: 'history' },
    ],
  },
  {
    label: 'Applications',
    items: [
      { label: 'Job Analyzer', to: '/job-analyzer', icon: 'target' },
      { label: 'Matcher', to: '/matcher', icon: 'match' },
      { label: 'Applications', to: '/applications', icon: 'route' },
    ],
  },
  {
    label: 'Practice',
    items: [
      { label: 'Text Interview', to: '/interview-room', icon: 'users' },
      { label: 'Voice Interview', to: '/voice-interview', icon: 'mic' },
      { label: 'Interview History', to: '/interview-history', icon: 'history' },
      { label: 'Voice History', to: '/voice-interview-history', icon: 'history' },
      { label: 'Roadmap', to: '/roadmap', icon: 'route' },
    ],
  },
];

const SECONDARY = [
  { label: 'Admin', to: '/admin', icon: 'shield' },
  { label: 'About', to: '/about', icon: 'doc' },
];

const ALL_APP_ITEMS = [...NAV_GROUPS.flatMap((g) => g.items), { label: 'Admin', to: '/admin' }];

const BOTTOM_TABS = [
  { label: 'Home', to: '/dashboard', icon: 'chart' },
  { label: 'Intel', to: '/career-intelligence', icon: 'sparkle' },
  { label: 'Vault', to: '/career-vault', icon: 'shield' },
  { label: 'Voice', to: '/voice-interview', icon: 'mic' },
  { label: 'Jobs', to: '/applications', icon: 'route' },
];

const isActive = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const drawerRef = useDialogFocus(drawerOpen);

  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isAppRoute = ALL_APP_ITEMS.some((i) => isActive(pathname, i.to));
  const showShell = isAuthenticated && isAppRoute && !isAuthRoute;

  const activeItem = ALL_APP_ITEMS.find((i) => isActive(pathname, i.to));

  // ── Body classes: reserve space for sidebar / bottom tabs ──
  useEffect(() => {
    document.body.classList.toggle('has-sidebar', showShell);
    document.body.classList.toggle('has-bottom-nav', showShell);
    return () => {
      document.body.classList.remove('has-sidebar');
      document.body.classList.remove('has-bottom-nav');
    };
  }, [showShell]);

  // Close menus on route change
  useEffect(() => {
    setDrawerOpen(false);
    setCommandOpen(false);
  }, [pathname]);

  // Escape closes the mobile drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    setCommandOpen(false);
    navigate('/login', { replace: true });
  };

  // ════════════════════════════════════════════════════════════════════
  // MARKETING NAVBAR (public routes + signed-out)
  // ════════════════════════════════════════════════════════════════════
  if (!showShell) {
    const anchor = (id) => (pathname === '/' ? `#${id}` : `/#${id}`);
    const cta = isAuthenticated
      ? { label: 'Open dashboard', to: '/dashboard' }
      : { label: 'Create your workspace', to: '/signup' };

    return (
      <header className="sticky top-0 z-50 border-b border-border bg-ivory/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" data-brand-anchor="nav" aria-label="CareerOS AI home" className="shrink-0">
            <Wordmark size="nav" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <a href={anchor('product')} className="rounded-lg px-3 py-2 text-sm font-medium text-sage-600 transition-colors hover:bg-white hover:text-ink">Product</a>
            <a href={anchor('how-it-works')} className="rounded-lg px-3 py-2 text-sm font-medium text-sage-600 transition-colors hover:bg-white hover:text-ink">How it works</a>
            <Link to="/about" className="rounded-lg px-3 py-2 text-sm font-medium text-sage-600 transition-colors hover:bg-white hover:text-ink">About</Link>
          </nav>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Link to="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white sm:inline-flex">
                Sign in
              </Link>
            )}
            <Link to={cta.to} className="btn-primary px-4 py-2 text-sm">
              {cta.label}
            </Link>
          </div>
        </div>
        <nav aria-label="Mobile navigation" className="flex flex-wrap items-center justify-center gap-1 border-t border-border px-3 py-2 md:hidden">
          <a href={anchor('product')} className="rounded-lg px-3 py-2 text-sm">Product</a>
          <a href={anchor('how-it-works')} className="rounded-lg px-3 py-2 text-sm">How it works</a>
          <Link to="/about" className="rounded-lg px-3 py-2 text-sm">About</Link>
          {!isAuthenticated && <Link to="/login" className="rounded-lg px-3 py-2 text-sm sm:hidden">Sign in</Link>}
        </nav>
      </header>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // WORKSPACE SHELL (authenticated app routes)
  // ════════════════════════════════════════════════════════════════════
  const SidebarNav = ({ onNavigate }) => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link to="/" aria-label="CareerOS AI home" onClick={onNavigate}>
          <Wordmark size="nav" />
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sage-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      active ? 'bg-forest-50 text-forest-700' : 'text-sage-600 hover:bg-white hover:text-ink'
                    }`}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-lime" />}
                    <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="border-t border-border pt-4">
          {SECONDARY.map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-forest-50 text-forest-700' : 'text-sage-600 hover:bg-white hover:text-ink'
                }`}
              >
                <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* ── Fixed desktop sidebar (lg+) ─────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-ivory lg:block">
        <SidebarNav />
      </aside>

      {/* ── Compact top bar ─────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-ivory/85 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-ink hover:bg-white lg:hidden"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" aria-label="CareerOS AI home" className="lg:hidden">
            <Wordmark size="nav" />
          </Link>

          <p className="hidden min-w-0 truncate text-sm font-semibold text-ink lg:block">
            {activeItem?.label || 'Workspace'}
          </p>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setCommandOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-sage-600 transition-colors hover:text-ink"
            >
              Search
              <span className="hidden rounded border border-border bg-ivory px-1 py-0.5 text-[10px] sm:inline">⌘K</span>
            </button>
            <span className="hidden text-sm text-sage-600 xl:inline">
              {user?.name ? `Hi, ${user.name.split(' ')[0]}` : ''}
            </span>
            <button onClick={handleLogout} className="btn-secondary px-3 py-2 text-sm">
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" ref={drawerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] overflow-y-auto bg-ivory shadow-lift">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-sage-600 hover:bg-white"
              aria-label="Close navigation"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Mobile bottom tab bar (sibling of header, not nested) ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-ivory/95 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Primary"
      >
        <div className="grid grid-cols-5 px-1 py-1">
          {BOTTOM_TABS.map(({ label, to, icon }) => {
            const active = isActive(pathname, to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${
                  active ? 'text-forest-700' : 'text-sage-600 hover:text-ink'
                }`}
              >
                <Icon name={icon} className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <CommandPalette open={commandOpen} onOpen={() => setCommandOpen(true)} onClose={() => setCommandOpen(false)} />
    </>
  );
}
