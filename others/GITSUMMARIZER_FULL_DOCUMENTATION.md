# GitSummarizer: Full Project Documentation

**An AI-powered web application that turns any public GitHub repository, commit or release range into plain-language summaries.**
Stack: **React (Vite) · Tailwind CSS · Node.js · Express · Neon PostgreSQL · GitHub REST API · OpenAI or Anthropic**

This is the master document. It defines the product, architecture, data model, API contract, DevOps and the build order. Two companion files hold the code-level detail:

| File | Contents |
|---|---|
| `GITSUMMARIZER_FULL_DOCUMENTATION.md` (this file) | Product, architecture, contracts, DevOps, build order, master checklist |
| `GITSUMMARIZER_BACKEND.md` | Complete backend code and specification (`backend/`) |
| `GITSUMMARIZER_FRONTEND.md` | Complete frontend design system, code and specification (`frontend/`) |

> **Note on the stack name.** The classic MERN stack uses MongoDB. This project keeps the M-E-R-N layers (Express, React, Node) and uses **Neon serverless PostgreSQL** as the database, as required. Nothing in this project uses Python, FastAPI, SQLite or MongoDB. The earlier draft of the project document that mentioned FastAPI and SQLite is superseded by this one, and the week-by-week schedule has been replaced by the build order in section 18.

---

## 0. Build it with Google Antigravity

1. Create an empty folder named `gitsummarizer`. Inside it make a `docs/` folder and place all three files there.
2. Open the folder in Antigravity.
3. Paste the prompt below into the agent.
4. When the agent asks, provide the secrets listed in section 15.3 (Neon connection strings, one AI provider key, optionally a GitHub token). Never paste secrets into the documents.

**Kickoff prompt (copy and paste):**

```
Build the GitSummarizer project from the three specification files in ./docs:
GITSUMMARIZER_FULL_DOCUMENTATION.md, GITSUMMARIZER_BACKEND.md and GITSUMMARIZER_FRONTEND.md.
Read all three completely before writing any code.

Rules:
- Stack is fixed: React 18 + Vite + Tailwind CSS v4 (frontend), Node.js 20 + Express 4 (backend), Neon PostgreSQL via the pg driver. JavaScript with ES modules only. No Python, no TypeScript, no ORM, no UI kit.
- Create the monorepo exactly as laid out in section 7 of the full documentation: frontend/, backend/, plus the root files in section 15.
- Copy code from the specifications verbatim where it is given; implement from the written spec where it is not.
- The frontend must follow the Strata design system exactly. Do not use any default theme or colour palette, and do not use blue or purple.
- Follow the build order in section 18 of the full documentation. After each stage run its verification commands and fix problems before moving on.
- Ask me only for secrets and for decisions that the documents leave open. Record any judgement call in README.md under "Decisions".
- Finish by running every checklist in section 19 and report the result line by line.
```

---

## 1. Introduction

GitSummarizer lets people understand a codebase without reading all of it. A user pastes a GitHub link; the backend reads the public repository through the GitHub REST API, builds a size-limited and safety-fenced text bundle, and asks a large language model to write a structured Markdown summary, which streams to the browser as it is written. Summaries are stored, reused as a shared cache, and linked to the signed-in user's history and saved collection.

Three kinds of summary are offered:

| Kind | Input | Output |
|---|---|---|
| **Overview** | Repository link | What the project does, key features, stack, prerequisites, getting started, code layout, where to look first |
| **Release notes** | Repository link or compare link | Recent commits (or a range) grouped into highlights, new, improved, fixed, breaking and behind-the-scenes changes |
| **One commit** | Commit link | The change explained: what changed, why it likely matters, files touched, risk and review notes |

Each can be written for one of three audiences: **learners**, **product teams** or **maintainers**.

---

## 2. Use cases

| Persona | Need | How GitSummarizer helps |
|---|---|---|
| Junior developers and students | Understand an open-source repository without being overwhelmed by dense documentation | Overview written for learners with jargon defined |
| Product managers and stakeholders | Turn technical commits into business-friendly release notes | Release notes written for product teams, focused on impact |
| Open-source maintainers | Give new contributors a fast, accurate first read, and draft changelogs | Maintainer-level overviews, compare-range release notes, one-commit explanations for review |

