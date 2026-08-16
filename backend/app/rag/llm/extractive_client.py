"""
Extractive LLM client — no API key or internet required.
Instead of generating an answer with an LLM, it returns the most relevant
retrieved passage directly as the answer (extractive QA).

This is the default fallback when no LLM provider is configured.
It still uses the FAISS vector search to find the best matching chunks —
it just skips the generative LLM step and returns the raw text.
"""

from app.rag.llm.base import BaseLLMClient


class ExtractiveClient(BaseLLMClient):
    """
    Returns the context chunks themselves as the answer.
    Parses the user_prompt to extract the context and question,
    then returns the most relevant snippet cleanly formatted.
    """

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        # Extract the context blocks from the prompt
        lines = user_prompt.splitlines()
        context_lines = []
        question = ""
        in_context = False

        for line in lines:
            stripped = line.strip()
            if stripped.startswith("Question:"):
                question = stripped[len("Question:"):].strip()
            elif stripped.startswith("[Source") or stripped.startswith("Source"):
                in_context = True
            elif in_context and stripped.startswith("Text:"):
                context_lines.append(stripped[len("Text:"):].strip())
            elif stripped == "---":
                in_context = False

        if not context_lines:
            return (
                "I could not find relevant information in your uploaded documents "
                "to answer this question. Please upload a document that contains "
                "information about this topic."
            )

        # Return the best (first = highest similarity) passage, cleanly formatted
        best = context_lines[0]
        extra = ""
        if len(context_lines) > 1:
            extra = f"\n\n**Also relevant:**\n> {context_lines[1][:300]}{'...' if len(context_lines[1]) > 300 else ''}"

        return (
            f"Based on your documents:\n\n"
            f"> {best}"
            f"{extra}"
        )
