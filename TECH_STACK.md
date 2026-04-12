# Technology Stack

Full breakdown of every technology used in ContractIQ, why it was chosen, and exactly how it integrates.

---

## Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Orchestration | IBM Watsonx Orchestrate | Latest |
| LLM / Reasoning | Anthropic Claude (via Anthropic SDK) | `claude-sonnet-4-6` |
| Memory & State | Redis Stack (local) | 7.x |
| External Research | Tavily Search API (via Orchestrate `vasco-tavily` tool) | — |
| Document Parsing | PyMuPDF | Latest |
| Backend API | FastAPI | 0.115+ |
| Frontend | React 19 + Next.js 16 (App Router) | Next 16.2.3 |
| Styling | Tailwind CSS | v4 |
| Containerization | Docker | Latest |

---

## IBM Watsonx Orchestrate

**Role:** Master orchestrator. The brain that routes, sequences, and governs everything.

**Why Watsonx Orchestrate:**
- Designed specifically for multi-agent enterprise workflows
- Native support for tool calling, agent chaining, and conditional routing
- Built-in guardrail framework — lets us enforce approval gates declaratively
- Required by the hackathon — judges reward deep Orchestrate integration

**How we use it:**

```python
# Example: Dispatching the extraction agent from Orchestrate
orchestrate_client.dispatch_agent(
    agent_id="extraction_agent",
    payload={
        "workflow_id": workflow_id,
        "document_ids": document_ids,
        "vendor_id": vendor_id
    },
    on_complete="risk_agent,vendor_research_agent",  # parallel dispatch
    confidence_threshold=0.70,
    on_low_confidence="human_review_queue"
)
```

**Integration points:**
- Receives initial intent from FastAPI backend
- Creates workflow state object in Redis on session start
- Dispatches agents based on workflow state transitions
- Reads confidence scores from each agent response
- Routes to human review queue when confidence < 70%
- Enforces artifact approval gate before any external action
- Writes completion event to Redis audit stream

---

## Redis Stack

**Role:** The connective tissue of the entire system — state, communication, search, and memory.

**Why Redis:**
- In-memory speed makes the Live Agent Feed feel instant
- Redis Streams are purpose-built for event-driven inter-agent messaging
- Redis Vector Search eliminates the need for a separate vector database
- Required by the hackathon — judges reward creative Redis integration
- Persistent enough for audit logs; fast enough for real-time pub/sub

**Data structures and their jobs:**

### Redis Hash — Contract Records
```
KEY: contract:{workflow_id}
FIELDS: vendor_name, annual_value, renewal_date, notice_period, auto_renewal, ...

# Write (Extraction Agent)
redis.hset(f"contract:{wf_id}", mapping=extracted_fields)

# Read (any downstream agent)
record = redis.hgetall(f"contract:{wf_id}")
```

### Redis Streams — Inter-Agent Message Bus
```
STREAM: agent_events

# Publish (any agent completing a task)
redis.xadd("agent_events", {
    "workflow_id": wf_id,
    "source_agent": "extraction_agent",
    "target_agent": "risk_agent",
    "payload": json.dumps(contract_record),
    "confidence": "0.94",
    "trace_id": trace_id
})

# Subscribe (Live Agent Feed)
messages = redis.xread({"agent_events": last_id}, block=1000)
```

### Redis Vector Search — Semantic Clause Retrieval
```python
# Index contract text chunks as vectors
redis.ft("contract_idx").create_index([
    VectorField("embedding", "HNSW", {"TYPE": "FLOAT32", "DIM": 768, "DISTANCE_METRIC": "COSINE"}),
    TextField("text"),
    TextField("vendor_id"),
    TextField("contract_id"),
])

# Query: "find all contracts with uncapped indemnity"
query = Query("*=>[KNN 10 @embedding $vec AS score]").return_fields("text", "vendor_id", "score")
results = redis.ft("contract_idx").search(query, query_params={"vec": embedding})
```

### Redis Sorted Set — Renewal Deadline Tracking
```python
# Score = days until cancellation deadline (lower = more urgent)
redis.zadd("renewals_by_deadline", {vendor_id: days_until_deadline})

# Renewal Command Center: get top 20 most urgent
urgent = redis.zrange("renewals_by_deadline", 0, 19, withscores=True)
```

### Redis TTL — Vendor Research Cache
```python
cache_key = f"vendor_research:{vendor_id}"
cached = redis.get(cache_key)
if not cached:
    result = tavily.search(vendor_name)
    redis.setex(cache_key, 86400, json.dumps(result))  # 24-hour TTL
```

---

## Tavily Search API (via Watsonx Orchestrate)

**Role:** Real-time external intelligence for the Vendor Research Agent.

