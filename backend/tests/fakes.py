"""
Fakes used only in tests — deterministic, offline, no network/model download.

FakeEmbedder uses a hashed bag-of-words representation instead of a pure
text hash. This matters for Phase 3: retrieval tests need a question and
its matching chunk to actually score as *more similar* than an unrelated
chunk, which a pure whole-string hash can't provide (any two different
strings hash to unrelated vectors). Hashing individual words into a fixed
number of buckets gives crude but real semantic overlap when texts share
vocabulary — enough to test retrieval, thresholding, and citation logic
without needing a real embedding model.
"""

import hashlib
import re

from app.rag.embeddings.base import BaseEmbedder
from app.rag.llm.base import BaseLLMClient

FAKE_DIMENSION = 256


class FakeEmbedder(BaseEmbedder):
    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_one(t) for t in texts]

    def _embed_one(self, text: str) -> list[float]:
        vec = [0.0] * FAKE_DIMENSION
        words = re.findall(r"[a-z0-9]+", text.lower())
        for word in words:
            bucket = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16) % FAKE_DIMENSION
            vec[bucket] += 1.0
        return vec

    def get_dimension(self) -> int:
        return FAKE_DIMENSION


class FakeLLMClient(BaseLLMClient):
    """Returns a canned, deterministic answer so tests can assert on plumbing
    (that a call happened, that context reached it) without needing a real
    model or API key."""

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        return "This is a test answer generated from the provided document context."