### User stories

1. As a visitor I can paste a link and read a summary without creating an account.
2. As a visitor I am told clearly when I have used my free reads and how to continue.
3. As a user I can create an account, sign in and sign out.
4. As a user my readings appear in a history grouped by day, which I can delete from.
5. As a user I can save a summary with a note and tags, find it by search or tag, edit it and remove it.
6. As a user I can copy a summary as Markdown, download it, or share a permanent link to it.
7. As a user I can force a fresh summary instead of a cached one.
8. As a user I see exactly what the system is doing while I wait and a useful explanation when something fails.

---

## 3. Scope

### 3.1 Functional requirements

| ID | Requirement |
|---|---|
| F-01 | Accept repository, `owner/repo`, SSH, branch, commit and compare links; reject other hosts and malformed links with a clear message. |
| F-02 | Show a live repository preview (avatar, name, language, stars, description) as soon as a link resolves. |
| F-03 | Generate overview, release-note and commit summaries for three audiences, streamed over Server-Sent Events. |
| F-04 | Show five real pipeline stages (read link, fetch details, read material, write, save) while generating. |
| F-05 | Render Markdown safely with code highlighting, a section rail and copy buttons on code. |
| F-06 | Cache summaries: commits forever, overviews and release notes for 24 hours; signed-in users can refresh. |
| F-07 | Email and password accounts with an httpOnly session cookie. |
| F-08 | Per-user reading history with cursor pagination, single and bulk delete. |
| F-09 | Saved summaries with note (500 characters), up to 8 tags, search and tag filter. |
| F-10 | Permanent summary pages at `/r/:id`. |
| F-11 | Dashboard sentence of figures: reads in 30 days, repositories, saved count, top language. |
| F-12 | Copy Markdown, download `.md`, copy link. |
| F-13 | Light and dark themes with a circular reveal, persisted. |
| F-14 | Command palette (`Ctrl K` or `⌘K`) and `/` to focus the link field. |
| F-15 | Handle GitHub rate limits, missing or private repositories, empty repositories, AI failures and network loss with specific messages. |
| F-16 | Rate limit guests (8 reads per hour) and users (60 per hour). |

### 3.2 Out of scope for this release

Private repositories, GitHub sign-in, pull-request summaries, team workspaces, billing, email notifications, languages other than English.

---

## 4. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | First summary text within about 3 seconds of submitting on a typical repository; cached summaries in about 1 second; home route JavaScript 180 KB gzip or less; Lighthouse performance 90 or higher. |
| Reliability | Graceful behaviour on every upstream failure; no unhandled promise rejections; health endpoints for the host. |
| Security | See section 12. |
| Accessibility | WCAG 2.2 AA intent: keyboard operable, visible focus, 4.5:1 contrast in both themes, reduced-motion support. |
| Privacy | Public repositories only; no source code stored; clear disclosure that text is sent to an AI provider. |
| Maintainability | Layered backend (routes, controllers, services, repositories), SQL isolated in repositories, validated environment, tests for the riskiest logic. |
| Cost control | Shared summary cache, input size limits, output token limit, per-user and per-IP rate limits. |

---

## 5. Technology stack

| Layer | Choice | Why |
|---|---|---|
| UI | React 18, Vite | Fast development and builds, huge ecosystem |
| Styling | Tailwind CSS v4 with a custom `@theme` that removes every default colour | Design tokens as CSS variables; two themes without duplicating components |
| Motion | Framer Motion, Lenis | Layout animations, springs, scroll smoothing; all respect reduced motion |
| Routing and data | React Router, TanStack Query, Zustand | Routing, server state and small UI state |
| Markdown | react-markdown, remark-gfm, rehype-highlight, rehype-slug | Safe Markdown without raw HTML |
| Backend | Node.js 20, Express 4 | The "E" and "N" of MERN; simple and well understood |
| Database | Neon serverless PostgreSQL, `pg` driver, SQL migrations | Required database; relational fit for users, repositories, summaries |
| Validation | zod | One schema language for environment and requests |
| Security libraries | helmet, cors, express-rate-limit, bcryptjs, jsonwebtoken, cookie-parser | Standard, audited building blocks |
| Logging | pino, pino-http | Structured logs with request ids and redaction |
| AI | OpenAI or Anthropic SDK behind a provider interface | Switch with one environment variable |
| External data | GitHub REST API (`api.github.com`) | Repository, README, commits, diffs, compare |
| Hosting | Render (single service) or a split static host plus Render; Neon for data | See section 15 |

