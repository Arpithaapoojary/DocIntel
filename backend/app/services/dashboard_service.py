"""
Dashboard service: aggregates a user's documents, Q&A activity, and storage
usage into a single summary view.
"""

from sqlalchemy.orm import Session

from app.repositories.chat_history_repository import ChatHistoryRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.chat import ChatMessageOut, SourceOut
from app.schemas.dashboard import DashboardResponse
from app.schemas.document import DocumentOut
import json


class DashboardService:
    def __init__(self, db: Session):
        self.doc_repo = DocumentRepository(db)
        self.history_repo = ChatHistoryRepository(db)

    def get_dashboard(self, user_id: str) -> DashboardResponse:
        recent_docs = self.doc_repo.list_recent_by_user(user_id, limit=5)
        recent_messages = self.history_repo.list_recent_by_user(user_id, limit=5)

        return DashboardResponse(
            total_documents=self.doc_repo.count_for_user(user_id),
            total_questions_asked=self.history_repo.count_for_user(user_id),
            storage_used_bytes=self.doc_repo.total_storage_for_user(user_id),
            recent_documents=[DocumentOut.model_validate(d) for d in recent_docs],
            recent_questions=[
                ChatMessageOut(
                    id=m.id,
                    question=m.question,
                    answer=m.answer,
                    confidence=m.confidence,
                    sources=[SourceOut(**s) for s in json.loads(m.sources_json)],
                    created_at=m.created_at,
                )
                for m in recent_messages
            ],
        )
