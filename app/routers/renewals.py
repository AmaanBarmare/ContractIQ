"""GET /api/renewals/urgent — upcoming renewals sorted by deadline."""

from __future__ import annotations

from fastapi import APIRouter

from app.services.redis_client import get_urgent_renewals

router = APIRouter(prefix="/api/renewals", tags=["renewals"])


@router.get("/urgent")
async def urgent_renewals(max_days: int = 90):
    """Return vendors with renewal deadlines within max_days, sorted by urgency."""
    renewals = get_urgent_renewals(max_days)
    return {
        "urgent_renewals": [
            {"vendor_id": vid, "days_until_deadline": int(days)}
            for vid, days in renewals
        ],
        "count": len(renewals),
    }
