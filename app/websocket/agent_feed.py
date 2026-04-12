"""WebSocket handler for the Live Agent Feed.

Clients connect to ``/ws/agent-feed/{workflow_id}`` and receive real-time
events as agents complete their work. Events are read from the
``agent_events`` Redis Stream, filtered by workflow_id.
"""

from __future__ import annotations

import asyncio
import json

from fastapi import WebSocket, WebSocketDisconnect

from app.services.redis_client import get_redis


async def agent_feed_handler(websocket: WebSocket, workflow_id: str) -> None:
    """Stream agent events for a specific workflow over WebSocket."""
    await websocket.accept()
    last_id = "0-0"

    try:
        while True:
            events = await asyncio.to_thread(
                _read_events, workflow_id, last_id,
            )
            for event_id, data in events:
                last_id = event_id
                await websocket.send_json(data)

                # If workflow is done, close gracefully
                if data.get("event_type") in (
                    "WORKFLOW_APPROVED", "WORKFLOW_FAILED",
                ):
                    await websocket.close()
                    return

            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pass


def _read_events(workflow_id: str, last_id: str) -> list[tuple[str, dict]]:
    """Read and filter events from the agent_events stream."""
    r = get_redis()
    results = r.xread({"agent_events": last_id}, count=20, block=1000)
    if not results:
        return []

    filtered = []
    for event_id, fields in results[0][1]:
        if fields.get("workflow_id") == workflow_id:
            data = {
                "event_id": event_id,
                "workflow_id": fields.get("workflow_id"),
                "source_agent": fields.get("source_agent"),
                "event_type": fields.get("event_type"),
                "timestamp": fields.get("timestamp"),
            }
            payload = fields.get("payload", "{}")
            try:
                data["payload"] = json.loads(payload)
            except (json.JSONDecodeError, TypeError):
                data["payload"] = {}
            filtered.append((event_id, data))
    return filtered
