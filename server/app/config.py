"""Settings, all from environment variables (see server/.env.example)."""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Neon (or any Postgres). Local default for development.
    database_url: str = "postgresql+psycopg://localhost/bloxio"

    # Signs admin login tokens. Must be a long random string in production.
    jwt_secret: str = "dev-only-change-me"
    jwt_hours: int = 12

    # Email (Resend). Without a key, emails are printed to the log instead.
    resend_api_key: str = ""
    mail_from: str = "BLOXio <no-reply@bloxio.tech>"
    notify_to: str = "contact@bloxio.tech"  # admin notifications
    mail_theme: str = "light"  # light = the official template; or dark

    # Where things live
    site_url: str = "https://bloxio.tech"
    admin_url: str = "https://admin.bloxio.tech"
    cors_origins: str = (
        "https://bloxio.tech,https://www.bloxio.tech,https://agrosense360.bloxio.tech,"
        "https://admin.bloxio.tech,http://localhost:5173,http://localhost:5174,"
        "http://agrosense360.localhost:5173"
    )

    # Shared with the site's /api/visit function so only it can record visits
    visit_secret: str = ""

    # Public form submissions allowed per visitor per 10 minutes
    rate_limit: int = 6

    # Publishing content: Vercel deploy hook URL for the public site
    vercel_deploy_hook: str = ""

    # Admin accounts created on first start: "email|Name|super" separated by commas.
    # super = may add and remove admins.
    seed_admins: str = (
        "owen@bloxio.tech|Owen Anyakie|super,"
        "austin@bloxio.tech|Austin-Chris Iwu|super,"
        "contact@bloxio.tech|BLOXio Contact|admin"
    )

    @field_validator("*", mode="before")
    @classmethod
    def _unquote(cls, v):
        # Dashboards (Render, .env pasting) sometimes keep quotes around a
        # value: "BLOXio <no-reply@bloxio.tech>" makes Resend reject every email.
        if isinstance(v, str):
            v = v.strip()
            if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
                v = v[1:-1].strip()
        return v

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def settings() -> Settings:
    return Settings()
