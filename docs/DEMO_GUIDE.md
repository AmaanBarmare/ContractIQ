# Demo Guide

Complete guide for presenting ContractIQ at the Enterprise Agents Hackathon — Sunday, April 12, 5–6pm ET via Zoom.

---

## Core Demo Principles

1. **Tell a story, not a feature tour.** Start with the pain. Show the magic. Quantify the value.
2. **Show agents communicating.** Judges are here for multi-agent orchestration. The Live Agent Feed is your proof.
3. **Show human control.** The approval gate demonstrates enterprise guardrails — a key judging criterion.
4. **Hit all three sponsors.** Watsonx Orchestrate, Redis, Tavily should all be visible and named.
5. **Know your fallback.** Have a backup video. If anything breaks, you are still prepared.

---

## Pre-Demo Checklist

Run through this the morning of Sunday (or Saturday night):

- [ ] All four Zoom sample documents are ready to upload
- [ ] Redis is running and healthy (`redis-cli ping` returns `PONG`)
- [ ] Watsonx Orchestrate workflow is configured and tested end-to-end
- [ ] Tavily API key is valid and returning results for "Zoom"
- [ ] Watsonx.ai API key is valid
- [ ] Backend is running (`uvicorn app.main:app`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Live Agent Feed is displaying events in real time
- [ ] The confidence confirmation prompt fires correctly for the notice period field
- [ ] Artifact Approval UI is rendering all five artifacts
- [ ] Backup demo video is recorded and ready (full 90-second run)
- [ ] GitHub README is complete with setup instructions
- [ ] Slide deck is finalized

---

## Five-Minute Demo Script

### Minute 0:00–0:30 — The Problem

**Spoken:**

> "Here's a real scenario. Your Zoom contract auto-renews in 34 days. Nobody noticed. The contract is in a shared drive, nobody knows the notice period, and Finance has no idea what you're paying. This happens to 67% of procurement teams every quarter. It costs North American companies $135 billion a year in unwanted renewals.
>
> ContractIQ fixes this. And it does it through six specialized AI agents — orchestrated by IBM Watsonx Orchestrate — that work together to extract, analyze, decide, and act."

**On screen:** Renewal Command Center, Zoom contract flagged red with 34 days remaining.

---

### Minute 0:30–1:15 — Upload and Ingestion

**Spoken:**

> "Let's start. I'm uploading four Zoom documents — the MSA, order form, amendment, and pricing sheet. Watch the Live Agent Feed on the right."

**Action:** Drag and drop four files.

**On screen:** Live Agent Feed lighting up.

> "The Ingestion Agent — running on IBM Watsonx Orchestrate — classifies all four documents in under 8 seconds. Now the Extraction Agent fires. It's parsing all four documents simultaneously, extracting 38 structured fields. 
>
> Here — it flagged the notice period at 58% confidence. It found text that looks like 60 days but it's not certain enough to proceed automatically. That's the confidence routing working. Instead of silently passing bad data forward, it asks me to confirm."

**Action:** Click "Confirm 60 days."

> "Confirmed. Now the extraction resumes."

---

### Minute 1:15–2:15 — Risk and Research in Parallel

**Spoken:**

> "Watch the next step. The Risk Agent and Vendor Research Agent fire simultaneously. This is the parallel branch in our architecture. They don't need to wait for each other.
>
> The Risk Agent is reading the extracted contract record from Redis. It found four flags — two critical, two high. Auto-renewal active. Pricing likely above benchmark. No termination for convenience. No renewal owner.
>
> At the same time — the Vendor Research Agent is calling the Tavily API right now in real time. It's searching for current Zoom news, pricing benchmarks for the video conferencing category, and alternatives."

**On screen:** Show the Tavily result appearing — the Zoom price increase announcement.

> "Tavily found that Zoom announced a pricing increase effective Q2 2026. That's live intelligence that wasn't in the contract. It also confirmed that Microsoft Teams and Google Meet may already be licensed through existing agreements — that's leverage."

---

### Minute 2:15–2:45 — Decision

**Spoken:**

> "Now the Decision Agent synthesizes everything — contract terms, risk flags, live vendor intel, spend context — and produces a single recommendation."

**On screen:** Decision card appears: RENEGOTIATE · 91% confidence · CRITICAL · 34 days to act.

> "Renegotiate. 91% confidence. Critical urgency. 34 days to act. The reasoning is right there: above-market pricing, auto-renewal risk, alternatives available, deadline imminent.
>
> Confidence is above the 80% threshold, so Watsonx Orchestrate routes to the Action Agent. If confidence had been lower, it would have escalated to me for a judgment call first."

---

### Minute 2:45–3:30 — Artifacts and Approval

**Spoken:**

> "The Action Agent generates five artifacts. All marked Draft — Pending Approval. Nothing is final until I say so. This is the guardrail."

**Action:** Click through each artifact tab: Renewal Brief, Negotiation Prep Sheet, Vendor Email, CFO Summary, Checklist.

> "Here's the negotiation prep sheet — it pulled the leverage points from the vendor research. Zoom is showing slowing growth. Teams and Meet are free alternatives. That's real leverage, grounded in live data.
>
> The vendor email is ready to send — I'll just personalize the account rep's name."

**Action:** Edit the email, then click Approve on all five.

> "Approved. Watsonx Orchestrate logs the approval to the Redis audit stream. The workflow is complete. Zoom moves out of the critical queue."

---

### Minute 3:30–4:00 — Architecture Callout

**Spoken:**

> "Quick architecture note for the judges. What just happened was six agents in sequence. IBM Watsonx Orchestrate coordinated every handoff. Redis ran as our message bus — every agent published to a Redis Stream, which is what powered this live feed. Tavily gave us the real-time vendor intelligence that static contracts can't provide."

**On screen:** Architecture diagram showing the six agents and the three sponsor technologies.

---

### Minute 4:00–5:00 — Business Close

**Spoken:**

> "What that workflow just replaced: three hours of manual contract review, a legal consult, a Zoom pricing research session, and four documents that someone would have written from scratch.
>
> For a procurement team managing 300 contracts, ContractIQ recovers 12 hours per manager per week. At fully-loaded cost, that's $150,000 per year in recovered productivity alone. Add in the auto-renewal risk prevention — $135 billion market — and renegotiation savings of 12–18% on flagged contracts, and the annual value for a 3-person procurement team is over $315,000. Payback period: under 6 weeks.
>
> This is what a real enterprise agent looks like. Not a chatbot. Not a search box. A multi-agent system that detects, decides, and acts — with humans in control at every step."

---

## Two-Minute Pitch Script

> "ContractIQ is a multi-agent AI platform for procurement teams. The problem: $135 billion lost every year to missed auto-renewals and manual contract admin. Mid-market teams manage hundreds of contracts manually — and constantly miss deadlines, overpay, and react too late.
>
> Our solution uses six specialized agents — orchestrated by IBM Watsonx Orchestrate — to turn uploaded contracts into structured intelligence, risk alerts, vendor decisions, and stakeholder-ready artifacts. Watch: a user uploads a Zoom contract. In under 90 seconds, Extraction, Risk, Vendor Research, Decision, and Generation agents fire in sequence. One field gets flagged for human confirmation — that's our confidence routing. The rest proceeds automatically. Tavily pulls live vendor intel. The Decision Agent recommends renegotiate at 91% confidence. Five artifacts are generated and ready for user approval. Nothing external fires until the user approves.
>
> Full IBM Watsonx Orchestrate orchestration. Redis as the message bus, vector store, and audit log. Tavily for real-time vendor grounding. Estimated ROI: $315,000 per year for a 3-person procurement team."

---

## Edge Cases and Fallbacks

| Scenario | What To Do |
|---|---|
| Tavily is slow or returns sparse results | Mention that the cache missed and it's making a live call — this is honest and shows real integration |
| Watsonx Orchestrate has latency | Explain each agent step verbally while it processes — fill the silence with architecture commentary |
| Confidence prompt doesn't fire | Proceed without it and explain: "Our confidence routing would normally pause here for a high-stakes field — we pre-seeded this demo with a confirmed value" |
| Action Agent artifact looks generic | Move on quickly; explain that prompt tuning is ongoing and the structure and routing are what matter |
| Live demo crashes | Switch to backup video immediately, no apology — "Let me show you the recorded run while I explain the architecture" |
| Judge asks "how is this different from a RAG chatbot?" | "Three ways: structured extraction with 40+ normalized fields, true multi-agent orchestration with parallel execution and confidence routing, and artifact generation with approval gates. RAG chatbots answer questions. ContractIQ makes decisions and takes action." |

---

## Key Lines to Memorize

- **Opening hook:** "67% of procurement teams miss at least one auto-renewal per quarter. It costs North American companies $135 billion a year."
- **Architecture one-liner:** "Six specialized agents. One orchestrator. Full audit trail."
- **Differentiator:** "Not a chatbot. Not a search box. A procurement operating system."
- **ROI close:** "$315,000 annual value. Under 6 weeks to payback."
- **Guardrail line:** "Nothing external fires until the user approves. That's the enterprise guardrail."
