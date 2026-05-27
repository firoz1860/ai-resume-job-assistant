# CareerOS AI

CareerOS AI is a full-stack AI career operating system for job seekers. It combines profile management, resume parsing, resume building, job matching, application tracking, interview practice, career intelligence, saved content, and searchable career memory in one coordinated workspace.

The purpose of the project is to reduce scattered job-search work. Instead of using separate tools for resume editing, interview notes, job tracking, follow-ups, and AI-generated messages, CareerOS AI keeps those workflows connected around the user's profile, applications, interviews, and saved career history.

## What This Project Does

- Stores a user's career profile with skills, education, projects, experience, links, preferences, and resume text
- Generates job-specific career content using AI
- Parses uploaded resumes from PDF, DOCX, TXT, or pasted text
- Builds ATS-style resumes and exports them through the browser print/PDF flow
- Saves resume versions for specific jobs
- Tracks applications, follow-ups, recruiters, job descriptions, resume changes, and interview prep
- Runs text and voice interview practice
- Scores voice answers using transcript quality and audio-style metrics such as WPM, filler count, pauses, confidence, STAR score, and answer structure
- Searches saved career memory across profile, applications, generated content, interviews, roadmaps, job analyses, and resume versions
- Shows live dashboard and admin metrics from MongoDB

## Why I Built It

Most job seekers have useful information spread across resumes, job portals, emails, notes, interview practice tools, and AI chats. That makes it hard to reuse proof from old projects, track application progress, or prepare for interviews based on the exact job.

CareerOS AI solves this by acting as a career command center:

- Profile data powers generation, matching, interview prep, and resume building
- Applications store the job context and follow-up history
- Interviews produce feedback that becomes searchable career memory
- Resume versions stay linked to target roles or companies
- Career Vault makes old work reusable instead of lost

## Navbar Guide

The app is organized around the navbar. Each page has a specific role in the job-search workflow.

| Navbar Item | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Public landing page introducing CareerOS AI and its main value |
| Dashboard | `/dashboard` | Authenticated command center with stats, next actions, progress, due follow-ups, quick actions, and recent activity |
| Intelligence | `/career-intelligence` | AI-powered overview of career readiness, application pipeline quality, weak areas, and recommendations |
| Vault | `/career-vault` | Search across saved profile data, applications, generated content, interviews, job analyses, roadmaps, and resume versions |
| Generator | `/generator` | Generate resume summaries, cover letters, cold emails, LinkedIn messages, and interview-style answers |
| Voice Interview | `/voice-interview` | Practice aloud with AI questions, transcript capture, scoring, spoken feedback, and audio metrics |
| Applications | `/applications` | Application Intelligence Tracker for jobs, recruiters, statuses, follow-ups, resume diff notes, and interview prep |

## Tools Menu Guide

The Tools dropdown contains focused modules that support the main workflow.

| Tool | Route | Purpose |
| --- | --- | --- |
| Career DNA | `/career-dna` | Analyzes profile strength, gaps, skills, and readiness |
| Job Analyzer | `/job-analyzer` | Compares a job description against the user's profile and extracts match signals |
| Resume Builder | `/resume-builder` | Upload/parse resumes, edit ATS sections, approve resume diffs, save versions, and export PDF |
| Admin | `/admin` | Live platform metrics: users, generated content, interviews, applications, resume versions, average score, common roles |
| Content Library | `/content-library` | Saved generated content for reuse |
| Matcher | `/matcher` | Public job/profile matching utility |
| Text Interview | `/interview-room` | Text-based mock interview workflow |
| Interview History | `/interview-history` | Past text interview sessions and feedback |
| Voice History | `/voice-interview-history` | Past voice interview sessions |
| Roadmap | `/roadmap` | AI-generated learning roadmap for target roles |
| Profile | `/profile` | User's core career data used by the rest of the app |
| About | `/about` | Project information and context |

## How The App Works Together

1. The user signs up or logs in.
2. The user fills the Profile page or uploads a resume in Resume Builder.
3. Profile data becomes the base context for generation, matching, intelligence, and interviews.
4. The user adds job applications manually or by pasting job text/link into Applications.
5. The Generator creates job-specific content from profile and job context.
6. Resume Builder saves tailored resume versions for specific roles.
7. Voice Interview and Text Interview produce feedback and scores.
8. Dashboard summarizes progress and next actions.
9. Career Vault searches across saved career memory so old proof, answers, content, and applications can be reused.