---

## 6. Architecture

### 6.1 System diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       React frontend                         │
│   Vite · Tailwind (Strata tokens) · Framer Motion · Query    │
└───────────────┬─────────────────────────────▲───────────────┘
                │ JSON requests               │ Server-Sent Events
                │ + httpOnly cookie           │ (stage, meta, delta, done, error)
                ▼                             │
┌─────────────────────────────────────────────┴───────────────┐
│                  Express API  /api/v1                         │
│  helmet · cors · rate limits · origin guard · zod · pino      │
│  routes → controllers → services → repositories               │
└───────┬────────────────────┬─────────────────────┬───────────┘
        │ 1. repo, README,    │ 2. fenced, size-    │ 3. read and write
        │    commits, diffs   │    limited prompt   │    summaries, users,
        ▼                     ▼                     │    history, saves
┌───────────────┐    ┌─────────────────┐            ▼
│ GitHub REST   │    │ OpenAI /        │    ┌──────────────────┐
│ API           │    │ Anthropic       │    │ Neon PostgreSQL   │
└───────────────┘    └─────────────────┘    └──────────────────┘
```

### 6.2 Request flow for a summary

```
Browser                     API                          GitHub        AI         Neon
   │ POST /summaries/stream  │                              │            │           │
   │────────────────────────▶│ validate, rate limit          │            │           │
   │◀─ event: stage parse ───│ parse link                    │            │           │
   │◀─ event: stage github ──│───────── repo metadata ──────▶│            │           │
   │◀─ event: meta ──────────│◀─────────────────────────────│            │           │
   │                         │──────────── upsert repository ───────────────────────▶│
   │                         │──────────── look for fresh summary ──────────────────▶│
   │                  hit?   │◀─────────────────────────────────────────────────────│
   │◀─ stage cache, delta ───│  (done, cached = true)                                  │
   │  miss:                  │                              │            │           │
   │◀─ event: stage context ─│── README, commits, diffs ───▶│            │           │
   │◀─ event: stage ai ──────│──────── fenced prompt ───────────────────▶│           │
   │◀─ event: delta … ───────│◀─────── streamed Markdown ───────────────│           │
   │◀─ event: stage save ────│──────────── upsert summary, add history ─────────────▶│
   │◀─ event: done ──────────│                                                        │
