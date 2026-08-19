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
        question_part = qa_split[1].replace("Answer:", "").strip() if len(qa_split) > 1 else ""

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

        stopwords = {
            'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
            'is', 'are', 'was', 'were', 'the', 'a', 'an', 'in', 'on', 'at', 'for',
            'to', 'of', 'and', 'or', 'does', 'do', 'did', 'tell', 'me', 'about', 'find', 'show', 'give'
        }
        q_words = [
            w.lower() for w in re.findall(r'\b[a-zA-Z0-9_\-\./]+\b', question_part)
            if len(w) >= 2 and w.lower() not in stopwords
        ]

        # Scan for directly matching lines or sentences across excerpts
        matching_lines = []
        if q_words:
            for exc in excerpts:
                for line in exc.splitlines():
                    line_clean = line.strip()
                    if not line_clean or len(line_clean) < 3:
                        continue
                    line_lower = line_clean.lower()
                    if any(w in line_lower for w in q_words):
                        if line_clean not in matching_lines:
                            matching_lines.append(line_clean)

        if matching_lines:
            bullet_points = "\n".join(f"- {line}" for line in matching_lines[:6])
            return f"Based on your uploaded documents:\n\n{bullet_points}"

        # Fallback to returning the best passage, cleanly formatted
        best = excerpts[0]
        extra = ""
        if len(excerpts) > 1:
            snippet = excerpts[1][:300]
            ellipsis = "..." if len(excerpts[1]) > 300 else ""
            extra = f"\n\n**Also relevant:**\n\n> {snippet}{ellipsis}"

        return f"Based on your uploaded documents:\n\n> {best}{extra}"

