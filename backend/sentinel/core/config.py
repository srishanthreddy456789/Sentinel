import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SENTINEL"
    VERSION: str = "2.0.1"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Security
    JWT_SECRET: str = "sentinel_super_secret_jwt_key_2026_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Encryption key for external provider keys (Fernet)
    # Generated using Fernet.generate_key()
    FERNET_SECRET_KEY: str = "tU2WvX4z-8kQJ7mP9nL1rS3tV5xZ7aB9cE1fG3hI5jK="

    # Database & Redis (sqlite+aiosqlite for instant local dev, postgresql+asyncpg for docker/prod)
    DATABASE_URL: str = "sqlite+aiosqlite:///./sentinel.db"
    SYNC_DATABASE_URL: str = "sqlite:///./sentinel.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # ML & MLOps Tracking
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    DEFAULT_FREE_MODEL_PROVIDER: str = "Ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Evaluation Configurable Thresholds
    EVAL_CORRECTNESS_THRESHOLD: float = 0.75
    EVAL_FAITHFULNESS_THRESHOLD: float = 0.60
    EVAL_HALLUCINATION_THRESHOLD: float = 0.30
    EVAL_TOXICITY_THRESHOLD: float = 0.10
    EVAL_CONSISTENCY_THRESHOLD: float = 0.70
    EVAL_LATENCY_SLA_MS: float = 2000.0
    RAG_SIMILARITY_THRESHOLD: float = 0.60

    # Diagnosis Configurable Thresholds
    MODEL_WEAKNESS_MIN_SAMPLES: int = 30
    DIAGNOSIS_MIN_CONFIDENCE: float = 0.70

    # Self-Healing Configurable Thresholds
    HEALING_MIN_IMPROVEMENT: float = 0.03
    HEALING_MAX_LATENCY_INCREASE: float = 0.10
    HEALING_AUTO_PROMOTE: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

settings = Settings()
