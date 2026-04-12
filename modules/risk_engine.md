# Module: Risk Detection Engine

The risk engine scans all extracted contract data and produces a structured, scored, routed risk assessment. It is proactive by design — it surfaces problems before they become crises.

---

## Risk Score Calculation

### Category Scores

Each risk category is scored independently on a 0–100 scale:

```python
severity_weights = {
    "Critical": 40,
    "High": 20,
    "Medium": 10,
    "Low": 5
}

def category_score(flags: list) -> int:
    return min(sum(severity_weights[f.severity] for f in flags), 100)
```

### Overall Score

The overall score is a weighted average of category scores:

```python
weights = {
    "renewal":    0.40,  # most time-sensitive, highest weight
    "commercial": 0.25,
    "legal":      0.25,
    "security":   0.10
}

overall = int(sum(scores[cat] * weight for cat, weight in weights.items()))
```

### Risk Level Bands

| Score | Risk Level | Color | Default Action |
|---|---|---|---|
| 75–100 | CRITICAL | 🔴 Red | Immediate notification to renewal owner |
| 50–74 | HIGH | 🟠 Orange | Surfaced in Renewal Command Center |
| 25–49 | MEDIUM | 🟡 Yellow | Shown in Vendor Workspace risk tab |
| 0–24 | LOW | 🟢 Green | Logged, no active alert |

---

## Full Risk Signal Library

### Renewal Risk Signals

| Signal | Severity | Detection Logic |
|---|---|---|
| Cancellation deadline ≤ 30 days | Critical | `days_to_deadline <= 30` |
| Cancellation deadline 31–45 days | High | `30 < days_to_deadline <= 45` |
| Cancellation deadline 46–90 days | Medium | `45 < days_to_deadline <= 90` |
| Auto-renewal clause present | High | `auto_renewal == "Yes"` |
| No termination for convenience | High | `termination_for_convenience == "No"` |
| Renewal owner not assigned | High | `renewal_owner == null` |
| Renewal date in amendment, not main agreement | Medium | `renewal_date_source == "AMENDMENT"` |
| Notice period ≤ 30 days | Critical | `notice_period_days <= 30` |
| Notice period 31–45 days | High | `notice_period_days <= 45` |

### Commercial Risk Signals

| Signal | Severity | Detection Logic |
|---|---|---|
| Pricing above market benchmark (>15%) | High | From Vendor Research Agent |
| Pricing above market benchmark (10–15%) | Medium | From Vendor Research Agent |
| Price escalator >7% annually | High | `price_uplift_percent > 7` |
| Price escalator 5–7% annually | Medium | `price_uplift_percent > 5` |
| Multi-year lock-in, no exit | High | `initial_term > 24 months AND termination_for_convenience == "No"` |
| Minimum commitment likely above usage | Medium | Requires usage data; flagged as unverifiable if not available |
| Payment terms Net 15 or less | Low | `payment_terms_days <= 15` |
| No contract on file (month-to-month) | Medium | `contract_type == "MONTH_TO_MONTH"` |

### Legal Risk Signals

| Signal | Severity | Detection Logic |
|---|---|---|
| Uncapped or absent liability cap | Critical | `liability_cap == null OR "uncapped"` |
| DPA missing for data-processing vendor | Critical | `is_data_processor == true AND dpa_present == false` |
| One-sided indemnity (vendor-favorable) | High | LLM analysis of indemnity clause |
| Vendor-only termination for convenience | High | Only vendor can terminate without cause |
| Missing notice clause | Medium | `notice_clause == null` |
| Assignment without consent | Medium | Assignment clause does not require consent |
| Governing law is non-home jurisdiction | Low | Context-dependent |

### Security / Compliance Risk Signals

