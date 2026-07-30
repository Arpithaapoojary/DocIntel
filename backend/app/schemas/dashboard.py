"""
Dashboard schema: the summary view the frontend home page will render.
"""

from pydantic import BaseModel

from app.schemas.chat import ChatMessageOut
from app.schemas.document import DocumentOut


class DashboardResponse(BaseModel):
    total_documents: int
    total_questions_asked: int
    storage_used_bytes: int
    recent_documents: list[DocumentOut]
    recent_questions: list[ChatMessageOut]
