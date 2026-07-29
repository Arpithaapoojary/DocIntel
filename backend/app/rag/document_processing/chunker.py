"""
Chunking: splits extracted page text into overlapping word-window chunks,
tagging each chunk with the page number it came from.
"""


def chunk_pages(
    pages: list[tuple[int, str]], chunk_size: int, chunk_overlap: int
) -> list[dict]:
    """
    pages: list of (page_number, page_text)
    Returns: list of {"text": str, "page": int} chunks.

    chunk_size/chunk_overlap are measured in characters to keep the logic
    simple and predictable; words are never split mid-token.
    """
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be smaller than chunk_size")

    chunks: list[dict] = []

    for page_number, text in pages:
        text = text.strip()
        if not text:
            continue

        start = 0
        length = len(text)
        while start < length:
            end = min(start + chunk_size, length)

            # avoid cutting a word in half: extend to the next whitespace
            if end < length:
                while end < length and not text[end].isspace():
                    end += 1

            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append({"text": chunk_text, "page": page_number})

            if end >= length:
                break
            start = end - chunk_overlap

    return chunks
