"use client";

import { useEffect, useRef } from "react";

/* ─── Sponsor SVG Logos (inline so no external deps) ─── */

function IBMLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="52" fontFamily="IBM Plex Mono, monospace" fontSize="42" fontWeight="700" fill="#ffffff">
        IBM
      </text>
      <text x="10" y="72" fontFamily="Outfit, sans-serif" fontSize="11" fontWeight="500" fill="#a78bfa" letterSpacing="0.12em">
        watsonx Orchestrate
      </text>
    </svg>
  );
}

function RedisLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Redis diamond shape */}
      <polygon points="40,10 70,30 40,50 10,30" fill="#DC382D" opacity="0.9" />
      <polygon points="40,18 60,30 40,42 20,30" fill="#fff" opacity="0.15" />
      <text x="80" y="38" fontFamily="Outfit, sans-serif" fontSize="26" fontWeight="700" fill="#DC382D">
        Redis
      </text>
      <text x="80" y="54" fontFamily="Outfit, sans-serif" fontSize="10" fontWeight="500" fill="#71717a" letterSpacing="0.08em">
        Stack
      </text>
    </svg>
  );
}

function TavilyLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tavily search icon */}
      <circle cx="30" cy="32" r="16" stroke="#14b8a6" strokeWidth="3" fill="none" />
      <line x1="42" y1="44" x2="56" y2="58" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" />
      <text x="65" y="42" fontFamily="Outfit, sans-serif" fontSize="26" fontWeight="700" fill="#14b8a6">
        Tavily
      </text>
    </svg>
  );
}

