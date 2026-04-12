"""GET /api/spend/summary — spend analytics across contracts."""

from __future__ import annotations

from fastapi import APIRouter

from app.services.redis_client import get_redis

router = APIRouter(prefix="/api/spend", tags=["spend"])


@router.get("/summary")
async def spend_summary():
    """Return aggregate spend data across all contracts in Redis."""
    r = get_redis()

    # Scan for all contract keys and aggregate
    total_value = 0.0
    vendor_count = 0
    vendors = []

    cursor = 0
    while True:
        cursor, keys = r.scan(cursor, match="contract:*", count=100)
        for key in keys:
            raw = r.hget(key, "data")
            if raw:
                import json
                try:
                    data = json.loads(raw)
                    vendor_name = data.get("vendor_name", {}).get("value", "Unknown")
                    annual_str = data.get("annual_value", {}).get("value", "0")
                    # Parse dollar amounts
                    annual = _parse_dollar(annual_str)
                    total_value += annual
                    vendor_count += 1
                    vendors.append({
                        "vendor": vendor_name,
                        "annual_value": annual,
                        "workflow_id": key.split(":")[-1],
                    })
                except (json.JSONDecodeError, TypeError):
                    pass
        if cursor == 0:
            break

    return {
        "total_annual_spend": total_value,
        "vendor_count": vendor_count,
        "vendors": vendors,
    }


def _parse_dollar(s: str) -> float:
    if not s:
        return 0.0
    # Remove $, commas, spaces, and currency codes (USD, EUR, etc.)
    cleaned = s.replace("$", "").replace(",", "").strip()
    # Split on space and take first part (e.g., "84000 USD" -> "84000")
    cleaned = cleaned.split()[0] if " " in cleaned else cleaned
    try:
        return float(cleaned)
    except ValueError:
        return 0.0
