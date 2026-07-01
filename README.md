# Zyrstar — Humanize AI

A production SaaS application providing a proprietary **AI Humanizer** and a proprietary
**AI Detection Engine**, built entirely in-house (no third-party AI-detection APIs).

## Architecture

```
zyrstar/
├── backend/          FastAPI service — auth, humanizer engine, detection engine, PostgreSQL
├── frontend/          Next.js 14 (App Router) — SEO-optimized UI, dashboard, tool pages
├── nginx/             Reverse proxy config (for self-hosted/VPS deployment)
├── docker-compose.yml Full local/self-hosted stack (postgres, backend, frontend, nginx)
└── DEPLOYMENT.md       Step-by-step Render deployment guide
```

### Backend (`/backend`)
- **FastAPI** modular clean-architecture service (`core/`, `models/`, `schemas/`, `api/`, `services/`)
- **Auth**: JWT (access + rotating refresh tokens), Argon2id password hashing, HttpOnly cookies,
  double-submit CSRF tokens, per-route rate limiting (slowapi), full input validation (Pydantic v2)
- **AI Engine** (`services/detector.py`, `services/humanizer.py`): pure CPU, no GPU/torch required
  by default. Combines 8 linguistic signals (perplexity proxy, burstiness, semantic similarity,
  structural variation, vocabulary diversity, repetition, coherence, boilerplate-phrase detection)
  into the **Zyrstar AI Detection Score**, and a rewriting pipeline that preserves meaning while
  producing the **Zyrstar Humanization Score**.
- **Database**: PostgreSQL via async SQLAlchemy 2.0 + Alembic migrations
- Security headers, strict CSP (with AdSense domains allow-listed), request-size limits, generic
  auth error messages to prevent user enumeration

### Frontend (`/frontend`)
- **Next.js 14 App Router**, TypeScript, Tailwind CSS
- Server-rendered metadata, Open Graph, Twitter Cards, JSON-LD (`SoftwareApplication`), dynamic
  `sitemap.xml` and `robots.txt`, `ads.txt`, semantic HTML, accessible forms (labels, skip link,
  focus-visible states)
- Google AdSense script embedded in the root `<head>` (`app/layout.tsx`) on every page
- Modular tool workspaces (`HumanizerWorkspace`, `DetectorWorkspace`) that call the FastAPI backend

## Local development

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in SECRET_KEY, CSRF_SECRET, DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Or run the full stack with Docker Compose:

```bash
docker compose up --build
```

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full Render deployment walkthrough.

## Modularity / upgrading the AI engine

The detector and humanizer are isolated in `backend/app/services/`. Each linguistic signal in
`detector.py` is an independent method with its own weight in `DetectionEngine.WEIGHTS`, so
individual signals can be recalibrated or replaced without touching the others. An optional
transformer-based paraphraser/perplexity model can be added behind the `ENABLE_HEAVY_MODELS` flag
without changing the API contract — the lightweight pipeline remains the default so the service
stays fully functional on CPU-only Render instances.
