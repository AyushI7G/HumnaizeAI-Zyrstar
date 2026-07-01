FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps: build tools for a couple of C-extension packages (argon2-cffi,
# psycopg2), then removed from the final layer footprint via slim base.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the small NLTK corpora at build time so cold starts don't
# hit the network in production.
RUN python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('punkt_tab', quiet=True); nltk.download('wordnet', quiet=True); nltk.download('omw-1.4', quiet=True); nltk.download('averaged_perceptron_tagger', quiet=True); nltk.download('averaged_perceptron_tagger_eng', quiet=True)"

COPY . .

RUN useradd --create-home --shell /bin/bash appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "60", \
     "--access-logfile", "-", "--error-logfile", "-"]
