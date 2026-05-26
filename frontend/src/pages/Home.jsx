import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Footer from '../components/Footer.jsx';

const modules = [
  ['Career Intelligence', 'Readiness score, proof gaps, timeline, and next actions from saved career data.'],
  ['Application Tracker', 'Kanban pipeline with follow-ups, recruiter CRM, resume diff, and status history.'],
  ['Voice Interview Room', '20-minute speaking interview with transcript, score, feedback, and final report.'],
  ['Resume Tailor', 'Generate role-specific summaries, messages, cover letters, and profile content.'],
  ['Job Match Analyzer', 'Compare your profile with job descriptions and find missing keywords.'],
  ['Skill Roadmap', 'Turn target roles into weekly learning plans and proof projects.'],
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
  ['Secure profile', 'JWT-protected account and private user-specific data.'],
  ['Saved history', 'MongoDB stores applications, interviews, content, roadmaps, and reports.'],
  ['Private AI key', 'AI API keys stay on the backend and are never exposed to the browser.'],
  ['Input-grounded AI', 'Outputs are tailored from profile, job description, and saved career evidence.'],
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
  ['Launch Mode', 'For students and freshers starting from zero applications.', ['Profile setup', 'Resume summary', 'First 20 applications']],
  ['Interview Mode', 'For candidates with calls coming up who need focused practice.', ['Voice interview', 'Weakness replay', 'Company prep']],
  ['Pipeline Mode', 'For active job seekers managing many companies and contacts.', ['Kanban tracker', 'Follow-up CRM', 'Success analytics']],
];

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center mb-10">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-accent mb-2">{eyebrow}</p>}
      <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">{title}</h2>
      {subtitle && <p className="text-muted max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

function MiniPreview() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-4">
        <div className="space-y-3">
          <div className="bg-navy-900 text-white rounded-lg p-4">
            <p className="text-xs text-white/60">Next action</p>
            <p className="font-bold mt-1">Tailor resume for Backend Developer</p>
          </div>
          {['Readiness 78%', 'Voice score 8/10', 'Follow-ups due 3'].map((item) => (
            <div key={item} className="bg-surface border border-border rounded-lg p-3 text-sm font-semibold text-ink">{item}</div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Career Intelligence', 'Application Tracker', 'Interview Replay', 'Resume Diff'].map((item) => (
            <div key={item} className="bg-surface border border-border rounded-lg p-4 min-h-28">
              <p className="text-sm font-bold text-ink">{item}</p>
              <div className="h-2 bg-white rounded-full overflow-hidden mt-4">
                <div className="h-full bg-accent rounded-full" style={{ width: item === 'Resume Diff' ? '62%' : '82%' }} />
              </div>
              <p className="text-xs text-muted mt-3">Dynamic from your saved data</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />

        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Product preview"
              title="A real career dashboard, not just a text generator"
              subtitle="CareerOS AI connects your profile, jobs, applications, interviews, and roadmap into one job-search operating system."
            />
            <MiniPreview />
          </div>
        </section>

        <section className="py-14 md:py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Modules"
              title="Everything your job search needs"
              subtitle="Each module supports a real candidate workflow from first profile setup to interview improvement."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map(([title, description]) => (
                <div key={title} className="card p-5 hover:shadow-card-hover transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold mb-4">{title.charAt(0)}</div>
                  <h3 className="font-bold text-ink mb-2">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Workflow"
              title="How CareerOS works"
              subtitle="A structured job-search loop that keeps improving with every saved profile, job, application, and interview."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflow.map(([step, title, description]) => (
                <div key={step} className="border border-border rounded-xl p-5 bg-white">
                  <span className="text-3xl font-extrabold text-accent/20">{step}</span>
                  <h3 className="font-bold text-ink mt-3 mb-2">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Career modes"
              title="Three focused ways to use CareerOS AI"
              subtitle="Choose a mode based on your current job-search stage."
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {careerModes.map(([title, description, bullets]) => (
                <div key={title} className="card p-6">
                  <h3 className="text-xl font-bold text-ink">{title}</h3>
                  <p className="text-sm text-muted mt-2 mb-5">{description}</p>
                  <div className="space-y-2">
                    {bullets.map((item) => (
                      <div key={item} className="bg-surface border border-border rounded-lg p-3 text-sm font-semibold text-ink">{item}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <SectionHeader
                  eyebrow="Trust"
                  title="Built like a secure career workspace"
                  subtitle="Your profile and application history are treated as private career data."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trust.map(([title, description]) => (
                    <div key={title} className="card p-5">
                      <h3 className="font-bold text-ink mb-2">{title}</h3>
                      <p className="text-sm text-muted">{description}</p>
                    </div>
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
                  {outcomes.map(([title, description]) => (
                    <div key={title} className="card p-4">
                      <h3 className="font-bold text-ink">{title}</h3>
                      <p className="text-sm text-muted mt-1">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader
              eyebrow="Use cases"
              title="Designed for candidates, students, and freshers"
              subtitle="Different job seekers need different proof. CareerOS adapts to where you are."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {useCases.map(([title, description]) => (
                <div key={title} className="card p-5">
                  <h3 className="font-bold text-ink mb-2">{title}</h3>
                  <p className="text-sm text-muted">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-2">Start now</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Turn your job search into a system</h2>
            <p className="text-white/70 mb-8 text-base sm:text-lg">
              Build your profile, track applications, practice interviews, and let CareerOS show the next best action.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
              <Link to="/dashboard" className="btn-primary px-8 py-3.5 text-base">Open Dashboard</Link>
              <Link to="/applications" className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition-colors border border-white/10">
                Track Applications
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
