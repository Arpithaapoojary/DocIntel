"""
Search schemas: semantic + keyword search with optional filters.
"""

from datetime import date
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=500)
    mode: str = Field(default="semantic", description="'semantic' or 'keyword'")
    document_ids: list[str] | None = None
    uploaded_after: date | None = None
    uploaded_before: date | None = None
    top_k: int = Field(default=10, ge=1, le=50)


class SearchResultOut(BaseModel):
    document_id: str
    document_name: str
    page: int
    snippet: str
    similarity: float | None = None  # populated for semantic search, null for keyword


class SearchResponse(BaseModel):
    results: list[SearchResultOut]
    total_results: int
