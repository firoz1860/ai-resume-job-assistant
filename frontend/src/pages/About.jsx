import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-10">
            <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full mb-4">
              About This Project
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4 leading-tight">
              Why I Built ResumeAI
            </h1>
            <p className="text-muted text-lg leading-relaxed">
              The real story behind this tool — the problem, the build, and what comes next.
            </p>
          </div>

          <div className="prose prose-slate max-w-none space-y-10">
            {/* Problem */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white text-sm font-bold shrink-0">1</div>
                <h2 className="text-xl font-bold text-ink m-0">The Problem I Experienced</h2>
              </div>
              <div className="pl-11 space-y-3 text-muted leading-relaxed">
                <p>
                  When I was applying for my first internships and entry-level roles, I spent hours writing and rewriting the same content — a cover letter for this company, a cold email for that recruiter, a "tell me about yourself" answer the night before every interview.
                </p>
                <p>
                  The advice online was generic: "Be professional. Highlight your strengths. Customize for each role." But nobody showed me <em>what that looks like</em> when you have no work experience and a resume that looks like everyone else's.
                </p>
                <p>
                  I knew my projects were good. I knew my skills were relevant. I just couldn't articulate them in a way that matched what employers expected.
                </p>
              </div>
            </section>

            {/* Solution */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white text-sm font-bold shrink-0">2</div>
                <h2 className="text-xl font-bold text-ink m-0">The Smallest Useful Version</h2>
              </div>
              <div className="pl-11 space-y-3 text-muted leading-relaxed">
                <p>
                  I built the smallest version of this idea that would actually be useful: a form where you enter your real details, choose what you need, and get tailored, human-sounding output.
                </p>
                <p>
                  The AI prompt is designed to avoid the things that make AI-generated content feel fake — no buzzwords like "hardworking" or "team player", no robotic openers like "I am writing to apply for...", and no generic career advice.
                </p>
                <p>
                  Instead, the output is structured around your specific background: your actual projects, your real skills, the actual role you're applying for. The tone options let you match the output to your personality.
                </p>
              </div>
            </section>

            {/* Tech choices */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white text-sm font-bold shrink-0">3</div>
                <h2 className="text-xl font-bold text-ink m-0">Technical Decisions</h2>
              </div>
              <div className="pl-11 space-y-3 text-muted leading-relaxed">
                <p>
                  I kept the AI call entirely on the backend so the API key is never exposed to the browser. The frontend only calls <code className="bg-surface px-1.5 py-0.5 rounded text-ink text-xs">/api/generate</code> on our Express server.
                </p>
                <p>
                  The prompt builder constructs context-rich instructions for Gemini based on every field the user fills in — not just a generic "write a resume" command. More input = better output.
                </p>
                <p>
                  I chose React + Vite for speed and simplicity on the frontend, and Node.js + Express for the backend because they're the right tool for a lightweight API that calls an external AI service.
                </p>
              </div>
            </section>

            {/* Future */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white text-sm font-bold shrink-0">4</div>
                <h2 className="text-xl font-bold text-ink m-0">What I'd Build With 4 More Weeks</h2>
              </div>
              <ul className="pl-11 space-y-2 text-muted">
                {[
                  'Save & manage generated content with a user account',
                  'PDF export directly from the result card',
                  'Resume builder that assembles a full PDF from sections',
                  'Interview question generator based on the job description',
                  'History of past generations with version comparison',
                  'Batch generation: generate all 6 content types at once',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