/* ─── Animated step connector ─── */
function StepConnector() {
  return (
    <div className="hidden items-center justify-center lg:flex" aria-hidden>
      <div className="h-px w-8 bg-gradient-to-r from-teal-500/60 to-teal-500/20" />
      <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 text-teal-400">
        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ─── Parallel branch connector ─── */
function ParallelBranch() {
  return (
    <div className="flex items-stretch justify-center py-1" aria-hidden>
      <svg width="32" height="48" viewBox="0 0 32 48" className="text-orange-400/60">
        <path d="M16 0 V12 M16 12 Q16 18 8 24 M16 12 Q16 18 24 24 M8 24 Q8 30 16 36 M24 24 Q24 30 16 36 M16 36 V48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

/* ─── The page ─── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    heroRef.current?.classList.add("animate-rise");
  }, []);

  return (
    <div className="mesh-backdrop relative min-h-screen overflow-x-hidden">
      {/* Aurora blobs */}
      <div className="aurora-blob" aria-hidden />
      <div className="aurora-blob" aria-hidden />
      <div className="aurora-blob" aria-hidden />
      <div className="grain-overlay" aria-hidden />
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.9),transparent_80%)]"
        aria-hidden
      />

      {/* ━━━ NAV BAR ━━━ */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <span className="font-display text-[0.72rem] font-bold uppercase tracking-[0.3em] text-teal-300">
            ContractIQ
          </span>
          <div className="flex items-center gap-5 text-[0.78rem] font-medium text-zinc-400">
            <a href="#tech" className="transition-colors hover:text-white">Tech Stack</a>
            <a href="#agents" className="transition-colors hover:text-white">Agents</a>
            <a href="#flow" className="transition-colors hover:text-white">Flow</a>
            <a href="#impact" className="transition-colors hover:text-white">Impact</a>
          </div>
        </div>
      </nav>

      {/* ━━━ HERO ━━━ */}
      <Section className="!pt-20 !pb-12 sm:!pt-28 sm:!pb-16">
        <div ref={heroRef} className="opacity-0">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/20 bg-teal-500/[0.06] px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-teal-300">
              Enterprise Agents Hackathon · April 10–12, 2026
            </span>
          </div>

          <h1 className="font-display mt-7 max-w-4xl text-[clamp(2.2rem,5vw+1rem,4.2rem)] font-bold leading-[1.06] tracking-[-0.03em] text-white">
            Six agents. One orchestrator.{" "}
            <span className="bg-gradient-to-r from-teal-200 via-teal-300 to-teal-400/80 bg-clip-text text-transparent">
              Complete procurement intelligence.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            ContractIQ transforms scattered vendor contracts into a structured decision engine — powered by{" "}
            <span className="font-semibold text-zinc-200">IBM Watsonx Orchestrate</span>,{" "}
            <span className="font-semibold text-zinc-200">Redis</span>, and{" "}
            <span className="font-semibold text-zinc-200">Tavily</span>.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#flow" className="btn-primary text-base">
              See the 90-second demo flow
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#tech" className="btn-ghost">
              Explore tech stack
            </a>
          </div>

          {/* Hero stats */}
          <div className="stagger-in mt-12 grid gap-3 sm:grid-cols-4">
            {[
              { label: "Agents", value: "6", sub: "specialized" },
              { label: "Pipeline time", value: "<90s", sub: "end-to-end" },
              { label: "Fields extracted", value: "40+", sub: "per contract" },
              { label: "Annual ROI", value: "$315K", sub: "per team" },
            ].map((s) => (
              <div key={s.label} className="hero-chip">
                <span className="hero-chip-label">{s.label}</span>
                <span className="hero-chip-value">{s.value}</span>
                <span className="mt-0.5 block text-[0.65rem] text-zinc-500">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ━━━ ABOUT ━━━ */}
      <Section id="about">
        <p className="eyebrow">The problem</p>
        <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
          $135B lost to contracts nobody reads
        </h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-5 text-[0.9375rem] leading-relaxed text-zinc-400">
            <p>
              Mid-market procurement teams manage 200–1,000 active vendor contracts across email, shared drives, and spreadsheets. Auto-renewals fire silently. Renegotiation windows close before anyone finds the renewal date. Finance can&apos;t answer &quot;what are we spending?&quot; without a week-long audit.
            </p>
            <p>
              Procurement managers spend <span className="font-semibold text-orange-300">14+ hours/week</span> on tasks that are fundamentally information retrieval and document drafting. <span className="font-semibold text-orange-300">67% of companies</span> miss at least one auto-renewal per quarter.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">ContractIQ replaces</p>
            <ul className="mt-4 space-y-3">
              {[
                "3 hours of manual contract review",
                "A legal consult for risk assessment",
                "A vendor pricing research session",
                "4 stakeholder documents written from scratch",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-teal-500/15 text-teal-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ━━━ SPONSOR TECH ━━━ */}
      <Section id="tech">
        <p className="eyebrow">Sponsor technologies</p>
        <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
          Where each technology lives in the codebase
        </h2>
        <p className="mt-4 max-w-2xl text-[0.9375rem] text-zinc-400">
          Not surface-level integrations. Each sponsor technology is load-bearing — remove it and the system breaks.
        </p>

        <div className="mt-12 space-y-8">
          {/* IBM Watsonx Orchestrate */}
          <div className="panel-surface">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
              <div className="shrink-0 lg:w-56">
                <IBMLogo className="h-16 w-auto" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-purple-300/80">Master Orchestrator</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9375rem] leading-relaxed text-zinc-300">
                  The brain that routes, sequences, and governs everything. Creates workflow state, dispatches agents in correct order, manages parallel execution (Agents 3+4), enforces confidence thresholds, and blocks all external actions until user approval.
                </p>
                <div className="mt-5 space-y-2">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">Codebase locations</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { file: "app/orchestrator/orchestrate.py", desc: "Workflow state machine + agent dispatch" },
                      { file: "app/services/tavily_client.py", desc: "Hosts vasco-tavily tool" },
                      { file: "app/routers/workflows.py", desc: "Approval gate enforcement" },
                    ].map((loc) => (
                      <div key={loc.file} className="rounded-lg border border-purple-500/15 bg-purple-500/[0.06] px-3 py-2">
                        <code className="block font-mono text-[0.72rem] font-medium text-purple-300">{loc.file}</code>
                        <span className="text-[0.68rem] text-zinc-500">{loc.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 rounded-lg border border-white/[0.06] bg-black/30 p-4">
                  <p className="mb-2 font-mono text-[0.65rem] font-medium text-zinc-500">// Agent dispatch via Orchestrate</p>
                  <pre className="overflow-x-auto font-mono text-[0.75rem] leading-relaxed text-zinc-300">
{`orchestrate_client.dispatch_agent(
    agent_id="extraction_agent",
    on_complete="risk_agent,vendor_research_agent",
    confidence_threshold=0.70,
    on_low_confidence="human_review_queue"
)`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Redis */}
          <div className="panel-surface">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
              <div className="shrink-0 lg:w-56">
                <RedisLogo className="h-16 w-auto" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-red-300/80">Connective Tissue</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9375rem] leading-relaxed text-zinc-300">
                  Not just a cache — Redis is the backbone. State, communication, search, and memory all live here. Five distinct data structures power different parts of the system.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { struct: "Hash", key: "contract:{wf_id}", use: "40+ extracted fields per contract, O(1) lookups by any agent" },
                    { struct: "Streams", key: "agent_events", use: "Inter-agent message bus + Live Agent Feed source" },
                    { struct: "Vector Index", key: "contract_chunks", use: "Semantic clause search via embeddings" },
                    { struct: "Sorted Set", key: "renewals_by_deadline", use: "Priority-ordered renewal deadlines" },
                    { struct: "TTL Keys", key: "vendor_research:{id}", use: "24h Tavily result cache — avoids redundant API calls" },
                    { struct: "Stream", key: "audit_log", use: "Append-only audit trail of all human actions" },
                  ].map((r) => (
                    <div key={r.struct} className="rounded-lg border border-red-500/10 bg-red-500/[0.04] p-3">
                      <p className="font-mono text-[0.7rem] font-bold text-red-300">{r.struct}</p>
                      <code className="mt-1 block font-mono text-[0.65rem] text-zinc-500">{r.key}</code>
                      <p className="mt-1.5 text-[0.72rem] leading-snug text-zinc-400">{r.use}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">Primary codebase location</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-lg border border-red-500/15 bg-red-500/[0.06] px-3 py-2">
                      <code className="block font-mono text-[0.72rem] font-medium text-red-300">app/services/redis_client.py</code>
                      <span className="text-[0.68rem] text-zinc-500">All Redis helpers — workflows, contracts, streams, audit</span>
                    </div>
                    <div className="rounded-lg border border-red-500/15 bg-red-500/[0.06] px-3 py-2">
                      <code className="block font-mono text-[0.72rem] font-medium text-red-300">app/websocket/agent_feed.py</code>
                      <span className="text-[0.68rem] text-zinc-500">WebSocket → Redis Stream subscription</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tavily */}
          <div className="panel-surface">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
              <div className="shrink-0 lg:w-56">
                <TavilyLogo className="h-16 w-auto" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-teal-300/80">Real-Time Intelligence</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9375rem] leading-relaxed text-zinc-300">
                  Purpose-built AI search for the Vendor Research Agent. Accessed through the <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[0.8rem] text-teal-300">vasco-tavily</code> tool inside Watsonx Orchestrate — no direct API key needed.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { query: "Company overview + news", result: "Zoom Q2 2026 price increase detected" },
                    { query: "Security incidents & breaches", result: "No critical incidents found" },
                    { query: "Pricing benchmarks for category", result: "Zoom priced above market by 15–20%" },
                    { query: "Competing alternatives", result: "MS Teams, Google Meet (may be pre-licensed)" },
                  ].map((q, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border border-teal-500/10 bg-teal-500/[0.04] p-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-500/15 font-mono text-[0.65rem] font-bold text-teal-300">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-[0.72rem] font-semibold text-zinc-300">{q.query}</p>
                        <p className="mt-0.5 text-[0.68rem] text-teal-400/80">{q.result}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-lg border border-teal-500/15 bg-teal-500/[0.06] px-3 py-2">
                      <code className="block font-mono text-[0.72rem] font-medium text-teal-300">app/agents/research.py</code>
                      <span className="text-[0.68rem] text-zinc-500">Agent 4 — issues 4 scoped queries per vendor</span>
                    </div>
                    <div className="rounded-lg border border-teal-500/15 bg-teal-500/[0.06] px-3 py-2">
                      <code className="block font-mono text-[0.72rem] font-medium text-teal-300">app/services/tavily_client.py</code>
                      <span className="text-[0.68rem] text-zinc-500">Orchestrate vasco-tavily tool wrapper</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 rounded-lg border border-orange-500/15 bg-orange-500/[0.06] px-3 py-2 text-[0.75rem] text-orange-200/80">
                  <span className="font-semibold">Privacy:</span> Only vendor names and category terms are sent to Tavily. No contract text, pricing data, or PII ever leaves the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ━━━ THE SIX AGENTS ━━━ */}
      <Section id="agents">
        <p className="eyebrow">The agent pipeline</p>
        <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
          Six agents, each with one job
        </h2>
        <p className="mt-4 max-w-2xl text-[0.9375rem] text-zinc-400">
          A single &quot;do everything&quot; agent would be impossible to debug, test, parallelize, or make transparent. Six specialized agents mean each one is independently scored, independently routable, and visible in the Live Agent Feed.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              num: "01",
              name: "Ingestion & Classification",
              file: "app/agents/ingestion.py",
              input: "Raw uploaded files",
              output: "Document envelope with metadata",
              desc: "Classifies each document (MSA, order form, amendment, etc.) and links them to a vendor workspace. Uses PyMuPDF for text extraction.",
              color: "teal",
              tech: "PyMuPDF",
            },
            {
              num: "02",
              name: "Extraction",
              file: "app/agents/extraction.py",
              input: "Classified documents",
              output: "40+ structured fields with confidence",
              desc: "Parses all documents into a normalized contract record. Per-field confidence scoring — flags uncertain fields for human confirmation instead of silently passing bad data.",
              color: "teal",
              tech: "Claude + Redis Hash",
            },
            {
              num: "03",
              name: "Risk & Compliance",
              file: "app/agents/risk.py",
              input: "Contract record (from Redis)",
              output: "Risk flags, scores, escalation routing",
              desc: "Scores risk across 4 dimensions: financial, operational, legal, and strategic. Rule-based — no LLM needed. Reads directly from Redis Hash for O(1) field lookups.",
              color: "orange",
              tech: "Redis Hash reads",
            },
            {
              num: "04",
              name: "Vendor Research",
              file: "app/agents/research.py",
              input: "Vendor name + category",
              output: "Vendor intelligence object",
              desc: "Runs 4 scoped Tavily queries for real-time intelligence: company news, security incidents, pricing benchmarks, and competing alternatives. Results cached in Redis with 24h TTL.",
              color: "orange",
              tech: "Tavily via Orchestrate",
            },
            {
              num: "05",
              name: "Decision",
              file: "app/agents/decision.py",
              input: "Risk report + vendor intel + spend",
              output: "Structured recommendation",
              desc: "Synthesizes everything into a single recommendation: RENEW, RENEGOTIATE, or CANCEL. Includes confidence score, urgency level, reasoning, and days-to-act countdown.",
              color: "purple",
              tech: "Claude LLM synthesis",
            },
            {
              num: "06",
              name: "Action & Generation",
              file: "app/agents/generation.py",
              input: "Decision package",
              output: "5 draft artifacts",
              desc: "Generates all stakeholder artifacts: Renewal Brief, Negotiation Prep Sheet, Vendor Email, CFO Summary, Action Checklist. All marked Draft — nothing fires without approval.",
              color: "purple",
              tech: "Claude + Approval Gate",
            },
          ].map((agent) => {
            const borderColor =
              agent.color === "teal" ? "border-teal-500/15" :
              agent.color === "orange" ? "border-orange-500/15" :
              "border-purple-500/15";
            const numBg =
              agent.color === "teal" ? "bg-teal-500/15 text-teal-300" :
              agent.color === "orange" ? "bg-orange-500/15 text-orange-300" :
              "bg-purple-500/15 text-purple-300";
            const techBg =
              agent.color === "teal" ? "bg-teal-500/10 text-teal-300" :
              agent.color === "orange" ? "bg-orange-500/10 text-orange-300" :
              "bg-purple-500/10 text-purple-300";

            return (
              <div key={agent.num} className={`rounded-2xl border ${borderColor} bg-zinc-900/40 p-5 transition-all hover:bg-zinc-900/60`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm font-bold ${numBg}`}>
                    {agent.num}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{agent.name}</p>
                  </div>
                </div>
                <p className="mt-3 text-[0.8rem] leading-relaxed text-zinc-400">{agent.desc}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-600">In</span>
                    <span className="text-[0.72rem] text-zinc-400">{agent.input}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-600">Out</span>
                    <span className="text-[0.72rem] text-zinc-400">{agent.output}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <code className="rounded bg-zinc-800/80 px-2 py-1 font-mono text-[0.65rem] text-zinc-400">{agent.file}</code>
                  <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold ${techBg}`}>{agent.tech}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-orange-500/15 bg-orange-500/[0.04] p-4">
          <p className="text-[0.8rem] text-orange-200/80">
            <span className="font-bold">Parallel execution:</span> Agents 3 (Risk) and 4 (Research) run simultaneously — they don&apos;t depend on each other. Risk reads from Redis; Research calls Tavily. Both complete before Agent 5 begins.
          </p>
        </div>
      </Section>

      {/* Divider */}
      <div className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ━━━ FLOW / DEMO WALKTHROUGH ━━━ */}
      <Section id="flow">
        <p className="eyebrow">Demo walkthrough</p>
        <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
          Renewal Rescue: the 90-second story
        </h2>
        <p className="mt-4 max-w-2xl text-[0.9375rem] text-zinc-400">
          Upload 4 Zoom contracts. Get a complete renegotiation decision package. Follow along as each agent fires.
        </p>

        <div className="mt-12 space-y-0">
          {[
            {
              step: "1",
              time: "0:00",
              title: "Upload 4 Zoom Documents",
              desc: "MSA, Order Form, Amendment, and Pricing Sheet are drag-and-dropped. FastAPI creates a workflow ID. IBM Watsonx Orchestrate initializes workflow state in Redis.",
              feed: ["Upload received — 4 documents — Zoom Video Communications"],
              tech: ["Watsonx Orchestrate", "Redis Hash"],
              accent: "teal",
            },
            {
              step: "2",
              time: "0:08",
              title: "Ingestion Agent Classifies",
              desc: "All 4 documents classified in under 8 seconds. Each linked to the Zoom vendor workspace with document type and confidence score.",
              feed: [
                "Ingestion Agent: MSA classified (97%)",
                "Ingestion Agent: complete — 4 docs linked to Zoom",
                "→ Dispatching Extraction Agent",
              ],
              tech: ["PyMuPDF", "Redis Hash"],
              accent: "teal",
            },
            {
              step: "3",
              time: "0:14",
              title: "Extraction Agent Parses",
              desc: "38 structured fields extracted. Notice period flagged at 58% confidence — the system pauses for human confirmation instead of silently passing uncertain data.",
              feed: [
                "Extraction Agent: 38 fields extracted",
                "⚠ Notice period: \"60 days\" — confidence 58% — needs confirmation",
                "User confirmed: notice_period = 60 days",
              ],
              tech: ["Claude LLM", "Confidence Routing"],
              accent: "teal",
            },
            {
              step: "4",
              time: "0:24",
              title: "Risk + Research Fire in Parallel",
              desc: "Two agents start simultaneously. Risk reads the contract record from Redis. Vendor Research calls Tavily through Orchestrate for live intelligence. Neither waits for the other.",
              feed: [
                "Risk Agent: 4 flags (2 critical, 2 high) — score 74/100",
                "Research Agent: Tavily found Zoom price increase Q2 2026",
                "Research Agent: above-market pricing confirmed, 3 alternatives",
              ],
              tech: ["Redis Hash", "Tavily", "Parallel Execution"],
              accent: "orange",
            },
            {
              step: "5",
              time: "0:41",
              title: "Decision Agent Synthesizes",
              desc: "Contract terms + risk flags + live vendor intel + spend context → single recommendation. Confidence above 80% threshold, so Orchestrate routes to the Action Agent.",
              feed: [
                "Decision Agent: RENEGOTIATE — 91% confidence — CRITICAL",
                "34 days to act — auto-renewal + above-market pricing",
                "→ Routing to Action Agent via Watsonx Orchestrate",
              ],
              tech: ["Claude LLM", "Watsonx Orchestrate"],
              accent: "purple",
            },
            {
              step: "6",
              time: "0:52",
              title: "5 Artifacts Generated",
              desc: "Renewal Brief, Negotiation Prep Sheet, Vendor Email, CFO Summary, and Action Checklist. All marked Draft — Pending Approval. The enterprise guardrail.",
              feed: [
                "Action Agent: 5 artifacts ready for review",
                "All artifacts marked DRAFT_PENDING_APPROVAL",
              ],
              tech: ["Claude LLM", "Approval Gate"],
              accent: "purple",
            },
            {
              step: "7",
              time: "1:15",
              title: "User Approves → Workflow Complete",
              desc: "User reviews artifacts, personalizes the vendor email, and approves all five. Watsonx Orchestrate logs approval to Redis audit stream. Nothing external fires until this gate passes.",
              feed: [
                "User approved: all 5 artifacts",
                "Watsonx Orchestrate: logged to audit stream",
                "Workflow COMPLETE — Zoom moved out of critical queue",
              ],
              tech: ["Watsonx Orchestrate", "Redis Stream", "Audit Log"],
              accent: "teal",
            },
          ].map((step, i) => {
            const accentBorder =
              step.accent === "teal" ? "border-l-teal-500/50" :
              step.accent === "orange" ? "border-l-orange-500/50" :
              "border-l-purple-500/50";
            const timeBg =
              step.accent === "teal" ? "bg-teal-500/15 text-teal-300" :
              step.accent === "orange" ? "bg-orange-500/15 text-orange-300" :
              "bg-purple-500/15 text-purple-300";

            return (
              <div key={step.step} className="relative">
                {/* Vertical connector line */}
                {i < 6 && (
                  <div className="absolute left-[1.65rem] top-full z-0 h-4 w-px bg-gradient-to-b from-white/10 to-transparent sm:left-[1.9rem]" />
                )}
                <div className={`relative rounded-xl border border-white/[0.06] border-l-2 ${accentBorder} bg-zinc-900/30 p-5 sm:p-6 mb-4`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg font-mono text-sm font-bold ${timeBg}`}>
                      {step.step}
                    </span>
                    <span className="font-mono text-[0.72rem] text-zinc-500">{step.time}</span>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  </div>
                  <p className="mt-3 max-w-2xl text-[0.875rem] leading-relaxed text-zinc-400">{step.desc}</p>

                  {/* Live Agent Feed preview */}
                  <div className="mt-4 rounded-lg border border-white/[0.05] bg-black/30 p-3">
                    <p className="mb-2 font-mono text-[0.6rem] font-bold uppercase tracking-[0.15em] text-zinc-600">Live Agent Feed</p>
                    {step.feed.map((line, j) => (
                      <p key={j} className="font-mono text-[0.72rem] leading-relaxed text-zinc-400">
                        <span className="text-zinc-600">[{step.time}] </span>
                        {line.startsWith("⚠") ? (
                          <span className="text-orange-300">{line}</span>
                        ) : line.startsWith("→") ? (
                          <span className="text-teal-300">{line}</span>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>

                  {/* Tech tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {step.tech.map((t) => (
                      <span key={t} className="rounded-full border border-white/[0.06] bg-zinc-800/50 px-2.5 py-0.5 text-[0.62rem] font-semibold text-zinc-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Divider */}
      <div className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ━━━ ARCHITECTURE DIAGRAM ━━━ */}
      <Section>
        <p className="eyebrow">Architecture</p>
        <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
          How the pieces connect
        </h2>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-6 sm:p-8">
          <pre className="font-mono text-[0.72rem] leading-relaxed text-zinc-300 sm:text-[0.8rem]">
{`┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│  Dashboard · Upload · Live Agent Feed · Artifact Approval           │
│  Next.js 16 + React 19 + Tailwind v4                               │
└────────────────────────┬───────────────────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼───────────────────────────────────────────┐
│                      FASTAPI BACKEND (18 routes)                   │
│              Session management · File upload · Auth                │
└────────────────────────┬───────────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────────────┐
│           `}<span className="text-purple-300 font-bold">IBM WATSONX ORCHESTRATE</span>{`                               │
│                                                                     │
│  • Dispatches agents in sequence (with parallel branch)             │
│  • Confidence routing → human review when uncertain                 │
│  • Approval gate → nothing fires without user consent               │
│  • Audit trail → every action logged to Redis                       │
└──────────────┬──────────────────────────────┬──────────────────────┘
               │                              │
    ┌──────────▼──────────┐       ┌───────────▼──────────┐
    │   AGENT PIPELINE    │       │   `}<span className="text-red-300 font-bold">REDIS</span>{` BACKBONE     │
    │                     │       │                      │
    │  1. Ingestion       │◄─────►│  Hash: contracts     │
    │  2. Extraction      │       │  Streams: msg bus    │
    │  3. Risk       ─┐   │       │  Vector: search      │
    │  4. Research   ─┼───┤       │  Sorted Set: urgency │
    │  5. Decision  ◄─┘   │       │  TTL: research cache │
    │  6. Generation      │       │  Pub/Sub: live feed  │
    └─────────────────────┘       └──────────────────────┘
                                           ▲
                               ┌───────────┴──────────┐
                               │  EXTERNAL SERVICES    │
                               │                       │
                               │  Anthropic Claude LLM │
                               │  `}<span className="text-teal-300 font-bold">Tavily</span>{` (via Orch.)  │
                               │  PyMuPDF              │
                               └───────────────────────┘`}
          </pre>
        </div>
      </Section>

      {/* Divider */}
      <div className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ━━━ BUSINESS IMPACT ━━━ */}
      <Section id="impact">
        <p className="eyebrow">Business impact</p>
        <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
          Measurable KPIs, not hand-waving
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { metric: "14 hrs → 2 hrs", label: "Weekly review time per manager", delta: "86% reduction" },
            { metric: "67% → 0%", label: "Auto-renewal miss rate", delta: "All deadlines surfaced 30+ days early" },
            { metric: "Days → 90s", label: "Upload to decision recommendation", delta: "From manual days to automated seconds" },
            { metric: "$315K", label: "Annual value per 3-person team", delta: "< 6 week payback period" },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl border border-white/[0.07] bg-zinc-900/40 p-5">
              <p className="font-display text-2xl font-bold text-white sm:text-3xl">{m.metric}</p>
              <p className="mt-2 text-[0.8rem] font-semibold text-zinc-300">{m.label}</p>
              <p className="mt-1 text-[0.72rem] text-teal-400/80">{m.delta}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/40 p-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">ROI breakdown</p>
            <div className="mt-4 space-y-3">
              {[
                { item: "Recovered procurement productivity", value: "$153,000" },
                { item: "Avoided unwanted auto-renewals", value: "$72,000" },
                { item: "Renegotiation savings via benchmarks", value: "$60,000" },
                { item: "Legal review efficiency", value: "$30,000" },
                { item: "Reduced cross-functional interruptions", value: "$36,000" },
              ].map((r) => (
                <div key={r.item} className="flex items-center justify-between border-b border-white/[0.04] pb-2 last:border-0">
                  <span className="text-[0.8rem] text-zinc-400">{r.item}</span>
                  <span className="font-mono text-[0.8rem] font-semibold text-white">{r.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-white">Total Annual Value</span>
                <span className="font-mono text-lg font-bold text-teal-300">$351,000</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/40 p-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-500">Target customer</p>
            <div className="mt-4 space-y-4 text-[0.875rem] text-zinc-400">
              <div>
                <p className="font-semibold text-zinc-200">500–5,000 employees</p>
                <p className="text-[0.8rem]">200–1,000 active vendor contracts</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-200">Procurement team of 2–8 people</p>
                <p className="text-[0.8rem]">No dedicated CLM, or an underused one</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-200">Contracts scattered everywhere</p>
                <p className="text-[0.8rem]">Google Drive, email, shared folders, spreadsheets</p>
              </div>
              <div className="rounded-lg bg-teal-500/[0.06] p-3">
                <p className="text-[0.8rem] font-semibold text-teal-300">
                  $2.5M average annual SaaS spend at a 1,000-person company — mostly unmanaged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ━━━ WHY THESE DESIGN DECISIONS ━━━ */}
      <Section>
        <p className="eyebrow">Design decisions</p>
        <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
          Why we built it this way
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            {
              q: "Why six agents instead of one?",
              a: "Each agent is independently testable, independently scored, and visible in the Live Feed. A monolithic agent can't parallelize, can't show meaningful progress, and can't tell you which step failed.",
            },
            {
              q: "Why Redis Streams for inter-agent communication?",
              a: "Streams give us the Live Agent Feed for free — the UI subscribes to the same stream agents write to. Workflows survive restarts. Every action is auditable. Agents don't need to be in the same process.",
            },
            {
              q: "Why is the approval gate in Orchestrate, not app code?",
              a: "Application-layer guardrails can be bypassed by bugs. Orchestrate's workflow definition is the authority — the gate is a workflow state, not a conditional. That's what 'enterprise guardrails' means.",
            },
            {
              q: "Why Tavily over generic web search?",
              a: "Tavily returns clean, structured, citation-rich results purpose-built for AI agents. Generic search returns SEO spam that needs heavy post-processing. For vendor research, Tavily is meaningfully more accurate.",
            },
          ].map((d) => (
            <div key={d.q} className="rounded-2xl border border-white/[0.07] bg-zinc-900/40 p-5">
              <p className="text-[0.9rem] font-semibold text-white">{d.q}</p>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-zinc-400">{d.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="font-display text-xl font-bold text-white sm:text-2xl">
              Built by a 3-person team in 48 hours
            </p>
            <p className="max-w-md text-sm text-zinc-400">
              Enterprise Agents Hackathon · April 10–12, 2026
            </p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-600">Agent Engineer</p>
                <p className="mt-1 text-sm text-zinc-300">Ingestion, Extraction, Risk, Decision</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-600">Integration Engineer</p>
                <p className="mt-1 text-sm text-zinc-300">Orchestrate, Redis, Tavily, FastAPI</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-zinc-600">Frontend & Demo</p>
                <p className="mt-1 text-sm text-zinc-300">React UI, Live Feed, Demo Prep</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="font-display text-[0.72rem] font-bold uppercase tracking-[0.3em] text-teal-300">
                ContractIQ
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-[0.75rem] text-zinc-500">Not a chatbot. Not a search box. A procurement operating system.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
