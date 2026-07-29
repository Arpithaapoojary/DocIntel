"""
Pydantic schemas for the Q&A endpoint and chat history.
"""

from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class SourceOut(BaseModel):
    document_id: str
    document_name: str
    page: int
    snippet: str


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    document_ids: list[str] | None = Field(
        default=None, description="Optional: restrict the search to specific document ids."
    )


class AskResponse(BaseModel):
    answer: str
    sources: list[SourceOut]
    confidence: float = Field(ge=0, le=100, description="0-100 confidence score based on retrieval relevance.")


class ChatMessageOut(BaseModel):
    id: str
    question: str
    answer: str
    confidence: float
    sources: list[SourceOut]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
