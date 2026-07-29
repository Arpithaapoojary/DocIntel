"""
QA service: embed question -> retrieve relevant chunks -> (if relevant
enough) ask the LLM, grounded strictly in retrieved context -> attach
citations from retrieval metadata -> save to history.
"""

import json

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.rag.embeddings.base import BaseEmbedder
from app.rag.llm.base import BaseLLMClient
from app.rag.prompts.qa_prompt import NO_INFO_FALLBACK, SYSTEM_PROMPT, build_user_prompt
from app.rag.vector_store.faiss_store import FaissStore
from app.repositories.chat_history_repository import ChatHistoryRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.chat import AskResponse, ChatMessageOut, SourceOut


class QAService:
    def __init__(
        self,
        db: Session,
        embedder: BaseEmbedder,
        vector_store: FaissStore,
        llm_client: BaseLLMClient,
    ):
        self.doc_repo = DocumentRepository(db)
        self.history_repo = ChatHistoryRepository(db)
        self.embedder = embedder
        self.vector_store = vector_store
        self.llm_client = llm_client

    def ask(self, user_id: str, question: str, document_ids: list[str] | None = None) -> AskResponse:
        if not question or not question.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Question cannot be empty.")

        query_vector = self.embedder.embed_texts([question])[0]
        results = self.vector_store.search(
            query_vector, top_k=settings.TOP_K_RESULTS, user_id=user_id, document_ids=document_ids
        )
        relevant = [r for r in results if r["similarity"] >= settings.RELEVANCE_THRESHOLD]

        if not relevant:
            answer_text = NO_INFO_FALLBACK
            sources: list[SourceOut] = []
            confidence = 0.0
        else:
            # Resolve document names for the LLM prompt and for citations.
            doc_name_cache: dict[str, str] = {}
            context_chunks = []
            for r in relevant:
                doc_id = r["document_id"]
                if doc_id not in doc_name_cache:
                    doc = self.doc_repo.get_by_id(doc_id)
                    doc_name_cache[doc_id] = doc.original_filename if doc else "Unknown document"
                context_chunks.append(
                    {"document_name": doc_name_cache[doc_id], "page": r["page"], "text": r["text"]}
                )

            user_prompt = build_user_prompt(question, context_chunks)
            answer_text = self.llm_client.generate(SYSTEM_PROMPT, user_prompt)

            sources = [
                SourceOut(
                    document_id=r["document_id"],
                    document_name=doc_name_cache[r["document_id"]],
                    page=r["page"],
                    snippet=(r["text"][:220] + "...") if len(r["text"]) > 220 else r["text"],
                )
                for r in relevant
            ]
            confidence = round(sum(r["similarity"] for r in relevant) / len(relevant) * 100, 1)

        self.history_repo.create(
            user_id=user_id,
            question=question,
            answer=answer_text,
            confidence=confidence,
            sources=[s.model_dump() for s in sources],
        )

        return AskResponse(answer=answer_text, sources=sources, confidence=confidence)

    def get_history(self, user_id: str) -> list[ChatMessageOut]:
        messages = self.history_repo.list_by_user(user_id)
        return [
            ChatMessageOut(
                id=m.id,
                question=m.question,
                answer=m.answer,
                confidence=m.confidence,
                sources=[SourceOut(**s) for s in json.loads(m.sources_json)],
                created_at=m.created_at,
            )
            for m in messages
        ]

    def clear_history(self, user_id: str) -> int:
        return self.history_repo.clear_for_user(user_id)
