"""
Admin service: user management and platform-wide analytics.

Deleting a user cascades to their documents (files + vectors) and their
chat history — an orphaned Document row pointing at a deleted user would
otherwise be a silent bug waiting to happen.
"""

import os

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.rag.vector_store.faiss_store import FaissStore
from app.repositories.chat_history_repository import ChatHistoryRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.user_repository import UserRepository
from app.schemas.admin import AdminAnalyticsResponse, AdminUserOut


class AdminService:
    def __init__(self, db: Session, vector_store: FaissStore):
        self.user_repo = UserRepository(db)
        self.doc_repo = DocumentRepository(db)
        self.history_repo = ChatHistoryRepository(db)
        self.vector_store = vector_store

    def list_users(self) -> list[AdminUserOut]:
        users = self.user_repo.list_all()
        return [
            AdminUserOut(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                is_active=u.is_active,
                is_admin=u.is_admin,
                document_count=self.doc_repo.count_for_user(u.id),
                question_count=self.history_repo.count_for_user(u.id),
            )
            for u in users
        ]

    def delete_user(self, user_id: str, requesting_admin_id: str) -> None:
        if user_id == requesting_admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot delete your own admin account while logged in as it.",
            )

        user = self.user_repo.get_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        for doc in self.doc_repo.list_by_user(user_id):
            self.vector_store.delete_document(doc.id)
            if os.path.exists(doc.stored_path):
                os.remove(doc.stored_path)
            self.doc_repo.delete(doc)

        self.history_repo.clear_for_user(user_id)
        self.user_repo.delete(user)

    def toggle_admin_role(self, user_id: str, requesting_admin_id: str) -> AdminUserOut:
        if user_id == requesting_admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot change your own admin role while logged in.",
            )
        user = self.user_repo.get_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
        if not user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Strict Single-Admin Policy: Only one admin account is allowed. Additional admins cannot be created.",
            )

        updated_user = self.user_repo.update_admin_role(user, False)
        return AdminUserOut(
            id=updated_user.id,
            email=updated_user.email,
            full_name=updated_user.full_name,
            is_active=updated_user.is_active,
            is_admin=updated_user.is_admin,
            document_count=self.doc_repo.count_for_user(updated_user.id),
            question_count=self.history_repo.count_for_user(updated_user.id),
        )

    def delete_any_document(self, document_id: str) -> None:
        """Admin document deletion bypasses the ownership check that the
        regular /document/{id} endpoint enforces."""
        doc = self.doc_repo.get_by_id(document_id)
        if doc is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

        self.vector_store.delete_document(doc.id)
        if os.path.exists(doc.stored_path):
            os.remove(doc.stored_path)
        self.doc_repo.delete(doc)

    def get_analytics(self) -> AdminAnalyticsResponse:
        return AdminAnalyticsResponse(
            total_users=self.user_repo.count_users(),
            total_documents=self.doc_repo.count_all(),
            total_questions_asked=self.history_repo.count_all(),
            total_storage_bytes=self.doc_repo.total_storage_all(),
        )
