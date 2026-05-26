import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { label: 'Open Dashboard', href: '/dashboard', group: 'Navigation', keywords: 'home overview stats' },
  { label: 'Career Intelligence', href: '/career-intelligence', group: 'Navigation', keywords: 'insights ai vault report' },
  { label: 'Generate Content', href: '/generator', group: 'Create', keywords: 'resume cover letter linkedin email' },
  { label: 'Add Application', href: '/applications', group: 'Track', keywords: 'job tracker kanban follow up' },
  { label: 'Start Voice Interview', href: '/voice-interview', group: 'Practice', keywords: 'speaking mock interview microphone' },
  { label: 'Text Interview Room', href: '/interview-room', group: 'Practice', keywords: 'mock questions answer feedback' },
  { label: 'Analyze Job Description', href: '/job-analyzer', group: 'Analyze', keywords: 'ats match keywords missing skills' },
  { label: 'Career DNA Scanner', href: '/career-dna', group: 'Analyze', keywords: 'profile score gaps strengths' },
  { label: 'Skill Roadmap', href: '/roadmap', group: 'Plan', keywords: 'learning tasks weekly plan' },
  { label: 'Content Library', href: '/content-library', group: 'Library', keywords: 'saved generated copy' },
  { label: 'Profile', href: '/profile', group: 'Account', keywords: 'skills resume target role' },
];

export default function CommandPalette({ open, onOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpen();
      }
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onOpen]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return actions;
    return actions.filter((action) => [action.label, action.group, action.keywords].join(' ').toLowerCase().includes(text));
  }, [query]);

  if (!open) return null;

  const go = (href) => {
    navigate(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-navy-900/45 backdrop-blur-sm p-3 sm:p-4 flex items-start justify-center pt-16 sm:pt-20" onMouseDown={onClose}>
      <div className="w-full max-w-2xl max-h-[calc(100vh-5rem)] bg-white rounded-xl border border-border shadow-card-hover overflow-hidden flex flex-col" onMouseDown={(event) => event.stopPropagation()}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold">K</div>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search actions, pages, and tools..."
              className="w-full outline-none text-sm text-ink placeholder:text-muted"
            />
            <kbd className="hidden sm:inline-flex text-[11px] font-semibold text-muted bg-surface border border-border rounded-md px-2 py-1">Esc</kbd>
          </div>
        </div>
        <div className="overflow-auto p-2">
          {filtered.length ? filtered.map((action) => (
            <button
              key={action.href}
              onClick={() => go(action.href)}
              className="w-full text-left flex items-center justify-between gap-3 rounded-lg px-3 py-3 hover:bg-surface transition-colors"
            >
              <span>
                <span className="block text-sm font-semibold text-ink">{action.label}</span>
                <span className="block text-xs text-muted">{action.group}</span>
              </span>
              <span className="text-xs text-muted">Open</span>
            </button>
          )) : (
            <div className="p-8 text-center text-sm text-muted">No matching action found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
