# ResumeAI — AI Resume & Job Application Assistant

A full-stack AI-powered tool that generates professional job application content tailored to your profile, target role, and company — in seconds.

---

## What It Does

ResumeAI takes your personal details (education, skills, projects, experience) and the role you're targeting, then generates:

- **Resume Summary** — A sharp 3-5 sentence professional summary
- **Cover Letter** — A tailored, hook-first cover letter (250-350 words)
- **Cold Email** — A concise outreach email with a subject line
- **LinkedIn Message** — A non-spammy connection request under 300 characters
- **Tell Me About Yourself** — A structured 60-90 second interview answer
- **Project Explanation** — A compelling technical project description

Five tone options: Professional, Confident, Fresher Friendly, Concise, Humanized.

---

## Why I Built This

When applying for my first internships and entry-level roles, I wasted hours writing and rewriting the same content for every application. The advice online was generic — nobody showed what "customize for each role" actually looks like when you're a fresher.

I built the smallest version of this tool that would genuinely help: enter your real details, choose what you need, get tailored output that doesn't sound like a template.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS        |
| Backend  | Node.js, Express.js                 |
| AI       | Google Gemini API (gemini-1.5-flash)|
| Routing  | React Router DOM v6                 |
| HTTP     | Fetch API (frontend), Axios (backend)|

---

## Features

- 6 content types × 5 tone options
- Context-rich prompt builder (tailored per-field)
- API key stays on the backend only
- Copy-to-clipboard with visual confirmation
- Regenerate without re-filling the form
- Responsive for mobile, tablet, and desktop
- Professional navy + white SaaS UI
- Loading, error, and empty states
- No sign-up required

---

## Folder Structure

```
ai-resume-job-assistant/
├── README.md
├── .gitignore
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── logo.svg
│   ├── src/
│   │   ├── assets/hero-illustration.svg
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── FeatureCard.jsx
│   │   │   ├── GeneratorForm.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Generator.jsx
│   │   │   └── About.jsx
│   │   ├── services/api.js
│   │   ├── utils/constants.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
└── backend/
    ├── src/
    │   ├── config/env.js
    │   ├── controllers/generateController.js
    │   ├── routes/generateRoutes.js
    │   ├── services/aiService.js
    │   ├── utils/buildPrompt.js
    │   ├── middleware/errorHandler.js
    │   └── server.js
    ├── .env.example
    ├── package.json
    └── nodemon.json
```

---

## How to Run

### Prerequisites
- Node.js >= 18
- A Google Gemini API key ([get one free](https://aistudio.google.com/))

### Backend

```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
# Edit .env and add your AI_API_KEY

npm run dev
# Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install

# Create your .env file
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:5000

npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable    | Description                        | Example                  |
|-------------|------------------------------------|--------------------------|
| `PORT`      | Server port                        | `5000`                   |
| `AI_API_KEY`| Google Gemini API key              | `AIza...`                |
| `AI_MODEL`  | Primary Gemini model to use        | `gemini-3.5-flash`       |
| `AI_FALLBACK_MODELS` | Optional comma-separated fallback models | `gemini-1.5-flash` |

### Frontend (`frontend/.env`)

| Variable            | Description              | Example                    |
|---------------------|--------------------------|----------------------------|
| `VITE_API_BASE_URL` | Backend API base URL     | `http://localhost:5000`    |

---

## API Reference

### `POST /api/generate`

**Request body:**
```json
{
  "fullName": "Arjun Sharma",
  "education": "B.Tech CSE, VIT University (2024)",
  "skills": "React, Node.js, MongoDB, Python",
  "projects": "Built a real-time chat app...",
  "experience": "SDE Intern at Infosys (6 months)",
  "targetRole": "Frontend Developer",
  "companyName": "Google",
  "jobDescription": "We are looking for...",
  "contentType": "Cover Letter",
  "tone": "Professional"
}
```

**Response:**
```json
{
  "success": true,
  "data": "Generated content text..."
}
```

---

## Architecture Decisions

- **API key on backend only**: The Gemini key is never sent to the frontend. All AI calls go through `POST /api/generate`.
- **Context-rich prompts**: Each content type has a dedicated prompt template in `buildPrompt.js` that uses every field the user fills in — not a generic "write a resume" instruction.
- **No database**: This is a stateless API. Each request is self-contained. Adding persistence (save history) would require a database, which is a planned future improvement.
- **ES Modules**: Both frontend (Vite) and backend use `import/export` syntax consistently.

---

## What I Used AI For

- Generating context-aware, human-sounding job application content
- Crafting prompts that avoid generic AI-sounding output
- Adapting output based on tone selection
- Tailoring content to the specific job description provided

---

## What I'd Change With 4 More Weeks

- User accounts with saved generation history
- PDF export from the result card
- Full resume builder (structured sections → exported PDF)
- Interview question generator from the job description
- Batch generation: all 6 content types at once
- Rate limiting and auth middleware on the backend

---

## Screenshots

> Add screenshots here after running the app

---

## Deployment

- **Frontend** → [Vercel](https://vercel.com) — push the `frontend/` folder, set `VITE_API_BASE_URL` in Vercel environment variables
- **Backend** → [Render](https://render.com) — deploy the `backend/` folder as a Node.js web service, set `AI_API_KEY`, `AI_MODEL`, optional `AI_FALLBACK_MODELS`, and `PORT` in Render environment variables

---

Built with purpose for job seekers who deserve better application tools.
