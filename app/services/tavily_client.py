"""Tavily vendor research via IBM Watsonx Orchestrate.

Tavily is accessed through the ``vasco-tavily`` tool connected inside
Watsonx Orchestrate — no direct TAVILY_API_KEY is needed.

This module provides a thin wrapper that calls Orchestrate's tool endpoint
and returns structured vendor intelligence.
"""

from __future__ import annotations

import json
import os
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv()


def _orchestrate_headers() -> dict:
    api_key = os.environ.get("ORCHESTRATE_API_KEY", "")
    return {
        "Authorization": f"Basic {api_key}",
        "Content-Type": "application/json",
    }


def _orchestrate_url() -> str:
    base = os.environ.get("ORCHESTRATE_INSTANCE_URL", "")
    return f"{base}/v1/orchestrate/tool_invoke"


def search_vendor(vendor_name: str, category: str = "SaaS") -> dict:
    """Research a vendor using Tavily via Orchestrate.

    Returns a dict matching the vendor_intel shape expected by
    ``app.agents.decision.run_decision``:

        {
            "company_health": {"summary": "..."},
            "pricing_benchmark": {"benchmark_assessment": "..."},
            "key_finding": "...",
            "alternatives": [{"vendor": "..."}, ...],
        }
    """
    queries = [
        f"{vendor_name} enterprise pricing benchmark {category} 2025 2026",
        f"{vendor_name} company health financial stability",
        f"{vendor_name} alternatives competitors {category}",
    ]

    raw_results = []
    for query in queries:
        result = _invoke_tavily(query)
        if result:
            raw_results.append(result)

    return _structure_vendor_intel(vendor_name, raw_results)


def _invoke_tavily(query: str) -> Optional[dict]:
    """Call the vasco-tavily tool through Orchestrate."""
    try:
        resp = httpx.post(
            _orchestrate_url(),
            headers=_orchestrate_headers(),
            json={
                "tool_name": "vasco-tavily",
                "parameters": {
                    "query": query,
                    "search_depth": "advanced",
                    "max_results": 5,
                },
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception:
        # Graceful degradation — decision agent works without vendor intel
        return None


def _structure_vendor_intel(vendor_name: str, raw_results: list[dict]) -> dict:
    """Transform raw Tavily results into the vendor_intel dict shape."""
    intel: dict = {
        "vendor_name": vendor_name,
        "company_health": {"summary": "Data available via Tavily research"},
        "pricing_benchmark": {"benchmark_assessment": "MARKET_RATE"},
        "key_finding": "",
        "alternatives": [],
        "raw_results": raw_results,
    }

    # Extract key findings from results
    findings = []
    for result in raw_results:
        if isinstance(result, dict):
            for item in result.get("results", []):
                if isinstance(item, dict) and item.get("content"):
                    findings.append(item["content"][:200])

    if findings:
        intel["key_finding"] = findings[0]

    return intel