```

If the browser disconnects, the API aborts the AI call and stores nothing.

### 6.3 Cache logic

A summary is identified by `(repository, kind, audience, ref, prompt_version, head_sha)`.

- `ref` is the branch for overviews, `last:N@branch` or `base...head` for release notes, and the full commit hash for commits.
- Commit summaries never expire. Other kinds are reused for `SUMMARY_TTL_HOURS` (24).
- Changing `PROMPT_VERSION` invalidates everything at once.
- Signed-in users can bypass the cache with Refresh.

### 6.4 Error strategy

Every failure carries a stable `code` and a plain-language `message`. The API never leaks stack traces. The frontend maps codes to titles and next steps. Unknown errors are logged with a request id that is also returned to the client.

---

## 7. Repository layout

```
gitsummarizer/
├─ docs/                              the three specification files
├─ .github/workflows/ci.yml
├─ .gitignore
├─ package.json                       root scripts
├─ render.yaml
├─ README.md
├─ backend/                           see GITSUMMARIZER_BACKEND.md section 3
└─ frontend/                          see GITSUMMARIZER_FRONTEND.md section 6
```

---

## 8. Data model (Neon PostgreSQL)

```
users 1───* search_history *───1 summaries *───1 repositories
users 1───* saved_summaries *───1 summaries
```

| Table | Purpose | Key columns |
|---|---|---|
| `users` | Accounts | `id` UUID, `email` CITEXT unique, `password_hash`, `display_name` |
| `repositories` | Cached public repository details | `full_name` lowercase unique, `owner`, `name`, `description`, `stars`, `language`, `topics[]`, `default_branch`, `license`, `pushed_at` |
| `summaries` | Generated summaries and the shared cache | `repository_id`, `kind`, `audience`, `ref`, `head_sha`, `title`, `content_md`, `provider`, `model`, `prompt_version`, token counts, `latency_ms` |
| `search_history` | One row per reading by a signed-in user | `user_id`, `summary_id`, `query_input`, `created_at` |
| `saved_summaries` | A user's saves | `user_id`, `summary_id`, `note`, `tags[]`, unique per user and summary |
| `schema_migrations` | Applied migrations | `name`, `applied_at` |

The authoritative SQL is `migrations/001_init.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE repositories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner           TEXT NOT NULL,
  name            TEXT NOT NULL,
  full_name       TEXT NOT NULL UNIQUE,
  description     TEXT,
  html_url        TEXT NOT NULL,
  avatar_url      TEXT,
  stars           INTEGER NOT NULL DEFAULT 0,
  forks           INTEGER NOT NULL DEFAULT 0,
  language        TEXT,
  topics          TEXT[] NOT NULL DEFAULT '{}',
  default_branch  TEXT NOT NULL DEFAULT 'main',
  license         TEXT,
  pushed_at       TIMESTAMPTZ,
  last_fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE summary_kind AS ENUM ('overview', 'release_notes', 'commit');
CREATE TYPE audience_kind AS ENUM ('learner', 'product', 'maintainer');

CREATE TABLE summaries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id  UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  kind           summary_kind NOT NULL,
  audience       audience_kind NOT NULL,
  ref            TEXT NOT NULL,
  head_sha       TEXT NOT NULL,
  title          TEXT NOT NULL,
  content_md     TEXT NOT NULL,
  provider       TEXT NOT NULL,
  model          TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  tokens_in      INTEGER,
  tokens_out     INTEGER,
  latency_ms     INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT summaries_cache_key UNIQUE (repository_id, kind, audience, ref, prompt_version, head_sha)
);
CREATE INDEX idx_summaries_lookup ON summaries (repository_id, kind, audience, ref, prompt_version, created_at DESC);

CREATE TABLE search_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_id  UUID NOT NULL REFERENCES summaries(id) ON DELETE CASCADE,
  query_input TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_history_user_created ON search_history (user_id, created_at DESC, id DESC);

CREATE TABLE saved_summaries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_id UUID NOT NULL REFERENCES summaries(id) ON DELETE CASCADE,
  note       TEXT NOT NULL DEFAULT '',
  tags       TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, summary_id)
);
CREATE INDEX idx_saved_user_created ON saved_summaries (user_id, created_at DESC);
CREATE INDEX idx_saved_tags ON saved_summaries USING GIN (tags);
CREATE TRIGGER saved_updated_at BEFORE UPDATE ON saved_summaries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## 9. API contract

Base path `/api/v1`. Success bodies are `{ "data": ... }`. Errors are `{ "error": { "code", "message", "details", "requestId" } }`. The complete request and response shapes, error code table and controller code are in `GITSUMMARIZER_BACKEND.md` section 14.

