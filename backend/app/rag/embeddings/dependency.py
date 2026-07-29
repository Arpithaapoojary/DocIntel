"""
Dependency-injectable embedder factory.

Using a FastAPI dependency (rather than a bare module-level singleton)
means tests can swap in a fast, deterministic fake embedder via
app.dependency_overrides, without downloading any real model or touching
the network.
"""

from functools import lru_cache

from app.core.config import settings
from app.rag.embeddings.base import BaseEmbedder
from app.rag.embeddings.sentence_transformer_embedder import SentenceTransformerEmbedder


@lru_cache()
def get_embedder() -> BaseEmbedder:
    return SentenceTransformerEmbedder(settings.EMBEDDING_MODEL)
