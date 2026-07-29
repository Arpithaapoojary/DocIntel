"""
Abstract embedder interface. Keeping this abstract means swapping the
embedding backend later (e.g. a different model, or an API-based embedder)
never touches the chunking, storage, or retrieval code.
"""

from abc import ABC, abstractmethod


class BaseEmbedder(ABC):
    @abstractmethod
    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Embed a batch of texts. Returns one vector per input text."""
        raise NotImplementedError

    @abstractmethod
    def get_dimension(self) -> int:
        """Return the fixed vector dimension this embedder produces."""
        raise NotImplementedError
