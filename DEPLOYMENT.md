# Deploying Zyrstar to Render

This guide deploys the full stack — PostgreSQL, FastAPI backend, and Next.js frontend — to
[Render](https://render.com), entirely on CPU-only instances.

---

## 1. Prerequisites

- A Render account
- This repository pushed to GitHub/GitLab
- A domain (e.g. `zyrstar.com`) if you want custom domains + the AdSense verification file
  publicly reachable at `https://zyrstar.com/ads.txt`

---

## 2. Create the PostgreSQL database

1. Render Dashboard → **New → PostgreSQL**
2. Name: `zyrstar-db`, Plan: Starter (or higher), Region: closest to your users
3. Once created, copy the **Internal Connection String** (used by the backend service) — it looks
   like `postgresql://user:pass@host/db`. Change the scheme to `postgresql+asyncpg://` for the
   backend's `DATABASE_URL`.

## 3. Deploy the backend (FastAPI)

1. Render Dashboard → **New → Web Service** → connect your repo
2. **Root Directory**: `backend`
3. **Runtime**: Docker (Render will detect `backend/Dockerfile`)
4. **Plan**: Starter or Standard — CPU-only, no GPU needed. The default NLP pipeline (nltk +
   scikit-learn + wordfreq) runs comfortably within 512MB–1GB RAM.
5. **Health Check Path**: `/api/v1/health`
6. **Environment Variables** (Render → Environment tab):

   | Key | Value |
   |---|---|
   | `ENVIRONMENT` | `production` |
   | `DEBUG` | `false` |
   | `SECRET_KEY` | generate: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
   | `CSRF_SECRET` | generate a second, different secret the same way |
   | `COOKIE_SECURE` | `true` |
   | `COOKIE_DOMAIN` | `.zyrstar.com` |
   | `DATABASE_URL` | the `postgresql+asyncpg://...` string from step 2 |
   | `ALLOWED_ORIGINS` | `https://zyrstar.com,https://www.zyrstar.com` |
   | `ENABLE_HEAVY_MODELS` | `false` (keep false for free/starter CPU instances) |
   | `MAX_INPUT_CHARS` | `15000` |
   | `FRONTEND_URL` | `https://zyrstar.com` |

7. Deploy. On first boot, `app.core.database.init_models()` creates tables automatically as a
   safety net; for production schema changes going forward, run migrations explicitly:

   ```bash
   # Render Shell (Web Service → Shell tab)
   alembic upgrade head
   ```

8. Note the generated backend URL, e.g. `https://zyrstar-backend.onrender.com` — you'll need it
   for the frontend's `NEXT_PUBLIC_API_URL`. If using a custom domain (`api.zyrstar.com`), add it
   under **Settings → Custom Domains** and point your DNS `CNAME` at Render.

## 4. Deploy the frontend (Next.js)

1. Render Dashboard → **New → Web Service** → same repo
2. **Root Directory**: `frontend`
3. **Runtime**: Docker (`frontend/Dockerfile`)
4. **Plan**: Starter
5. **Environment Variables**:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://zyrstar.com` |
   | `NEXT_PUBLIC_API_URL` | `https://api.zyrstar.com/api/v1` (or the Render backend URL) |

6. Deploy. Add your custom domain under **Settings → Custom Domains** and point DNS (`A`/`CNAME`
   per Render's instructions).

## 5. DNS & AdSense verification

- Point `zyrstar.com` and `www.zyrstar.com` at the Render frontend service.
- Confirm `https://zyrstar.com/ads.txt` and view-source on any page shows the AdSense script tag
  inside `<head>` — this is required for Google AdSense site verification. Both are already wired
  in `frontend/public/ads.txt` and `frontend/app/layout.tsx`.
- Submit `https://zyrstar.com/sitemap.xml` to Google Search Console.

## 6. Post-deploy checklist

- [ ] `GET /api/v1/health` returns `200`
- [ ] `GET /api/v1/health/ready` reports `"database": "ok"`
- [ ] Register + login flow works end-to-end (cookies set with `Secure`, `HttpOnly`, `SameSite=Lax`)
- [ ] `/humanizer` and `/detector` return real scores against sample text
- [ ] Lighthouse run on the deployed frontend (aim for 90+ across Performance/SEO/Accessibility/
      Best Practices — Next.js SSR + Tailwind + optimized images gets you most of the way there)
- [ ] `robots.txt` and `sitemap.xml` are reachable and correct
- [ ] Rotate `SECRET_KEY`/`CSRF_SECRET` if they were ever committed anywhere, and store them only
      in Render's environment variable manager

## 7. Scaling notes

- The AI engine is CPU-bound but embarrassingly parallel across requests — scale horizontally by
  increasing the backend service's instance count / gunicorn workers before reaching for bigger
  instances.
- If you later enable `ENABLE_HEAVY_MODELS=true` for a transformer-based paraphraser, move to a
  Standard/Pro Render plan with more RAM (transformer models are optional and off by default so
  the app remains fully functional without them).
- Rate limiting (`slowapi`) runs in-memory per instance by default. If you scale the backend to
  multiple instances and need rate limits enforced consistently across all of them, add a shared
  backing store (e.g. Redis) to `slowapi`'s `Limiter` — not required to run the app, only to make
  limits consistent under horizontal scaling.

## 8. Alternative: self-hosted / VPS via Docker Compose

If you deploy outside Render (e.g. a VPS), use the provided `docker-compose.yml` and
`nginx/nginx.conf` directly:

```bash
cp backend/.env.example backend/.env      # fill in real secrets
cp frontend/.env.example frontend/.env
docker compose up -d --build
```

Place TLS certificates at `nginx/certs/fullchain.pem` and `nginx/certs/privkey.pem` (e.g. via
Certbot) before exposing port 443.
