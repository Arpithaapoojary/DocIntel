"""
Document endpoints: upload, list, delete.
"""

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.rag.embeddings.base import BaseEmbedder
from app.rag.embeddings.dependency import get_embedder
from app.rag.vector_store.dependency import get_vector_store
from app.rag.vector_store.faiss_store import FaissStore
from app.schemas.document import DocumentListResponse, DocumentOut
from app.services.document_service import DocumentService

router = APIRouter(tags=["Documents"])


def _get_service(
    db: Session = Depends(get_db),
    embedder: BaseEmbedder = Depends(get_embedder),
    vector_store: FaissStore = Depends(get_vector_store),
) -> DocumentService:
    return DocumentService(db=db, embedder=embedder, vector_store=vector_store)


@router.post("/upload", response_model=DocumentOut, status_code=201)
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: DocumentService = Depends(_get_service),
):
    """Upload a PDF, DOCX, or TXT file. Processed synchronously (extract → chunk → embed → index)."""
    return service.upload(current_user.id, file)


@router.get("/documents", response_model=DocumentListResponse)
def list_documents(
    current_user: User = Depends(get_current_user),
    service: DocumentService = Depends(_get_service),
):
    """List all documents owned by the current user, plus storage usage."""
    return service.list_documents(current_user.id)


@router.delete("/document/{document_id}", status_code=204)
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    service: DocumentService = Depends(_get_service),
):
    """Delete a document: removes the file, its vectors, and its DB record."""
    service.delete_document(current_user.id, document_id)
