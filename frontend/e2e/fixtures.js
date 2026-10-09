// ──────────────────────────────────────────────────────────────────────────
// FIXTURES — synthetic data + helpers for the CareerOS QA suite.
//
// IMPORTANT: every value here is fake. Installing a session and mocking these
// endpoints lets us render authenticated screens WITHOUT a backend. It proves
// LAYOUT / UI-STATE only — never real authentication, MongoDB persistence, or
// live AI. Tests that use these are labelled "fixture" in their titles.
// ──────────────────────────────────────────────────────────────────────────

const ok = (data) => ({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
const fail = (error = 'Server error', status = 500) => ({ status, contentType: 'application/json', body: JSON.stringify({ success: false, error }) });

export const USER = { name: 'Alex Rivera', email: 'alex@example.com', role: 'admin' };

export const MOCKS = {
  dashboard: {
    stats: [
      { label: 'Career Score', value: '78%', help: 'From your latest Career DNA' },
      { label: 'Generated', value: '12', help: 'Application assets' },
      { label: 'Applications', value: '9', help: 'Tracked roles' },
      { label: 'Practice', value: '4', help: 'Interview sessions' },
    ],
    progress: [
      { label: 'Profile analyzed', value: 80 },
      { label: 'Job matched', value: 60 },
      { label: 'Content generated', value: 45 },
      { label: 'Interview practiced', value: 50 },
      { label: 'Applications tracked', value: 70 },
    ],
    nextActions: [
      { label: 'Tailor your resume for Northwind', href: '/resume-builder', help: 'Add 3 missing skills before applying.' },
      { label: 'Practice a system-design answer', href: '/voice-interview', help: 'Your weakest area last session.' },
    ],
    followUpsDue: [{ id: '1', companyName: 'Northwind', role: 'Backend Engineer', followUpDate: 'today' }],
    recentActivities: [
      { type: 'interview', title: 'Voice interview scored 7/10', date: '2026-10-08' },
      { type: 'application', title: 'Moved Northwind to Interview', date: '2026-10-07' },
    ],
    lastInterview: { type: 'Voice', score: 72 },
  },
  profile: {
    name: 'Alex Rivera', email: 'alex@example.com', title: 'Backend Engineer',
    phone: '', location: 'Remote', targetRole: 'Backend Engineer',
    summary: 'Backend engineer focused on reliable APIs and data pipelines.',
    // These fields are free text in the profile/resume editors, so they are
    // stored as strings (matching the real data model), not objects.
    skills: 'Node.js, React, PostgreSQL, Docker',
    experience: 'Backend Engineer — Northwind (2023–present): built checkout services; cut latency 40%.',
    projects: 'Inventory API — batched inventory reads to cut checkout latency 40%.',
    education: 'B.S. Computer Science',
    githubUrl: 'https://github.com/example',
    preferredLocation: 'Remote',
  },
  // Representative no-backend response: the real endpoint returns a `fallback`
  // flag when it can't read the database, and the page renders a clear
  // "not connected" state. (A full object is the only other real shape.)
  intelligence: { fallback: true },
  vault: {
    summary: { total: 12, profileComplete: 70, skills: 8, projects: 3 },
    results: [
      { type: 'Skill', title: 'PostgreSQL', href: '/profile', snippet: 'Used across 3 projects.' },
      { type: 'Project', title: 'Inventory API', href: '/resume-builder', snippet: 'Cut latency 40%.' },
      { type: 'Experience', title: 'Backend Engineer · Northwind', href: '/profile', snippet: 'Checkout services.' },
    ],
  },
  content: [
    { id: 'c1', type: 'Cover letter', title: 'Backend Engineer · Northwind', role: 'Backend Engineer', content: 'Dear hiring team, I build reliable services…', createdAt: '2026-10-06' },
    { id: 'c2', type: 'Recruiter message', title: 'Intro to recruiter', role: 'Backend Engineer', content: 'Hi — I noticed the backend role…', createdAt: '2026-10-05' },
  ],
  applications: [
    { id: 'a1', companyName: 'Northwind', role: 'Backend Engineer', status: 'Interview', location: 'Remote', appliedDate: '2026-10-01', followUpDate: '2026-10-09', recruiterName: 'Sam Lee', recruiterEmail: 'sam@northwind.example', jobUrl: 'https://jobs.example/nw', notes: 'Second round next week.' },
    { id: 'a2', companyName: 'Acme', role: 'Platform Engineer', status: 'Applied', location: 'Hybrid', appliedDate: '2026-10-03', followUpDate: '', notes: '' },
    { id: 'a3', companyName: 'Globex', role: 'API Engineer', status: 'Saved', location: 'Onsite', notes: '' },
    { id: 'a4', companyName: 'Initech', role: 'Backend Dev', status: 'Offer', location: 'Remote', notes: 'Verbal offer.' },
  ],
  interviewHistory: [
    { id: 'i1', type: 'Behavioral', role: 'Backend Engineer', score: 7, date: '2026-10-06', status: 'completed' },
    { id: 'i2', type: 'System design', role: 'Backend Engineer', score: 6, date: '2026-10-02', status: 'completed' },
  ],
  voiceHistory: [
    { id: 'v1', type: 'Voice', role: 'Backend Engineer', score: 72, difficulty: 'Medium', date: '2026-10-07', status: 'completed' },
  ],
  admin: { totalUsers: 42, totalApplications: 128, totalInterviews: 36, totalContent: 210, users: [{ name: 'Alex Rivera', email: 'alex@example.com', role: 'admin' }] },
  versions: [{ id: 'rv1', label: 'v2 — Northwind', name: 'Northwind tailor', createdAt: '2026-10-06' }],
  match: { score: 71, matchedSkills: ['Node.js', 'PostgreSQL', 'Docker'], missingSkills: ['Kafka'], summary: 'Strong backend match; add streaming evidence.' },
};

/** Inject a fake signed-in session before any script runs. */
export async function installSession(context) {
  await context.addInitScript((user) => {
    try {
      localStorage.setItem('careeros_token', 'fixture-token');
      localStorage.setItem('careeros_user', JSON.stringify(user));
    } catch { /* ignore */ }
  }, USER);
}

/** Register all default API mocks on a context. */
export async function routeApi(context) {
  // Playwright matches the LAST-registered route first, so the broad catch-all
  // must be registered BEFORE the specific routes or it shadows them.
  await context.route('**/api/**', (r) => {
    if (r.request().method() === 'GET') return r.fulfill(ok([]));
    return r.fulfill(ok({}));
  });
  await context.route('**/health', (r) => r.fulfill({ status: 200, body: 'ok' }));
  const map = [
    ['**/api/auth/me', ok({ user: USER })],
    ['**/api/dashboard/stats', ok(MOCKS.dashboard)],
    ['**/api/user/profile', ok(MOCKS.profile)],
    ['**/api/intelligence/overview', ok(MOCKS.intelligence)],
    ['**/api/career-vault/search**', ok(MOCKS.vault)],
    ['**/api/content/library', ok(MOCKS.content)],
    ['**/api/applications', ok(MOCKS.applications)],
    ['**/api/interview/history', ok(MOCKS.interviewHistory)],
    ['**/api/voice-interview/history', ok(MOCKS.voiceHistory)],
    ['**/api/admin/stats', ok(MOCKS.admin)],
    ['**/api/resume/versions', ok(MOCKS.versions)],
    ['**/api/match', ok(MOCKS.match)],
  ];
  // Registered last → highest precedence, so these win over the catch-all.
  for (const [pattern, response] of map) {
    await context.route(pattern, (r) => r.fulfill(response));
  }
}

export { ok, fail };

/** Catalog of every screen to capture. auth:true needs session + mocks. */
export const PAGES = [
  { name: 'home', path: '/', auth: false },
  { name: 'login', path: '/login', auth: false },
  { name: 'signup', path: '/signup', auth: false },
  { name: 'about', path: '/about', auth: false },
  { name: 'matcher', path: '/matcher', auth: false },
  { name: 'notfound', path: '/this-route-does-not-exist', auth: false },

  { name: 'dashboard', path: '/dashboard', auth: true },
  { name: 'profile', path: '/profile', auth: true },
  { name: 'career-intelligence', path: '/career-intelligence', auth: true },
  { name: 'career-dna', path: '/career-dna', auth: true },
  { name: 'career-vault', path: '/career-vault', auth: true },
  { name: 'resume-builder', path: '/resume-builder', auth: true },
  { name: 'generator', path: '/generator', auth: true },
  { name: 'content-library', path: '/content-library', auth: true },
  { name: 'job-analyzer', path: '/job-analyzer', auth: true },
  { name: 'applications', path: '/applications', auth: true },
  { name: 'interview-room', path: '/interview-room', auth: true },
  { name: 'voice-interview', path: '/voice-interview', auth: true },
  { name: 'interview-history', path: '/interview-history', auth: true },
  { name: 'voice-interview-history', path: '/voice-interview-history', auth: true },
  { name: 'roadmap', path: '/roadmap', auth: true },
  { name: 'admin', path: '/admin', auth: true },
];