| Method and path | Auth | Purpose |
|---|---|---|
| `GET /health`, `GET /health/ready` | none | Liveness, database readiness |
| `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | none or optional | Accounts and session |
| `GET /repos/preview?input=` | none | Parse a link and return repository details |
| `POST /summaries/stream` | optional | Generate a summary as an event stream |
| `GET /summaries/:id` | optional | Read a stored summary |
| `GET /history`, `DELETE /history/:id`, `DELETE /history` | required | Reading history |
| `GET /saved`, `POST /saved`, `PATCH /saved/:id`, `DELETE /saved/:id` | required | Saved summaries |
| `GET /me/stats` | required | Dashboard figures |

Stream events: `stage`, `meta`, `delta`, `done`, `error`.

---

## 10. AI pipeline

1. **Input.** Repository text from GitHub is fenced inside `<repo_data>` tags and declared untrusted in the system prompt. Closing tags inside the data are neutralised.
2. **Size limits.** README 18,000 characters; commit messages 500; 100 commits; 30 files and 22,000 characters of diff for a commit; lock files, minified files and build folders skipped.
3. **Prompts.** One system prompt and one task prompt per kind, plus an audience instruction. Output is Markdown only, starts with a level-1 heading, and follows a fixed section list per kind. Full text in backend section 9.
4. **Honesty rules.** State only what the data supports; say "likely" when inferring intent; never invent URLs, versions or commands.
5. **Provider.** `AI_PROVIDER=anthropic` or `openai`. Both stream; both report token usage, which is stored.
6. **Output limit.** `AI_MAX_OUTPUT_TOKENS` (default 1800).

---

## 11. GitHub integration

Calls made (all to `api.github.com`, with an optional token raising the limit from 60 to 5,000 requests per hour): repository, README (raw), root contents, languages, commits, single commit, compare. Responses are cached in memory for five minutes. Rate-limit responses become `GITHUB_RATE_LIMITED` with a retry time; 404 becomes a specific not-found error; empty repositories return no commits; private repositories are refused even if a token could read them. User links are parsed, never fetched, so the server cannot be steered to other hosts.

---

## 12. Security and privacy

| Topic | Control |
|---|---|
| Transport | HTTPS in production, `Secure` cookies, HSTS from helmet |
| Sessions | JWT in an httpOnly cookie; bcrypt (cost 12) passwords; equalised login timing |
| CSRF | `SameSite` cookies plus an origin guard on all non-safe methods |
| Input | zod validation on every body, query and parameter; 10 kB body limit |
| SQL | Parameterised queries only |
| SSRF | Only `api.github.com` and the AI provider are ever called |
| Prompt injection | Fenced, untrusted, size-limited repository text; Markdown-only output rendered without raw HTML |
| Abuse | Per-IP and per-user rate limits; auth endpoint limits |
| Secrets | Environment variables only; `.env` ignored by git; never in the frontend |
| Logging | Structured logs, request ids, redaction of cookies, headers and passwords |
| Privacy | Public repositories only; no source code stored; disclosure that README and commit text go to an AI provider |

---

## 13. Frontend overview

The interface follows the **Strata** design system, fully defined in `GITSUMMARIZER_FRONTEND.md`.

- **Concept.** A repository is a stack of history; the interface uses layered bands in earth and mineral colours, flat slabs with hard offset shadows, and one memorable moment: raw commit lines translated into plain English, layer by layer.
- **Palette.** Daylight (lichen-grey paper, ink green-black) and Basalt (deep peat). Accents: malachite, oxide, ochre, verdigris, clay, sand. No blue or purple. Tailwind's default colours are removed.
- **Type.** Bricolage Grotesque (display), Instrument Sans (text), Martian Mono (code only).
- **Motion.** Framer Motion and Lenis; one orchestrated hero sequence; the route wipe, drill loader, theme reveal, section rail and save feedback respond to actions; everything respects reduced motion.

| Route | Page | Access |
|---|---|---|
| `/` | Hero with analyzer form and translation stack, reading ways, audiences, samples, FAQ | public |
| `/read` | Streaming reading from query parameters `input`, `kind`, `audience` | public |
| `/r/:id` | Permanent summary page | public |
| `/dashboard` | Figures, history, saved | signed in |
| `/login`, `/register` | Authentication | public |
| `*` | Not found | public |

---

## 14. Observability and operations

- **Logs.** JSON logs in production with request id, route, status and latency; health checks are not logged. Pipe to the host's log viewer.
- **Health.** `GET /api/v1/health` for the host's health check; `GET /api/v1/health/ready` checks the database.
- **Usage.** Each summary stores provider, model, token counts and latency, so cost and speed can be reviewed with SQL, for example average `latency_ms` and sum of `tokens_out` per day.
- **Backups.** Rely on Neon's built-in history and branching; create a branch before risky migrations.
- **Secrets rotation.** Rotating `JWT_SECRET` signs everyone out. Rotate AI and GitHub keys in the host dashboard and redeploy.

---

## 15. DevOps and deployment

### 15.1 Root files

`package.json`:

```json
{
  "name": "gitsummarizer",
  "private": true,
  "scripts": {
    "dev:api": "npm --prefix backend run dev",
    "dev:web": "npm --prefix frontend run dev",
    "migrate": "npm --prefix backend run migrate",
    "test": "npm --prefix backend test && npm --prefix frontend test",
    "build": "npm --prefix frontend ci --include=dev && npm --prefix frontend run build && npm --prefix backend ci --omit=dev",
    "start": "npm --prefix backend start"
  }
}
```

`.gitignore`:

```
node_modules
dist
.env
.DS_Store
npm-debug.log*
```

`render.yaml`:

```yaml
services:
  - type: web
    name: gitsummarizer
    runtime: node
    plan: free
    buildCommand: npm run build
    startCommand: npm start
    healthCheckPath: /api/v1/health
    envVars:
      - key: NODE_VERSION
        value: "20"
      - key: NODE_ENV
        value: production
      - key: SERVE_CLIENT
        value: "true"
      - key: CLIENT_ORIGIN
        sync: false
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: AI_PROVIDER
        value: anthropic
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: GITHUB_TOKEN
        sync: false
