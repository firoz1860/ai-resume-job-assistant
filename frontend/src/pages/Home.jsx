import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import FeatureCard from '../components/FeatureCard.jsx';
import Footer from '../components/Footer.jsx';
import { FEATURES, HOW_IT_WORKS } from '../utils/constants.js';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />

        {/* Features */}
        <section className="py-16 md:py-24 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">
                Everything You Need to Apply With Confidence
              </h2>
              <p className="text-muted max-w-xl mx-auto">
                Six types of job application content, crafted by AI, tailored to your profile and the role.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">How It Works</h2>
              <p className="text-muted max-w-lg mx-auto">
                From your details to polished content in under 30 seconds.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} className="relative">
                  <div className="flex flex-col">
                    <span className="text-3xl font-extrabold text-accent/20 mb-3">{step.step}</span>
                    <h3 className="font-semibold text-ink mb-2">{step.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 bg-navy-900 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Start Generating in Seconds
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              No sign-up. No credit card. Just fill in your details and get professional content instantly.
            </p>
            <Link to="/generator" className="btn-primary px-8 py-3.5 text-base">
              Open Generator
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
