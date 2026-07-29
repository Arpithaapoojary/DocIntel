"""
Text extraction with page-number preservation.

- PDF: real per-page extraction via PyMuPDF (fitz).
- DOCX: python-docx has no reliable page-boundary concept (page breaks depend
  on rendering, not just explicit breaks), so the whole document is treated
  as a single logical "page" (page 1). This is a known, documented limitation.
- TXT: treated as a single page (page 1).
"""

import fitz  # PyMuPDF
import docx


def extract_pdf(file_path: str) -> list[tuple[int, str]]:
    """Returns a list of (page_number, page_text), 1-indexed."""
    pages = []
    with fitz.open(file_path) as pdf:
        for i, page in enumerate(pdf, start=1):
            text = page.get_text().strip()
            if text:
                pages.append((i, text))
    return pages


def extract_docx(file_path: str) -> list[tuple[int, str]]:
    """DOCX has no reliable page boundaries; returns everything as page 1."""
    document = docx.Document(file_path)
    full_text = "\n".join(p.text for p in document.paragraphs if p.text.strip())
    return [(1, full_text)] if full_text.strip() else []


def extract_txt(file_path: str) -> list[tuple[int, str]]:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()
    return [(1, text)] if text.strip() else []


def extract_pages(file_path: str, file_type: str) -> list[tuple[int, str]]:
    """Dispatch to the correct extractor based on file extension."""
    if file_type == ".pdf":
        return extract_pdf(file_path)
    if file_type == ".docx":
        return extract_docx(file_path)
    if file_type == ".txt":
        return extract_txt(file_path)
    raise ValueError(f"No extractor available for file type '{file_type}'")
