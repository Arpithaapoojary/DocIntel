"""
Q&A endpoints: ask a question, view chat history, clear chat history.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.rag.embeddings.base import BaseEmbedder
from app.rag.embeddings.dependency import get_embedder
from app.rag.llm.base import BaseLLMClient
from app.rag.llm.dependency import get_llm_client
from app.rag.vector_store.dependency import get_vector_store
from app.rag.vector_store.faiss_store import FaissStore
from app.schemas.chat import AskRequest, AskResponse, ChatMessageOut
from app.services.qa_service import QAService

router = APIRouter(tags=["Q&A"])


def _get_service(
    db: Session = Depends(get_db),
    embedder: BaseEmbedder = Depends(get_embedder),
    vector_store: FaissStore = Depends(get_vector_store),
    llm_client: BaseLLMClient = Depends(get_llm_client),
) -> QAService:
    return QAService(db=db, embedder=embedder, vector_store=vector_store, llm_client=llm_client)


@router.post("/ask", response_model=AskResponse)
def ask_question(
    request: AskRequest,
    current_user: User = Depends(get_current_user),
    service: QAService = Depends(_get_service),
):
    """
    Ask a question about your uploaded documents. Answers are grounded strictly
    in retrieved excerpts — if nothing relevant is found, you'll get:
    "I couldn't find relevant information in the uploaded documents."
    """
    return service.ask(current_user.id, request.question, request.document_ids)


@router.get("/history", response_model=list[ChatMessageOut])
def get_history(
    current_user: User = Depends(get_current_user),
    service: QAService = Depends(_get_service),
):
    """List this user's Q&A history, most recent first."""
    return service.get_history(current_user.id)


@router.delete("/history", status_code=204)
def clear_history(
    current_user: User = Depends(get_current_user),
    service: QAService = Depends(_get_service),
):
    """Delete all of this user's Q&A history."""
    service.clear_history(current_user.id)
