"""
Dependency-injectable LLM client factory. Tests override this with a fake
client so the suite never makes a real network call.
"""

from functools import lru_cache

from fastapi import HTTPException, status

from app.core.config import settings
from app.rag.llm.base import BaseLLMClient
from app.rag.llm.openai_client import OpenAILLMClient
from app.rag.llm.ollama_client import OllamaLLMClient
from app.rag.llm.groq_client import GroqLLMClient
from app.rag.llm.extractive_client import ExtractiveClient


@lru_cache()
def get_llm_client() -> BaseLLMClient:
    if settings.LLM_PROVIDER == "openai":
        return OpenAILLMClient(api_key=settings.OPENAI_API_KEY, model=settings.OPENAI_MODEL)

    if settings.LLM_PROVIDER == "ollama":
        return OllamaLLMClient(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_MODEL)

    if settings.LLM_PROVIDER == "groq":
        return GroqLLMClient(api_key=settings.GROQ_API_KEY, model=settings.GROQ_MODEL)

    if settings.LLM_PROVIDER == "extractive" or not settings.LLM_PROVIDER:
        return ExtractiveClient()

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Unknown LLM_PROVIDER '{settings.LLM_PROVIDER}'. Use 'extractive', 'groq', 'openai', or 'ollama'.",
    )
