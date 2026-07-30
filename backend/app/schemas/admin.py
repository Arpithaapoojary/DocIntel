"""
Admin schemas: user management and platform-wide analytics.
"""

from pydantic import BaseModel

from app.schemas.user import UserOut


class AdminUserOut(UserOut):
    document_count: int
    question_count: int


class AdminAnalyticsResponse(BaseModel):
    total_users: int
    total_documents: int
    total_questions_asked: int
    total_storage_bytes: int
