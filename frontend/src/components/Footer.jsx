import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M5 7h10M5 11h10M5 15h6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="18" cy="10" r="3" fill="#2563EB"/>
                  <path d="M18 8.5v3M16.5 10h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-bold text-lg">Resume<span className="text-accent">AI</span></span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              AI-powered job application content for students, freshers, and job seekers.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-white/80">Pages</h4>
            <ul className="space-y-2">
              {[['Home', '/'], ['Generator', '/generator'], ['About', '/about']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-white/60 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stack */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-white/80">Built With</h4>
            <ul className="space-y-1.5">
              {['React + Vite', 'Tailwind CSS', 'Node.js + Express', 'Gemini API'].map((tech) => (
                <li key={tech} className="text-white/60 text-sm">{tech}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-white/40 text-xs">
          <span>© {new Date().getFullYear()} ResumeAI. Built for job seekers.</span>
          <span>Made with purpose, not just code.</span>
        </div>
      </div>
    </footer>
  );
}
