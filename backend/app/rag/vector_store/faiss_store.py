"""
FAISS vector store wrapper.

Stores one flat L2 index plus a parallel metadata list (chunk text, page
number, document id, owner user id). Both are persisted to disk so the
index survives a restart.

FAISS itself doesn't support deleting by arbitrary id in the plain
IndexFlatL2 index, so deletion is implemented by rebuilding the index from
the surviving metadata — perfectly fine at the scale this project targets.
"""

import os
import pickle
import threading

import faiss
import numpy as np


def _normalize(vectors: np.ndarray) -> np.ndarray:
    """L2-normalize each row. Normalizing lets us convert IndexFlatL2's squared
    L2 distance into a cosine similarity: for unit vectors,
    ||a-b||^2 = 2 - 2*cos_sim(a,b)  =>  cos_sim = 1 - distance/2.
    This gives a meaningful, bounded [-1,1] similarity we can use for
    relevance thresholding and confidence scoring downstream."""
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1e-8
    return vectors / norms


class FaissStore:
    def __init__(self, dimension: int, persist_dir: str):
        self.dimension = dimension
        self.persist_dir = persist_dir
        os.makedirs(self.persist_dir, exist_ok=True)

        self._index_path = os.path.join(self.persist_dir, "index.faiss")
        self._meta_path = os.path.join(self.persist_dir, "metadata.pkl")
        self._lock = threading.Lock()

        self.index = faiss.IndexFlatL2(dimension)
        self.metadata: list[dict] = []  # aligned by row position with self.index

        self._load()

    def _load(self):
        if os.path.exists(self._index_path) and os.path.exists(self._meta_path):
            self.index = faiss.read_index(self._index_path)
            with open(self._meta_path, "rb") as f:
                self.metadata = pickle.load(f)

    def _persist(self):
        faiss.write_index(self.index, self._index_path)
        with open(self._meta_path, "wb") as f:
            pickle.dump(self.metadata, f)

    def add_document_chunks(
        self, document_id: str, user_id: str, chunks: list[dict], vectors: list[list[float]]
    ) -> int:
        """chunks: [{"text": ..., "page": ...}, ...] aligned with vectors. Returns count added."""
        if len(chunks) != len(vectors):
            raise ValueError("chunks and vectors must be the same length")
        if not chunks:
            return 0

        with self._lock:
            np_vectors = _normalize(np.array(vectors, dtype="float32"))
            self.index.add(np_vectors)
            for chunk in chunks:
                self.metadata.append(
                    {
                        "document_id": document_id,
                        "user_id": user_id,
                        "text": chunk["text"],
                        "page": chunk["page"],
                    }
                )
            self._persist()
        return len(chunks)

    def delete_document(self, document_id: str) -> int:
        """Rebuilds the index without the given document's chunks. Returns count removed."""
        with self._lock:
            keep_indices = [
                i for i, m in enumerate(self.metadata) if m["document_id"] != document_id
            ]
            removed = len(self.metadata) - len(keep_indices)
            if removed == 0:
                return 0

            new_index = faiss.IndexFlatL2(self.dimension)
            if keep_indices:
                all_vectors = self.index.reconstruct_n(0, self.index.ntotal)
                kept_vectors = all_vectors[keep_indices]
                new_index.add(kept_vectors)

            self.index = new_index
            self.metadata = [self.metadata[i] for i in keep_indices]
            self._persist()
        return removed

    def search(
        self, query_vector: list[float], top_k: int, user_id: str | None = None,
        document_ids: list[str] | None = None,
    ) -> list[dict]:
        """Returns top_k metadata dicts (with a 'score' field added), optionally scoped
        to a user and/or a specific set of document ids."""
        if self.index.ntotal == 0:
            return []

        # Over-fetch to allow for post-filtering by user/document, then trim.
        fetch_k = min(self.index.ntotal, max(top_k * 5, top_k))
        query_np = _normalize(np.array([query_vector], dtype="float32"))
        distances, indices = self.index.search(query_np, fetch_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue
            meta = self.metadata[idx]
            if user_id and meta["user_id"] != user_id:
                continue
            if document_ids and meta["document_id"] not in document_ids:
                continue
            similarity = max(0.0, min(1.0, 1.0 - (float(dist) / 2.0)))
            results.append({**meta, "score": float(dist), "similarity": similarity})
            if len(results) >= top_k:
                break
        return results

    def total_chunks(self) -> int:
        return self.index.ntotal
