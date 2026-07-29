"""
Dependency-injectable LLM client factory. Tests override this with a fake
client so the suite never makes a real network call to OpenAI.
"""

from functools import lru_cache

from fastapi import HTTPException, status

from app.core.config import settings
from app.rag.llm.base import BaseLLMClient
from app.rag.llm.openai_client import OpenAILLMClient


@lru_cache()
def get_llm_client() -> BaseLLMClient:
    if settings.LLM_PROVIDER == "openai":
        return OpenAILLMClient(api_key=settings.OPENAI_API_KEY, model=settings.OPENAI_MODEL)

    if settings.LLM_PROVIDER == "ollama":
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=(
                "LLM_PROVIDER=ollama is reserved for a future phase once a local "
                "Ollama server is available. Set LLM_PROVIDER=openai in .env for now."
            ),
        )

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Unknown LLM_PROVIDER '{settings.LLM_PROVIDER}'.",
    )
