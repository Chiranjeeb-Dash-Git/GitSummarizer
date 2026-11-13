<div align="center">

<img src="./assets/header.svg" width="100%" alt="GitSummarizer: repository intelligence"/>

<a href="https://github.com/Chiranjeeb-Dash-Git/GitSummarizer">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=20&duration=3200&pause=1200&color=D4AF37&center=true&vCenter=true&width=760&height=44&lines=Repository+intelligence%2C+distilled;Raw+codebases+into+architecture+overviews;Three+summary+kinds+for+three+audiences;Summaries+streamed+live+over+SSE;Gemini+%7C+Claude+%7C+OpenAI+behind+one+interface" alt="Animated tagline"/>
</a>

<br/>

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-OPEN-059669?style=for-the-badge&labelColor=080808)](https://gitsummarizer-puce.vercel.app/)
[![License](https://img.shields.io/badge/LICENSE-MIT-D4AF37?style=for-the-badge&labelColor=080808)](LICENSE)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-D4AF37?style=for-the-badge&labelColor=080808)](https://github.com/Chiranjeeb-Dash-Git/GitSummarizer/actions)

![React](https://img.shields.io/badge/React_18-080808?style=flat-square&logo=react&logoColor=D4AF37)
![Vite](https://img.shields.io/badge/Vite_5-080808?style=flat-square&logo=vite&logoColor=D4AF37)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-080808?style=flat-square&logo=tailwindcss&logoColor=D4AF37)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-080808?style=flat-square&logo=framer&logoColor=D4AF37)
![Node](https://img.shields.io/badge/Node.js_20-080808?style=flat-square&logo=nodedotjs&logoColor=D4AF37)
![Express](https://img.shields.io/badge/Express_4-080808?style=flat-square&logo=express&logoColor=D4AF37)
![Postgres](https://img.shields.io/badge/Neon_PostgreSQL-080808?style=flat-square&logo=postgresql&logoColor=D4AF37)
![Zod](https://img.shields.io/badge/Zod_3-080808?style=flat-square&logo=zod&logoColor=D4AF37)

<br/>

**[Live Demo](https://gitsummarizer-puce.vercel.app/)** &nbsp;·&nbsp; **[Architecture](#architecture)** &nbsp;·&nbsp; **[Features](#features)** &nbsp;·&nbsp; **[Tech Stack](#tech-stack)** &nbsp;·&nbsp; **[Quickstart](#quickstart)** &nbsp;·&nbsp; **[Configuration](#configuration)** &nbsp;·&nbsp; **[Deployment](#deployment)** &nbsp;·&nbsp; **[API](#api)** &nbsp;·&nbsp; **[Roadmap](#roadmap)** &nbsp;·&nbsp; **[Report an Issue](https://github.com/Chiranjeeb-Dash-Git/GitSummarizer/issues)**

</div>

<img src="./assets/divider.svg" width="100%" alt=""/>

## Overview

**GitSummarizer** turns any public GitHub repository, commit, or release range into plain-language summaries — streamed live to your browser.

Paste a GitHub link. The backend reads the repository through the GitHub REST API, builds a size-limited and safety-fenced context bundle, and asks the AI provider of your choice to write a structured Markdown summary. Text streams to the browser token by token over Server-Sent Events. Finished summaries are stored in Neon PostgreSQL and reused as a shared cache — repeat requests answer from the cache in about one second instead of re-calling GitHub and the model.

Three kinds of summary are offered:

| Kind | Input | Output |
| :--- | :--- | :--- |
| **Overview** | Repository link | What the project does, key features, stack, prerequisites, getting started, code layout, where to look first |
| **Release notes** | Repository or compare link | Recent commits grouped into highlights, new, improved, fixed, breaking and behind-the-scenes |
| **One commit** | Commit link | What changed, why it matters, files touched, risk and review notes |

Each can be written for three audiences: **Learners**, **Product teams**, or **Maintainers**.

<img src="./assets/divider.svg" width="100%" alt=""/>

## Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🔴 Live SSE streaming</h3>
      Summaries appear token by token over Server-Sent Events with five real pipeline stages (parse → github → context → ai → save). No polling loop.
    </td>
    <td width="50%" valign="top">
      <h3>🤖 Provider-agnostic AI</h3>
      Switch between Google Gemini, OpenAI and Anthropic with one environment variable (<code>AI_PROVIDER</code>). Both stream and report token usage.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>📦 Smart cache</h3>
      Commit summaries never expire. Overviews and release notes reuse for 24 hours. Signed-in users can force a fresh summary. Cache keyed by <code>(repo, kind, audience, ref, prompt_version, head_sha)</code>.
    </td>
    <td width="50%" valign="top">
      <h3>👤 User accounts</h3>
      Email + password accounts with an httpOnly JWT cookie. Reading history grouped by day. Save summaries with notes and up to 8 tags. Search and tag filter.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🔒 Hardened API</h3>
      Origin guard, per-IP and per-user rate limits (8/hour guests, 60/hour users), Zod request validation, bcrypt passwords, structured pino logging with request IDs.
    </td>
    <td width="50%" valign="top">
      <h3>🎨 Strata design system</h3>
      Custom design system in Tailwind CSS v4. Layered earth & mineral colours, flat slab shadows, Framer Motion, Lenis smooth scroll. Light (Daylight) + dark (Basalt) themes.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🔗 Flexible link parser</h3>
      Accepts repo links, <code>owner/repo</code>, SSH URLs, branch links, commit links (<code>/commit/sha</code>) and compare ranges (<code>base...head</code>). Rejects non-GitHub hosts with clear messages.
    </td>
    <td width="50%" valign="top">
      <h3>📄 Permanent summaries</h3>
      Every summary gets a permanent URL at <code>/r/:id</code>. Copy Markdown, download <code>.md</code>, or share the link. Dashboard with 30-day stats.
    </td>
  </tr>
</table>

<img src="./assets/divider.svg" width="100%" alt=""/>

## Architecture

<img src="./assets/architecture.svg" width="100%" alt="GitSummarizer architecture and request flow"/>

### Request lifecycle

```
Browser                     API (/api/v1)               GitHub        AI         Neon
   │ POST /summaries/stream  │                              │            │           │
   │────────────────────────▶│ validate · rate limit         │            │           │
   │◀─ stage: parse ─────────│ parse link                    │            │           │
   │◀─ stage: github ────────│────── repo metadata ─────────▶│            │           │
   │◀─ meta ─────────────────│◀────────────────────────────│            │           │
   │                         │──────────── upsert repository ──────────────────────▶│
   │                         │──────────── look for cached summary ─────────────────▶│
   │  cache HIT:             │◀────────────────────────────────────────────────────│
   │◀─ stage: cache, delta ──│ (done, cached=true)                                  │
   │  cache MISS:            │                              │            │           │
   │◀─ stage: context ───────│── README, commits, diffs ───▶│            │           │
   │◀─ stage: ai ────────────│──────── fenced prompt ────────────────────▶│           │
   │◀─ delta… delta… ────────│◀─────── streamed Markdown ───────────────│           │
   │◀─ stage: save ──────────│────────────── upsert summary + history ───────────────▶│
   │◀─ done ─────────────────│                                                      │
```

> If the browser disconnects, the API aborts the AI call and stores nothing.

### Engineering decisions

| Decision | Reason |
| :--- | :--- |
| Server-Sent Events | One-way token stream over plain HTTP — no polling, no extra protocol |
| Neon serverless PostgreSQL with pooled connection string | Suited to serverless runtimes where long-lived TCP connections are impractical |
| Cache keyed by `(repo, kind, audience, ref, prompt_version, head_sha)` | Avoids repeat GitHub and model calls; changing `PROMPT_VERSION` invalidates everything at once |
| `AI_PROVIDER` env var behind a provider interface | Swap models without touching application code |
| Repository text fenced inside `<repo_data>` tags | Prompt injection defence — declared untrusted in the system prompt |
| Parameterised SQL queries only | No SQL injection surface |
| httpOnly JWT cookie | Token never accessible to JavaScript |
| `helmet` + HSTS + `SameSite` cookies | Transport and CSRF protection |

<img src="./assets/divider.svg" width="100%" alt=""/>

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS v4 (custom `@theme`, no defaults), Framer Motion, Lenis |
| **State & data** | Zustand, TanStack React Query, React Router |
| **Markdown** | react-markdown, remark-gfm, rehype-highlight, rehype-slug |
| **Backend** | Node.js 20, Express 4, ES modules (`"type": "module"`) |
| **Validation** | Zod 3 (env, request bodies, queries) |
| **Database** | Neon serverless PostgreSQL, `pg` driver, SQL migrations (no ORM) |
| **Auth** | jsonwebtoken, bcryptjs, cookie-parser |
| **Security** | helmet, cors, express-rate-limit, origin guard |
| **Logging** | pino, pino-http (structured JSON, request IDs, secret redaction) |
| **AI providers** | Google Gemini, OpenAI (`openai` SDK), Anthropic (`@anthropic-ai/sdk`) |
| **Integrations** | GitHub REST API, Resend (email verification) |
| **Testing** | Node.js built-in test runner (backend), Vitest (frontend) |
| **CI** | GitHub Actions |
| **Hosting** | Vercel (live), Render-compatible (`render.yaml` included) |

<img src="./assets/divider.svg" width="100%" alt=""/>

## Data Model

```
users 1────* search_history *────1 summaries *────1 repositories
users 1────* saved_summaries *────1 summaries
```

| Table | Purpose |
| :--- | :--- |
| `users` | Accounts — `id` UUID, `email` CITEXT unique, `password_hash`, `display_name` |
| `repositories` | Cached public repository metadata — `full_name`, stars, forks, language, topics, license |
| `summaries` | Generated summaries and shared cache — `kind`, `audience`, `ref`, `head_sha`, `content_md`, token counts, `latency_ms` |
| `search_history` | One row per reading by a signed-in user — cursor-paginated |
| `saved_summaries` | User saves — `note` (500 chars), `tags[]` (up to 8), GIN-indexed for tag search |
| `schema_migrations` | Applied migration names |

Summary cache key: `UNIQUE (repository_id, kind, audience, ref, prompt_version, head_sha)`

<img src="./assets/divider.svg" width="100%" alt=""/>

## API

Base path: `/api/v1`  
Success: `{ "data": ... }` · Error: `{ "error": { "code", "message", "details", "requestId" } }`

| Method & Path | Auth | Purpose |
| :--- | :--- | :--- |
| `GET /health` | none | Liveness check |
| `GET /health/ready` | none | Database readiness |
| `POST /auth/register` | none | Create account |
| `POST /auth/login` | none | Sign in (sets httpOnly cookie) |
| `POST /auth/logout` | none | Sign out |
| `GET /auth/me` | optional | Current user |
| `GET /repos/preview?input=` | none | Parse link → repository details |
| `POST /summaries/stream` | optional | Generate summary (SSE stream) |
| `GET /summaries/:id` | optional | Read a stored summary |
| `GET /history` | required | Reading history (cursor paginated) |
| `DELETE /history/:id` | required | Delete one history entry |
| `DELETE /history` | required | Delete all history |
| `GET /saved` | required | Saved summaries (search + tag filter) |
| `POST /saved` | required | Save a summary |
| `PATCH /saved/:id` | required | Update note or tags |
| `DELETE /saved/:id` | required | Remove a save |
| `GET /me/stats` | required | Dashboard figures (30-day reads, repos, top language) |

**SSE stream events:** `stage` · `meta` · `delta` · `done` · `error`

<img src="./assets/divider.svg" width="100%" alt=""/>

## AI Pipeline

1. **Input guard** — Repository text is fenced inside `<repo_data>` tags and declared untrusted in the system prompt. Closing tags inside data are neutralised.
2. **Size limits** — README 18,000 chars; commit messages 500 chars; 100 commits max; 30 files and 22,000 chars of diff per commit; lock files, minified files and build folders are skipped.
3. **Prompts** — One system prompt and one task prompt per kind, plus an audience instruction. Output is Markdown only, starts with a level-1 heading, and follows a fixed section list.
4. **Honesty rules** — State only what the data supports; use "likely" when inferring; never invent URLs, versions or commands.
5. **Output limit** — `AI_MAX_OUTPUT_TOKENS` (default 1800).
6. **Token tracking** — Provider, model, `tokens_in`, `tokens_out` and `latency_ms` stored per summary.

<img src="./assets/divider.svg" width="100%" alt=""/>

## Quickstart

**Prerequisites:** Node.js ≥ 20.11 · npm 10+ · Git · a Neon account · one AI provider key

```bash
# 1. Clone
git clone https://github.com/Chiranjeeb-Dash-Git/GitSummarizer.git
cd GitSummarizer

# 2. Install (root + backend + frontend)
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Configure environment variables (see Configuration below)
cp backend/.env.example backend/.env
# fill in DATABASE_URL, JWT_SECRET, and your AI provider key

# 4. Run migrations to create tables
cd backend && npm run migrate && cd ..

# 5. Start development servers (two terminals)
npm run dev:api    # backend  → http://localhost:8080
npm run dev:web    # frontend → http://localhost:5173

# 6. Run tests
npm test
```

<img src="./assets/divider.svg" width="100%" alt=""/>

## Configuration

**`backend/.env`**

```ini
NODE_ENV=development
PORT=8080

# CORS — comma-separated allowed origins
CLIENT_ORIGIN=http://localhost:5173

# Neon PostgreSQL
# Pooled connection string for the app:
DATABASE_URL=postgresql://<user>:<password>@<pooler-host>.neon.tech/neondb?sslmode=require
# Direct (unpooled) string for migrations:
DATABASE_URL_UNPOOLED=postgresql://<user>:<password>@<host>.neon.tech/neondb?sslmode=require

# Auth
JWT_SECRET=                         # openssl rand -hex 32  (must be ≥ 32 chars)
JWT_EXPIRES_IN=7d
COOKIE_NAME=gs_session
COOKIE_SAMESITE=lax                 # 'none' for cross-site setups
COOKIE_DOMAIN=                      # .example.com for sibling subdomains

# GitHub (optional — raises rate limit from 60 → 5000 req/hr)
GITHUB_TOKEN=

# AI provider — choose one
AI_PROVIDER=anthropic               # 'anthropic' | 'openai'
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-haiku-5-5
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
AI_MAX_OUTPUT_TOKENS=1800
PROMPT_VERSION=v1                   # bump to invalidate all cached summaries
SUMMARY_TTL_HOURS=24

# Single-service deployment — set true to serve frontend/dist from Express
SERVE_CLIENT=false
LOG_LEVEL=info
```

**`frontend/.env`**

```ini
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

> **Notes**
> - Generate a strong JWT secret: `openssl rand -hex 32`
> - For local email testing, point Resend at an emulator with `RESEND_BASE_URL`.
> - Never commit `.env` files — only commit `.env.example` placeholders.
> - Model names change. Confirm `ANTHROPIC_MODEL` / `OPENAI_MODEL` against provider docs before going live.

<img src="./assets/divider.svg" width="100%" alt=""/>

## Deployment

### Vercel (live)

The project deploys to **[Vercel](https://vercel.com)** as a monorepo — **[live deployment](https://gitsummarizer-puce.vercel.app/)**.

1. Push the repository to GitHub.
2. In Vercel, choose **Add New Project** and import the repository.
3. Set the environment variables from the table below.
4. Deploy — Vercel builds the client bundle and serves the API through serverless functions.

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` | Neon pooled connection string |
| `DATABASE_URL_UNPOOLED` | Neon direct connection string (for migrations) |
| `AI_PROVIDER` | `anthropic` or `openai` |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | The key matching `AI_PROVIDER` |
| `ANTHROPIC_MODEL` / `OPENAI_MODEL` | Model name (check provider docs) |
| `JWT_SECRET` | 32+ character random string |
| `CLIENT_ORIGIN` | Exact public origin, e.g. `https://gitsummarizer-puce.vercel.app` |
| `NODE_ENV` | `production` |
| `GITHUB_TOKEN` | Optional — raises GitHub rate limit |

### Render (single service)

A `render.yaml` blueprint is included for one-command Render deployment.

1. In Render choose **New → Blueprint** and select this repository.
2. Set `DATABASE_URL`, `JWT_SECRET` and your AI key in the Render dashboard.
3. Run `npm run migrate` once against the Neon direct connection string.
4. `SERVE_CLIENT=true` causes Express to serve `frontend/dist` as the SPA.

> **Split deployment (optional):** Host the static frontend separately and set `VITE_API_BASE_URL` at build time and `CLIENT_ORIGIN` / `COOKIE_DOMAIN` on the backend. Use sibling subdomains — Safari blocks cross-site cookies.

<img src="./assets/divider.svg" width="100%" alt=""/>

## Security

| Topic | Control |
| :--- | :--- |
| Transport | HTTPS in production, `Secure` cookies, HSTS via `helmet` |
| Sessions | JWT in an httpOnly cookie; bcrypt (cost 12) passwords; equalised login timing |
| CSRF | `SameSite` cookies + origin guard on all non-safe methods |
| Input | Zod validation on every body, query and param; 10 kB body limit |
| SQL | Parameterised queries only — no ORM escape hatch |
| SSRF | Only `api.github.com` and the AI provider are ever called |
| Prompt injection | Fenced, untrusted, size-limited repository text; Markdown-only output rendered without raw HTML |
| Abuse | 8 reads/hour (guests), 60 reads/hour (users), stricter limits on auth endpoints |
| Secrets | Environment variables only; `.env` git-ignored; never in the frontend bundle |
| Logging | Structured logs, request IDs, redaction of cookies, headers and passwords |

<img src="./assets/divider.svg" width="100%" alt=""/>

## Troubleshooting

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| Server exits: "Invalid environment configuration" | Missing or short variable | Check `DATABASE_URL`, `JWT_SECRET` (≥ 32 chars), and the key for `AI_PROVIDER` |
| First request after idle is slow | Neon compute waking up | Retry — pool allows 15 s; use the pooled connection string |
| `npm run migrate` fails on `CREATE EXTENSION` | Insufficient rights | Use the **direct** (`DATABASE_URL_UNPOOLED`) string with the owner role |
| Summary text appears all at once | Proxy buffering the stream | Keep `X-Accel-Buffering: no`; avoid compression on `text/event-stream`; test with `curl -N` |
| Sign in works locally but not when deployed | Cookie domain / SameSite mismatch | Use single-service deployment, or sibling subdomains with `COOKIE_DOMAIN` |
| `ORIGIN_DENIED` on every POST | `CLIENT_ORIGIN` does not match browser origin | Set exact public origin including `https://` |
| `GITHUB_RATE_LIMITED` quickly | No token | Add `GITHUB_TOKEN` |
| AI 401 or 404 errors | Wrong key or model name | Check `*_API_KEY` and `*_MODEL` against provider docs |
| Blank page after build | SPA fallback missing | Set `SERVE_CLIENT=true`; ensure `frontend/dist` exists at runtime |

<img src="./assets/divider.svg" width="100%" alt=""/>

## Roadmap

- [ ] Redis-backed rate limiting for multi-instance deployments
- [ ] GitHub OAuth and private repository support with the user's own token
- [ ] Pull-request summaries and issue digests
- [ ] Repository watch mode — email release notes when new commits land
- [ ] Team workspaces and shared collections
- [ ] Open Graph preview images for `/r/:id` permanent pages
- [ ] Browser extension: "Read in plain language" button on GitHub pages
- [ ] Additional summary languages

<img src="./assets/divider.svg" width="100%" alt=""/>

## Contributing

Issues and pull requests are welcome. Fork the repository, create a feature branch, and open a pull request describing the change. Bugs and feature requests go to [GitHub Issues](https://github.com/Chiranjeeb-Dash-Git/GitSummarizer/issues).

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Lint
npm run lint       # in backend/ or frontend/
```

## License

Released under the **MIT License**. See [`LICENSE`](LICENSE).

> ⚠️ **Note:** A `LICENSE` file does not currently exist in this repository. The badge and link above will be broken until one is added.

<div align="center">

<img src="./assets/footer.svg" width="100%" alt="Designed and engineered by Chiranjeeb Dash"/>

</div>
