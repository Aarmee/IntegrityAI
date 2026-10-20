"""
Configuration for ai-analysis-service.
All values can be overridden via environment variables or a .env file.
Secrets (MongoDB URI) must never be committed — use environment variables in production.
"""

import os
import tempfile
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Server
    host: str = "0.0.0.0"
    port: int = 8090

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017/integrityai_analysis"
    mongodb_database: str = "integrityai_analysis"

    # Analysis thresholds
    similarity_threshold: float = 0.75
    ai_detection_threshold: float = 0.65

    # Upload directory (OS temporary directory matching submission-service)
    upload_dir: str = os.path.join(tempfile.gettempdir(), "integrityai_uploads")


settings = Settings()
