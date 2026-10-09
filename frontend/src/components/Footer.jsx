import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Wordmark from './marketing/Wordmark.jsx';

// Workspace routes get no marketing footer (focused screens).
const APP_PREFIXES = [
  '/dashboard', '/career-intelligence', '/career-vault', '/career-dna',
  '/job-analyzer', '/generator', '/content-library', '/resume-builder',
  '/matcher', '/interview-room', '/interview-history', '/voice-interview',
  '/voice-interview-history', '/roadmap', '/applications', '/profile', '/admin',
];

const GITHUB_URL = 'https://github.com/firoz1860/ai-resume-job-assistant';

export default function Footer() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  const onAppRoute = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isAuthenticated && onAppRoute) return null;

  const anchor = (id) => (pathname === '/' ? `#${id}` : `/#${id}`);

  return (
    <footer className="mt-auto border-t border-border bg-ivory">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="CareerOS AI home">
              <Wordmark size="nav" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-sage-600">
              One workspace that connects your resume, job research, applications, and interview
              practice—so you always know the next move.
            </p>
          </div>

          <nav aria-label="Product">
            <h4 className="text-sm font-semibold text-ink">Product</h4>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li><a href={anchor('how-it-works')} className="text-sage-600 transition-colors hover:text-ink">How it works</a></li>
              <li><a href={anchor('product')} className="text-sage-600 transition-colors hover:text-ink">Product walkthrough</a></li>
              <li><a href={anchor('faq')} className="text-sage-600 transition-colors hover:text-ink">FAQ</a></li>
              <li><Link to="/matcher" className="text-sage-600 transition-colors hover:text-ink">Job match analyzer</Link></li>
            </ul>
          </nav>

          <nav aria-label="Get started">
            <h4 className="text-sm font-semibold text-ink">Get started</h4>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li><Link to="/signup" className="text-sage-600 transition-colors hover:text-ink">Create your workspace</Link></li>
              <li><Link to="/login" className="text-sage-600 transition-colors hover:text-ink">Sign in</Link></li>
              <li><Link to="/dashboard" className="text-sage-600 transition-colors hover:text-ink">Open dashboard</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <h4 className="text-sm font-semibold text-ink">Company</h4>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li><Link to="/about" className="text-sage-600 transition-colors hover:text-ink">About</Link></li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sage-600 transition-colors hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
                  </svg>
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-sage-600 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} CareerOS AI</span>
          <span>Build profile → Analyze role → Prepare materials → Track → Practice.</span>
        </div>
      </div>
    </footer>
  );
}
