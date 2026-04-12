"""Agent 1: Ingestion & Classification.

Receives raw uploaded files, classifies document types, extracts metadata,
and produces a document envelope for the Extraction Agent.
"""

from __future__ import annotations

import hashlib
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from app.services.parser import parse_pdf


def run_ingestion(file_paths: list[str]) -> dict:
    """Process uploaded files and return a document envelope.

    Returns:
        {
            "documents": [
                {
                    "file_id": "...",
                    "filename": "...",
                    "doc_type": "MSA" | "ORDER_FORM" | "AMENDMENT" | "PRICING_SHEET" | "OTHER",
                    "vendor_hint": "...",
                    "page_count": int,
                    "char_count": int,
                    "file_hash": "sha256:...",
                    "text": "...",
                },
                ...
            ],
            "merged_text": "...",
            "total_documents": int,
            "ingested_at": "...",
        }
    """
    documents = []
    merged_parts = []

    for fp in file_paths:
        path = Path(fp)
        if not path.exists():
            continue

        text = parse_pdf(fp)
        filename = path.name
        file_hash = _hash_file(fp)
        doc_type = _classify_document(filename, text)
        vendor_hint = _extract_vendor_hint(filename, text)

        doc = {
            "file_id": file_hash[:12],
            "filename": filename,
            "doc_type": doc_type,
            "vendor_hint": vendor_hint,
            "page_count": _estimate_pages(text),
            "char_count": len(text),
            "file_hash": f"sha256:{file_hash}",
            "text": text,
        }
        documents.append(doc)
        merged_parts.append(f"=== DOCUMENT: {filename} ===\n{text}")

    return {
        "documents": documents,
        "merged_text": "\n\n".join(merged_parts),
        "total_documents": len(documents),
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }


def _hash_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def _classify_document(filename: str, text: str) -> str:
    """Classify document type from filename and content heuristics."""
    fn = filename.lower()
    txt = text[:2000].lower()

    if "msa" in fn or "master service" in txt or "master agreement" in txt:
        return "MSA"
    if "order" in fn or "order form" in txt or "subscription order" in txt:
        return "ORDER_FORM"
    if "amendment" in fn or "amendment" in txt[:500]:
        return "AMENDMENT"
    if "pricing" in fn or "price list" in txt or "pricing schedule" in txt:
        return "PRICING_SHEET"
    return "OTHER"


def _extract_vendor_hint(filename: str, text: str) -> Optional[str]:
    """Try to identify the vendor from the filename."""
    # Common pattern: Vendor_DocType.pdf
    parts = filename.replace(".pdf", "").replace(".PDF", "").split("_")
    if parts:
        return parts[0]
    return None


def _estimate_pages(text: str) -> int:
    """Rough page estimate based on character count."""
    return max(1, len(text) // 3000)