| Signal | Severity | Detection Logic |
|---|---|---|
| No SOC 2 Type II reference | High | `soc2_type2 == null` |
| Breach notification SLA absent | High | `breach_notification_sla == null` |
| Breach notification SLA >72 hours | High | `breach_notification_sla_hours > 72` |
| No subprocessor disclosure | Medium | `subprocessor_disclosure == null` |
| Data retention terms absent | Medium | `data_retention == null` |
| Audit rights not granted | Medium | `audit_rights == "No" OR null` |
| Data residency unspecified for PII vendor | High | Context-dependent |

---

## Escalation Routing

Each flag carries an escalation queue that tells the system who needs to know:

```python
ESCALATION_MAP = {
    "renewal":    "renewal_action_queue",
    "commercial": "negotiation_queue",
    "legal":      "legal_review_queue",
    "security":   "security_review_queue"
}

# Routing function
def route_flag(flag: dict) -> str:
    if flag.severity in ["Critical", "High"]:
        return ESCALATION_MAP[flag.category]
    else:
        return "standard_review_queue"
```

---

---

# Module: Contract Knowledge Layer

The knowledge layer is ContractIQ's semantic search and Q&A engine — the interface for natural language questions against the full contract portfolio.

---

## Architecture

```
User question
      │
Query embedding (Watsonx Embeddings)
      │
Redis Vector Search → top K relevant chunks
      │
Watsonx.ai synthesis prompt
      │
Structured answer: direct response + evidence + confidence + recommended action
```

---

## Redis Vector Index Setup

```python
from redis.commands.search.field import VectorField, TextField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType

schema = [
    TextField("text"),
    TextField("vendor_id"),
    TextField("contract_id"),
    TextField("doc_type"),
    VectorField(
        "embedding",
        "HNSW",
        {
            "TYPE": "FLOAT32",
            "DIM": 768,
            "DISTANCE_METRIC": "COSINE",
            "INITIAL_CAP": 10000
        }
    )
]

definition = IndexDefinition(prefix=["chunk:"], index_type=IndexType.HASH)
redis.ft("contract_idx").create_index(schema, definition=definition)
```

---

## Chunking Strategy

Each contract document is split into overlapping chunks for indexing:

- **Chunk size:** 512 tokens
- **Overlap:** 64 tokens (to avoid splitting mid-clause)
- **Metadata per chunk:** vendor_id, contract_id, doc_type, page_number, section_header (if detectable)

---

## Query Types and Routing

| Query Pattern | Routing |
|---|---|
| "Which vendors..." | Vector search across all chunks + aggregation |
| "What does our [vendor] contract say about..." | Vector search scoped to vendor_id |
| "How much are we spending on..." | Redis Hash direct lookup (structured spend fields) |
| "When does [vendor] renew?" | Redis Hash direct lookup (renewal_date field) |
| "Do we have a DPA with..." | Redis Hash direct lookup (dpa_present field) |

---

---

# Module: Live Agent Feed

The Live Agent Feed is both a UX feature and an architectural transparency tool. It makes the multi-agent system legible in real time.

---

## What It Shows

For every workflow, the feed displays a timestamped log of inter-agent events:

```
14:30:00  Upload received — 4 documents — Zoom Video Communications
14:30:01  ▶ Ingestion Agent: starting classification
14:30:03  Ingestion Agent: MSA classified (97% confidence)
14:30:07  ✓ Ingestion Agent: complete → dispatching Extraction Agent
14:30:08  ▶ Extraction Agent: parsing 4 documents
14:30:14  Extraction Agent: 38 fields extracted
14:30:14  ⚠ Extraction Agent: notice_period at 58% confidence — awaiting user confirmation
14:30:22  ✓ User confirmed: notice_period = 60 days
14:30:23  ✓ Extraction Agent: complete → dispatching Risk + Vendor Research (parallel)
14:30:24  ▶ Risk Agent: analyzing 38 fields
14:30:24  ▶ Vendor Research Agent: searching via Tavily
14:30:27  Risk Agent: 4 flags identified (2 critical, 2 high) — score 74/100
14:30:35  Vendor Research Agent: above-market pricing confirmed — 3 alternatives found
14:30:36  ▶ Decision Agent: synthesizing
14:30:41  ✓ Decision Agent: RENEGOTIATE — 91% confidence — CRITICAL
14:30:42  ▶ Action Agent: generating 5 artifacts
14:30:52  ✓ Action Agent: complete — 5 draft artifacts ready for approval
```

