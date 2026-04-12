# MVP Scope

Priority framework for the 48-hour build window. P0 must work perfectly before P1 is touched. P1 before P2.

**Rule:** Depth on the demo flow beats breadth across all features.

---

## P0 — Must Ship (The Demo Must Work)

Everything in P0 is required for the Renewal Rescue demo to run end-to-end.

| Feature | Owner | Est. Hours |
|---|---|---|
| Contract upload (drag-and-drop, 4 files) | Frontend | 2 |
| Ingestion Agent: classify documents, link to vendor | Agent Engineer | 3 |
| Extraction Agent: 15+ key fields from PDF | Agent Engineer | 5 |
| Watsonx Orchestrate: route between agents, confidence threshold | Integration Engineer | 6 |
| Redis: contract Hash storage, Streams message bus | Integration Engineer | 3 |
| Risk Agent: renewal risk + commercial risk flags | Agent Engineer | 4 |
| Vendor Research Agent: Tavily integration (news + pricing + alternatives) | Integration Engineer | 3 |
| Decision Agent: structured recommendation with reasoning | Agent Engineer | 4 |
| Action Agent: negotiation prep sheet + vendor email draft | Agent Engineer | 3 |
| Live Agent Feed: real-time Redis Stream → WebSocket → UI | Frontend + Integration | 4 |
| Artifact Approval UI: review, edit, approve artifacts | Frontend | 3 |
| Confidence routing: confirmation prompt for flagged fields | Integration + Frontend | 2 |
| **P0 Total** | | **~42 hours** |

---

## P1 — Should Ship (Adds Depth and Demo Quality)

| Feature | Owner | Est. Hours |
|---|---|---|
| Full 40+ field extraction | Agent Engineer | 3 |
| Contract Q&A (natural language questions via Redis Vector Search) | Integration + Agent | 4 |
| Renewal Command Center: 30/60/90-day view, priority sorted | Frontend | 3 |
| Spend intelligence: total spend aggregation, category breakdown | Agent Engineer | 2 |
| CFO Summary artifact | Agent Engineer | 1 |
| Full Internal Renewal Brief artifact | Agent Engineer | 1 |
| Full three-tier confidence routing (auto / human-review / escalate) | Integration | 2 |
| **P1 Total** | | **~16 hours** |

---

## P2 — Nice to Have (Only If P0 and P1 Are Fully Working)

| Feature | Owner | Est. Hours |
|---|---|---|
| Portfolio dashboard with top-line metrics | Frontend | 4 |
| Vendor workspace view with document history | Frontend | 3 |
| Executive summary generator | Agent Engineer | 2 |
| Duplicate detection during ingestion | Agent Engineer | 2 |
| Redis TTL-based vendor research caching | Integration | 1 |
| **P2 Total** | | **~12 hours** |

---

## Hard Cuts (Not in MVP)

These were considered and deliberately excluded:

- Multi-tenant support (single team demo only)
- Real email sending (artifacts are drafts only — no actual email integration)
- SSO / authentication (simple session token for demo)
- Historical trend analysis (requires multiple time periods of data)
- Contract redlining (requires document editing library)
- Mobile interface
