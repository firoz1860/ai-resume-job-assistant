import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Generator', to: '/generator' },
    { label: 'Matcher', to: '/matcher' },
    { label: 'About', to: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M5 7h10M5 11h10M5 15h6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="10" r="3" fill="#2563EB" opacity="0.85"/>
              <path d="M18 8.5v3M16.5 10h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-navy-900 text-lg">
            Resume<span className="text-accent">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                pathname === l.to
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/generator" className="ml-3 btn-primary text-sm px-4 py-2">
            Try Free
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
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
        <div className="md:hidden border-t border-border bg-white animate-fade-in">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
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
            <Link
              to="/generator"
              onClick={() => setOpen(false)}
              className="btn-primary text-sm mt-1 justify-center"
            >
              Try Free
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
