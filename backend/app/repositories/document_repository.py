"""
Document repository: isolates raw DB queries from business logic.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.document import Document


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        user_id: str,
        original_filename: str,
        stored_path: str,
        file_type: str,
        file_size_bytes: int,
    ) -> Document:
        doc = Document(
            user_id=user_id,
            original_filename=original_filename,
            stored_path=stored_path,
            file_type=file_type,
            file_size_bytes=file_size_bytes,
            status="processing",
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def mark_ready(self, doc: Document, page_count: int, chunk_count: int) -> Document:
        doc.page_count = page_count
        doc.chunk_count = chunk_count
        doc.status = "ready"
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def mark_failed(self, doc: Document) -> Document:
        doc.status = "failed"
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def get_by_id(self, doc_id: str) -> Document | None:
        return self.db.query(Document).filter(Document.id == doc_id).first()

    def list_by_user(self, user_id: str) -> list[Document]:
        return (
            self.db.query(Document)
            .filter(Document.user_id == user_id)
            .order_by(Document.uploaded_at.desc())
            .all()
        )

    def get_filenames_for_user(self, user_id: str) -> list[str]:
        rows = self.db.query(Document.original_filename).filter(Document.user_id == user_id).all()
        return [r[0] for r in rows]

    def total_storage_for_user(self, user_id: str) -> int:
        total = (
            self.db.query(func.sum(Document.file_size_bytes))
            .filter(Document.user_id == user_id)
            .scalar()
        )
        return total or 0

    def delete(self, doc: Document) -> None:
        self.db.delete(doc)
        self.db.commit()
