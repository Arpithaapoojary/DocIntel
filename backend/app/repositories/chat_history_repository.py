"""
Chat history repository.
"""

import json

from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage


class ChatHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self, user_id: str, question: str, answer: str, confidence: float, sources: list[dict]
    ) -> ChatMessage:
        msg = ChatMessage(
            user_id=user_id,
            question=question,
            answer=answer,
            confidence=confidence,
            sources_json=json.dumps(sources),
        )
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def list_by_user(self, user_id: str) -> list[ChatMessage]:
        return (
            self.db.query(ChatMessage)
            .filter(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at.desc())
            .all()
        )

    def clear_for_user(self, user_id: str) -> int:
        count = self.db.query(ChatMessage).filter(ChatMessage.user_id == user_id).delete()
        self.db.commit()
        return count