## Architecture

CareerOS AI is split into a React frontend and an Express backend.

```text
frontend React app
  -> services/api.js
  -> backend Express API
  -> MongoDB through Mongoose models
  -> Gemini AI service for generation and scoring
```

Important architecture choices:

- The AI API key stays only on the backend.
- Protected data uses JWT auth.
- MongoDB stores user-owned data.
- Controllers are separated by product area: auth, profile, applications, generation, resume, interviews, dashboard, intelligence, vault, admin.
- AI prompts are isolated in prompt files.
- Shared helper logic lives in `utils/`, such as resume parsing, text analysis, job matching, prompt building, and AI JSON parsing.
- The app includes fallback handling for database health and API errors.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express, Helmet, CORS, express-rate-limit |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt, protected middleware |
| AI | Google Gemini API through backend service |
| Resume Parsing | `multer`, `pdf-parse`, `mammoth` |
| Testing | Node's built-in `node:test` |

Backend requires Node.js `>=20.16.0` because the current `pdf-parse` package targets modern Node versions.

## Main Frontend Files

| File | Purpose |
| --- | --- |
| `frontend/src/App.jsx` | Route definitions and protected route wrapping |
| `frontend/src/components/Navbar.jsx` | Main navigation, tools dropdown, mobile nav, command search trigger |
| `frontend/src/components/CommandPalette.jsx` | Ctrl+K action search |
| `frontend/src/components/ToastProvider.jsx` | Global toast notifications |
| `frontend/src/context/AuthContext.jsx` | Login state and auth operations |
| `frontend/src/services/api.js` | Central frontend API client |
| `frontend/src/pages/Dashboard.jsx` | Main authenticated dashboard |
| `frontend/src/pages/Applications.jsx` | Application tracker and application-specific intelligence |
| `frontend/src/pages/ResumeBuilder.jsx` | Resume parser, builder, diff approval, versions, export |
| `frontend/src/pages/CareerVault.jsx` | Career memory search |
| `frontend/src/pages/VoiceInterview.jsx` | Voice interview setup and runtime |

## Main Backend Files

| File | Purpose |
| --- | --- |
| `backend/src/server.js` | Express app setup, middleware, routes, health endpoint |
| `backend/src/routes/generateRoutes.js` | Main product API routes |
| `backend/src/routes/authRoutes.js` | Signup, login, current user, logout |
| `backend/src/routes/userRoutes.js` | Profile read/update |
| `backend/src/routes/voiceInterviewRoutes.js` | Voice interview endpoints |
| `backend/src/controllers/resumeController.js` | Resume parsing, profile application, versions, diff |
| `backend/src/controllers/applicationController.js` | Application CRUD and follow-up generation |
| `backend/src/controllers/careerVaultController.js` | Search across saved career memory |
| `backend/src/controllers/dashboardController.js` | Dashboard stats and next actions |
| `backend/src/controllers/adminController.js` | Live admin metrics |
| `backend/src/services/aiService.js` | Gemini API integration and fallback behavior |
| `backend/src/services/voiceInterviewService.js` | Voice session helpers, fallback scoring, audio metrics |
| `backend/src/utils/resumeParser.js` | Resume section extraction and resume diff helpers |

## Data Models

| Model | Stores |
| --- | --- |
| `User` | Account, hashed password, auth identity |
| `CareerProfile` | Education, skills, projects, experience, target role, links, salary, language, availability |
| `Application` | Company, role, job link, status, dates, recruiter info, job description, resume before/after, project evidence |
| `GeneratedContent` | AI-generated cover letters, messages, summaries, and prompts |
| `InterviewSession` | Text or voice interview session metadata, status, report, scores |
| `InterviewMessage` | Questions, answers, transcripts, feedback, mistakes, audio metrics |
| `JobAnalysis` | Job description analysis result |
| `Roadmap` | Target-role learning plan |
| `ResumeVersion` | Saved resume sections for general or job-specific versions |

