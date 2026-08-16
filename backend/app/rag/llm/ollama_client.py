"""
Ollama LLM client — calls a locally running Ollama server.
No API key required. Requires Ollama to be installed and running
with the model pulled: `ollama pull llama3`
"""

import json
import urllib.request
import urllib.error

from app.rag.llm.base import BaseLLMClient


class OllamaLLMClient(BaseLLMClient):
    def __init__(self, base_url: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.model = model

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        payload = json.dumps({
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "stream": False,
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{self.base_url}/api/chat",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result["message"]["content"]
        except urllib.error.URLError as e:
            raise RuntimeError(
                f"Could not reach Ollama at {self.base_url}. "
                f"Make sure Ollama is running (`ollama serve`) and the model is pulled "
                f"(`ollama pull {self.model}`). Original error: {e}"
            )
