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

const socials = [
  { label: 'GitHub', href: 'https://github.com/firoz1860/ai-resume-job-assistant', path: 'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z' },
  { label: 'LinkedIn', href: '#', path: 'M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21h-4z' },
  { label: 'Email', href: 'mailto:hello@careeros.ai', path: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 3.2V18h18V8.2l-9 5.6z' },
];

function BrandMark({ className = 'w-9 h-9' }) {
  return (
    <div className={`${className} bg-white/10 rounded-lg flex items-center justify-center shrink-0`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
        <path d="M5 7h10M5 11h10M5 15h6" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="10" r="3" fill="#6D5CF0" />
        <path d="M18 8.5v3M16.5 10h3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative bg-navy-900 text-white mt-auto overflow-hidden">
      <div className="h-1 w-full bg-brand-gradient" />
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <BrandMark />
              <span className="font-display font-bold text-lg">CareerOS<span className="text-gradient-light">AI</span></span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-5">
              Your AI career operating system. Tailor resumes, track applications, practice interviews, and improve job readiness from one workspace.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noreferrer' : undefined}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 grid place-items-center transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/80"><path d={path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/80 uppercase tracking-wide">Navigation</h4>
            <ul className="space-y-2.5">
              {navLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-cyan-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/80 uppercase tracking-wide">Tools</h4>
            <ul className="space-y-2.5">
              {toolLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-cyan-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Built with */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/80 uppercase tracking-wide">Built With</h4>
            <ul className="space-y-2.5">
              {['React + Vite', 'Tailwind CSS', 'Node.js + Express', 'MongoDB', 'Gemini API', 'JWT Auth'].map((tech) => (
                <li key={tech} className="text-white/60 text-sm">{tech}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/40 text-xs">
          <span>© {new Date().getFullYear()} CareerOS AI — Built for serious job seekers.</span>
          <span className="text-white/50">Profile → Generate → Apply → Practice → Improve.</span>
        </div>
      </div>
    </footer>
  );
}
