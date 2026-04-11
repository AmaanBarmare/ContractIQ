# Workflow: Renewal Rescue

The flagship workflow. Triggered when a contract is approaching its renewal or cancellation deadline. Takes four uploaded documents and produces a complete stakeholder-ready decision package in under 2 minutes.

---

## When It Triggers

- A contract's days-until-cancellation-deadline drops to 90 (automated alert — medium priority)
- A contract's days-until-cancellation-deadline drops to 45 (automated alert — high priority)
- A contract's days-until-cancellation-deadline drops to 30 (automated alert — critical priority)
- A user manually initiates a vendor review from the Renewal Command Center

---

## Demo Scenario

**Vendor:** Zoom Video Communications  
**Documents uploaded:** MSA, Order Form, Amendment, Pricing Sheet  
**Situation:** Auto-renewal fires in 34 days. No renewal owner assigned. Pricing above market.  
**Expected outcome:** RENEGOTIATE recommendation with full artifact package.

---

## Step-by-Step Flow

### Step 1 — Upload

User drags and drops four Zoom documents into the upload area.

```
Documents:
  - Zoom_MSA_2024.pdf
  - Zoom_OrderForm_2025.pdf
  - Zoom_Amendment_1.pdf
  - Zoom_PricingSheet.pdf
```

Live Agent Feed shows:
```
[14:30:00]  Upload received — 4 documents — Zoom Video Communications
[14:30:01]  Ingestion Agent: starting classification...
```

---

### Step 2 — Ingestion Agent

Classifies all four documents, links to the Zoom vendor workspace.

```
[14:30:03]  Ingestion Agent: MSA classified (97% confidence)
[14:30:04]  Ingestion Agent: Order Form classified (95% confidence)
[14:30:05]  Ingestion Agent: Amendment classified (93% confidence)
[14:30:06]  Ingestion Agent: Pricing Sheet classified (91% confidence)
[14:30:07]  Ingestion Agent: complete — 4 documents linked to Zoom workspace
[14:30:07]  → Dispatching Extraction Agent
```

---

### Step 3 — Extraction Agent

Parses all four documents into a unified contract record.

```
[14:30:08]  Extraction Agent: parsing 4 documents...
[14:30:14]  Extraction Agent: extracted 38 fields
[14:30:14]  Extraction Agent: 1 field requires confirmation
[14:30:14]  ⚠ Notice period: extracted "60 days" — confidence 58% — needs confirmation
```

**User sees inline confirmation prompt:**

> **Please confirm this extracted value:**
> 
> **Notice Period:** 60 days  
> *Source: "Either party may terminate this Agreement upon sixty (60) days written notice..."*  
> *Confidence: 58% — Please verify against the original document.*
> 
> [✓ Confirm 60 days]  [✗ Incorrect — enter correct value]

User clicks **Confirm 60 days**.

```
[14:30:22]  User confirmed: notice_period = 60 days
[14:30:22]  Extraction Agent: resuming with confirmed field
[14:30:23]  Extraction Agent: complete — confidence 0.91
[14:30:23]  → Dispatching Risk Agent + Vendor Research Agent (parallel)
```

---

### Step 4 — Risk Agent + Vendor Research Agent (parallel)

Both agents fire simultaneously.

```
[14:30:24]  Risk Agent: analyzing renewal risk...
[14:30:24]  Vendor Research Agent: searching for Zoom intelligence via Tavily...
[14:30:27]  Risk Agent: found 4 flags (2 critical, 2 high)
[14:30:27]  Risk Agent: overall risk score 74/100 — HIGH
[14:30:31]  Vendor Research Agent: company health retrieved
[14:30:33]  Vendor Research Agent: pricing benchmark retrieved — Zoom is ABOVE_MARKET
[14:30:35]  Vendor Research Agent: 3 alternatives identified
[14:30:35]  Vendor Research Agent: complete — confidence 0.76
[14:30:35]  → Both agents complete — dispatching Decision Agent
```

---

### Step 5 — Decision Agent

```
[14:30:36]  Decision Agent: synthesizing contract record + risk report + vendor intel...
[14:30:41]  Decision Agent: RENEGOTIATE — confidence 91% — CRITICAL urgency
[14:30:41]  Decision Agent: 34 days to act — primary reason: auto-renewal + above-market pricing
[14:30:41]  → Confidence above threshold — routing to Action Agent via Watsonx Orchestrate
```

---

### Step 6 — Action & Generation Agent

```
[14:30:42]  Action Agent: generating artifacts for RENEGOTIATE recommendation...
[14:30:45]  Action Agent: Renewal Brief — DRAFT
[14:30:47]  Action Agent: Negotiation Prep Sheet — DRAFT
[14:30:49]  Action Agent: Vendor Outreach Email (to Zoom) — DRAFT
[14:30:51]  Action Agent: CFO Summary — DRAFT
[14:30:52]  Action Agent: Action Checklist — DRAFT
[14:30:52]  → 5 artifacts ready for review
```

---

### Step 7 — User Reviews and Approves

User opens the Artifact Approval UI. Reviews all five artifacts. Edits the vendor email to personalize the account rep's name. Approves all five.

```
[14:31:15]  User approved: Renewal Brief
[14:31:15]  User approved: Negotiation Prep Sheet
[14:31:16]  User edited + approved: Vendor Outreach Email
[14:31:16]  User approved: CFO Summary
[14:31:17]  User approved: Action Checklist
[14:31:17]  Watsonx Orchestrate: logging approval to audit stream
[14:31:17]  Workflow WF-2026-0411-ZM-001: COMPLETE
[14:31:17]  Renewal Command Center: updated — Zoom moved to "In Progress"
```

---

## Total Elapsed Time

**From first document upload to approved decision package: 75 seconds.**

---

## Output Summary

| Artifact | Status | Audience |
|---|---|---|
| Renewal Brief | ✅ Approved | Procurement Manager |
| Negotiation Prep Sheet | ✅ Approved | Procurement Manager |
| Vendor Outreach Email | ✅ Approved (edited) | Zoom Account Rep (via user) |
| CFO Summary | ✅ Approved | Finance Director |
| Action Checklist | ✅ Approved | All stakeholders |

---

## Redis State at Completion

```
contract:WF-2026-0411-ZM-001      → full contract record (Hash)
artifacts:WF-2026-0411-ZM-001     → approved artifact set (JSON, TTL 7 days)
workflow:WF-2026-0411-ZM-001      → status: COMPLETE
audit_log (Stream)                → full trace of all 12 events
renewals_by_deadline (Sorted Set) → Zoom removed from urgent queue
```
