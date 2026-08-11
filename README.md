# Curio

> Take one question. Follow it for fifteen minutes. Close the tabs and see what stayed.

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-1f2320?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-1f2320?style=flat-square)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-1f2320?style=flat-square)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-1f2320?style=flat-square)](https://vercel.com/)

Curio is a small research ritual for people who want to remember more of what they read. It gives you a worthwhile question, fifteen minutes to investigate it, and three follow-up questions that test whether you can explain the idea without leaning on the source.

No feed, summaries, or points system. The interesting part is doing the reading.

## How a session works

1. **Take a question.** Shuffle through Curio’s topic catalog and choose a depth.
2. **Follow it for fifteen minutes.** Read freely and keep notes in your own words.
3. **Close the tabs.** Answer one explanation, one challenge, and one connection question.
4. **Find the thin spots.** Curio scores each answer and gives short, specific feedback.

Curio has two quiz providers:

- The **local provider** works without external services and is useful for development.
- The **OpenAI provider** uses the learner’s topic and notes to generate the quiz and assess the answers. The API key stays on the server.

## Stack

| Part | Choice |
| --- | --- |
| Web | React 19, Vite, TypeScript |
| Motion | Motion and Lucide icons |
| API | Express 5 with Zod validation |
| AI | OpenAI Responses API with Structured Outputs |
| Local storage | Atomic JSON file repository |
| Vercel storage | Upstash Redis |
| Deployment | One Vercel Function plus CDN-served frontend assets |

The UI uses Inter for interface text and Times New Roman MT, with a Times New Roman fallback, for editorial display type.

## Run locally

You need Node.js 20 or newer.

```powershell
git clone <your-repository-url>
cd curio
npm install
Copy-Item .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API runs on port 3001 and Vite proxies `/api` requests to it.

An empty `.env` is enough for local development. Curio will use its built-in question and grading provider and store sessions in `data/sessions.json`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | Enables generated quizzes and model-based feedback |
| `OPENAI_MODEL` | No | Overrides the configured model |
| `UPSTASH_REDIS_REST_URL` | On Vercel | Upstash REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | On Vercel | Upstash REST credential |
| `SESSION_TTL_SECONDS` | No | Session lifetime; defaults to seven days |
| `PORT` | No | Local API port; defaults to 3001 |

Do not prefix server credentials with `VITE_`. Vite exposes variables with that prefix to the browser.

## Deploy to Vercel

Curio is arranged for Vercel’s zero-configuration Express support:

- [`app.ts`](./app.ts) exports the Express application as the serverless entrypoint.
- `npm run vercel-build` type-checks the project and builds the frontend.
- Vite writes the frontend to `public/`, which Vercel serves from its CDN.
- Express handles the `/api/*` routes as one Vercel Function.
- Production sessions are stored in Redis rather than the function filesystem.

### 1. Import the repository

Push the project to GitHub, GitLab, or Bitbucket, then choose **Add New → Project** in Vercel and import it.

Keep the project root at the repository root. The checked-in vercel.json pins the build command and public/ output directory, so repository configuration overrides stale dashboard values.

### 2. Add durable session storage

In the Vercel project:

1. Open **Storage** or the **Marketplace**.
2. Install **Upstash Redis**.
3. Create or select a Redis database.
4. Connect it to the Curio project.
5. Redeploy after the integration adds its environment variables.

The integration supplies `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Curio deliberately refuses to start on Vercel when they are missing; using the function filesystem would lose sessions between invocations.

See the [Vercel storage guide](https://vercel.com/docs/marketplace-storage) and [Upstash’s Vercel integration guide](https://upstash.com/docs/redis/howto/vercelintegration) for the dashboard steps.

### 3. Add OpenAI

In **Project Settings → Environment Variables**, add:

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6
```

Apply the variables to Production, Preview, and Development only where you want real model calls. If the key is absent, Curio uses its local provider.

### 4. Deploy

Trigger a deployment from the dashboard or run:

```powershell
npx vercel
npx vercel --prod
```

After deployment, verify:

- `https://your-domain.vercel.app/`
- `https://your-domain.vercel.app/api/health`

The health endpoint should return:

```json
{ "status": "ok" }
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the API and Vite dev server together |
| `npm run dev:api` | Runs only the Express API |
| `npm run dev:web` | Runs only the Vite frontend |
| `npm test` | Runs service and HTTP tests |
| `npm run build` | Type-checks everything and builds production assets |
| `npm start` | Serves the production build locally on port 3001 |

To test the production shape locally:

```powershell
npm run build
npm start
```

Then open [http://localhost:3001](http://localhost:3001).

## Project map

```text
curio/
├── app.ts                         # Vercel Express entrypoint
├── server/
│   ├── app.ts                     # HTTP routes and middleware
│   ├── catalog.ts                 # Curated topic catalog
│   ├── createApplication.ts       # Production dependency wiring
│   ├── learningService.ts         # Session rules
│   ├── quizProvider.ts            # Local and OpenAI providers
│   ├── sessionRepository.ts       # File and Redis repositories
│   └── validation.ts              # Request schemas
├── shared/
│   └── contracts.ts               # Types shared by browser and server
└── src/
    ├── api.ts                     # Browser API boundary
    ├── useLearningSession.ts      # Frontend session state
    └── components/                # Home, research, quiz, and result screens
```

The domain service does not know whether sessions live in a file or Redis, and the HTTP layer does not know whether quizzes come from the local provider or OpenAI. Those boundaries keep deployment concerns from leaking into the learning flow.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness check |
| `GET` | `/api/topics` | Full topic catalog |
| `GET` | `/api/topics/random` | Random topic, optionally excluding one |
| `POST` | `/api/sessions` | Start and persist a session |
| `PATCH` | `/api/sessions/:id/notes` | Save research notes |
| `POST` | `/api/sessions/:id/quiz` | Generate three questions |
| `POST` | `/api/sessions/:id/answers` | Grade the completed quiz |

Quiz and grading routes are rate-limited. Request bodies are size-limited and validated before reaching the domain service.

## Checks before merging

```powershell
npm test
npm run build
```

Both commands are expected to pass without an OpenAI key or Redis connection.

## Current scope

Curio is intentionally account-free. Sessions are addressed by a random identifier and expire automatically in Redis. Authentication, cross-device history, and scheduled review are good next steps, but they are not hidden inside this MVP.
