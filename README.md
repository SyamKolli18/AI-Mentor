# AI Mentor – Personalized Career & Learning Operating System

AI Mentor is a comprehensive, full-stack web application designed to help Computer Science students and self-taught developers structure their career preparation, learning roadmaps, portfolio projects, interview skills, and daily productivity in one unified platform.

---

## 📌 Problem Statement

Computer Science students and aspiring software engineers frequently face fragmented learning experiences:
- Struggling to map clear, structured learning paths tailored to their target technical career (Frontend, Backend, AI/ML, DevOps).
- Lacking objective guidance on missing prerequisite skills or optimal portfolio project ideas.
- Struggling to evaluate code quality, performance bottlenecks, and security vulnerabilities without direct mentor reviews.
- Lacking consistent tracking for daily study goals, DSA problem practice, and employer placement readiness.

## 💡 Solution: Focused Product Vision

**AI Mentor** acts as a personalized AI mentor throughout the student's journey, focusing on answering core college student questions:
- *What to learn* & *Which programming language to start*
- *Which career path suits them best*
- *What skills they are missing & what to learn next*
- *Whether they actually understand what they studied*

### Core Student Flow
```text
Student → Onboarding → Student Profile Analysis → Career Recommendation → Personalized Roadmap → Learning & Progress Tracking → AI Learning System → Adaptive Mentor Engine → Updated Learning Path
```

---

## ✨ Core Features

1. **Onboarding**: Multi-step wizard collecting academic details, skills, career goals, study preferences, and hardware constraints with draft autosaving.
2. **Student Profile Analysis**: Cognitive skill vector breakdown with transparent beginner explanations for each score ("What does this score mean?", "What should I do to improve it?"), strengths, weaknesses, and skill gaps.
3. **Career Recommendation**: Deep career matching explaining match %, why it matches, current strengths, missing skills, recommended next skills, difficulty, and expected learning path timeline.
4. **Personalized Roadmap**: Highly visual 3-stage module tree detailing topics, why it matters, prerequisites, estimated learning time, difficulty, learning outcomes, resources, practice/assessments, and completion status.
5. **AI Learning System**: Interactive 6-step study interface for every topic: **Explain → Teach → Practice → Evaluate → Feedback → Next Action**.
6. **Adaptive Mentor Engine**: Continuous evaluation loop analyzing quiz/assessment performance to flag weak/strong topics, recommend remediation, adjust difficulty, generate targeted exercises, and unlock modules.
7. **Learning & Progress Tracking**: Real-time progress analytics tracking study streaks, total study hours, mastered vs. weak topics, and adaptive recommendations.
8. **Real AI Service Integration**: Dedicated LLM service layer using Google Gemini API (`AI_PROVIDER=gemini`, `GEMINI_API_KEY`) with structured prompts, response validation, retries, timeouts, and safe fallback behavior.
9. **Secure Authentication & Token Refresh**: JWT authentication with automatic Refresh Token Rotation via `POST /api/auth/refresh-token` and logout token revocation.
10. **Automated Vitest Test Suite**: Vitest suite verifying core business logic: profile scoring, career matching, skill-gap detection, roadmap progression, answer evaluation, adaptive decisions, and auth utilities.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (Vite 8 build tool)
- **Language**: TypeScript 6
- **Styling**: Tailwind CSS 3 with custom CSS Glassmorphism design tokens
- **Animations**: Framer Motion 12
- **Data Visualization**: Recharts 3 (Radar, Area, and Bar charts)
- **State & Querying**: TanStack React Query 5, Axios, React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Runtime & Server**: Node.js 18, Express 4
- **Language**: TypeScript 5
- **Database ODM**: Mongoose 8 (MongoDB)
- **Authentication & Security**: BcryptJS 2, JSONWebTokens 9, Zod 3 input validation
- **Utility Services**: Nodemailer 6 (SMTP mailer)

### DevOps & Infrastructure
- **Containers**: Docker (Multi-stage Node Alpine & Nginx Alpine builds)
- **Orchestration**: Docker Compose

---

## 🏗️ Architecture

AI Mentor follows a decoupled Client-Server Single Page Application (SPA) REST architecture:

```text
[ React 19 Client SPA ]  <-- HTTP / REST (Axios) -->  [ Express 4 / Node.js Server ]
(Port 5173 / 80 Docker)                               (Port 5000 Docker)
                                                             │
                                                    [ Mongoose ODM ]
                                                             │
                                                  [ MongoDB Database ]
                                                (Port 27017 / Atlas)
```

---

## 📁 Project Structure

