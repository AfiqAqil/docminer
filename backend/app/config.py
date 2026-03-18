from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="DOCMINER_")

    model: str = "ollama/llama3.2-vision"
    db_url: str = "sqlite:///data/docminer.db"
    upload_dir: str = "data/uploads"


settings = Settings()
