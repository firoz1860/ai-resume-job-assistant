import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Footer from '../components/Footer.jsx';
import { Reveal, AnimatedCounter, Icon } from '../components/Reveal.jsx';

const modules = [
  ['Career Intelligence', 'Readiness score, proof gaps, timeline, and next actions from saved career data.', 'chart'],
  ['Application Tracker', 'Kanban pipeline with follow-ups, recruiter CRM, resume diff, and status history.', 'match'],
  ['Voice Interview Room', '20-minute speaking interview with transcript, score, feedback, and final report.', 'mic'],
  ['Resume Tailor', 'Generate role-specific summaries, messages, cover letters, and profile content.', 'doc'],
  ['Job Match Analyzer', 'Compare your profile with job descriptions and find missing keywords.', 'target'],
  ['Skill Roadmap', 'Turn target roles into weekly learning plans and proof projects.', 'route'],
];

const workflow = [
  ['01', 'Build profile', 'Save skills, projects, resume text, target role, links, and preferences.'],
  ['02', 'Analyze job', 'Paste a job description and get match score, gaps, and ATS keywords.'],
  ['03', 'Generate assets', 'Create cover letters, recruiter messages, summaries, and follow-ups.'],
  ['04', 'Track pipeline', 'Move roles through saved, applied, interview, rejected, and offer stages.'],
  ['05', 'Practice interview', 'Speak answers aloud and get scored feedback with replayable insights.'],
  ['06', 'Improve weekly', 'Use readiness, roadmap, and weak-area drills to close gaps.'],
];

const trust = [
  ['Secure profile', 'JWT-protected account and private user-specific data.', 'shield'],
  ['Saved history', 'MongoDB stores applications, interviews, content, roadmaps, and reports.', 'history'],
  ['Private AI key', 'AI API keys stay on the backend and are never exposed to the browser.', 'key'],
  ['Input-grounded AI', 'Outputs are tailored from profile, job description, and saved career evidence.', 'sparkle'],
];

const outcomes = [
  ['Better resume targeting', 'Turn generic bullets into role-specific proof.'],
  ['Stronger interview answers', 'Practice with feedback, scores, and better answer examples.'],
  ['Organized applications', 'Never lose job links, contacts, notes, follow-ups, or generated content.'],
  ['Clear skill gaps', 'Know what to learn and what project proves it.'],
  ['Follow-up discipline', 'Track due dates and generate professional messages.'],
];

const useCases = [
  ['Fresher', 'Build proof from projects, skills, and interview practice.'],
  ['Student', 'Prepare internships with resume content, GitHub proof, and mock interviews.'],
  ['Career switcher', 'Translate existing experience into target-role language.'],
  ['Internship seeker', 'Track many applications and follow-ups without losing context.'],
  ['Junior developer', 'Improve project explanations, system tradeoffs, and job match.'],
];

const careerModes = [
  ['Launch Mode', 'For students and freshers starting from zero applications.', ['Profile setup', 'Resume summary', 'First 20 applications'], 'rocket'],
  ['Interview Mode', 'For candidates with calls coming up who need focused practice.', ['Voice interview', 'Weakness replay', 'Company prep'], 'mic'],
  ['Pipeline Mode', 'For active job seekers managing many companies and contacts.', ['Kanban tracker', 'Follow-up CRM', 'Success analytics'], 'chart'],
];

const stats = [
  ['10', '+', 'Integrated career tools'],
  ['6', '', 'Guided workflow steps'],
  ['20', 'min', 'AI voice interview'],
  ['100', '%', 'Private, grounded AI'],
];

const testimonials = [
  ['CareerOS finally made my job search feel organized. I stopped losing track of applications and follow-ups.', 'Aisha K.', 'Frontend Developer'],
  ['The voice interview practice with scored feedback is the closest thing to a real mock I have used.', 'Daniel R.', 'CS Student'],
  ['Tailoring my resume to each job description used to take an hour. Now it takes minutes and reads better.', 'Priya S.', 'Career Switcher'],
];

const brands = ['ATS-ready', 'React', 'Node.js', 'MongoDB', 'Gemini AI', 'JWT Secure', 'Vercel', 'Render'];

