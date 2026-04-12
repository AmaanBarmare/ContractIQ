# Agent 4: Vendor Research Agent

**Single job:** Ground every contract decision in live external intelligence. Use Tavily to research the vendor, the market, and the competitive landscape — in real time.

---

## Responsibilities

1. Receive the vendor name and category from the workflow
2. Call Tavily Search API across five research dimensions
3. Structure and score the results
4. Cache results in Redis with a 24-hour TTL
5. Return a vendor intelligence object to the Decision Agent

---

## Why This Agent Exists

A procurement team should never ask only: "What does the contract say?"

They must also ask:
- Is this vendor financially stable?
- Have they had recent security incidents?
- Are we paying above market?
- Are there better alternatives?
- Is anything happening at this company that should affect our renewal decision?

Static contract documents cannot answer these questions. Tavily can.

---

## Research Dimensions

### 1. Company Overview & Business Health

**Tavily query:** `{vendor_name} company overview funding revenue 2025 2026`

**What we're looking for:**
- Signs of financial instability (recent funding round failures, layoffs, restructuring)
- M&A activity (acquisition might change pricing or support quality)
- Leadership changes (new CEO, CFO often signal strategy shifts)
- Recent product changes that affect the value proposition

### 2. Security Incidents & Trust Signals

**Tavily queries:**
- `{vendor_name} security breach data incident 2025 2026`
- `{vendor_name} outage service disruption 2025 2026`
- `{vendor_name} regulatory action fine penalty`

**What we're looking for:**
- Public breach disclosures or incident reports
- Known vulnerabilities (CVEs) in the vendor's product
- Regulatory fines or investigations
- Customer data exposure events
- Patterns of recurring outages

### 3. Pricing Benchmarks

**Tavily queries:**
- `{category} software pricing per seat cost 2026`
- `{vendor_name} pricing cost per user enterprise`
- `{category} average contract value benchmark mid-market`

**What we're looking for:**
- Typical price ranges for comparable tools in the category
- Whether the current contract rate is in line with market
- Published pricing tiers (some vendors publish list pricing)
- Industry reports or analyst benchmarks

### 4. Alternative Vendors

**Tavily queries:**
- `best alternatives to {vendor_name} {category} 2026`
- `{category} software comparison top competitors`

**What we're looking for:**
- 2–3 credible alternatives in the same category
- Key differentiators and pricing signals for each
- Recent market positioning changes
- Migration complexity signals

### 5. Customer Sentiment

**Tavily queries:**
- `{vendor_name} customer reviews problems complaints 2025 2026`
- `{vendor_name} G2 Gartner Peer Insights rating`

**What we're looking for:**
- Recent spikes in negative reviews or support complaints
- Patterns in what customers dislike (support quality, pricing increases, feature regression)
- Net Promoter Score or review trend signals

---

## Tavily Integration

```python
from tavily import TavilyClient
import redis
import json

client = TavilyClient(api_key=TAVILY_API_KEY)
r = redis.Redis.from_url(REDIS_URL)

def research_vendor(vendor_name: str, category: str, vendor_id: str) -> dict:
    # Check Redis cache first
    cache_key = f"vendor_research:{vendor_id}"
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)
    
    results = {}
    
    # Company health
    results["company"] = client.search(
        f"{vendor_name} company news funding 2026",
        search_depth="advanced",
        max_results=4,
        include_answer=True
    )
    
    # Security
    results["security"] = client.search(
        f"{vendor_name} security breach data incident 2025 2026",
        max_results=3,
        include_answer=True
    )
    
    # Pricing benchmarks
    results["pricing"] = client.search(
        f"{category} software pricing per seat benchmark 2026",
        max_results=4,
        include_answer=True
    )
    
    # Alternatives
    results["alternatives"] = client.search(
        f"best alternatives to {vendor_name} {category}",
        max_results=5,
        include_answer=True
    )
    
    # Customer sentiment
    results["sentiment"] = client.search(
        f"{vendor_name} customer reviews problems 2025 2026",
        max_results=3,
        include_answer=True
    )
    
    # Cache results for 24 hours
    r.setex(cache_key, 86400, json.dumps(results))
    
    return results
```

