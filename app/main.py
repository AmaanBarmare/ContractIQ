"""ContractIQ — FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import artifacts, contracts, documents, qa, renewals, spend, workflows
from app.websocket.agent_feed import agent_feed_handler

app = FastAPI(
    title="ContractIQ",
    description="Multi-agent AI platform for procurement teams",
    version="1.0.0",
)

# CORS — allow frontend on :3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(workflows.router)
app.include_router(documents.router)
app.include_router(contracts.router)
app.include_router(qa.router)
app.include_router(spend.router)
app.include_router(renewals.router)
app.include_router(artifacts.router)


# WebSocket endpoint
@app.websocket("/ws/agent-feed/{workflow_id}")
async def ws_agent_feed(websocket, workflow_id: str):
    await agent_feed_handler(websocket, workflow_id)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "contractiq"}
