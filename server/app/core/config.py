"""Application configuration for AarogyaVaani Medical Intelligence Server."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AarogyaVaani Medical Intelligence API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Base directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    
    # Database
    DATABASE_URL: str = "sqlite:///./aarogya.db"
    
    # AI Vision & Reasoning
    GEMINI_API_KEY: str | None = None
    GEMINI_PRIMARY_MODEL: str = "gemini-2.5-flash-lite"
    GEMINI_FALLBACK_MODELS: list[str] = [
        "gemini-2.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-flash-latest",
    ]
    
    OPENAI_API_KEY: str | None = None
    OPENAI_BASE_URL: str = "https://api.groq.com/openai/v1"
    
    # Supabase Cloud Configuration
    SUPABASE_URL: str | None = None
    SUPABASE_PUBLISHABLE_KEY: str | None = None
    SUPABASE_SECRET_KEY: str | None = None
    SUPABASE_JWKS_URL: str | None = None

    # LiveKit WebRTC Configuration
    LIVEKIT_URL: str | None = None
    LIVEKIT_API_KEY: str | None = None
    LIVEKIT_API_SECRET: str | None = None
    
    # Server Host / Port
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