function SectionHeader({ eyebrow, title, subtitle, light = false }) {
  return (
    <Reveal className="text-center mb-12 max-w-2xl mx-auto">
      {eyebrow && (
        <span className={`eyebrow-pill mb-3 ${light ? 'bg-white/10 text-white/80' : 'bg-accent/10 text-accent'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${light ? 'bg-cyan-400' : 'bg-accent'}`} />
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-3xl sm:text-4xl font-bold tracking-tight mb-3 ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>
      {subtitle && <p className={`${light ? 'text-white/60' : 'text-muted'} text-base sm:text-lg leading-relaxed`}>{subtitle}</p>}
    </Reveal>
  );
}

function MiniPreview() {
  return (
    <Reveal className="card p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-4">
        <div className="space-y-3">
          <div className="bg-navy-900 text-white rounded-xl p-4 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-gradient opacity-40 blur-2xl rounded-full" />
            <p className="text-xs text-white/60 relative">Next action</p>
            <p className="font-bold mt-1 relative">Tailor resume for Backend Developer</p>
          </div>
          {[['Readiness', '78%'], ['Voice score', '8/10'], ['Follow-ups due', '3']].map(([label, val]) => (
            <div key={label} className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between text-sm font-semibold text-ink">
              <span className="text-muted font-medium">{label}</span>
              <span>{val}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[['Career Intelligence', 82], ['Application Tracker', 74], ['Interview Replay', 90], ['Resume Diff', 62]].map(([item, pct]) => (
            <div key={item} className="bg-surface border border-border rounded-xl p-4 min-h-28">
              <p className="text-sm font-bold text-ink">{item}</p>
              <div className="h-2 bg-white rounded-full overflow-hidden mt-4">
                <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-muted mt-3">Dynamic from your saved data</p>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />

        {/* ── Trust marquee ─────────────────────────────── */}
        <div className="bg-white border-y border-border py-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted mb-4">Built on a modern, secure stack</p>
          <div className="marquee-mask overflow-hidden">
            <div className="marquee-track gap-4">
              {[...brands, ...brands].map((b, idx) => (
                <span key={`${b}-${idx}`} className="shrink-0 px-5 py-2 rounded-full border border-border bg-surface text-sm font-semibold text-muted">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats band ────────────────────────────────── */}
        <section className="bg-navy-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 aurora-layer opacity-70" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map(([num, suffix, label], i) => (
                <Reveal key={label} delay={i * 90} className="text-center">
                  <p className="font-display text-4xl sm:text-5xl font-bold text-gradient-light">
                    <AnimatedCounter value={num} suffix={suffix} />
                  </p>
                  <p className="text-white/60 text-sm mt-2">{label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Product preview ───────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Product preview"
              title="A real career dashboard, not just a text generator"
              subtitle="CareerOS AI connects your profile, jobs, applications, interviews, and roadmap into one job-search operating system."
            />
            <MiniPreview />
          </div>
        </section>

        {/* ── Modules ───────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Modules"
              title="Everything your job search needs"
              subtitle="Each module supports a real candidate workflow from first profile setup to interview improvement."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.map(([title, description, icon], i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="card-gradient p-6 h-full group">
                    <div className="w-12 h-12 rounded-xl bg-brand-gradient text-white flex items-center justify-center mb-4 shadow-glow transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                      <Icon name={icon} className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-ink mb-2">{title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Workflow ──────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Workflow"
              title="How CareerOS works"
              subtitle="A structured job-search loop that keeps improving with every saved profile, job, application, and interview."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflow.map(([step, title, description], i) => (
                <Reveal key={step} delay={i * 70}>
                  <div className="relative border border-border rounded-2xl p-6 bg-white hover:shadow-soft transition-shadow h-full overflow-hidden">
                    <span className="font-display text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-accent/30 to-violet-500/20">{step}</span>
                    <h3 className="font-bold text-ink mt-3 mb-2">{title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Career modes ──────────────────────────────── */}
        <section className="py-16 md:py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Career modes"
              title="Three focused ways to use CareerOS AI"
              subtitle="Choose a mode based on your current job-search stage."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {careerModes.map(([title, description, bullets, icon], i) => (
                <Reveal key={title} delay={i * 100}>
                  <div className="card-gradient p-7 h-full">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                      <Icon name={icon} className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-ink font-display">{title}</h3>
                    <p className="text-sm text-muted mt-2 mb-5">{description}</p>
                    <div className="space-y-2">
                      {bullets.map((item) => (
                        <div key={item} className="flex items-center gap-2.5 bg-surface border border-border rounded-lg p-3 text-sm font-semibold text-ink">
                          <span className="w-5 h-5 rounded-full bg-accent/10 text-accent grid place-items-center shrink-0">
                            <Icon name="check" className="w-3 h-3" />
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Loved by job seekers"
              title="Momentum you can feel"
              subtitle="Candidates use CareerOS to stay organized, prepared, and consistently improving."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map(([quote, name, role], i) => (
                <Reveal key={name} delay={i * 90}>
                  <figure className="card p-6 h-full flex flex-col">
                    <div className="flex gap-0.5 text-amber-400 mb-3" aria-hidden="true">
                      {'★★★★★'.split('').map((s, idx) => <span key={idx}>{s}</span>)}
                    </div>
                    <blockquote className="text-ink text-sm leading-relaxed flex-1">“{quote}”</blockquote>
                    <figcaption className="mt-4 flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-brand-gradient text-white grid place-items-center font-bold">{name.charAt(0)}</span>
                      <span>
                        <span className="block text-sm font-semibold text-ink">{name}</span>
                        <span className="block text-xs text-muted">{role}</span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust + Outcomes ──────────────────────────── */}
        <section className="py-16 md:py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <SectionHeader
                  eyebrow="Trust"
                  title="Built like a secure career workspace"
                  subtitle="Your profile and application history are treated as private career data."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trust.map(([title, description, icon], i) => (
                    <Reveal key={title} delay={i * 70}>
                      <div className="card p-5 h-full">
                        <span className="w-10 h-10 rounded-lg bg-accent/10 text-accent grid place-items-center mb-3">
                          <Icon name={icon} className="w-5 h-5" />
                        </span>
                        <h3 className="font-bold text-ink mb-2">{title}</h3>
                        <p className="text-sm text-muted">{description}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
              <div>
                <SectionHeader
                  eyebrow="Outcomes"
                  title="What job seekers improve"
                  subtitle="The interface is designed around visible progress, proof, and follow-through."
                />
                <div className="space-y-3">
                  {outcomes.map(([title, description], i) => (
                    <Reveal key={title} delay={i * 60}>
                      <div className="card p-4 flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center shrink-0 mt-0.5">
                          <Icon name="check" className="w-4 h-4" />
                        </span>
                        <div>
                          <h3 className="font-bold text-ink">{title}</h3>
                          <p className="text-sm text-muted mt-1">{description}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Use cases ─────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Use cases"
              title="Designed for candidates, students, and freshers"
              subtitle="Different job seekers need different proof. CareerOS adapts to where you are."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {useCases.map(([title, description], i) => (
                <Reveal key={title} delay={i * 70}>
                  <div className="card p-5 h-full hover:shadow-soft transition-shadow">
                    <span className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-600 grid place-items-center mb-3">
                      <Icon name="users" className="w-5 h-5" />
                    </span>
                    <h3 className="font-bold text-ink mb-2">{title}</h3>
                    <p className="text-sm text-muted">{description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-navy-900 text-white">
          <div className="absolute inset-0 aurora-layer animate-aurora-shift" />
          <div className="absolute inset-0 bg-dots opacity-40" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
            <Reveal>
              <span className="eyebrow-pill bg-white/10 text-white/80 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Start now
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
                Turn your job search into a system
              </h2>
              <p className="text-white/70 mb-9 text-lg max-w-2xl mx-auto">
                Build your profile, track applications, practice interviews, and let CareerOS show the next best action.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                <Link to="/dashboard" className="btn-gradient text-base flex-1">
                  Open Dashboard
                  <Icon name="rocket" className="w-4 h-4" />
                </Link>
                <Link to="/applications" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl glass text-white font-semibold text-base hover:bg-white/15 transition-colors flex-1">
                  Track Applications
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