**Privacy note:** Only the vendor name and category label are sent to Tavily. No contract text, no pricing data, no PII, no internal annotations.

---

## Output (Vendor Intelligence Object)

```json
{
  "workflow_id": "WF-2026-0411-ZM-001",
  "vendor_id": "zoom_video_communications",
  "vendor_name": "Zoom Video Communications",
  "research_timestamp": "2026-04-11T14:30:52Z",
  "cache_hit": false,
  "company_health": {
    "summary": "Zoom reported slowing growth in 2025 and has been repositioning as an AI-first platform. No major funding events. Stable but competitive pressure from Teams and Meet is intensifying.",
    "risk_signals": ["Slowing revenue growth", "Increased competition from bundled alternatives"],
    "recent_news_headlines": [
      "Zoom announces AI Companion pricing changes effective Q2 2026",
      "Zoom Q4 2025 earnings: growth down to 3% YoY"
    ],
    "confidence": 0.82
  },
  "security_posture": {
    "summary": "No major data breaches found in the past 12 months. Zoom maintains SOC 2 Type II certification. One minor security advisory (CVE-2025-xxxxx) was patched within 14 days.",
    "risk_signals": [],
    "incidents": [],
    "confidence": 0.79
  },
  "pricing_benchmark": {
    "category": "Video Conferencing",
    "market_range_per_seat_annual": { "low": "$380", "high": "$450", "midpoint": "$415" },
    "current_contract_rate": "$467",
    "benchmark_assessment": "ABOVE_MARKET",
    "estimated_overpayment_annual": "$9,360 (at midpoint benchmark)",
    "confidence": 0.71
  },
  "alternatives": [
    {
      "vendor": "Microsoft Teams",
      "category_fit": "High",
      "pricing_signal": "Included in M365 E3/E5 — may already be licensed",
      "migration_complexity": "Medium",
      "note": "If company is on M365, Teams may be free"
    },
    {
      "vendor": "Google Meet",
      "category_fit": "Medium",
      "pricing_signal": "Included in Google Workspace — may already be licensed",
      "migration_complexity": "Low",
      "note": "If company is on Google Workspace, Meet is included"
    },
    {
      "vendor": "Webex by Cisco",
      "category_fit": "High",
      "pricing_signal": "$350–$450/seat/year",
      "migration_complexity": "High",
      "note": "Enterprise-focused; stronger compliance features"
    }
  ],
  "customer_sentiment": {
    "trend": "NEUTRAL",
    "summary": "Generally positive reviews. Recent complaints focus on AI feature upselling and price increases. Support quality rated 3.8/5 on G2.",
    "confidence": 0.68
  },
  "overall_vendor_risk": "MEDIUM",
  "key_finding": "Zoom pricing appears 12–13% above market midpoint. Recent company-wide price increase announcement (Q2 2026) suggests further increases at renewal are likely. Two alternatives (Teams, Meet) may already be licensed through existing agreements.",
  "agent": "vendor_research_agent",
  "confidence": 0.76
}
```

---

## Redis Caching

```python
# Cache key per vendor (not per workflow — vendor research is reusable across reviews)
cache_key = f"vendor_research:{vendor_id}"

# Check before calling Tavily
cached = redis.get(cache_key)
if cached:
    return json.loads(cached)  # Cache hit — no Tavily call needed

# After Tavily call, cache for 24 hours
redis.setex(cache_key, 86400, json.dumps(research_results))
```

This means if two team members review Zoom contracts on the same day, only one Tavily call is made.

---

## Communicates To

**Target:** Decision Agent  
**Trigger:** On completion of all five research dimensions  
**Channel:** Redis Stream (`agent_events`)  
**Note:** Runs in parallel with Risk Agent — both must complete before the Decision Agent begins.
