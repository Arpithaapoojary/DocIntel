"""
Application configuration.

All secrets and environment-specific values are loaded from environment
variables (via a .env file in development). Nothing sensitive is hard-coded.
"""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "AI Document Intelligence Platform"
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)

    # --- Security / Auth ---
    SECRET_KEY: str = Field(..., description="JWT signing secret. Must be set in .env")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24)  # 24 hours

    # --- Database ---
    DATABASE_URL: str = Field(default="sqlite:///./data/app.db")

    # --- CORS ---
    CORS_ORIGINS: List[str] = Field(default=["http://localhost:5173", "http://localhost:3000"])

    # --- File storage ---
    UPLOAD_DIR: str = Field(default="./data/uploads")
    MAX_UPLOAD_SIZE_MB: int = Field(default=25)
    ALLOWED_EXTENSIONS: List[str] = Field(default=[".pdf", ".docx", ".txt"])

    # --- Vector store ---
    VECTOR_STORE_DIR: str = Field(default="./data/vector_store")
    EMBEDDING_MODEL: str = Field(default="sentence-transformers/all-MiniLM-L6-v2")
    CHUNK_SIZE: int = Field(default=800)
    CHUNK_OVERLAP: int = Field(default=120)
    TOP_K_RESULTS: int = Field(default=5)
    RELEVANCE_THRESHOLD: float = Field(
        default=0.25,
        description="Minimum cosine similarity for a chunk to be considered relevant. "
        "Below this, the question is treated as unanswerable from the uploaded documents.",
    )

    # --- LLM provider ---
    # "groq"   → free, fast, no GPU needed (recommended for most users)
    # "openai" → requires OpenAI API key
    # "ollama" → requires local Ollama server
    LLM_PROVIDER: str = Field(default="groq")
    OPENAI_API_KEY: str = Field(default="")
    OPENAI_MODEL: str = Field(default="gpt-4o-mini")
    GROQ_API_KEY: str = Field(default="")
    GROQ_MODEL: str = Field(default="llama-3.1-8b-instant")
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434")
    OLLAMA_MODEL: str = Field(default="llama3")

    # --- Rate limiting ---
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance so .env is parsed only once per process."""
    return Settings()


settings = get_settings()
