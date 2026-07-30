"""
Search endpoint: semantic or keyword search across the user's documents,
with optional document/date filters. Does not call the LLM — returns raw
matching chunks, unlike /ask.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.rag.embeddings.base import BaseEmbedder
from app.rag.embeddings.dependency import get_embedder
from app.rag.vector_store.dependency import get_vector_store
from app.rag.vector_store.faiss_store import FaissStore
from app.schemas.search import SearchRequest, SearchResponse
from app.services.search_service import SearchService

router = APIRouter(tags=["Search"])


@router.post("/search", response_model=SearchResponse)
def search_documents(
    request: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    embedder: BaseEmbedder = Depends(get_embedder),
    vector_store: FaissStore = Depends(get_vector_store),
):
    """Semantic (mode='semantic') or keyword (mode='keyword') search over your documents."""
    service = SearchService(db=db, embedder=embedder, vector_store=vector_store)
    return service.search(current_user.id, request)
