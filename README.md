# ⚡ The Last Commit

```
$ git checkout -b 24h-sprint
$ git commit -m "make it count"
$ git push origin you

```

> **24 Hours. One Branch. Zero Second Chances.**
>
> A high-voltage, terminal-themed hackathon platform engineered with a React/Vite client, Node/Express TypeScript engine, and serverless PostgreSQL storage.

### 🌐 Live Production

| **Service** | **Endpoint** | **Status** | 
| **Frontend Portal** | [the-last-commit-wine.vercel.app](https://the-last-commit-wine.vercel.app) |  | 
| **Admin Analytics** | [/ #/admin](https://the-last-commit-wine.vercel.app/#/admin) |  | 
| **Backend API** | [the-last-commit-b9w1.onrender.com](https://the-last-commit-b9w1.onrender.com) |  | 
| **Health Check** | [/api/health](https://the-last-commit-b9w1.onrender.com/api/health) |  | 

*Render free-tier instances may sleep after idle periods; initial spin-up takes \~30s.*

### 🔮 Core Features

* **Terminal Matrix Aesthetic** — Retro scanlines, dynamic typing, responsive card layouts, and matrix rain visuals.

* **Streamlined Registration** — Zod schema validation, instant input sanitization, and duplicate record handling (`409 Conflict`).

* **Admin Control Center** — Secure JWT authentication, real-time registration metrics, searchable participant logs, and one-click `.csv` roster export.

* **Hardened Architecture** — Production-locked CORS origin enforcement and decoupled micro-deployments.

### 🛠 Tech Stack

```
Client   ─── React 18 • TypeScript • Vite • CSS Modules
Server   ─── Node.js • Express • TypeScript • Zod • JWT
Database ─── PostgreSQL (Neon Serverless)
Host     ─── Vercel (UI) + Render (API)

```

### ⚡ Quick Start

```
# Clone
git clone https://github.com/himanshhuu973/The-last-commit.git
cd The-last-commit

# Backend
cd backend && npm install && npm run dev

# Frontend
cd ../frontend && npm install && npm run dev

```

### 🧠 AI Collaboration & Prompt Log

*AI assistance (ChatGPT / LLM chat interfaces) was utilized for architectural scaffolding, cross-origin debug runs, and theme customization.*

1. **System Design & DB Pool** — Outlined the unified TypeScript layout, Neon PostgreSQL pool bindings, and route isolation.

2. **CORS & Environment Pipeline** — Diagnosed Vercel configuration schemas and linked the strict `CORS_ORIGIN` rule to the production deployment domain.

3. **Matrix Theme & Layout** — Structured terminal UI components, prize breakdown cards, and timeline transitions.