**Why Tavily:**
- Purpose-built for AI agents — returns clean, structured, citation-rich results
- Filters out noise and SEO spam that generic search would return
- Designed for the exact use case of grounding AI decisions in current information
- Required by the hackathon — key sponsor

**How we use it:**

Tavily is **not** called directly. It's connected inside Watsonx Orchestrate as
the `vasco-tavily` tool. The Vendor Research agent invokes the tool through
Orchestrate, which handles auth and rate-limiting. This keeps Tavily credentials
inside Orchestrate and removes the need for a `TAVILY_API_KEY` in this repo.

The Vendor Research agent issues four scoped queries per run:
1. Company overview and recent news
2. Security incidents and breaches
3. Pricing benchmarks for the category
4. Competing alternatives to the current vendor

**Important:** Only vendor names and category terms are passed to the tool. No
contract text, no pricing data, no PII is ever sent through Tavily queries.

---

## Anthropic Claude

**Role:** LLM backbone for all reasoning, extraction, and generation tasks.

**Model used:**
- `claude-sonnet-4-6` — default for structured extraction, decision reasoning, and artifact generation. Override via `ANTHROPIC_MODEL_ID`.

**Integration pattern:**

```python
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=3000,
    temperature=0.1,  # low temp for extraction
    messages=[{"role": "user", "content": extraction_prompt}],
)

response_text = message.content[0].text
```

The wrapper lives in `app/services/llm_client.py` as `call_llm(prompt, temperature)`.
Agents (extraction, decision) import and call it — they do not talk to the
Anthropic SDK directly, so swapping providers is a single-file change.

**Temperature strategy:**
- Extraction tasks: `temperature=0.05` — deterministic, precise
- Decision synthesis: `temperature=0.2` — structured but allows reasoning
- Artifact generation: `temperature=0.4` — more natural language variation

---

## PyMuPDF

**Role:** Document ingestion and text extraction from PDFs.

```python
import fitz  # PyMuPDF

def parse_pdf(path: str) -> str:
    doc = fitz.open(path)
    try:
        return "\n\n".join(
            page.get_text() for page in doc if page.get_text().strip()
        )
    finally:
        doc.close()
```

The wrapper lives in `app/services/parser.py`. Scanned/image-only PDFs aren't
supported yet — if the demo hits one, the parser output will be empty and
extraction confidence will crater. Add OCR (LlamaParse or similar) only if
that actually happens on real inputs.

---

## FastAPI Backend

**Role:** HTTP/WebSocket API layer connecting the React frontend to the agent system.

**Key endpoints:** See [API Reference](api/API_REFERENCE.md).

**WebSocket for Live Agent Feed:**
```python
@app.websocket("/ws/agent-feed/{workflow_id}")
async def ws_agent_feed(websocket, workflow_id: str):
    await agent_feed_handler(websocket, workflow_id)

# In app/websocket/agent_feed.py:
# Reads from the agent_events Redis Stream, filters by workflow_id,
# and sends matching events to the WebSocket client in real time.
# Uses asyncio.to_thread for non-blocking Redis xread calls.
```

---

## React + Next.js Frontend

**Role:** Single-page dashboard for the full renewal workflow: upload → extract → evaluate → recommend → approve.

**Stack:** Next.js 16.2.3 (App Router, Turbopack) + React 19 + Tailwind CSS v4.

**Architecture:**
- App Router files live in `app/` alongside the Python backend (Next.js ignores `.py` files)
- Components, hooks, and lib code live in `src/` with `@/*` path aliases
- Single-page app — all five workflow steps visible on one dashboard
- Demo fallback mode: if the backend is unavailable, the UI shows pre-built Zoom scenario data

**Key libraries:**
- `tailwindcss` v4 — utility-first styling with glass-morphism panel design
- Custom `useWorkflow` hook — manages workflow state machine (create → upload → poll → hydrate → approve)
- Typed `api-client.ts` — fetch-based client matching all 18 backend routes
- `adapters.ts` — transforms backend Pydantic model shapes into UI-friendly types

**Fonts:** Space Grotesk (body) + IBM Plex Mono (code/labels)

---

## Environment Variables

```bash
# IBM Watsonx Orchestrate — workflow orchestration + vasco-tavily tool access
ORCHESTRATE_API_KEY=
ORCHESTRATE_INSTANCE_URL=

# Anthropic Claude — LLM backbone
ANTHROPIC_API_KEY=
# Optional override; defaults to claude-sonnet-4-6
# ANTHROPIC_MODEL_ID=claude-sonnet-4-6

# Redis (local)
REDIS_URL=redis://localhost:6379

# App
SECRET_KEY=
```

> Tavily is accessed through the `vasco-tavily` tool inside Watsonx Orchestrate,
> so no `TAVILY_API_KEY` is needed in this repo.
