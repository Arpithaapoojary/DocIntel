"""
Search service: semantic search re-uses the same embedding + FAISS
retrieval as the Q&A pipeline, but returns raw matching chunks instead of
an LLM-generated answer. Keyword search scans stored chunk text directly.
Both support optional document and upload-date filters.
"""

from datetime import date, datetime, time

from sqlalchemy.orm import Session

from app.rag.embeddings.base import BaseEmbedder
from app.rag.vector_store.faiss_store import FaissStore
from app.repositories.document_repository import DocumentRepository
from app.schemas.search import SearchRequest, SearchResponse, SearchResultOut


class SearchService:
    def __init__(self, db: Session, embedder: BaseEmbedder, vector_store: FaissStore):
        self.doc_repo = DocumentRepository(db)
        self.embedder = embedder
        self.vector_store = vector_store

    def search(self, user_id: str, request: SearchRequest) -> SearchResponse:
        allowed_doc_ids = self._resolve_date_filtered_doc_ids(user_id, request)

        if request.mode == "keyword":
            raw_results = self._keyword_search(user_id, request.query, allowed_doc_ids, request.top_k)
        else:
            raw_results = self._semantic_search(user_id, request.query, allowed_doc_ids, request.top_k)

        doc_name_cache: dict[str, str] = {}
        results = []
        for r in raw_results:
            doc_id = r["document_id"]
            if doc_id not in doc_name_cache:
                doc = self.doc_repo.get_by_id(doc_id)
                doc_name_cache[doc_id] = doc.original_filename if doc else "Unknown document"
            results.append(
                SearchResultOut(
                    document_id=doc_id,
                    document_name=doc_name_cache[doc_id],
                    page=r["page"],
                    snippet=(r["text"][:220] + "...") if len(r["text"]) > 220 else r["text"],
                    similarity=r.get("similarity"),
                )
            )

        return SearchResponse(results=results, total_results=len(results))

    def _resolve_date_filtered_doc_ids(self, user_id: str, request: SearchRequest) -> list[str] | None:
        """Combines the explicit document_ids filter with an upload-date range
        filter, returning the final allowed set of document ids (or None if
        no filtering is requested at all)."""
        if not request.uploaded_after and not request.uploaded_before:
            return request.document_ids

        docs = self.doc_repo.list_by_user(user_id)
        allowed = []
        for d in docs:
            if request.document_ids and d.id not in request.document_ids:
                continue
            uploaded_date = d.uploaded_at.date() if isinstance(d.uploaded_at, datetime) else d.uploaded_at
            if request.uploaded_after and uploaded_date < request.uploaded_after:
                continue
            if request.uploaded_before and uploaded_date > request.uploaded_before:
                continue
            allowed.append(d.id)
        return allowed

    def _semantic_search(
        self, user_id: str, query: str, document_ids: list[str] | None, top_k: int
    ) -> list[dict]:
        query_vector = self.embedder.embed_texts([query])[0]
        return self.vector_store.search(
            query_vector, top_k=top_k, user_id=user_id, document_ids=document_ids
        )

    def _keyword_search(
        self, user_id: str, query: str, document_ids: list[str] | None, top_k: int
    ) -> list[dict]:
        query_lower = query.lower()
        matches = []
        for meta in self.vector_store.metadata:
            if meta["user_id"] != user_id:
                continue
            if document_ids is not None and meta["document_id"] not in document_ids:
                continue
            if query_lower in meta["text"].lower():
                matches.append(meta)
            if len(matches) >= top_k:
                break
        return matches
