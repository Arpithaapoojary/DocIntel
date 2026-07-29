"""
Pydantic schemas for Document requests/responses.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentOut(BaseModel):
    id: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    page_count: int
    chunk_count: int
    status: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    documents: list[DocumentOut]
    total_documents: int
    total_storage_bytes: int
