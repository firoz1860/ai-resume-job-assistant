# CareerOS AI

One workspace that connects a job seeker's **resume, job research, applications, and interview practice** — so you always know the next move. Built as a React + Vite single-page app talking to an Express + MongoDB backend, with a single real AI integration (Google Gemini) for content generation and interview feedback.

> **Status (honest):** the app is feature-complete and the production build, frontend UI suite, and backend unit tests all pass. **Live end-to-end flows against a deployed backend + MongoDB + Gemini were not re-verified in this audit** (no credentials in this environment). Authenticated screens in the gallery below are **fixture previews** (mocked API), clearly labelled. See [Verification status](#verification-status).

---

## What it does

- **Profile / Career Vault** — save skills, projects, experience, target roles; search across saved career data.
- **Resume Builder** — parse an uploaded/pasted resume, edit fields alongside a live preview, save versions against tracked jobs, and export via the browser print dialog.
- **Generator + Content Library** — generate role-specific drafts (cover letters, recruiter messages, summaries) with **Gemini**, then save/reuse them. Drafts are drafts — nothing is sent anywhere.
- **Job Analyzer / Matcher** — compare your profile against a job description and see supporting skills + missing evidence as an **evidence-based profile match** (not a hiring probability).
- **Applications** — a 5-stage pipeline (Saved → Applied → Interview → Rejected → Offer) with recruiter details, notes, follow-ups, and resume-change tracking.
- **Interviews** — text and spoken (Web Speech API) practice with per-answer feedback and a final report (**Gemini**, with a heuristic fallback if the model call fails).
- **Dashboard / Career Intelligence / Roadmap** — aggregated signals and a weekly plan computed from your saved records.

### What is AI vs. heuristic (no overclaiming)

| Feature | Backed by |
|---|---|
| Content Generator | **Google Gemini** (real model) |
| Text & Voice interview questions/feedback/report | **Google Gemini** with a deterministic fallback on error |
| Matcher, Job Analyzer, Career DNA, Career Intelligence, Career Vault, Roadmap, resume parse/diff, follow-up generation | **Local heuristics / templates** (keyword overlap, scaffolding) — *not* a language model |
| Dashboard, Admin | Database aggregation |

---

## Architecture

```
frontend/ (React 18, Vite 5, React Router 6, Tailwind 3 — JSX)
  src/services/api.js      one fetch layer; {success,data} envelope; 401 -> sign-out
  src/context/AuthContext  JWT (Bearer) in localStorage; background /me validation
  src/components/...       marketing (hero, scroll-stack, logo-morph) + workspace shell
  e2e/                     Playwright suite (public, fixture-UI, gallery, regression)

backend/ (Node, Express 4, Mongoose; in-memory fallback when Mongo is down)
  src/routes / controllers / services / models / middleware
  src/services/aiService.js   Google Gemini REST (the only model call)
```

Auth is **JWT in `Authorization: Bearer`** (from `localStorage`), verified by the `protect` middleware. Every user-scoped query filters by the authenticated user id (IDOR-safe). CORS is an allow-list driven by `CLIENT_URL`.

---

## Frontend <-> backend connection table

| Screen | Action | Frontend `api.js` | Method + path | Backend | Kind |
|---|---|---|---|---|---|
| Login/Signup | sign in / up / guest | `authApi.*` | POST `/api/auth/{login,signup,guest}` | authController | real |
| (all) | session restore | `authApi.me` | GET `/api/auth/me` | authController | real |
| Dashboard | load | `dashboardApi.stats` | GET `/api/dashboard/stats` | dashboardController | real (DB aggregate) |
| Profile | load / save | `profileApi.get/update` | GET/PUT `/api/user/profile` | userController | real |
| Career Intelligence | load / inspect job | `intelligenceApi.*` | GET `/api/intelligence/overview`, POST `/inspect-job` | intelligenceController | heuristic |
| Career DNA | scan | `careerApi.analyze` | POST `/api/career/analyze` | careerController | heuristic |
| Career Vault | search | `careerVaultApi.search` | GET `/api/career-vault/search` | careerVaultController | heuristic |
| Resume Builder | load / parse / apply / versions / diff | `profileApi`, `resumeApi.*`, `applicationsApi.list` | GET/POST `/api/resume/*`, `/api/user/profile` | resumeController | real + heuristic parse/diff |
| Generator | generate | `generateContent` | POST `/api/generate` | generateController -> aiService | **Gemini** |
| Content Library | list / delete | `contentApi.*` | GET `/api/content/library`, DELETE `/api/content/:id` | contentController | real |
| Job Analyzer | analyze | `jobAnalyzerApi.analyze` | POST `/api/job/analyze` | jobAnalyzerController | heuristic |
| Matcher *(public)* | match | `matchJob` | POST `/api/match` | matchController | heuristic |
| Applications | list/create/update/delete/follow-up | `applicationsApi.*` | GET/POST/PUT/DELETE `/api/applications[/:id[/follow-up]]` | applicationController | real (+ template follow-up) |
| Text Interview | start/answer/end/history | `interviewApi.*` | POST `/api/interview/{start,answer,end}`, GET `/history` | interviewController -> aiService | **Gemini** (+fallback) |
| Voice Interview | start/answer/end/history/detail | `voiceInterviewApi.*` | `/api/voice-interview/*` | voiceInterviewController | **Gemini** (+fallback) |
| Roadmap | create | `roadmapApi.create` | POST `/api/roadmap/create` | roadmapController | heuristic (deterministic plan) |
| Admin | load | `adminApi.stats` | GET `/api/admin/stats` | adminController (`requireAdmin`) | real (DB aggregate) |

---

## Local setup

**Prerequisites:** Node 18+ and a MongoDB instance (or run without one — the backend uses an in-memory fallback for local dev).

```bash
# Backend
cd backend
npm install
cp .env.example .env     # fill in the values below
npm run dev              # http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env     # set VITE_API_BASE_URL
npm run dev              # http://localhost:5173
```

### Environment variables (names only — never commit real secrets)

**backend/.env**

| Name | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string (omit to use the in-memory fallback locally) |
| `JWT_SECRET` | Signs auth tokens. **Required in production.** |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `AI_API_KEY` | Google Gemini API key. **Required** — the server refuses to start without it. |
| `AI_MODEL` / `AI_FALLBACK_MODELS` | Gemini model id(s), default `gemini-2.0-flash` |
| `CLIENT_URL` | **Comma-separated allowed frontend origins for CORS. Set this to the deployed frontend URL in production or the browser will be CORS-blocked.** |

**frontend/.env**

| Name | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL. **Must be set at build time in production** — otherwise the build falls back to `http://localhost:5000` and every request fails (the app logs a console error when this happens). |

---

## Testing

```bash
# Frontend
cd frontend
npm run build            # production build
npm run test:e2e         # Playwright (auto-starts `vite preview`)
npm run test:e2e:gallery # Playwright + regenerate the qa-evidence gallery

# Backend
cd backend
npm test                 # node --test (unit tests; uses test/setup.mjs dummy env)
```

The Playwright suite is organised into categories:

- **Public UI** — real production build, no mocks (home, login, signup, about, matcher, 404).
- **Fixture-backed UI** — mocked API + injected session (`e2e/fixtures.js`); verifies **layout and UI states only**, never real auth/DB/AI.
- **Regression** — `e2e/regression.spec.js` covers the audit fixes (defensive render, error states, role-gated admin link).
- **Real backend / real AI** — **not run here** (no credentials). Run against a live backend by pointing `baseURL` at it and signing in with a disposable account.

---

## Verification status

**Verified in this audit**
- Frontend `npm run build` — passes.
- Backend `npm test` — 6/6 unit tests pass.
- Playwright suite — public UI + fixture UI + regression, desktop & mobile, no horizontal overflow, no non-API console errors.
- Contract review — frontend paths/methods/response shapes match backend routes; JWT auth consistent both sides; IDOR-safe (every user-scoped query filters by user id).

**Fixed in this audit**
- Voice interview `submit`/`skip` no longer dereference a `null` result -> no white-screen when an answer request fails.
- Career Intelligence: defensive guards on every nested access -> partial data renders instead of crashing.
- Voice Interview Detail: shows an error state instead of an infinite loader on load failure.
- Interview Room: `start`/`answer`/`end` failures now surface an inline error.
- Resume Builder: name/email fall back to the signed-in user (the `CareerProfile` doc has neither).
- Admin link is gated to `role === 'admin'` (backend `requireAdmin` remains the real control).
- Removed "AI" labels from heuristic features (Roadmap, Career DNA, Career Intelligence panels).
- `api.js` logs a clear error if a production build is pointing at localhost.
- Backend tests made runnable without real secrets (`backend/test/setup.mjs`).

**Not verified / blockers**
- **Live end-to-end** (signup -> login -> persist -> logout, real Generator/interview AI, Applications CRUD round-trips) — needs `MONGO_URI` + `AI_API_KEY` + a deployed backend. Not available in this environment.
- **Real speaking (microphone) voice-interview run** — the setup/permission UI is tested; an actual spoken session needs a device with a mic.
- **Production config to double-check before trusting the live site:** `VITE_API_BASE_URL` set on the frontend build, and `CLIENT_URL` set on the backend to the deployed frontend origin.
- **Guest login shares a single `guest@careeros.ai` account** — all guests read/write the same data (by design; don't store anything private as a guest).

This project is **not** "production-ready / fully tested" — the live-backend and real-AI paths above remain unverified here.

---

## Screenshots

Fixture previews use synthetic data (mocked API) and verify UI only — **not** real account data. Click any thumbnail for the full-page capture. Walkthrough videos (hero, logo-morph, card-stack, mobile nav) live in [`qa-evidence/video/`](qa-evidence/video).

<details>
<summary><b>Public</b> (real production build, no mocks)</summary>

| | |
|---|---|
| <a href="docs/screenshots/full/home-desktop.jpg"><img src="docs/screenshots/public/home-desktop.jpg" width="300" alt="Homepage"></a><br><sub>Home</sub> | <a href="docs/screenshots/full/about-desktop.jpg"><img src="docs/screenshots/public/about-desktop.jpg" width="300" alt="About page"></a><br><sub>About</sub> |
| <a href="docs/screenshots/full/login-desktop.jpg"><img src="docs/screenshots/public/login-desktop.jpg" width="300" alt="Login split screen"></a><br><sub>Login</sub> | <a href="docs/screenshots/full/signup-desktop.jpg"><img src="docs/screenshots/public/signup-desktop.jpg" width="300" alt="Signup split screen"></a><br><sub>Signup</sub> |
| <a href="docs/screenshots/full/notfound-desktop.jpg"><img src="docs/screenshots/public/notfound-desktop.jpg" width="300" alt="Not Found page"></a><br><sub>Not Found</sub> | |

Mobile: <a href="docs/screenshots/full/home-mobile.jpg"><img src="docs/screenshots/public/home-mobile.jpg" width="140" alt="Home (mobile)"></a> <a href="docs/screenshots/full/login-mobile.jpg"><img src="docs/screenshots/public/login-mobile.jpg" width="140" alt="Login (mobile)"></a> <a href="docs/screenshots/full/signup-mobile.jpg"><img src="docs/screenshots/public/signup-mobile.jpg" width="140" alt="Signup (mobile)"></a> <a href="docs/screenshots/full/about-mobile.jpg"><img src="docs/screenshots/public/about-mobile.jpg" width="140" alt="About (mobile)"></a>
</details>

<details>
<summary><b>Career Workspace</b> (fixture preview)</summary>

| | |
|---|---|
| <a href="docs/screenshots/full/dashboard-desktop.jpg"><img src="docs/screenshots/workspace/dashboard-desktop.jpg" width="300" alt="Dashboard (fixture)"></a><br><sub>Dashboard</sub> | <a href="docs/screenshots/full/career-intelligence-desktop.jpg"><img src="docs/screenshots/workspace/career-intelligence-desktop.jpg" width="300" alt="Career Intelligence (fixture)"></a><br><sub>Career Intelligence</sub> |
| <a href="docs/screenshots/full/profile-desktop.jpg"><img src="docs/screenshots/workspace/profile-desktop.jpg" width="300" alt="Profile (fixture)"></a><br><sub>Profile</sub> | <a href="docs/screenshots/full/career-vault-desktop.jpg"><img src="docs/screenshots/workspace/career-vault-desktop.jpg" width="300" alt="Career Vault (fixture)"></a><br><sub>Career Vault</sub> |
| <a href="docs/screenshots/full/career-dna-desktop.jpg"><img src="docs/screenshots/workspace/career-dna-desktop.jpg" width="300" alt="Career DNA (fixture)"></a><br><sub>Career DNA</sub> | <a href="docs/screenshots/full/roadmap-desktop.jpg"><img src="docs/screenshots/workspace/roadmap-desktop.jpg" width="300" alt="Roadmap (fixture)"></a><br><sub>Roadmap</sub> |
| <a href="docs/screenshots/full/dashboard-empty-desktop.jpg"><img src="docs/screenshots/workspace/dashboard-empty-desktop.jpg" width="300" alt="Dashboard empty state (fixture)"></a><br><sub>Dashboard — empty state</sub> | <a href="docs/screenshots/full/dashboard-error-desktop.jpg"><img src="docs/screenshots/workspace/dashboard-error-desktop.jpg" width="300" alt="Dashboard error state (fixture)"></a><br><sub>Dashboard — failed load (dashes, not fake 0s)</sub> |
| <a href="docs/screenshots/full/admin-desktop.jpg"><img src="docs/screenshots/workspace/admin-desktop.jpg" width="300" alt="Admin (fixture)"></a><br><sub>Admin</sub> | |

Mobile: <a href="docs/screenshots/full/dashboard-mobile.jpg"><img src="docs/screenshots/workspace/dashboard-mobile.jpg" width="140" alt="Dashboard (mobile)"></a> <a href="docs/screenshots/full/profile-mobile.jpg"><img src="docs/screenshots/workspace/profile-mobile.jpg" width="140" alt="Profile (mobile)"></a> <a href="docs/screenshots/full/career-intelligence-mobile.jpg"><img src="docs/screenshots/workspace/career-intelligence-mobile.jpg" width="140" alt="Career Intelligence (mobile)"></a>
</details>

<details>
<summary><b>Applications</b> (fixture preview)</summary>

| | |
|---|---|
| <a href="docs/screenshots/full/applications-desktop.jpg"><img src="docs/screenshots/applications/applications-desktop.jpg" width="300" alt="Applications pipeline (fixture)"></a><br><sub>Pipeline</sub> | <a href="docs/screenshots/full/applications-add-drawer-desktop.jpg"><img src="docs/screenshots/applications/applications-add-drawer-desktop.jpg" width="300" alt="Add application drawer (fixture)"></a><br><sub>Add / edit drawer</sub> |
| <a href="docs/screenshots/full/applications-detail-drawer-desktop.jpg"><img src="docs/screenshots/applications/applications-detail-drawer-desktop.jpg" width="300" alt="Application detail drawer (fixture)"></a><br><sub>Detail drawer</sub> | <a href="docs/screenshots/full/job-analyzer-desktop.jpg"><img src="docs/screenshots/applications/job-analyzer-desktop.jpg" width="300" alt="Job Analyzer (fixture)"></a><br><sub>Job Analyzer</sub> |
| <a href="docs/screenshots/full/matcher-desktop.jpg"><img src="docs/screenshots/applications/matcher-desktop.jpg" width="300" alt="Matcher (public)"></a><br><sub>Matcher (public)</sub> | |

Mobile: <a href="docs/screenshots/full/applications-mobile.jpg"><img src="docs/screenshots/applications/applications-mobile.jpg" width="140" alt="Applications (mobile)"></a> <a href="docs/screenshots/full/job-analyzer-mobile.jpg"><img src="docs/screenshots/applications/job-analyzer-mobile.jpg" width="140" alt="Job Analyzer (mobile)"></a> <a href="docs/screenshots/full/matcher-mobile.jpg"><img src="docs/screenshots/applications/matcher-mobile.jpg" width="140" alt="Matcher (mobile)"></a>
</details>

<details>
<summary><b>Resume Tools</b> (fixture preview)</summary>

| | |
|---|---|
| <a href="docs/screenshots/full/resume-builder-desktop.jpg"><img src="docs/screenshots/resume/resume-builder-desktop.jpg" width="300" alt="Resume Builder editor + preview (fixture)"></a><br><sub>Resume Builder (editor + live preview)</sub> | <a href="docs/screenshots/full/generator-desktop.jpg"><img src="docs/screenshots/resume/generator-desktop.jpg" width="300" alt="Generator (fixture)"></a><br><sub>Generator</sub> |
| <a href="docs/screenshots/full/content-library-desktop.jpg"><img src="docs/screenshots/resume/content-library-desktop.jpg" width="300" alt="Content Library (fixture)"></a><br><sub>Content Library</sub> | |

Mobile: <a href="docs/screenshots/full/resume-builder-mobile.jpg"><img src="docs/screenshots/resume/resume-builder-mobile.jpg" width="140" alt="Resume Builder (mobile)"></a> <a href="docs/screenshots/full/generator-mobile.jpg"><img src="docs/screenshots/resume/generator-mobile.jpg" width="140" alt="Generator (mobile)"></a> <a href="docs/screenshots/full/content-library-mobile.jpg"><img src="docs/screenshots/resume/content-library-mobile.jpg" width="140" alt="Content Library (mobile)"></a>
</details>

<details>
<summary><b>Interviews</b> (fixture preview)</summary>

| | |
|---|---|
| <a href="docs/screenshots/full/interview-room-desktop.jpg"><img src="docs/screenshots/interviews/interview-room-desktop.jpg" width="300" alt="Text interview setup (fixture)"></a><br><sub>Text interview — setup</sub> | <a href="docs/screenshots/full/voice-interview-desktop.jpg"><img src="docs/screenshots/interviews/voice-interview-desktop.jpg" width="300" alt="Voice interview setup (fixture)"></a><br><sub>Voice interview — setup</sub> |
| <a href="docs/screenshots/full/interview-history-desktop.jpg"><img src="docs/screenshots/interviews/interview-history-desktop.jpg" width="300" alt="Interview history (fixture)"></a><br><sub>Interview history</sub> | <a href="docs/screenshots/full/voice-interview-history-desktop.jpg"><img src="docs/screenshots/interviews/voice-interview-history-desktop.jpg" width="300" alt="Voice interview history (fixture)"></a><br><sub>Voice interview history</sub> |

Mobile: <a href="docs/screenshots/full/interview-room-mobile.jpg"><img src="docs/screenshots/interviews/interview-room-mobile.jpg" width="140" alt="Text interview (mobile)"></a> <a href="docs/screenshots/full/voice-interview-mobile.jpg"><img src="docs/screenshots/interviews/voice-interview-mobile.jpg" width="140" alt="Voice interview (mobile)"></a> <a href="docs/screenshots/full/interview-history-mobile.jpg"><img src="docs/screenshots/interviews/interview-history-mobile.jpg" width="140" alt="Interview history (mobile)"></a>
</details>
