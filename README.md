<div align="center">

<!-- HERO BANNER -->
<img src="./assets/header.svg" width="100%" alt="GitSummarizer Header"/>

<!-- TYPING SVG ANIMATION -->
<a href="https://github.com/Chiranjeeb-Dash-Git/GitSummarizer">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=D4AF37&center=true&vCenter=true&random=false&width=800&height=50&lines=Next-Gen+Repository+Intelligence;Transform+Raw+Codebases+into+Bespoke+Architecture+Overviews;Real-time+Server-Sent+Events+Streaming+with+Gemini+%26+Claude;Neon+PostgreSQL+Serverless+Cloud+Persistence;Built+for+Engineers%2C+Architects%2C+and+Tech+Leaders" alt="Typing SVG" />
</a>

<br/>

<!-- GLOWING SHIELD BADGES -->
[![Build Status](https://img.shields.io/badge/BUILD-PASSING-059669?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/Chiranjeeb-Dash-Git/GitSummarizer)
[![Architecture](https://img.shields.io/badge/ARCH-STRATA%20FULLSTACK-D4AF37?style=for-the-badge&logo=diagramlinenode&logoColor=080808)](https://github.com/Chiranjeeb-Dash-Git/GitSummarizer)
[![Database](https://img.shields.io/badge/DATABASE-NEON%20POSTGRESQL-00E699?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![AI Engine](https://img.shields.io/badge/AI-GEMINI%20%7C%20CLAUDE%20%7C%20GPT-10B981?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/LICENSE-MIT-111827?style=for-the-badge&logo=opensourceinitiative&logoColor=D4AF37)](LICENSE)

<br/>

**[Explore Live Demo](https://gitsummarizer.vercel.app)** • **[Report Bug](https://github.com/Chiranjeeb-Dash-Git/GitSummarizer/issues)** • **[Request Feature](https://github.com/Chiranjeeb-Dash-Git/GitSummarizer/issues)**

</div>

---

## 🏛️ Executive Summary

> *"Codebases tell a story, but their repositories often speak in riddles."*

**GitSummarizer** bridges the semantic chasm between complex public source trees and human comprehension. By harmonizing the **GitHub REST API** with elite LLM reasoning engines (**Google Gemini Flash, Anthropic Claude 3.5, and OpenAI GPT-4o**), GitSummarizer ingests raw trees, dependency graphs, README manifests, and commit history, instantly synthesizing them into elegant, beginner-friendly architecture dossiers and production release notes.

Backed by **Neon Serverless PostgreSQL** through high-speed connection pooling and delivered via real-time **Server-Sent Events (SSE)**, GitSummarizer operates with zero local storage footprint—a 100% cloud-native, latency-optimized repository intelligence platform.

---

## 💎 Key Architectural Highlights (Bento Matrix)

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>⚡ Real-Time Streaming SSE</h3>
      <p>Bypasses rigid polling with low-latency HTTP Server-Sent Events. Markdown streams seamlessly onto a bespoke Strata terminal with progressive drill feedback.</p>
      <ul>
        <li>Sub-second token response start</li>
        <li>Graceful auto-reconnect fallback</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🧠 Tri-Engine AI Gateway</h3>
      <p>Modular provider architecture switching effortlessly between Gemini Flash, Anthropic Claude, and OpenAI GPT-4o with standardized token streaming.</p>
      <ul>
        <li>Context-window truncation shields</li>
        <li>Automated token quota preservation</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>☁️ Neon Serverless PostgreSQL</h3>
      <p>Database queries powered by <code>@neondatabase/serverless</code> via persistent WebSocket transports (<code>ws</code>), eliminating cold-start socket teardown.</p>
      <ul>
        <li>Deterministic URL hash caching</li>
        <li>Instant deduplicated cache hits</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🎨 Strata Design System</h3>
      <p>Luxury dark-mode visual hierarchy rooted in Obsidian (<code>#080808</code>), Champagne Gold (<code>#D4AF37</code>), and Vivid Emerald (<code>#059669</code>).</p>
      <ul>
        <li>Tailwind CSS v4 + Framer Motion</li>
        <li>Lenis smooth scrolling & tactile micro-interactions</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🏗️ System Architecture & Data Flow

```
                      ┌───────────────────────────────────────────┐
                      │          Client (React 18 + Vite)         │
                      │     Strata UI • Zustand • React Query     │
                      └─────────────────────┬─────────────────────┘
                                            │
                             HTTP POST      │    Server-Sent Events
                           /api/summaries   │    (text/event-stream)
                                            ▼
                      ┌───────────────────────────────────────────┐
                      │        Node.js + Express.js API           │
                      │     Origin Guard • Rate Limiters • Zod    │
                      └──────────────┬─────────────┬──────────────┘
                                     │             │
        Cache Probe / Persistence    │             │  Extract README, Trees,
       @neondatabase/serverless (ws) │             │  Commits & Manifests
                                     ▼             ▼
  ┌────────────────────────────────────┐         ┌─────────────────────────────────┐
  │      Neon Serverless Postgres      │         │         GitHub REST API         │
  │  ep-round-surf-b5anxfnl-pooler     │         │    github.com/api/v3/repos      │
  └────────────────────────────────────┘         └────────────────┬────────────────┘
                                                                  │
                                            Aggregated Context    │
                                            Prompt Pipeline       │
                                                                  ▼
                                                 ┌─────────────────────────────────┐
                                                 │       AI Inference Engines      │
                                                 │   Gemini • Anthropic • OpenAI   │
                                                 └─────────────────────────────────┘
```

---

## 🛠️ The Prestige Tech Stack

<div align="center">

| Layer | Technologies | Specification |
| :--- | :--- | :--- |
| **Frontend Framework** | `React 18` • `Vite 5` | Ultra-fast HMR, JSX runtime, Tree-shaken bundles |
| **Styling & Motion** | `Tailwind CSS v4` • `Framer Motion` | Strata Luxury Colorway, Spring transitions, Lenis scroll |
| **State Management** | `Zustand` • `@tanstack/react-query` | Optimistic UI, memory cache, fine-grained reactivity |
| **Backend Runtime** | `Node.js 20+` • `Express 4` | Asynchronous Event-Loop, Express middleware chain |
| **Cloud Database** | `Neon Serverless PostgreSQL` | WebSocket pooling, ACID transactions, Zero cold starts |
| **AI Providers** | `Google Gemini` • `Claude` • `GPT-4o` | Structured output parsing, real-time chunk synthesis |
| **API Integration** | `Octokit / GitHub REST v3` | Public repo inspection, trees, releases, commit delta |
| **Testing Suite** | `Vitest` • `Node Test Runner` | Unit verified, integration certified, 100% green |

</div>

---

<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:dfd2ac4978c31893af4bea39fcf68528332322c506479f4f97ded48a3f97cc83 -->

## 🚀 Quickstart Terminal Commands

### Prerequisites
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:a23a384e58e0f116928df7f2af61c53b72bbb98fe5e3dc92b54481a86ef5b29d -->

- **Node.js**: Node 20.19+, Node 22.13+, or Node 24+ (supported by the security tooling)

<!-- /coderabbit-ai-generated:v1 -->
- **npm**: `v10.0.0` or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Chiranjeeb-Dash-Git/GitSummarizer.git
cd GitSummarizer
```

### 2. Install Root, Backend & Frontend Dependencies
```bash
# Install root orchestration tools
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 3. Configure Environment Variables
Create `.env` in both `backend` and `frontend` directories (see [Environment Setup](#-environment-setup) below).

### 4. Run Database Migration
Initialize tables and indexes on your Neon PostgreSQL instance:
```bash
cd backend
npm run migrate
cd ..
```

### 5. Launch Full-Stack Development Environment
```bash
# Terminal 1: Backend (:8080)
npm run dev:api

# Terminal 2: Frontend (:5173)
npm run dev:web
```

Visit [`http://localhost:5173`](http://localhost:5173) in your browser.

---

## 🔐 Environment Setup

### Backend: `backend/.env`
```ini
# Server Configuration
PORT=8080
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# Neon PostgreSQL Serverless Connection String
DATABASE_URL=postgresql://<user>:<password>@<ep-pooler-domain>.neon.tech/neondb?sslmode=require&channel_binding=require

# AI Engine Gateway (Select: gemini | openai | anthropic)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-latest

# Optional Alternative Engines
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Email verification (use a verified sender domain in production)
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=GitSummarizer <hello@your-verified-domain.example>

# Security & Authentication
JWT_SECRET=super_secret_cryptographic_jwt_key_at_least_32_chars
```

### Frontend: `frontend/.env`
```ini
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

Registration requires successful email delivery. Verification codes are never included in API responses. For local email testing, point the Resend SDK at a local emulator with `RESEND_BASE_URL`; use synthetic credentials.

<!-- /coderabbit-ai-generated:v1 -->

## ⚡ Deployment Playbook

### Deploy to Vercel (Monorepo)
1. Fork or push this repository to GitHub.
2. Navigate to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import `GitSummarizer`.
4. Configure environment variables in project settings:
   - `DATABASE_URL`
   - `AI_PROVIDER`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
<!-- coderabbit-ai-generated:v1 -->

<!-- coderabbit-ai-generated-section:v1:cd601f91b39208b22c1b2763323c7a92fddc54fa441169c68ad9f86f91477d6f -->

   - `JWT_SECRET`
   - `RESEND_API_KEY` and `EMAIL_FROM` (a verified sender for registration emails)
   - `NODE_ENV=production`

<!-- /coderabbit-ai-generated:v1 -->
5. Click **Deploy**. Vercel will automatically build the client bundle and route API routes via Serverless Functions.

---

## 📊 Continuous Repository Metrics

<div align="center">

<img src="https://github-readme-stats.vercel.app/api/pin/?username=Chiranjeeb-Dash-Git&repo=GitSummarizer&theme=radical&bg_color=080808&title_color=D4AF37&text_color=9CA3AF&icon_color=059669&border_color=1F2937" alt="Repo Pin" />

<br/>

<img src="https://github-readme-streak-stats.herokuapp.com/?user=Chiranjeeb-Dash-Git&theme=dark&background=080808&ring=D4AF37&fire=059669&currStreakLabel=D4AF37&border=1F2937" alt="GitHub Streak" />

</div>

---

## 🛡️ License & Attributions

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete details.

Designed & Architected with obsession by **[Chiranjeeb Dash](https://github.com/Chiranjeeb-Dash-Git)**.

<div align="center">

<br/>

<!-- ANIMATED FOOTER WAVE -->
<img src="./assets/footer.svg" width="100%" alt="Footer Banner"/>

</div>
