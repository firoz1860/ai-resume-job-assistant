import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CommandPalette from './CommandPalette.jsx';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const primaryLinks = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Intelligence', to: '/career-intelligence' },
    { label: 'Generator', to: '/generator' },
    { label: 'Voice Interview', to: '/voice-interview' },
    { label: 'Applications', to: '/applications' },
  ];

  const toolLinks = [
    { label: 'Career DNA', to: '/career-dna' },
    { label: 'Job Analyzer', to: '/job-analyzer' },
    { label: 'Content Library', to: '/content-library' },
    { label: 'Matcher', to: '/matcher' },
    { label: 'Text Interview', to: '/interview-room' },
    { label: 'Interview History', to: '/interview-history' },
    { label: 'Voice History', to: '/voice-interview-history' },
    { label: 'Roadmap', to: '/roadmap' },
    { label: 'Profile', to: '/profile' },
    { label: 'About', to: '/about' },
  ];

  const allLinks = [...primaryLinks, ...toolLinks];
  const isToolsActive = toolLinks.some((link) => pathname === link.to);
  const handleLogout = async () => {
    await logout();
    setOpen(false);
    setToolsOpen(false);
    setCommandOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 bg-navy-900 rounded-lg flex items-center justify-center shadow-sm shadow-blue-500/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M5 7h10M5 11h10M5 15h6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="10" r="3" fill="#2563EB" opacity="0.85"/>
              <path d="M18 8.5v3M16.5 10h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-navy-900 text-lg whitespace-nowrap">
            CareerOS<span className="text-accent">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {primaryLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                pathname === l.to
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="relative">
            <button
              onClick={() => setToolsOpen((value) => !value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${isToolsActive ? 'bg-accent/10 text-accent' : 'text-muted hover:text-ink hover:bg-surface'}`}
            >
              Tools
            </button>
            {toolsOpen && (
              <div className="absolute right-0 top-11 w-64 bg-white border border-border rounded-xl shadow-card-hover p-2 animate-fade-in">
                {toolLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setToolsOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === l.to ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface'}`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setCommandOpen(true)}
              className="ml-2 hidden xl:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-xs font-semibold text-muted hover:text-ink hover:bg-white transition-colors"
            >
              Search
              <span className="border border-border bg-white rounded px-1.5 py-0.5 text-[10px]">Ctrl K</span>
            </button>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="ml-3 btn-secondary text-sm px-4 py-2">Logout</button>
          ) : (
            <Link to="/login" className="ml-3 btn-primary text-sm px-4 py-2">Login</Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="lg:hidden border-t border-border bg-white animate-fade-in">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            {isAuthenticated && (
              <button
                onClick={() => { setCommandOpen(true); setOpen(false); }}
                className="w-full mb-4 px-4 py-2.5 rounded-lg border border-border bg-surface text-left text-sm font-semibold text-muted"
              >
                Search actions with Ctrl K
              </button>
            )}
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Main</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-4">
              {primaryLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === l.to ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Tools</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {toolLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.to ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface'
                }`}
              >
                {l.label}
              </Link>
            ))}
            </div>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-secondary text-sm mt-1 justify-center">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="btn-primary text-sm mt-1 justify-center">Login</Link>
            )}
          </nav>
        </div>
      )}
      {isAuthenticated && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-border px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-5 gap-1">
            {[
              ['Home', '/dashboard'],
              ['AI', '/career-intelligence'],
              ['Gen', '/generator'],
              ['Voice', '/voice-interview'],
              ['Jobs', '/applications'],
            ].map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className={`text-center rounded-lg px-1 py-2 text-xs font-semibold ${pathname === to ? 'bg-accent/10 text-accent' : 'text-muted'}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <CommandPalette open={commandOpen} onOpen={() => setCommandOpen(true)} onClose={() => setCommandOpen(false)} />
    </header>
  );
}
