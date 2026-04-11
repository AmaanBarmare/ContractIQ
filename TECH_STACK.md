# Technology Stack

Full breakdown of every technology used in ContractIQ, why it was chosen, and exactly how it integrates.

---

## Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Orchestration | IBM Watsonx Orchestrate | Latest |
| LLM / Reasoning | IBM Watsonx.ai (Granite / Llama 3) | Latest |
| Memory & State | Redis Stack | 7.x |
| Semantic Search | Redis Vector Search | Built into Redis Stack |
| External Research | Tavily Search API | v2 |
| Document Parsing | PyMuPDF + LlamaParse | Latest |
| Embeddings | IBM Watsonx Embeddings | Latest |
| Agent Framework | Python + LangGraph | 0.2.x |
| Backend API | FastAPI | 0.110.x |
| Frontend | React + Next.js | Next 14 |
| Containerization | Docker + Docker Compose | Latest |

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

## Tavily Search API

**Role:** Real-time external intelligence for the Vendor Research Agent.

**Why Tavily:**
- Purpose-built for AI agents — returns clean, structured, citation-rich results
- Filters out noise and SEO spam that generic search would return
- Designed for the exact use case of grounding AI decisions in current information
- Required by the hackathon — key sponsor

**How we use it:**

```python
from tavily import TavilyClient

client = TavilyClient(api_key=TAVILY_API_KEY)

def research_vendor(vendor_name: str, category: str) -> dict:
    results = {}
    
    # Company overview and recent news
    results["news"] = client.search(
        f"{vendor_name} company news 2026",
        search_depth="advanced",
        max_results=5
    )
    
    # Security incidents
    results["security"] = client.search(
        f"{vendor_name} security breach incident data 2025 2026",
        max_results=3
    )
    
    # Pricing benchmarks
    results["pricing"] = client.search(
        f"{category} software pricing benchmark average cost 2026",
        max_results=4
    )
    
    # Alternatives
    results["alternatives"] = client.search(
        f"best alternatives to {vendor_name} {category}",
        max_results=4
    )
    
    return results
```

**Important:** Only vendor names and category terms are sent to Tavily. No contract text, no pricing data, no PII ever leaves the system via Tavily queries.

---

## IBM Watsonx.ai

**Role:** LLM backbone for all reasoning, extraction, and generation tasks.

**Models used:**
- `ibm/granite-13b-instruct-v2` — primary model for structured extraction (fast, precise)
- `meta-llama/llama-3-70b-instruct` — decision reasoning and artifact generation (more capable)

**Integration pattern:**

```python
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import Model

model = Model(
    model_id="ibm/granite-13b-instruct-v2",
    credentials=Credentials(api_key=WATSONX_API_KEY, url=WATSONX_URL),
    project_id=WATSONX_PROJECT_ID,
    params={"max_new_tokens": 2000, "temperature": 0.1}  # low temp for extraction
)

response = model.generate_text(prompt=extraction_prompt)
```

**Temperature strategy:**
- Extraction tasks: `temperature=0.1` — deterministic, precise
- Risk analysis: `temperature=0.2` — structured but allows reasoning
- Artifact generation: `temperature=0.4` — more natural language variation

---

## LangGraph (Agent Framework)

**Role:** Individual agent logic, tool calling, and structured output enforcement.

Each agent is implemented as a LangGraph graph with defined nodes and edges:

```python
from langgraph.graph import StateGraph

def build_extraction_agent():
    graph = StateGraph(ExtractionState)
    graph.add_node("parse_documents", parse_documents_node)
    graph.add_node("extract_fields", extract_fields_node)
    graph.add_node("score_confidence", score_confidence_node)
    graph.add_node("store_to_redis", store_to_redis_node)
    graph.add_node("publish_completion", publish_completion_node)
    
    graph.set_entry_point("parse_documents")
    graph.add_edge("parse_documents", "extract_fields")
    graph.add_edge("extract_fields", "score_confidence")
    graph.add_conditional_edges("score_confidence", route_by_confidence, {
        "proceed": "store_to_redis",
        "flag": "store_to_redis"  # store anyway, but flag in the record
    })
    graph.add_edge("store_to_redis", "publish_completion")
    
    return graph.compile()
```

---

## PyMuPDF + LlamaParse

**Role:** Document ingestion and text extraction from PDFs and DOCX files.

```python
import fitz  # PyMuPDF

def extract_text_from_pdf(path: str) -> list[dict]:
    doc = fitz.open(path)
    chunks = []
    for page_num, page in enumerate(doc):
        text = page.get_text()
        chunks.append({
            "page": page_num + 1,
            "text": text,
            "char_count": len(text)
        })
    return chunks
```

LlamaParse is used for complex, multi-column, or table-heavy contracts where PyMuPDF's output is noisy.

---

## FastAPI Backend

**Role:** HTTP/WebSocket API layer connecting the React frontend to the agent system.

**Key endpoints:** See [API Reference](api/API_REFERENCE.md).

**WebSocket for Live Agent Feed:**
```python
@app.websocket("/ws/agent-feed/{workflow_id}")
async def agent_feed_websocket(websocket: WebSocket, workflow_id: str):
    await websocket.accept()
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(f"workflow:{workflow_id}:events")
    
    async for message in pubsub.listen():
        if message["type"] == "message":
            await websocket.send_json(json.loads(message["data"]))
```

---

## React + Next.js Frontend

**Role:** UI surfaces including Dashboard, Live Agent Feed, Artifact Approval UI, and Renewal Command Center.

**Key libraries:**
- `react-query` — data fetching and cache management
- `recharts` — spend analytics charts
- `framer-motion` — Live Agent Feed animations
- `tailwindcss` — styling
- `shadcn/ui` — component library

---

## Environment Variables

```bash
# IBM Watsonx
WATSONX_API_KEY=
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=

# Redis
REDIS_URL=redis://localhost:6379
REDIS_CLOUD_URL=  # use for Redis Cloud

# Tavily
TAVILY_API_KEY=

# App
SECRET_KEY=
DATABASE_URL=sqlite:///./contractiq.db  # local dev only
```
