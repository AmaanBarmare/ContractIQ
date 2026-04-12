"""Agent 4: Vendor Research (Tavily via Orchestrate).

Researches the vendor using Tavily (through IBM Watsonx Orchestrate) to
gather pricing benchmarks, company health, alternatives, and recent news.
"""

from __future__ import annotations

from typing import Optional

from app.services.redis_client import get_vendor_research, save_vendor_research
from app.services.tavily_client import search_vendor


def run_research(vendor_name: str, category: str = "SaaS") -> dict:
    """Research a vendor, with Redis caching.

    Returns vendor_intel dict compatible with ``run_decision(vendor_intel=...)``.
    """
    # Check cache first
    vendor_id = vendor_name.lower().replace(" ", "_")
    cached = get_vendor_research(vendor_id)
    if cached:
        return cached

    # Call Tavily via Orchestrate
    intel = search_vendor(vendor_name, category)

    # Cache result (TTL 24h handled by redis_client)
    if intel:
        save_vendor_research(vendor_id, intel)

    return intel
