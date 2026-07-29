"""
Prompt construction for the RAG Q&A pipeline.

The design choice that matters most here: citations are attached
programmatically from retrieval metadata (see qa_service.py), NOT parsed
out of the LLM's own output. The LLM only ever has to answer the question
using the given context — it never has to (and never gets to) invent which
document/page something came from. That removes an entire class of
hallucinated-citation failure.
"""

NO_INFO_FALLBACK = "I couldn't find relevant information in the uploaded documents."


SYSTEM_PROMPT = """You are a document Q&A assistant. You answer questions using ONLY the
context excerpts provided below, which come from the user's own uploaded documents.

Rules you must follow:
1. Answer using only the information in the provided context. Do not use outside knowledge.
2. If the context does not contain enough information to answer the question, say so plainly —
   do not guess, speculate, or fill gaps with general knowledge.
3. Do not fabricate facts, numbers, names, or details that are not present in the context.
4. Be concise and directly answer the question asked.
5. Do not mention "the context" or "the excerpts" explicitly — just answer naturally, as if you
   had read the documents yourself.
"""


def build_user_prompt(question: str, context_chunks: list[dict]) -> str:
    """
    context_chunks: list of {"document_name": str, "page": int, "text": str}
    """
    excerpt_blocks = []
    for i, chunk in enumerate(context_chunks, start=1):
        excerpt_blocks.append(
            f"[Excerpt {i} — {chunk['document_name']}, page {chunk['page']}]\n{chunk['text']}"
        )
    context_text = "\n\n".join(excerpt_blocks)

    return f"""Context excerpts:

{context_text}

Question: {question}

Answer:"""
