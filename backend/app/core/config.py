"""
Centralized application configuration.
All values are sourced from environment variables (see .env.example).
Never hardcode secrets here.
"""
from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ---- App ----
    APP_NAME: str = "Zyrstar Humanize AI"
    ENVIRONMENT: str = Field(default="production")  # development | staging | production
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # ---- Security ----
    SECRET_KEY: str = Field(..., min_length=32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    CSRF_SECRET: str = Field(..., min_length=32)
    COOKIE_SECURE: bool = True
    COOKIE_DOMAIN: str | None = None

    # ---- Database ----
    DATABASE_URL: str = Field(..., description="postgresql+asyncpg://user:pass@host:5432/db")

    # ---- CORS ----
    ALLOWED_ORIGINS: List[str] = ["https://zyrstar.com", "https://www.zyrstar.com"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def split_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # ---- Rate limiting ----
    RATE_LIMIT_DEFAULT: str = "60/minute"
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_HUMANIZE: str = "20/minute"

    # ---- AI Engine ----
    ENABLE_HEAVY_MODELS: bool = False  # set true only if host has enough RAM/CPU
    MAX_INPUT_CHARS: int = 15000
    MODEL_CACHE_DIR: str = "/app/.model_cache"

    # ---- Frontend ----
    FRONTEND_URL: str = "https://zyrstar.com"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
