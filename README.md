# Academicos

> Your Academic Operating System

Academicos is an integrated academic productivity platform designed for students, competitive exam aspirants (e.g., CAT, GATE, GRE), and lifelong learners. It unifies daily study planning, syllabus tracking, mock test analysis, exam scheduling, task management, and AI-powered document imports into a single cohesive interface.

---

## Key Features

- **Daily Check-In & Study Planner**: Track available time, energy levels, and set daily non-negotiable goals with automated streak counters.
- **Smart Import (AI-Powered)**: Server-side Gemini AI integration to automatically parse scorecards, test results, syllabi, timetables, and academic notices.
- **Test Center & Analytics**: Full mock test logging, sectional score tracking, percentiles, accuracy metrics, and AI mistake book analysis.
- **Syllabus & Course Tracker**: Program-level topic breakdown with completion status and revision scheduling.
- **Academic Updates & Calendar**: Verified institutional notices, official university portals, and exam deadline notifications.
- **Tasks & Study Timer**: Flexible task management with priority levels and integrated study timers.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion, Recharts
- **Backend / Server**: Express (Node.js), TypeScript
- **AI Integration**: Google Gemini API (`@google/genai` SDK, server-side only)
- **Build Tooling**: Vite, esbuild, tsx

---

## Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

| Variable Name | Description | Required | Default |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | API Key for Gemini AI Smart Import features | Yes (for AI features) | None |
| `NODE_ENV` | Environment mode (`development` or `production`) | Optional | `development` |
| `PORT` | Server listening port | Optional | `3000` |

> **Note**: Never commit `.env` or real API keys to version control.

---

## Development Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will start at `http://localhost:3000`.

---

## Production Build & Run

1. **Build the Application**:
   ```bash
   npm run build
   ```
   This compiles the React frontend assets into `dist/` and bundles `server.ts` into `dist/server.cjs`.

2. **Start Production Server**:
   ```bash
   npm run start
   ```
   The production server binds to `0.0.0.0` on the port specified by `PORT` (or `3000` by default).

---

## API Endpoints

- `GET /api/health`: Health check endpoint returning server status.
- `POST /api/smart-import`: Server-side endpoint for Gemini AI document parsing (rate-limited per IP).
