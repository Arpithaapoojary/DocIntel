"""
Groq LLM client — uses Groq's free, ultra-fast inference API.
Groq is OpenAI-compatible so we reuse the openai package with a custom base_url.

Free tier: https://console.groq.com (sign up, get free API key instantly)
Recommended model: llama-3.1-8b-instant (free, very fast)
"""

from fastapi import HTTPException, status

from app.rag.llm.base import BaseLLMClient


class GroqLLMClient(BaseLLMClient):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        self._client = None

    def _load_client(self):
        if self._client is None:
            if not self.api_key:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        "GROQ_API_KEY is not configured. "
                        "Get a free key at https://console.groq.com and set it in your .env file."
                    ),
                )
            from openai import OpenAI
            self._client = OpenAI(
                api_key=self.api_key,
                base_url="https://api.groq.com/openai/v1",
            )
        return self._client

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        client = self._load_client()
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=600,
        )
        return response.choices[0].message.content.strip()
