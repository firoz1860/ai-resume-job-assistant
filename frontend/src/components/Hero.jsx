import { Link } from 'react-router-dom';
import heroIllustration from '../assets/hero-illustration.svg';

export default function Hero() {
  return (
    <section className="bg-navy-900 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
            Powered by Gemini AI
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-5">
            Land Your Dream Job With{' '}
            <span className="text-accent">AI-Crafted</span> Application Content
          </h1>

          <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
            Generate tailored resume summaries, cover letters, cold emails, LinkedIn messages, and interview answers — in seconds. Built for students, freshers, and job seekers.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/generator" className="btn-primary px-6 py-3 text-base justify-center">
              Generate Content Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 justify-center px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition-colors border border-white/10">
              Why We Built This
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-10 text-white/60 text-sm">
            {[['6', 'Content Types'], ['5', 'Tone Options'], ['100%', 'Free to Use']].map(([num, label]) => (
              <div key={label} className="flex flex-col">
                <span className="text-white text-xl font-bold">{num}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div className="hidden md:flex justify-center items-center animate-fade-in">
          <img src={heroIllustration} alt="Resume AI illustration" className="w-full max-w-md opacity-90" />
        </div>
      </div>
    </section>
  );
}
