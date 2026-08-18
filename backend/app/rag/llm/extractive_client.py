"""
Extractive LLM client — no API key or internet required.
Instead of generating an answer with an LLM, it returns the most relevant
retrieved passage directly as the answer (extractive QA).

This is the default fallback when no LLM provider is configured.
It still uses the FAISS vector search to find the best matching chunks —
it just skips the generative LLM step and returns the raw text.
"""

import re

from app.rag.llm.base import BaseLLMClient


class ExtractiveClient(BaseLLMClient):
    """
    Returns the context chunks themselves as the answer.

    The user_prompt produced by build_user_prompt() looks like:

        Context excerpts:

        [Excerpt 1 — filename.pdf, page 1]
        <chunk text>

        [Excerpt 2 — filename.pdf, page 2]
        <chunk text>

        Question: <question>

        Answer:

    This parser pulls out each excerpt block and returns the best one
    as a cleanly formatted answer.
    """

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        # Separate context excerpts from the trailing Question/Answer section
        qa_split = re.split(r"\n+Question:\s*", user_prompt, maxsplit=1)
        context_part = qa_split[0]

        # Match excerpt blocks: [Excerpt N — doc, page P]\ntext
        pattern = r"\[Excerpt\s+\d+\s+—\s+[^\]]+\]\n(.*?)(?=\n\[Excerpt|\Z)"
        matches = re.findall(pattern, context_part, re.DOTALL)

        excerpts = [m.strip() for m in matches if m.strip()]

        if not excerpts:
            return (
                "I could not find relevant information in your uploaded documents "
                "to answer this question. Please upload a document that contains "
                "information about this topic."
            )

        # Return the best (first = highest similarity) passage, cleanly formatted
        best = excerpts[0]
        extra = ""
        if len(excerpts) > 1:
            snippet = excerpts[1][:300]
            ellipsis = "..." if len(excerpts[1]) > 300 else ""
            extra = f"\n\n**Also relevant:**\n\n> {snippet}{ellipsis}"

        return f"Based on your uploaded documents:\n\n> {best}{extra}"

