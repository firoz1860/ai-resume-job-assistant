import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Generator', to: '/generator' },
  { label: 'Applications', to: '/applications' },
  { label: 'Voice Interview', to: '/voice-interview' },
  { label: 'Career Vault', to: '/career-vault' },
  { label: 'Resume Builder', to: '/resume-builder' },
  { label: 'About', to: '/about' },
];

const toolLinks = [
  { label: 'Career DNA', to: '/career-dna' },
  { label: 'Job Analyzer', to: '/job-analyzer' },
  { label: 'Intelligence', to: '/career-intelligence' },
  { label: 'Interview Room', to: '/interview-room' },
  { label: 'Roadmap', to: '/roadmap' },
  { label: 'Profile', to: '/profile' },
];

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M5 7h10M5 11h10M5 15h6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="18" cy="10" r="3" fill="#2563EB"/>
                  <path d="M18 8.5v3M16.5 10h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-lg">CareerOS<span className="text-accent">AI</span></span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Your AI career operating system. Tailor resumes, track applications, practice interviews, and improve job readiness from one workspace.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/80 uppercase tracking-wide">Navigation</h4>
            <ul className="space-y-2">
              {navLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-white/60 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/80 uppercase tracking-wide">Tools</h4>
            <ul className="space-y-2">
              {toolLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-white/60 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Built with */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/80 uppercase tracking-wide">Built With</h4>
            <ul className="space-y-2">
              {['React + Vite', 'Tailwind CSS', 'Node.js + Express', 'MongoDB', 'Gemini API', 'JWT Auth'].map((tech) => (
                <li key={tech} className="text-white/60 text-sm">{tech}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/40 text-xs">
          <span>© {new Date().getFullYear()} CareerOS AI — Built for serious job seekers.</span>
          <span>Profile → Generate → Apply → Practice → Improve.</span>
        </div>
      </div>
    </footer>
  );
}