```

`.github/workflows/ci.yml`:

```yaml
name: ci
on:
  push:
  pull_request:

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm test

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

`README.md` (generate): project summary, quick start from section 16, a "Decisions" heading for judgement calls, links to the three documents.

### 15.2 Neon database

1. Create a Neon project (Postgres 16 or newer) in the region nearest your host.
2. In **Connect**, copy the pooled string (host contains `-pooler`) into `DATABASE_URL` and the direct string into `DATABASE_URL_UNPOOLED`. Keep `sslmode=require`.
3. Create a branch called `dev` for local work if you want to keep production data untouched.
4. Run `npm run migrate` once per environment.

### 15.3 Secrets you must supply

| Secret | Where to get it |
|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | Neon console, Connect |
| `JWT_SECRET` | `openssl rand -hex 32` (Render can generate it) |
| `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` | The provider's console. Only the one matching `AI_PROVIDER` is required |
| `GITHUB_TOKEN` (optional) | GitHub, Settings, Developer settings, fine-grained token with public repository read-only access |

### 15.4 Deploy to Render (single service)

1. Push the repository to GitHub.
2. In Render choose **New, Blueprint** and select the repository, or create a Web Service with build command `npm run build` and start command `npm start`.
3. Set the variables from the table in 15.3 and `CLIENT_ORIGIN` to the service's public URL.
4. Run `npm run migrate` from your machine against the Neon direct connection string.
5. Open the URL and run the checklist in section 19.

The free Render plan sleeps when idle, so the first request after a pause is slow. Rate-limit counters are held in memory, which is correct for one instance.

### 15.5 Split deployment (optional)

Static frontend host plus Render API, both on subdomains of one domain. Frontend build variable `VITE_API_BASE_URL=https://api.example.com/api/v1`. Backend variables `CLIENT_ORIGIN=https://app.example.com`, `COOKIE_DOMAIN=.example.com`, `SERVE_CLIENT=false`. Do not host the halves on unrelated default domains: Safari blocks cross-site cookies and sign-in will fail.

---

## 16. Environment variables (master table)

| Variable | Side | Required | Default | Notes |
|---|---|---|---|---|
| `NODE_ENV` | backend | no | `development` | `production` on the host |
| `PORT` | backend | no | `8080` | Render sets this itself |
| `CLIENT_ORIGIN` | backend | no | `http://localhost:5173` | Comma separated list |
| `DATABASE_URL` | backend | yes | none | Neon pooled string |
| `DATABASE_URL_UNPOOLED` | backend | for migrations | falls back to `DATABASE_URL` | Neon direct string |
| `JWT_SECRET` | backend | yes | none | 32 or more characters |
| `JWT_EXPIRES_IN` | backend | no | `7d` | |
| `COOKIE_NAME` | backend | no | `gs_session` | |
| `COOKIE_SAMESITE` | backend | no | `lax` | `none` only for cross-site setups |
| `COOKIE_DOMAIN` | backend | no | empty | `.example.com` for sibling subdomains |
| `GITHUB_TOKEN` | backend | no | empty | Raises the GitHub rate limit |
| `AI_PROVIDER` | backend | yes | `anthropic` | `anthropic` or `openai` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | backend | per provider | `claude-haiku-5-5` | Confirm the model name in the provider docs |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | backend | per provider | `gpt-4o-mini` | Confirm the model name in the provider docs |
| `AI_MAX_OUTPUT_TOKENS` | backend | no | `1800` | |
| `PROMPT_VERSION` | backend | no | `v1` | Bump to invalidate the cache |
| `SUMMARY_TTL_HOURS` | backend | no | `24` | |
| `SERVE_CLIENT` | backend | no | `false` | `true` for the single-service deployment |
| `LOG_LEVEL` | backend | no | `info` | |
| `VITE_API_BASE_URL` | frontend build | no | empty | Only for split deployment |