---

## Technical Implementation

The feed is powered by a Redis Stream read via WebSocket:

```python
# Backend: stream new events to connected clients
@app.websocket("/ws/agent-feed/{workflow_id}")
async def agent_feed(websocket: WebSocket, workflow_id: str):
    await websocket.accept()
    last_id = "0"
    while True:
        messages = redis.xread({f"workflow:{workflow_id}:stream": last_id}, block=500, count=10)
        for stream, events in messages or []:
            for event_id, data in events:
                await websocket.send_json(json.loads(data["payload"]))
                last_id = event_id
```

```typescript
// Frontend: React component subscribing to feed
const AgentFeed = ({ workflowId }: { workflowId: string }) => {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/agent-feed/${workflowId}`);
    ws.onmessage = (msg) => {
      const event = JSON.parse(msg.data);
      setEvents(prev => [...prev, event]);
    };
    return () => ws.close();
  }, [workflowId]);
  
  return (
    <div className="agent-feed">
      {events.map(event => <AgentEvent key={event.id} event={event} />)}
    </div>
  );
};
```

---

---

# Module: Renewal Command Center

The Renewal Command Center is the flagship dashboard view — the operational nerve center for procurement teams managing contract renewals.

---

## What It Shows

### Urgency Tiers

Contracts are sorted into three urgency bands:

| Band | Criteria | Count | Spend at Risk |
|---|---|---|---|
| 🔴 Critical (0–30 days) | Cancellation deadline within 30 days | N | $X |
| 🟡 High (31–60 days) | Cancellation deadline 31–60 days | N | $X |
| 🟢 Upcoming (61–90 days) | Cancellation deadline 61–90 days | N | $X |

### Per-Contract Row

Each contract in the queue shows:

- Vendor name + category
- Annual spend
- Cancellation deadline + days remaining
- Auto-renewal status (Yes/No badge)
- Risk score (color-coded)
- Renewal owner (or "⚠ Unassigned")
- Current workflow status (Not started / In Progress / Complete)
- Action button: "Review Now" → launches Renewal Rescue workflow

---

## Redis Data Source

```python
# Renewal Command Center reads from the Sorted Set
def get_urgent_renewals(days: int = 90) -> list[dict]:
    # Get all vendors with deadline within N days
    vendors = redis.zrangebyscore("renewals_by_deadline", 0, days, withscores=True)
    
    results = []
    for vendor_id, days_to_deadline in vendors:
        contract = redis.hgetall(f"contract_latest:{vendor_id}")
        results.append({
            "vendor_id": vendor_id,
            "vendor_name": contract.get("vendor_name"),
            "annual_value": contract.get("annual_value"),
            "cancellation_deadline": contract.get("cancellation_deadline"),
            "days_until_deadline": int(days_to_deadline),
            "urgency": "CRITICAL" if days_to_deadline <= 30 else "HIGH" if days_to_deadline <= 60 else "UPCOMING",
            "auto_renewal": contract.get("auto_renewal"),
            "risk_score": contract.get("risk_score"),
            "renewal_owner": contract.get("renewal_owner")
        })
    
    return sorted(results, key=lambda x: x["days_until_deadline"])
```

---

## The Best User Moment

A procurement lead logs in Monday morning and sees:

- 3 contracts need action this week
- $487K of spend renewing next quarter
- One vendor has a Critical risk flag AND no renewal owner assigned
- Two contracts are currently "In Progress" with ContractIQ

They can see exactly what matters, in what order, and what to do about each one. Without ContractIQ, this would have required a 2-hour manual audit of a spreadsheet.