```text
AI-Mentor/
├── backend/
│   ├── src/
│   │   ├── config/       # Database connection & Zod env schema
│   │   ├── controllers/  # 13 Express API route controllers
│   │   ├── middleware/   # Auth JWT, RBAC authorize, error & security filters
│   │   ├── models/       # 15 Mongoose MongoDB schemas
│   │   ├── routes/       # Express API router mounts (/api/*)
│   │   ├── utils/        # AI Service, Mailer transport, Database seeder
│   │   ├── app.ts        # Express app initialization & security setup
│   │   └── server.ts     # HTTP server listener bootstrap
│   ├── .env.example      # Environment variables template
│   ├── Dockerfile        # Multi-stage Docker build for backend
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # UI primitives (Button, Card, Input, Skeleton)
│   │   ├── context/      # AuthContext, ThemeContext, ToastContext
│   │   ├── features/     # Feature views (onboarding, dashboard, roadmaps, etc.)
│   │   ├── layouts/      # AuthLayout, DashboardLayout, LandingLayout
│   │   ├── lib/          # Axios instance & utility functions
│   │   ├── App.tsx       # Lazy-loaded route declarations (21 pages)
│   │   └── main.tsx      # React root mount
│   ├── .env.example      # Frontend environment variables template
│   ├── Dockerfile        # Multi-stage Nginx Docker build for frontend
│   └── package.json
├── docker-compose.yml     # Multi-container orchestration
├── .gitignore             # Root Git ignore rules
├── CHANGELOG.md           # Version changelog history
├── FINAL_REPORT.md        # Architectural verification report
├── PROJECT_PROGRESS.md    # Development milestones report
└── README.md              # Project documentation
```

---

## ⚙️ Environment Variables

Copy `.env.example` files to `.env` in both `backend` and `frontend` directories before running locally:

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-mentor
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM="AI Mentor <noreply@aimentor.com>"

FRONTEND_URL=http://localhost:5173
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local MongoDB instance running on port 27017 or a MongoDB Atlas connection string.

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Update MONGODB_URI and JWT_SECRET
npm run dev
```
The Express backend server will start on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
The React frontend application will start on `http://localhost:5173`.

---

## 🐳 Docker Setup

Run the full application stack (Frontend, Backend, and MongoDB) using Docker Compose:

```bash
docker-compose up --build
```
- **Frontend SPA**: `http://localhost:80`
- **Backend API**: `http://localhost:5000`
- **MongoDB**: `localhost:27017`

---

## 📡 API Overview

The backend exposes 42 REST API endpoints categorized by domain:

- **Auth** (`/api/auth`): Signup, Login, Email Verification, Password Recovery, Token Auth (`/me`).
- **Onboarding** (`/api/onboarding`): Fetch progress, draft autosave, and submit profile.
- **AI & Roadmaps** (`/api/ai`): Profile vector analysis, career recommendations, roadmap generation, module reordering, lesson & quiz completions, dashboard stats, and weekly goal setting.
- **Projects** (`/api/projects`): Blueprint recommendations, save/bookmark projects, update progress, upload builds.
- **Code Review** (`/api/code-review`): Code snippet security/quality evaluation and history logs.
- **Mock Interviews** (`/api/interviews`): Generate session, answer questions, complete interview, fetch scorecards.
- **Placement Readiness** (`/api/placement`): Employer match matrices and readiness recalculation.
- **Study Planner** (`/api/planner`): Tasks CRUD, daily habit toggles, and Pomodoro focus duration logging.
- **Coding Practice** (`/api/coding`): Solved problem difficulty counters and heatmap synchronization.
- **AI Assistant** (`/api/assistant`): Interactive chat assistant responses, session histories, bookmarks, and favorite replies.
- **Community** (`/api/community`): Discussion forums, study club memberships, project showcases, and leaderboard standings.
- **Admin Management** (`/api/admin`): Platform analytics, resource link & category CRUD, guarded by `authorize(['admin'])`.
- **System Health** (`/api/health`): System diagnostic metrics (uptime, memory, database connection state).

---

## 🔒 Security Architecture

- **Password Hashing**: Salted password hashing via `bcryptjs` (10 salt rounds).
- **Session Protection**: Signed JSON Web Tokens (JWT) with configurable expiry.
- **Role-Based Authorization**: Middleware gate (`authorize(['admin'])`) shielding administrative routes.
- **NoSQL Injection Defense**: Recursive query sanitizer stripping object keys starting with `$` or `.`.
- **Rate Limiting**: In-memory IP request rate limiting (300 requests per 15-minute window).
- **HTTP Security Headers**: Strict security headers (`X-Frame-Options`, `X-XSS-Protection`, `Content-Security-Policy`, `X-Content-Type-Options`).

---

## ⚠️ Known Limitations & Implementation Truthfulness

In compliance with source-code audit findings:
1. **Local Heuristic AI Logic**: All features described as "AI" (Profile Vector Calculations, Career Recommendations, Adaptive Skip/Insert Roadmaps, Code Reviews, Mock Interview Scoring, and Chat Assistant) are powered by **local deterministic TypeScript math formulas, rule-based heuristics, regex string matching, and static data pools**. There is currently **NO external OpenAI, Gemini, or Anthropic LLM API integration**.
2. **In-Memory Rate Limiting**: The current rate limiter operates in server memory. Distributed multi-container deployments should be upgraded to a Redis-backed rate limiter.
3. **Automated Test Suite**: The codebase currently relies on clean TypeScript compilation (`tsc`) and manual API verification. Automated unit and E2E test suites (Jest / Vitest / Playwright) are not yet integrated.

---

## 🔮 Future Improvements

- Integrate live LLM SDKs (OpenAI GPT-4 / Google Gemini REST API) for dynamic conversational responses and natural language code reviews.
- Integrate WebSockets (Socket.io) for real-time instant messaging inside Community Study Groups.
- Build automated Vitest unit test suites for `aiService.ts` scoring utilities and Supertest integration tests for backend routes.
- Add GitHub Actions CI/CD pipelines for automated testing, linting, and cloud deployments.