---

## 17. Local development

Prerequisites: Node.js 20.11 or newer, npm, a Neon account, one AI provider key.

```bash
# 1. install
cd backend && npm install && cd ../frontend && npm install && cd ..

# 2. configure
cp backend/.env.example backend/.env       # fill DATABASE_URL(_UNPOOLED), JWT_SECRET, AI key
cp frontend/.env.example frontend/.env     # leave VITE_API_BASE_URL empty for local work

# 3. database
npm run migrate

# 4. run (two terminals)
npm run dev:api                            # http://localhost:8080
npm run dev:web                            # http://localhost:5173 (proxies /api to 8080)

# 5. test
npm test
```

---

## 18. Build order

The agent builds in this order and verifies each stage before continuing. There is no calendar schedule.

| Stage | Build | Verify |
|---|---|---|
| 1. Skeleton | Monorepo, root files, `backend/` and `frontend/` scaffolds, linting | `npm run lint` passes in both |
| 2. Backend foundation | `env.js`, logger, pool, error handling, middleware, health routes, migrations | `npm run migrate` twice is clean; `/health` and `/health/ready` return ok |
| 3. Parsing and GitHub | `urlParser`, `github.service`, preview route | `npm test` for the parser; `curl` preview of `vitejs/vite` |
| 4. AI and streaming | Context builder, prompts, both providers, orchestrator, repositories, stream endpoint | `curl -N` shows stage, delta and done events; repeat shows `cached: true` |
| 5. Accounts and library | Auth service and routes, history, saved, stats | Register, history, save, tag filter and delete work with a cookie jar |
| 6. Frontend foundation | Tokens, `globals.css`, fonts, theme toggle, shell, router, toasts, wipe, primitives | Both themes render; no default Tailwind colour works; wipe plays |
| 7. Reading flow | Analyzer form, preview, drill loader, streaming result, rail, actions, save dialog, errors, `/r/:id` | A full reading works end to end on a real repository |
| 8. Pages | Home sections, dashboard, login and register, 404, command palette | Every route and state in the frontend checklist |
| 9. Quality | Accessibility pass, reduced motion, responsive pass, performance budgets, tests | Lighthouse targets met; all tests pass |
| 10. Release | CI, Render blueprint, migration on production Neon, smoke test on the live URL | Master checklist below |

---

## 19. Definition of done

The project is finished only when all three checklists pass.

1. **Backend:** every item in `GITSUMMARIZER_BACKEND.md` section 20.
2. **Frontend:** every item in `GITSUMMARIZER_FRONTEND.md` section 20.
3. **Product, on the live deployment:**
   - [ ] A visitor with no account reads `expressjs/express` as an overview and sees streaming text.
   - [ ] Reading the same repository again is noticeably faster and says it was reused.
   - [ ] A commit link and a compare link each produce the right kind automatically.
   - [ ] Creating an account, signing out and signing in works and the history survives.
   - [ ] Save, edit tags, search and delete work; `/r/:id` opens from a copied link in a private window.
   - [ ] The ninth guest reading within an hour is refused with the account prompt.
   - [ ] An invalid link, a missing repository and a GitLab link each give a specific, useful message.
   - [ ] Switching the AI provider by environment variable works with no code change.
   - [ ] CI is green on the main branch.
   - [ ] No secret appears in the repository, the logs or the browser bundle.

