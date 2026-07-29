"""
Sentence-Transformers embedder — the real, production embedding backend.

The model is loaded lazily on first use (not at import time) so that
importing this module doesn't force a model download in contexts where
it isn't needed (e.g. running unrelated tests).
"""

from app.rag.embeddings.base import BaseEmbedder


class SentenceTransformerEmbedder(BaseEmbedder):
    def __init__(self, model_name: str):
        self.model_name = model_name
        self._model = None  # loaded lazily

    def _load_model(self):
        if self._model is None:
            # Imported here, not at module level, so environments that never
            # touch the real embedder don't need torch/sentence-transformers
            # importable just to import this file.
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name)
        return self._model

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        model = self._load_model()
        vectors = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return vectors.tolist()

    def get_dimension(self) -> int:
        model = self._load_model()
        return model.get_sentence_embedding_dimension()
