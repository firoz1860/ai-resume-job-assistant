import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Footer from '../components/Footer.jsx';
import { Reveal, Icon } from '../components/Reveal.jsx';
import LogoMorph from '../components/marketing/LogoMorph.jsx';
import ScrollStack from '../components/marketing/ScrollStack.jsx';

/* ── Section heading ──────────────────────────────────────── */
function SectionHead({ eyebrow, title, subtitle }) {
  return (
    <Reveal className="max-w-2xl">
      <p className="eyebrow-pill mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-forest" />
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg leading-relaxed text-sage-600">{subtitle}</p>}
    </Reveal>
  );
}

/* ── Small interface illustrations for the stacking cards ───── */
function VaultVisual() {
  return (
    <div className="w-full max-w-xs space-y-2.5">
      {['Profile', 'Projects', 'Resume text', 'Skills & links'].map((r, i) => (
        <div key={r} className="flex items-center justify-between rounded-card border border-border bg-white px-3.5 py-2.5 text-sm">
          <span className="font-medium text-ink">{r}</span>
          <span className={`badge ${i < 3 ? 'bg-lime text-forest-800' : 'bg-ivory text-sage-600'}`}>{i < 3 ? 'Saved' : 'Add'}</span>
        </div>
      ))}
    </div>
  );
}
function RoleVisual() {
  return (
    <div className="w-full max-w-xs rounded-card border border-border bg-white p-4">
      <p className="text-sm font-semibold text-ink">Backend Engineer</p>
      <div className="mt-3 space-y-2 text-xs">
        {[['Node.js', true], ['PostgreSQL', true], ['Kafka', false], ['Docker', true]].map(([skill, have]) => (
          <div key={skill} className="flex items-center gap-2">
            <span className={`grid h-4 w-4 place-items-center rounded-full ${have ? 'bg-lime text-forest-800' : 'border border-border text-sage-600'}`}>
              {have ? '✓' : '+'}
            </span>
            <span className={have ? 'text-ink' : 'text-sage-600'}>{skill}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 border-t border-border pt-2 text-xs text-sage-600">1 skill missing evidence</p>
    </div>
  );
}
function PipelineVisual() {
  const cols = [['Saved', 2], ['Applied', 4], ['Interview', 2], ['Offer', 1]];
  return (
    <div className="grid w-full max-w-sm grid-cols-4 gap-2">
      {cols.map(([label, n]) => (
        <div key={label} className="rounded-card border border-border bg-white p-2">
          <p className="text-[11px] font-semibold text-sage-600">{label}</p>
          <div className="mt-2 space-y-1.5">
            {Array.from({ length: n }).map((_, i) => (
              <div key={i} className="h-5 rounded bg-ivory" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function PracticeVisual() {
  return (
    <div className="w-full max-w-xs rounded-card border border-border bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-white"><Icon name="mic" className="h-4 w-4" /></span>
        <span className="text-sm font-semibold text-ink">Interview feedback</span>
      </div>
      <p className="mt-3 text-sm text-ink">“Strong structure. Add one concrete metric to your impact answer.”</p>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-ivory px-3 py-2 text-xs">
        <span className="text-sage-600">Last score</span>
        <span className="font-semibold text-ink">7 / 10</span>
      </div>
    </div>
  );
}

const STACK_ITEMS = [
  {
    step: 'Step 01',
    title: 'Build your career foundation',
    body: 'Keep your profile, projects, and resume information in one place so everything you write later is grounded in real evidence.',
    capabilities: ['Profile, skills, and project records', 'Paste or upload resume text', 'Searchable Career Vault'],
    cta: { label: 'Set up your profile', to: '/profile' },
    visual: <VaultVisual />,
  },
  {
    step: 'Step 02',
    title: 'Prepare for the role',
    body: 'Paste a job description to see which of your skills match, where the evidence is thin, and what to tailor before you apply.',
    capabilities: ['Requirement breakdown', 'Matching evidence from your profile', 'Resume tailoring suggestions'],
    cta: { label: 'Analyze a role', to: '/job-analyzer' },
    visual: <RoleVisual />,
  },
  {
    step: 'Step 03',
    title: 'Keep every application moving',
    body: 'Track each role through clear stages, store recruiter details, and never miss a follow-up date again.',
    capabilities: ['Saved → Applied → Interview → Offer', 'Recruiter contacts and notes', 'Follow-up reminders'],
    cta: { label: 'Open applications', to: '/applications' },
    visual: <PipelineVisual />,
  },
  {
    step: 'Step 04',
    title: 'Practice, reflect, improve',
    body: 'Rehearse with text or voice interviews, review the transcript and feedback, and turn weak spots into a learning plan.',
    capabilities: ['Text and voice interview practice', 'Transcript and scored feedback', 'Skill roadmap from your gaps'],
    cta: { label: 'Practice an interview', to: '/voice-interview' },
    visual: <PracticeVisual />,
  },
];

const WORKFLOW = [
  ['Build profile', 'Save skills, projects, resume text, and target roles.', 'Everything downstream reads from here.'],
  ['Analyze role', 'Paste a job description to see matches and gaps.', 'Pulls evidence straight from your profile.'],
  ['Prepare materials', 'Draft tailored summaries, messages, and cover letters.', 'Grounded in the role and your saved data.'],
  ['Track application', 'Move the role through your pipeline with notes.', 'Carries the materials you prepared.'],
  ['Practice and improve', 'Rehearse interviews and close skill gaps.', 'Feeds a roadmap you can act on weekly.'],
];

const MODES = [
  {
    title: 'Starting your search',
    body: 'Turn scattered notes into a profile, then tailor your first applications with confidence.',
    points: ['Set up profile and resume', 'Analyze your first roles', 'Track early applications'],
    icon: 'rocket',
  },
  {
    title: 'Preparing for interviews',
    body: 'Rehearse with text or voice practice and review feedback before the real conversation.',
    points: ['Voice and text practice', 'Transcript and feedback', 'Focus on weak areas'],
    icon: 'mic',
  },
  {
    title: 'Managing an active pipeline',
    body: 'Keep many roles organized with stages, recruiter contacts, and timely follow-ups.',
    points: ['Pipeline stages', 'Recruiter CRM', 'Follow-up reminders'],
    icon: 'chart',
  },
];

const FAQ = [
  ['What information should I add?', 'Start with your profile: skills, projects, experience, target roles, and resume text. The more you save, the more grounded your analyses and drafts become.'],
  ['Can I tailor materials for different jobs?', 'Yes. Paste a job description and generate role-specific summaries, messages, and cover letters that draw on your saved profile and the role’s requirements.'],
  ['How does interview practice work?', 'You can practice with a text interview or a spoken voice interview. You answer questions, see a transcript, and get scored feedback you can review afterwards.'],
  ['Can I review previous content?', 'Yes. Generated content, applications, interview sessions, and reports are saved to your account so you can revisit and reuse them.'],
  ['What happens when an AI request fails?', 'You see a clear error and your input is kept so you can try again. A failed request is never shown as a result, and sample numbers are never presented as your account data.'],
  ['What resume formats are supported?', 'You can paste resume text directly, or upload a resume file to be parsed into your profile. If a file can’t be read, paste the text instead.'],
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <LogoMorph />
      <main className="flex-1">
        <Hero />

        {/* ── C. Product walkthrough ─────────────────────── */}
        <section id="product" className="scroll-mt-24 bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHead
              eyebrow="Product walkthrough"
              title="A workspace that shows you what to do next"
              subtitle="This is an illustrative view of CareerOS AI. Your own dashboard is built from the profile, roles, and practice you save."
            />
            <Reveal className="mt-10">
              <div className="panel overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border bg-ivory px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-border" />
                  <span className="h-2.5 w-2.5 rounded-full bg-border" />
                  <span className="h-2.5 w-2.5 rounded-full bg-border" />
                  <span className="ml-2 text-xs font-medium text-sage-600">Example workspace — sample data</span>
                </div>
                <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-3">
                  <div className="rounded-card border border-border bg-forest p-5 text-white lg:col-span-1">
                    <p className="text-xs text-white/70">Do this next</p>
                    <p className="mt-1 font-semibold">Send a follow-up to Northwind, then practice one system-design answer.</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2"><span>Follow-ups due</span><span className="font-semibold">2</span></div>
                      <div className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2"><span>Applications</span><span className="font-semibold">12</span></div>
                    </div>
                  </div>
                  <div className="rounded-card border border-border p-5">
                    <p className="text-sm font-semibold text-ink">Application pipeline</p>
                    <div className="mt-4"><PipelineVisual /></div>
                  </div>
                  <div className="space-y-5">
                    <div className="rounded-card border border-border p-5">
                      <p className="text-sm font-semibold text-ink">Resume feedback</p>
                      <p className="mt-2 text-sm text-sage-600">8 of 11 target skills have evidence. 3 to add for Backend Engineer.</p>
                    </div>
                    <div className="rounded-card border border-border p-5">
                      <p className="text-sm font-semibold text-ink">Interview feedback</p>
                      <p className="mt-2 text-sm text-sage-600">Last score 7/10 — add a concrete metric to your impact answer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── D. Signature scroll-stacking cards ─────────── */}
        <section className="bg-ivory py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHead
              eyebrow="How the pieces connect"
              title="Four steps, one connected workspace"
              subtitle="Each stage builds on the last, so your profile, applications, and practice stay in sync."
            />
            <div className="mt-10">
              <ScrollStack items={STACK_ITEMS} />
            </div>
          </div>
        </section>

        {/* ── E. Simple workflow ─────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-24 bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHead
              eyebrow="How it works"
              title="A loop that keeps improving"
              subtitle="Information carries from one step to the next, so you’re never starting from a blank page."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {WORKFLOW.map(([title, body, carry], i) => (
                <Reveal key={title} delay={i * 60}>
                  <div className="flex h-full flex-col rounded-card border border-border bg-white p-5">
                    <span className="font-display text-sm font-semibold text-forest-500">Step {i + 1}</span>
                    <h3 className="mt-2 font-semibold text-ink">{title}</h3>
                    <p className="mt-2 text-sm text-sage-600">{body}</p>
                    <p className="mt-auto pt-3 text-xs text-forest-600">{carry}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── F. Audience modes ──────────────────────────── */}
        <section className="bg-ivory py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHead
              eyebrow="Ways to use it"
              title="Wherever you are in the search"
              subtitle="The same workspace adapts to what you need right now."
            />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {MODES.map((mode, i) => (
                <Reveal key={mode.title} delay={i * 80}>
                  <div className="card-gradient h-full p-7">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime text-forest-800">
                      <Icon name={mode.icon} className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-xl font-bold text-ink">{mode.title}</h3>
                    <p className="mt-2 text-sm text-sage-600">{mode.body}</p>
                    <ul className="mt-5 space-y-2">
                      {mode.points.map((p) => (
                        <li key={p} className="flex items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-forest-50 text-forest-700"><Icon name="check" className="h-3 w-3" /></span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── G. Trust + FAQ ─────────────────────────────── */}
        <section id="faq" className="scroll-mt-24 bg-white py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHead
                eyebrow="Trust"
                title="Treated as private career data"
                subtitle="A few plain-language protections, no vague promises."
              />
              <div className="mt-8 space-y-3">
                {[
                  ['Your account, your data', 'Your profile, applications, and history live in your signed-in account.'],
                  ['Keys stay on the server', 'AI API keys are used by the backend and are never exposed to the browser.'],
                  ['Grounded in what you save', 'Analyses and drafts are built from your profile and the job description you provide.'],
                ].map(([t, d]) => (
                  <div key={t} className="flex items-start gap-3 rounded-card border border-border p-4">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-forest-50 text-forest-700"><Icon name="shield" className="h-4 w-4" /></span>
                    <div>
                      <h3 className="font-semibold text-ink">{t}</h3>
                      <p className="mt-1 text-sm text-sage-600">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionHead eyebrow="FAQ" title="Questions, answered plainly" />
              <div className="mt-8 divide-y divide-border rounded-card border border-border bg-white">
                {FAQ.map(([q, a]) => (
                  <details key={q} className="group px-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold text-ink marker:hidden">
                      {q}
                      <span className="ml-3 text-sage-600 transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="pb-4 text-sm leading-relaxed text-sage-600">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── H. Closing CTA ─────────────────────────────── */}
        <section className="bg-ivory pb-20 pt-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="relative overflow-hidden rounded-panel bg-forest px-6 py-14 text-center sm:px-10">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime/30 blur-2xl" aria-hidden="true" />
              <h2 className="relative font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Bring your job search into one place
              </h2>
              <p className="relative mx-auto mt-3 max-w-xl text-white/75">
                Create your workspace, add your profile, and let CareerOS show you the next move.
              </p>
              <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/signup" className="btn-lime text-base">Create your workspace</Link>
                <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-white/25 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-white/10">
                  Sign in
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
