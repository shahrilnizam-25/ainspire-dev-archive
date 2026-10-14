# AiNspire - TM AI Readiness Platform

AiNspire is a Telekom Malaysia workforce AI-readiness platform. Employees complete a bilingual EN/BM readiness journey, receive a progressive AI contribution profile, and get role-aware learning and project recommendations. HR can review workforce analytics and generate team development plans.

## What It Does

The active journey contains:

- Department and current-role selection
- 20 structured questions across six readiness dimensions
- A pledge and consent step
- Deterministic readiness scoring from 1-to-4 answer scores
- Progressive contribution profiles based on overall readiness
- AI-generated narrative, strengths, gaps, project fit, and learning actions
- Optional English YouTube training recommendations with thumbnails
- HR dashboard, report export, skills-gap analysis, and 90-day action plans

The readiness score measures capability. The contribution profile describes the person's current way of contributing to AI work; it is not a seniority ranking.

## Assessment Dimensions

| Section | Dimension | Questions |
|---|---|---:|
| 1 | Cognitive Readiness | 4 |
| 2 | Behavioral Adoption | 4 |
| 3 | Skills Capability | 4 |
| 4 | Organisational / Environmental Exposure | 3 |
| 5 | Emotional Disposition | 3 |
| 6 | Economic Vulnerability | 2 |

The question set and EN/BM content are defined in `artifacts/tm-ai-persona/src/data/assessment.ts`.

## Progressive Profiles

The current profile bands are based on overall readiness:

| Overall readiness | Profile | Meaning |
|---:|---|---|
| 0-54% | Explorer | Building awareness and confidence through discovery |
| 55-69% | Builder | Applying AI practically in tools, workflows, and solutions |
| 70-84% | Strategist | Connecting AI capability to business outcomes and planning |
| 85-100% | Visionary | Leading transformational AI adoption and direction |

The authoritative scoring logic is in `artifacts/api-server/src/lib/assessmentScore.ts`. The LLM explains the scored result; it does not override the deterministic profile.

## Agentic MCP Layer

The backend uses the official TypeScript MCP SDK with an in-process MCP client/server workflow. The frontend contract remains unchanged.

MCP tools currently include:

- `calculate_readiness_score`
- `get_workforce_context`
- `find_project_matches`
- `get_learning_pathway`

The learning-pathway tool can optionally search YouTube for English training videos using the selected persona, department, role, and weakest readiness dimensions. YouTube metadata is normalized and thumbnails are served through the same-origin API proxy at `/api/youtube-thumbnail/:videoId`.

## AI Gateway

LLM calls use the TM API Gateway OAuth client-credentials flow in `artifacts/api-server/src/lib/llm.ts`.

Required environment variables:

| Variable | Description |
|---|---|
| `TM_APIGATE_CLIENT_ID` | API Gateway OAuth client ID |
| `TM_APIGATE_CLIENT_SECRET` | API Gateway OAuth client secret |
| `TM_APIGATE_CHAT_KEY` | LiteLLM/API Gateway chat key |
| `TM_LLM_MODEL` | Model name, normally `gpt-oss-20b` |

The database uses PostgreSQL through Drizzle ORM. Set `DATABASE_URL` to a PostgreSQL connection string before running database commands or enabling persistence.

The client caches access tokens, refreshes them before expiry, sends the gateway headers, and retries once after a 401 response.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/healthz` | API health check |
| `POST` | `/api/classify` | Score an assessment and generate a profile |
| `POST` | `/api/action-plan` | Generate an HR team action plan |
| `GET` | `/api/youtube-thumbnail/:videoId` | Same-origin YouTube thumbnail proxy |
| `POST` | `/api/events` | Persist frontend observability events |

The classify response includes `overallReadiness`, `dimensionScores`, `personaScores`, `persona`, narrative fields, recommendations, and optional video metadata.

## Languages

The supported languages are:

- English (`EN`)
- Bahasa Melayu (`BM`)

Both languages cover the active assessment, department flow, pledge, loading states, results, reports, and learning-path UI. Classification is prefetched for both languages when the assessment is submitted, so switching language does not trigger a second wait.

## Project Structure

```text
v1/
├── artifacts/
│   ├── api-server/
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── agent.ts
│   │       │   ├── assessmentScore.ts
│   │       │   ├── llm.ts
│   │       │   └── mcp.ts
│   │       └── routes/
│   │           ├── classify.ts
│   │           ├── actionPlan.ts
│   │           ├── health.ts
│   │           └── youtube.ts
│   └── tm-ai-persona/
│       └── src/
│           ├── App.tsx
│           ├── i18n.ts
│           ├── data/assessment.ts
│           └── components/
├── lib/
│   ├── api-spec/
│   ├── api-client-react/
│   ├── api-zod/
│   └── db/
├── render.yaml
└── README.md
```

## Running Locally

Prerequisites:

- Node.js 24+
- pnpm 11+

Install dependencies:

```sh
cd v1
pnpm install
```

Create `v1/.env` from `.env.example` and provide the TM API Gateway credentials. Add `YOUTUBE_API_KEY` if YouTube video recommendations are required, and optionally `YOUTUBE_API_KEY_BACKUP` as a second key for quota/auth fallback. The file is ignored by Git.

Start the API:

```sh
PORT=3001 pnpm --dir artifacts/api-server dev
```

Start the frontend in another terminal:

```sh
PORT=3000 API_PORT=3001 pnpm --dir artifacts/tm-ai-persona dev
```

Open `http://localhost:3000/`. The API health endpoint is `http://localhost:3001/api/healthz`.

## Validation Commands

```sh
pnpm --dir artifacts/api-server typecheck
pnpm --dir artifacts/api-server test
pnpm --dir artifacts/tm-ai-persona typecheck
pnpm --dir artifacts/tm-ai-persona build
```

The API test suite covers deterministic scoring and the MCP tool workflow. A live LLM or YouTube request is not required for the automated tests.

Database schema commands:

```sh
pnpm --dir lib/db generate
pnpm --dir lib/db migrate
```

`generate` creates SQL from the Drizzle schema. `migrate` applies committed migrations to the PostgreSQL database in `DATABASE_URL`. Do not run `push-force` against production.

## Render Deployment

`render.yaml` defines the API service. Configure these secrets in Render:

```text
TM_APIGATE_CLIENT_ID
TM_APIGATE_CLIENT_SECRET
TM_APIGATE_CHAT_KEY
DATABASE_URL
YOUTUBE_API_KEY
YOUTUBE_API_KEY_BACKUP
```

The Render build runs the API bundle from `artifacts/api-server`, and the service starts the compiled API on the configured `PORT`.

## YouTube Notes

YouTube search is optional. Without `YOUTUBE_API_KEY`, the learning path still returns text recommendations. With a key, the MCP learning tool searches for English training videos, caches no persistent user data, and returns titles, channels, durations, watch links, and same-origin thumbnails. API quota and YouTube policy limits still apply.

If `YOUTUBE_API_KEY_BACKUP` is also set, the MCP learning tool automatically retries with the backup key when the primary key returns a quota or auth error (HTTP 403/429), keeping video recommendations available if one key's daily quota is exhausted.

## Confidentiality

AiNspire is intended for internal Telekom Malaysia workforce-development use. Recommendations are advisory and should not be treated as automatic employment, promotion, or termination decisions. HR review and organisational policy remain required for consequential actions.
