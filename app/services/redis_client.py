"""Redis connection and helper functions.

Key patterns follow the schema in CLAUDE.md:
    workflow:{workflow_id}       Hash   — workflow state
    contract:{workflow_id}       Hash   — extracted contract fields
    doc:{file_id}                Hash   — document metadata
    artifacts:{workflow_id}      String — JSON, TTL 7 days
    vendor_research:{vendor_id}  String — JSON, TTL 24 hours
    renewals_by_deadline         SortedSet — vendor_id → days_until_deadline
    agent_events                 Stream — live agent feed
    audit_log                    Stream — human actions
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any, Optional

import redis
from dotenv import load_dotenv

load_dotenv()

_pool: Optional[redis.ConnectionPool] = None


def _get_pool() -> redis.ConnectionPool:
    global _pool
    if _pool is None:
        url = os.environ.get("REDIS_URL", "redis://localhost:6379")
        _pool = redis.ConnectionPool.from_url(url, decode_responses=True)
    return _pool


def get_redis() -> redis.Redis:
    """Return a Redis client using the shared connection pool."""
    return redis.Redis(connection_pool=_get_pool())


# ---------------------------------------------------------------------------
# Workflow helpers
# ---------------------------------------------------------------------------

def save_workflow(workflow_id: str, data: dict) -> None:
    r = get_redis()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    r.hset(f"workflow:{workflow_id}", mapping={
        k: json.dumps(v) if isinstance(v, (dict, list)) else str(v)
        for k, v in data.items()
    })


def get_workflow(workflow_id: str) -> Optional[dict]:
    r = get_redis()
    raw = r.hgetall(f"workflow:{workflow_id}")
    return raw if raw else None


def delete_workflow(workflow_id: str) -> bool:
    """Delete a workflow and all its associated data from Redis."""
    r = get_redis()
    keys = [
        f"workflow:{workflow_id}",
        f"contract:{workflow_id}",
        f"risk:{workflow_id}",
        f"decision:{workflow_id}",
        f"artifacts:{workflow_id}",
    ]
    deleted = r.delete(*keys)
    return deleted > 0


# ---------------------------------------------------------------------------
# Contract helpers
# ---------------------------------------------------------------------------

def save_contract(workflow_id: str, contract_data: dict) -> None:
    r = get_redis()
    r.hset(f"contract:{workflow_id}", mapping={
        "data": json.dumps(contract_data, default=str),
    })


def get_contract(workflow_id: str) -> Optional[dict]:
    r = get_redis()
    raw = r.hget(f"contract:{workflow_id}", "data")
    return json.loads(raw) if raw else None


# ---------------------------------------------------------------------------
# Artifact helpers
# ---------------------------------------------------------------------------

def save_artifacts(workflow_id: str, artifacts: dict) -> None:
    r = get_redis()
    r.set(
        f"artifacts:{workflow_id}",
        json.dumps(artifacts, default=str),
        ex=7 * 86400,  # TTL 7 days
    )


def get_artifacts(workflow_id: str) -> Optional[dict]:
    r = get_redis()
    raw = r.get(f"artifacts:{workflow_id}")
    return json.loads(raw) if raw else None


# ---------------------------------------------------------------------------
# Risk report helpers
# ---------------------------------------------------------------------------

def save_risk_report(workflow_id: str, risk_data: dict) -> None:
    r = get_redis()
    r.set(f"risk:{workflow_id}", json.dumps(risk_data, default=str), ex=7 * 86400)


def get_risk_report(workflow_id: str) -> Optional[dict]:
    r = get_redis()
    raw = r.get(f"risk:{workflow_id}")
    return json.loads(raw) if raw else None


# ---------------------------------------------------------------------------
# Decision helpers
# ---------------------------------------------------------------------------

def save_decision(workflow_id: str, decision_data: dict) -> None:
    r = get_redis()
    r.set(f"decision:{workflow_id}", json.dumps(decision_data, default=str), ex=7 * 86400)


def get_decision(workflow_id: str) -> Optional[dict]:
    r = get_redis()
    raw = r.get(f"decision:{workflow_id}")
    return json.loads(raw) if raw else None


# ---------------------------------------------------------------------------
# Vendor research cache
# ---------------------------------------------------------------------------

def save_vendor_research(vendor_id: str, data: dict) -> None:
    r = get_redis()
    r.set(
        f"vendor_research:{vendor_id}",
        json.dumps(data, default=str),
        ex=24 * 3600,  # TTL 24 hours
    )


def get_vendor_research(vendor_id: str) -> Optional[dict]:
    r = get_redis()
    raw = r.get(f"vendor_research:{vendor_id}")
    return json.loads(raw) if raw else None


# ---------------------------------------------------------------------------
# Agent event stream (Live Agent Feed)
# ---------------------------------------------------------------------------

def publish_agent_event(
    workflow_id: str,
    source_agent: str,
    event_type: str,
    payload: dict | None = None,
) -> str:
    """Publish an event to the agent_events stream. Returns the stream ID."""
    r = get_redis()
    return r.xadd("agent_events", {
        "workflow_id": workflow_id,
        "source_agent": source_agent,
        "event_type": event_type,
        "payload": json.dumps(payload or {}),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


def read_agent_events(
    last_id: str = "0-0",
    count: int = 50,
    block: int = 0,
) -> list[tuple[str, dict]]:
    """Read events from the agent_events stream."""
    r = get_redis()
    results = r.xread({"agent_events": last_id}, count=count, block=block)
    if not results:
        return []
    # results = [("agent_events", [(id, fields), ...])]
    return results[0][1]


# ---------------------------------------------------------------------------
# Audit log
# ---------------------------------------------------------------------------

def log_audit(action: str, user: str, details: dict) -> str:
    r = get_redis()
    return r.xadd("audit_log", {
        "action": action,
        "user": user,
        "details": json.dumps(details),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


# ---------------------------------------------------------------------------
# Renewals sorted set
# ---------------------------------------------------------------------------

def set_renewal_deadline(vendor_id: str, days_until: int) -> None:
    r = get_redis()
    r.zadd("renewals_by_deadline", {vendor_id: days_until})


def get_urgent_renewals(max_days: int = 30) -> list[tuple[str, float]]:
    """Return vendor IDs with deadlines ≤ max_days, sorted ascending."""
    r = get_redis()
    return r.zrangebyscore(
        "renewals_by_deadline", 0, max_days, withscores=True,
    )
