import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { Icon } from '../components/Reveal.jsx';

const sections = [
  {
    step: 1,
    title: 'The Problem I Experienced',
    body: [
      'When I was applying for my first internships and entry-level roles, I spent hours writing and rewriting the same content — a cover letter for this company, a cold email for that recruiter, a "tell me about yourself" answer the night before every interview.',
      'The advice online was generic: "Be professional. Highlight your strengths. Customize for each role." But nobody showed me what that looks like when you have no work experience and a resume that looks like everyone else\'s.',
      'I knew my projects were good. I knew my skills were relevant. I just couldn\'t articulate them in a way that matched what employers expected.',
    ],
  },
  {
    step: 2,
    title: 'The Smallest Useful Version',
    body: [
      'I built the smallest version of this idea that would actually be useful: a form where you enter your real details, choose what you need, and get tailored, human-sounding output.',
      'The AI prompt is designed to avoid the things that make AI-generated content feel fake — no buzzwords like "hardworking" or "team player", no robotic openers like "I am writing to apply for...", and no generic career advice.',
      'Instead, the output is structured around your specific background: your actual projects, your real skills, the actual role you\'re applying for. The tone options let you match the output to your personality.',
    ],
  },
];

const stack = ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'Gemini API'];

const roadmap = [
  'Save & manage generated content with a user account',
  'PDF export directly from the result card',
  'Resume builder that assembles a full PDF from sections',
  'Interview question generator based on the job description',
  'History of past generations with version comparison',
  'Batch generation: generate all 6 content types at once',
];

function StepHeading({ step, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center text-sm font-bold shrink-0">{step}</div>
      <h2 className="text-xl font-bold text-ink m-0">{title}</h2>
    </div>
  );
}

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-10">
            <span className="eyebrow-pill mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
              About This Project
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4 leading-tight">
              Why I Built ResumeAI
            </h1>
            <p className="text-sage-600 text-lg leading-relaxed">
              The real story behind this tool — the problem, the build, and what comes next.
            </p>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.step}>
                <StepHeading step={section.step} title={section.title} />
                <div className="pl-11 space-y-3 text-sage-600 leading-relaxed">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            {/* Tech choices */}
            <section>
              <StepHeading step={3} title="Technical Decisions" />
              <div className="pl-11 space-y-3 text-sage-600 leading-relaxed">
                <p>
                  I kept the AI call entirely on the backend so the API key is never exposed to the browser. The frontend only calls <code className="bg-surface border border-border px-1.5 py-0.5 rounded text-ink text-xs">/api/generate</code> on our Express server.
                </p>
                <p>
                  The prompt builder constructs context-rich instructions for Gemini based on every field the user fills in — not just a generic "write a resume" command. More input = better output.
                </p>
                <p>
                  I chose React + Vite for speed and simplicity on the frontend, and Node.js + Express for the backend because they're the right tool for a lightweight API that calls an external AI service.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {stack.map((tech) => (
                    <span key={tech} className="badge bg-forest-50 text-forest-700 border border-forest-100">{tech}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* Future */}
            <section>
              <StepHeading step={4} title="What I'd Build With 4 More Weeks" />
              <ul className="pl-11 space-y-2 text-sage-600">
                {roadmap.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Icon name="check" className="w-4 h-4 text-forest-700 shrink-0 mt-1" />
                    <span>{item}</span>
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
