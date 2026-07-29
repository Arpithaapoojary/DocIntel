"""
Abstract LLM client interface. Keeping this abstract means the OpenAI
implementation today can be swapped for Ollama (or anything else) later
without touching the QA service, prompts, or retrieval logic.
"""

from abc import ABC, abstractmethod


class BaseLLMClient(ABC):
    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generate a completion given a system and user prompt."""
        raise NotImplementedError
