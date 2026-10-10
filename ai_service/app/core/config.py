import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-haiku-4-5-20251001"
    HF_TOKEN: str = "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"
    HULU_MED_MODEL_ID: str = "ZJU-AI4H/Hulu-Med-7B"
    MAX_FILE_SIZE_MB: int = 20
    MAX_PDF_PAGES: int = 10
    UPLOAD_DIR: str = "uploads"
    ENABLE_MOCK_AI: bool = False
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


settings = Settings()