---

## 20. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Server exits at start with "Invalid environment configuration" | Missing or short variable | Read the printed list; set `DATABASE_URL`, `JWT_SECRET` (32+ characters) and the key for `AI_PROVIDER` |
| First request after idle is slow or times out | Neon compute waking up | Retry; the pool allows 15 seconds; use the pooled connection string |
| `npm run migrate` fails on `CREATE EXTENSION` | Insufficient rights or wrong string | Use the direct connection string for the project owner role |
| Summary text appears all at once | A proxy buffers the stream | Keep `X-Accel-Buffering: no`, avoid compression on `text/event-stream`, test with `curl -N` |
| Sign in works locally but not when deployed | Cookie domain or SameSite mismatch | Use the single-service deployment, or sibling subdomains with `COOKIE_DOMAIN` |
| `ORIGIN_DENIED` on every POST | `CLIENT_ORIGIN` does not match the browser origin | Set it to the exact public origin including `https://` |
| `GITHUB_RATE_LIMITED` quickly | No token | Add `GITHUB_TOKEN` |
| AI errors with 401 or 404 | Wrong key or model name | Check `*_API_KEY` and `*_MODEL` against the provider documentation |
| Blank page after build | SPA fallback missing | Set `SERVE_CLIENT=true` and make sure `frontend/dist` exists at runtime |
| Fonts or styles look default | Tailwind plugin or CSS import missing | Confirm `@tailwindcss/vite` in `vite.config.js` and that `main.jsx` imports `globals.css` |

---

## 21. Roadmap after this release

1. Redis-backed rate limiting for multiple instances.
2. GitHub sign-in and private repository support with the user's own token.
3. Pull-request summaries and issue digests.
4. Watching a repository and emailing release notes when new commits land.
5. Team workspaces and shared collections.
6. Public share controls and Open Graph preview images for `/r/:id`.
7. Additional languages for summaries.
8. Browser extension that adds a "Read in plain language" button on GitHub pages.

---

## 22. Real-world relevance

| Skill | Where it appears |
|---|---|
| Third-party API integration | Rate limits, authentication scopes, conditional failure handling and JSON parsing against the GitHub REST API |
| AI documentation pipelines | Prompt design, context budgeting, streaming, injection defence, cost tracking: the same patterns used by enterprise changelog and briefing tools |
| Full-stack persistence | Relational modelling, migrations, keyset pagination, cache design, per-user data |
| Production engineering | Validation, security headers, rate limiting, structured logging, graceful shutdown, CI and deployment |
| Product design | A distinct, accessible design system with purposeful motion |

---

## 23. Glossary

| Term | Meaning |
|---|---|
| Commit | A saved change to a repository, identified by a hash |
| Compare range | Two references joined by `...`, covering all commits between them |
| Server-Sent Events (SSE) | A one-way stream from server to browser over HTTP |
| Neon | Serverless PostgreSQL that scales compute to zero and supports branching |
| Pooled connection | A Neon connection string routed through a connection pooler, suited to applications |
| Prompt injection | Text inside data that tries to give instructions to the AI |
| Keyset pagination | Paging by the position of the last row seen rather than by page number |
| Strata | The name of this project's design system |

---

## 24. Resources

- React: https://react.dev/
- Vite: https://vite.dev/
- Tailwind CSS: https://tailwindcss.com/docs
- Motion (Framer Motion): https://motion.dev/
- TanStack Query: https://tanstack.com/query/latest
- React Router: https://reactrouter.com/
- Express: https://expressjs.com/
- node-postgres: https://node-postgres.com/
- Neon documentation: https://neon.com/docs
- GitHub REST API: https://docs.github.com/en/rest
- Anthropic API: https://docs.anthropic.com/
- OpenAI API: https://platform.openai.com/docs

---

## 25. Conclusion

GitSummarizer closes the gap between large codebases and quick understanding. It combines careful integration with the GitHub API, a safe and streaming AI pipeline, a well-modelled Neon PostgreSQL database and a distinctive interface, so that a link becomes a readable, trustworthy summary that people can keep and share. Built to this specification, it is a complete full-stack product, not a demonstration.
