"""
Admin endpoints: user management and platform-wide analytics.
All routes require an admin account (see api/deps.py::get_current_admin).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_db
from app.models.user import User
from app.rag.vector_store.dependency import get_vector_store
from app.rag.vector_store.faiss_store import FaissStore
from app.schemas.admin import AdminAnalyticsResponse, AdminUserOut
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])


def _get_service(
    db: Session = Depends(get_db),
    vector_store: FaissStore = Depends(get_vector_store),
) -> AdminService:
    return AdminService(db=db, vector_store=vector_store)


@router.get("/users", response_model=list[AdminUserOut])
def list_users(
    current_admin: User = Depends(get_current_admin),
    service: AdminService = Depends(_get_service),
):
    """List every user on the platform, with their document/question counts."""
    return service.list_users()


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    current_admin: User = Depends(get_current_admin),
    service: AdminService = Depends(_get_service),
):
    """Delete a user and cascade-delete their documents, vectors, and chat history."""
    service.delete_user(user_id, requesting_admin_id=current_admin.id)


@router.delete("/documents/{document_id}", status_code=204)
def delete_any_document(
    document_id: str,
    current_admin: User = Depends(get_current_admin),
    service: AdminService = Depends(_get_service),
):
    """Delete any user's document — bypasses the ownership check regular users have."""
    service.delete_any_document(document_id)


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_analytics(
    current_admin: User = Depends(get_current_admin),
    service: AdminService = Depends(_get_service),
):
    """Platform-wide totals: users, documents, questions asked, storage used."""
    return service.get_analytics()