## API Reference

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create account |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/user/profile` | Load career profile |
| `PUT` | `/api/user/profile` | Update career profile |
| `POST` | `/api/generate` | Generate AI content |
| `POST` | `/api/match` | Match profile against job data |
| `GET` | `/api/dashboard/stats` | Dashboard stats |
| `GET` | `/api/intelligence/overview` | Career intelligence overview |
| `POST` | `/api/intelligence/inspect-job` | Inspect a job post |
| `GET` | `/api/career-vault/search` | Search career memory |
| `GET` | `/api/admin/stats` | Live platform metrics |
| `POST` | `/api/resume/parse` | Parse uploaded/pasted resume |
| `POST` | `/api/resume/apply-parsed` | Save parsed resume fields to profile |
| `GET` | `/api/resume/versions` | List saved resume versions |
| `POST` | `/api/resume/versions` | Save resume version |
| `POST` | `/api/resume/diff` | Build resume bullet diff |
| `POST` | `/api/career/analyze` | Career DNA analysis |
| `POST` | `/api/job/analyze` | Job description analysis |
| `GET` | `/api/content/library` | Saved generated content |
| `DELETE` | `/api/content/:id` | Delete generated content |
| `POST` | `/api/interview/start` | Start text interview |
| `POST` | `/api/interview/answer` | Submit text interview answer |
| `POST` | `/api/interview/end` | End text interview |
| `GET` | `/api/interview/history` | Text interview history |
| `GET` | `/api/interview/:id` | Text interview detail |
| `POST` | `/api/voice-interview/start` | Start voice interview |
| `POST` | `/api/voice-interview/answer` | Submit transcript and get feedback/metrics |
| `POST` | `/api/voice-interview/end` | End voice interview and generate report |
| `GET` | `/api/voice-interview/history` | Voice interview history |
| `GET` | `/api/voice-interview/:id` | Voice interview detail |
| `POST` | `/api/roadmap/create` | Create learning roadmap |
| `GET` | `/api/applications` | List applications |
| `POST` | `/api/applications` | Create application |
| `PUT` | `/api/applications/:id` | Update application |
| `DELETE` | `/api/applications/:id` | Delete application |
| `POST` | `/api/applications/:id/follow-up` | Generate follow-up message |
| `GET` | `/health` | Server and MongoDB health |

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:5000`.

Backend environment:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/careeros-ai
JWT_SECRET=replace-with-a-long-secret
AI_API_KEY=your-gemini-key
AI_MODEL=gemini-1.5-flash
AI_FALLBACK_MODELS=gemini-1.5-flash
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

Frontend environment:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Testing And Verification

Backend tests:

```bash
cd backend
npm test
```

Frontend production build:

```bash
cd frontend
npm run build
```

Current tests cover resume parsing and resume diff helpers. The next useful tests would be auth integration tests, application CRUD tests, protected route tests, AI fallback tests, and frontend smoke tests.

## Deployment

### Backend On Render

1. Create a Render Web Service from `backend/`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set `PORT`, `CLIENT_URL`, `MONGODB_URI`, `JWT_SECRET`, `AI_API_KEY`, `AI_MODEL`, and `AI_FALLBACK_MODELS`.
5. Set `CLIENT_URL` to the deployed frontend URL.

### Frontend On Vercel

1. Import the repo.
2. Set root directory to `frontend/`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_API_BASE_URL` to the deployed backend URL.

## Production Hardening

- Add MongoDB indexes for `userId`, `createdAt`, `status`, `followUpDate`, and `targetRole`
- Add integration tests for auth, profile, applications, interviews, resume versions, and protected routes
- Add AI quota-specific UI states
- Add more granular rate limits for auth, AI generation, resume upload, and interview routes
- Add calendar reminders for interviews, follow-ups, and roadmap tasks
- Add email sync for application confirmations, recruiter replies, interview invites, rejections, and offers
- Add a browser extension for one-click job import
- Add vector embeddings for deeper Career Vault retrieval

## Current Project Status

CareerOS AI is now a working full-stack application with dynamic MongoDB-backed data. It does not rely on seeded demo data. The dashboard, admin metrics, vault, applications, resumes, generated content, and interviews are designed to reflect real user activity.

