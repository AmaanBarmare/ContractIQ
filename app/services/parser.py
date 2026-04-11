"""PDF parsing wrapper around PyMuPDF (``fitz``).

Used by the Extraction Agent to turn uploaded contract PDFs into clean text.
Deliberately thin — no OCR, no LlamaParse fallback. If sample PDFs come out
garbled (scanned images, not text), the parser should be upgraded before
tuning the extraction prompt.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

import fitz  # PyMuPDF


def parse_pdf(file_path: str) -> str:
    """Extract text from a single PDF. Returns all pages joined with blank lines."""
    doc = fitz.open(file_path)
    try:
        pages: list[str] = []
        for page in doc:
            text = page.get_text()
            if text.strip():
                pages.append(text)
        return "\n\n".join(pages)
    finally:
        doc.close()


def parse_multiple_pdfs(file_paths: Iterable[str]) -> str:
    """Parse multiple PDFs and merge into one string tagged with filenames.

    The document delimiters ("=== DOCUMENT: ... ===") let the extraction prompt
    attribute values to specific source files when needed (e.g. amendments
    overriding base MSA terms).
    """
    chunks: list[str] = []
    for path in file_paths:
        text = parse_pdf(path)
        filename = Path(path).name
        chunks.append(f"=== DOCUMENT: {filename} ===\n{text}")
    return "\n\n".join(chunks)
