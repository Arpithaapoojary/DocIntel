"""
Dependency-injectable vector store factory.

Cached per embedding dimension so switching embedding models doesn't
silently mix incompatible vectors in the same index.
"""

from functools import lru_cache

from fastapi import Depends

from app.core.config import settings
from app.rag.embeddings.base import BaseEmbedder
from app.rag.embeddings.dependency import get_embedder
from app.rag.vector_store.faiss_store import FaissStore


@lru_cache()
def _get_store_for_dimension(dimension: int) -> FaissStore:
    return FaissStore(dimension=dimension, persist_dir=settings.VECTOR_STORE_DIR)


def get_vector_store(embedder: BaseEmbedder = Depends(get_embedder)) -> FaissStore:
    return _get_store_for_dimension(embedder.get_dimension())
