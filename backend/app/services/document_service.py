"""
Document service: the upload -> extract -> chunk -> embed -> store pipeline.
"""

import os
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
from app.rag.document_processing.chunker import chunk_pages
from app.rag.document_processing.extractors import extract_pages
from app.rag.embeddings.base import BaseEmbedder
from app.rag.vector_store.faiss_store import FaissStore
from app.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentListResponse, DocumentOut
from app.utils.validators import validate_extension, validate_not_duplicate, validate_size


class DocumentService:
    def __init__(self, db: Session, embedder: BaseEmbedder, vector_store: FaissStore):
        self.repo = DocumentRepository(db)
        self.embedder = embedder
        self.vector_store = vector_store

    def upload(self, user_id: str, file: UploadFile) -> DocumentOut:
        ext = validate_extension(file.filename)

        # Read fully to validate size (UploadFile.size isn't always populated
        # by every client), then reset the pointer for saving.
        contents = file.file.read()
        validate_size(len(contents))
        file.file.seek(0)

        existing_filenames = self.repo.get_filenames_for_user(user_id)
        validate_not_duplicate(existing_filenames, file.filename)

        user_dir = os.path.join(settings.UPLOAD_DIR, user_id)
        os.makedirs(user_dir, exist_ok=True)
        stored_name = f"{uuid.uuid4()}{ext}"
        stored_path = os.path.join(user_dir, stored_name)
        with open(stored_path, "wb") as out_file:
            out_file.write(contents)

        doc = self.repo.create(
            user_id=user_id,
            original_filename=file.filename,
            stored_path=stored_path,
            file_type=ext,
            file_size_bytes=len(contents),
        )

        try:
            self._process(doc, user_id)
        except Exception as exc:  # noqa: BLE001 - convert any processing failure into a clean 500
            self.repo.mark_failed(doc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process document: {exc}",
            ) from exc

        return DocumentOut.model_validate(self.repo.get_by_id(doc.id))

    def _process(self, doc: Document, user_id: str) -> None:
        pages = extract_pages(doc.stored_path, doc.file_type)
        if not pages:
            raise ValueError("No extractable text found in the document.")

        chunks = chunk_pages(pages, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
        if not chunks:
            raise ValueError("Document produced no chunks after splitting.")

        vectors = self.embedder.embed_texts([c["text"] for c in chunks])
        self.vector_store.add_document_chunks(doc.id, user_id, chunks, vectors)

        self.repo.mark_ready(doc, page_count=len(pages), chunk_count=len(chunks))

    def list_documents(self, user_id: str) -> DocumentListResponse:
        docs = self.repo.list_by_user(user_id)
        return DocumentListResponse(
            documents=[DocumentOut.model_validate(d) for d in docs],
            total_documents=len(docs),
            total_storage_bytes=self.repo.total_storage_for_user(user_id),
        )

    def delete_document(self, user_id: str, doc_id: str) -> None:
        doc = self.repo.get_by_id(doc_id)
        if doc is None or doc.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

        self.vector_store.delete_document(doc_id)
        if os.path.exists(doc.stored_path):
            os.remove(doc.stored_path)
        self.repo.delete(doc)
