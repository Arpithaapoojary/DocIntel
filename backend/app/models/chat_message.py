"""
ChatMessage ORM model — one row per question asked, with its answer,
confidence score, and the sources used, so chat history can be listed
and cleared later.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), index=True, nullable=False)

    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    sources_json: Mapped[str] = mapped_column(Text, default="[]")  # JSON-encoded list of source dicts

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
