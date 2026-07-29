"""
OpenAI LLM client — the default, production LLM backend for this project.
"""

from fastapi import HTTPException, status

from app.rag.llm.base import BaseLLMClient


class OpenAILLMClient(BaseLLMClient):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        self._client = None  # loaded lazily

    def _load_client(self):
        if self._client is None:
            if not self.api_key:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        "OPENAI_API_KEY is not configured. Set it in your .env file "
                        "(LLM_PROVIDER=openai requires a valid OpenAI API key)."
                    ),
                )
            from openai import OpenAI

            self._client = OpenAI(api_key=self.api_key)
        return self._client

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        client = self._load_client()
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,  # low temperature: favor grounded, consistent answers over creativity
            max_tokens=600,
        )
        return response.choices[0].message.content.strip()
