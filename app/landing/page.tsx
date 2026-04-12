import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ContractIQ — AI Contract Intelligence",
  description:
    "Six AI agents turn contract uploads into board-ready decisions in under 90 seconds.",
};

/* ═══════════════════════════════════════════════════════════════
   ContractIQ Landing — "Command Intelligence" aesthetic
   Light premium shell + dark system-view panels for pipeline/arch
   Cobalt primary (#2563EB) · Amber urgency (#F59E0B) · Warm base
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="font-(family-name:--font-inter) min-h-screen text-[#374151]">
      {/* ── Global keyframes ── */}
      <style>{`
        html{overflow:auto;scrollbar-gutter:stable}
        body{overflow-x:hidden;background:#F8FAFC}

        @keyframes fadeUp{
          from{opacity:0;transform:translateY(28px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes fadeIn{
          from{opacity:0}
          to{opacity:1}
        }
        @keyframes pulseGlow{
          0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.35)}
          50%{box-shadow:0 0 0 8px rgba(37,99,235,0)}
        }
        @keyframes pulseDot{
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:.55;transform:scale(1.35)}
        }
        @keyframes shimmer{
          0%{background-position:-200% 0}
          100%{background-position:200% 0}
        }
        @keyframes slideRight{
          from{width:0}
          to{width:100%}
        }
        @keyframes floatSlow{
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-8px)}
        }

        .anim-rise{animation:fadeUp .72s cubic-bezier(.22,1,.36,1) both}
        .anim-fade{animation:fadeIn .6s ease both}
        .d1{animation-delay:.08s}.d2{animation-delay:.15s}.d3{animation-delay:.22s}
        .d4{animation-delay:.30s}.d5{animation-delay:.38s}.d6{animation-delay:.46s}
        .d7{animation-delay:.54s}.d8{animation-delay:.62s}.d9{animation-delay:.70s}
        .d10{animation-delay:.78s}

        .pulse-dot{animation:pulseDot 2.4s ease-in-out infinite}

        .shimmer-bar{
          background:linear-gradient(90deg,transparent 0%,rgba(37,99,235,.12) 50%,transparent 100%);
          background-size:200% 100%;
          animation:shimmer 3s linear infinite;
        }

        .float-card{animation:floatSlow 6s ease-in-out infinite}
        .float-card-alt{animation:floatSlow 6s ease-in-out 1.5s infinite}

        .arch-arrow{
          background:linear-gradient(180deg,#2563EB,#60A5FA);
          border-radius:2px;
        }

        .hero-glow{
          position:absolute;
          width:680px;height:680px;
          border-radius:50%;
          background:radial-gradient(circle,rgba(37,99,235,.13) 0%,rgba(37,99,235,.04) 40%,transparent 70%);
          top:-220px;left:50%;transform:translateX(-50%);
          pointer-events:none;
          z-index:0;
        }

        .hero-glow-amber{
          position:absolute;
          width:400px;height:400px;
          border-radius:50%;
          background:radial-gradient(circle,rgba(245,158,11,.08) 0%,transparent 65%);
          top:60px;right:-80px;
          pointer-events:none;
          z-index:0;
        }
      `}</style>

      {/* ━━━━━━━━━━━━━━━━━━━ NAV ━━━━━━━━━━━━━━━━━━━ */}
      <nav className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            {/* Logo mark */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]">
              <svg viewBox="0 0 20 20" className="h-4.5 w-4.5 text-white" fill="currentColor">
                <path d="M4 4h5v5H4V4zm7 0h5v5h-5V4zm-7 7h5v5H4v-5zm7 0h5v5h-5v-5z" opacity=".9"/>
                <path d="M6 6h1v1H6V6zm7 0h1v1h-1V6zm-7 7h1v1H6v-1zm7 0h1v1h-1v-1z" fill="rgba(255,255,255,.5)"/>
              </svg>
            </div>
            <span className="font-(family-name:--font-space-grotesk) text-[15px] font-bold tracking-tight text-[#111827]">
              ContractIQ
            </span>
          </div>
          <div className="flex items-center gap-7 text-[13px] font-medium text-[#9CA3AF]">
            <a href="#tech" className="transition-colors hover:text-[#111827]">Technology</a>
            <a href="#agents" className="transition-colors hover:text-[#111827]">Agents</a>
            <a href="#flow" className="transition-colors hover:text-[#111827]">Pipeline</a>
            <a href="#impact" className="transition-colors hover:text-[#111827]">Impact</a>
            <a href="#arch" className="transition-colors hover:text-[#111827]">Architecture</a>
          </div>
        </div>
      </nav>

      {/* ━━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden bg-linear-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#F8FAFC]">
        <div className="hero-glow" />
        <div className="hero-glow-amber" />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-20 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:pt-28 lg:pb-24">
          {/* Left — copy */}
          <div className="anim-rise max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/80 px-3.5 py-1.5 text-[12px] font-semibold tracking-wide text-[#6B7280] backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2563EB] pulse-dot" />
              AI-POWERED CONTRACT INTELLIGENCE
            </div>

            <h1 className="font-(family-name:--font-space-grotesk) mt-7 text-[clamp(2.5rem,5.5vw,4.25rem)] font-extrabold leading-[1.08] tracking-tight text-[#111827]">
              Six AI agents.<br />
              One decision&nbsp;engine.
            </h1>

            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#6B7280]">
              Upload contracts. Get risk analysis, vendor intelligence, and a
              full renegotiation package — in under 90&nbsp;seconds.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <a
                href="#flow"
                className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30"
              >
                See the live workflow
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </a>
              <a
                href="#arch"
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-[14px] font-semibold text-[#374151] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D1D5DB] hover:shadow-md"
              >
                View architecture
              </a>
            </div>

            {/* Trust strip */}
            <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-[#E5E7EB] pt-7">
              <span className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#9CA3AF]">Powered&nbsp;by</span>
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#4F46E5]" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                IBM Watsonx
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#DC2626]" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>
                Redis
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7280]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#059669]" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                Tavily
              </div>
            </div>
          </div>

          {/* Right — product mockup */}
          <div className="anim-rise d3 relative">
            {/* Outer mockup shell */}
            <div className="rounded-2xl border border-[#1E293B]/80 bg-[#0F172A] p-1 shadow-2xl shadow-black/25 ring-1 ring-white/5">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 rounded-t-xl bg-[#1E293B] px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]/70" />
                <span className="ml-3 text-[10px] font-medium text-[#64748B] font-mono">contractiq — live agent feed</span>
              </div>

              {/* Dashboard content */}
              <div className="space-y-3 bg-[#0F172A] p-4 pb-5">
                {/* Status bar */}
                <div className="flex items-center justify-between rounded-lg bg-[#1E293B] px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#22C55E] pulse-dot" />
                    <span className="text-[11px] font-semibold text-[#94A3B8] font-mono">WORKFLOW WF-2026-0412</span>
                  </div>
                  <span className="rounded-full bg-[#F59E0B]/15 px-2 py-0.5 text-[10px] font-bold text-[#F59E0B]">CRITICAL</span>
                </div>

                {/* Recommendation card */}
                <div className="relative overflow-hidden rounded-lg border border-[#2563EB]/30 bg-linear-to-r from-[#2563EB]/10 to-[#1E293B] p-3.5">
                  <div className="shimmer-bar absolute inset-0 pointer-events-none" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#60A5FA]">Recommendation</p>
                      <p className="font-(family-name:--font-space-grotesk) mt-1 text-[22px] font-extrabold text-white">RENEGOTIATE</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[24px] font-bold text-[#60A5FA] font-mono">91%</p>
                      <p className="text-[10px] text-[#64748B]">confidence</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <span className="rounded bg-[#DC2626]/15 px-2 py-0.5 text-[9px] font-bold text-[#FCA5A5]">AUTO-RENEWAL ACTIVE</span>
                    <span className="rounded bg-[#F59E0B]/15 px-2 py-0.5 text-[9px] font-bold text-[#FCD34D]">34 DAYS LEFT</span>
                    <span className="rounded bg-[#F59E0B]/15 px-2 py-0.5 text-[9px] font-bold text-[#FCD34D]">ABOVE MARKET</span>
                  </div>
                </div>

                {/* Risk score */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-[#1E293B] p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#64748B]">Risk Score</p>
                    <p className="font-(family-name:--font-space-grotesk) mt-1 text-[20px] font-bold text-[#F59E0B]">74<span className="text-[12px] text-[#64748B]">/100</span></p>
                  </div>
                  <div className="rounded-lg bg-[#1E293B] p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#64748B]">Flags</p>
                    <p className="font-(family-name:--font-space-grotesk) mt-1 text-[20px] font-bold text-[#EF4444]">4</p>
                  </div>
                  <div className="rounded-lg bg-[#1E293B] p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#64748B]">Artifacts</p>
                    <p className="font-(family-name:--font-space-grotesk) mt-1 text-[20px] font-bold text-[#22C55E]">5</p>
                  </div>
                </div>

                {/* Feed entries */}
                <div className="space-y-1.5">
                  {[
                    { color: "bg-[#22C55E]", text: "Ingestion complete — 4 docs classified", time: "0:08" },
                    { color: "bg-[#2563EB]", text: "38 fields extracted, 1 flagged for review", time: "0:14" },
                    { color: "bg-[#F59E0B]", text: "⚠ Notice period: 58% confidence — confirmed", time: "0:16" },
                    { color: "bg-[#2563EB]", text: "Risk: 2 critical · Research: 3 alternatives", time: "0:24" },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded bg-[#1E293B]/60 px-3 py-1.5">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${entry.color}`} />
                      <span className="flex-1 truncate text-[10px] text-[#94A3B8]">{entry.text}</span>
                      <span className="text-[9px] text-[#475569] font-mono">{entry.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero stat strip */}
        <div className="relative z-10 border-t border-[#E5E7EB] bg-white/60 backdrop-blur-md">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[#E5E7EB] sm:grid-cols-4">
            {[
              { value: "6", label: "Specialized Agents" },
              { value: "<90s", label: "End-to-End Pipeline" },
              { value: "40+", label: "Extracted Fields" },
              { value: "$351K", label: "Annual ROI" },
            ].map((s, i) => (
              <div key={s.label} className={`anim-rise d${i + 2} px-6 py-5 text-center`}>
                <p className="font-(family-name:--font-space-grotesk) text-[22px] font-extrabold text-[#111827]">{s.value}</p>
                <p className="mt-0.5 text-[12px] font-medium text-[#9CA3AF]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━ PROBLEM ━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[#FFFBF5] py-20">
        <div className="anim-rise mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#F59E0B]">The problem</p>
            <h2 className="font-(family-name:--font-space-grotesk) mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#111827]">
              $135 billion lost to contracts nobody reads
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-[#6B7280]">
              Procurement teams manage hundreds of contracts across email, shared drives, and spreadsheets.
              Auto-renewals fire silently. Renegotiation windows close before anyone finds the date.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { stat: "14+ hrs/week", desc: "spent on manual contract review per manager", accent: "text-[#DC2626]", bg: "bg-[#FEF2F2]" },
              { stat: "67% of companies", desc: "miss at least one auto-renewal per quarter", accent: "text-[#F59E0B]", bg: "bg-[#FFFBEB]" },
              { stat: "Days to weeks", desc: "from upload to actionable recommendation", accent: "text-[#6B7280]", bg: "bg-[#F9FAFB]" },
            ].map((item) => (
              <div key={item.stat} className={`rounded-2xl ${item.bg} border border-[#E5E7EB]/60 p-6`}>
                <p className={`font-(family-name:--font-space-grotesk) text-[22px] font-extrabold ${item.accent}`}>{item.stat}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6B7280]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━ SPONSOR TECH ━━━━━━━━━━━━━━━━━━━ */}
      <section id="tech" className="bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="anim-rise text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#2563EB]">Core technologies</p>
            <h2 className="font-(family-name:--font-space-grotesk) mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#111827]">
              Three technologies, deeply integrated
            </h2>
            <p className="mt-3 text-[16px] text-[#9CA3AF]">
              Each one is load-bearing — remove it and the system breaks.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                ),
                color: "#4F46E5",
                bg: "bg-[#EEF2FF]",
                name: "IBM Watsonx Orchestrate",
                role: "Master Orchestrator",
                desc: "Coordinates all six agents in sequence, runs Risk and Research in parallel, routes uncertain fields to human review when confidence drops below 70%, and enforces the approval gate so nothing external fires without consent.",
                files: ["app/orchestrator/orchestrate.py", "app/routers/workflows.py"],
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/>
                    <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/>
                  </svg>
                ),
                color: "#DC2626",
                bg: "bg-[#FEF2F2]",
                name: "Redis Stack",
                role: "State & Communication",
                desc: "The backbone. Contract records in Hashes for O(1) lookups. Inter-agent messages flow through Streams powering the Live Agent Feed. Sorted Sets track renewal deadlines. Vendor research cached with 24h TTL. Append-only audit log for every human action.",
                files: ["app/services/redis_client.py", "app/websocket/agent_feed.py"],
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                ),
                color: "#059669",
                bg: "bg-[#ECFDF5]",
                name: "Tavily",
                role: "Real-Time Intelligence",
                desc: "Four scoped queries per vendor — company news, security incidents, pricing benchmarks, and competing alternatives. Accessed through the vasco-tavily tool inside Watsonx Orchestrate. Only vendor names are sent — no contract text or PII ever leaves.",
                files: ["app/agents/research.py", "app/services/tavily_client.py"],
              },
            ].map((tech) => (
              <div
                key={tech.name}
                className="group relative rounded-2xl border border-[#E5E7EB] bg-white/80 p-7 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute top-0 left-6 right-6 h-0.5 rounded-b-full" style={{ background: `linear-gradient(90deg, transparent, ${tech.color}, transparent)`, opacity: 0.5 }} />
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tech.bg}`} style={{ color: tech.color }}>
                    {tech.icon}
                  </div>
                  <div>
                    <p className="font-(family-name:--font-space-grotesk) text-[16px] font-bold text-[#111827]">{tech.name}</p>
                    <p className="text-[12px] font-medium text-[#9CA3AF]">{tech.role}</p>
                  </div>
                </div>
                <p className="mt-5 text-[14.5px] leading-[1.7] text-[#6B7280]">{tech.desc}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {tech.files.map((f) => (
                    <code key={f} className="rounded-md bg-[#F1F5F9] px-2.5 py-1 text-[11.5px] font-medium text-[#64748B] font-mono">{f}</code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━ AGENTS ━━━━━━━━━━━━━━━━━━━ */}
      <section id="agents" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="anim-rise text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#2563EB]">The agent pipeline</p>
            <h2 className="font-(family-name:--font-space-grotesk) mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#111827]">
              Six agents, each with one job
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[16px] text-[#9CA3AF]">
              Independently testable, confidence-scored, and visible in the Live Agent Feed.
            </p>
          </div>

          <div className="mt-14 space-y-3">
            {[
              {
                num: "01",
                name: "Ingestion & Classification",
                desc: "Classifies uploaded documents (MSA, order form, amendment) and links them to a vendor workspace.",
                input: "Raw uploaded files",
                output: "Document envelope with metadata",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                ),
                borderColor: "#2563EB",
              },
              {
                num: "02",
                name: "Extraction",
                desc: "Parses all documents into a structured contract record with 40+ fields. Flags uncertain fields for human confirmation instead of passing bad data forward.",
                input: "Document envelope",
                output: "Normalized contract record (40+ fields)",
                humanReview: true,
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                ),
                borderColor: "#2563EB",
              },
              {
                num: "03",
                name: "Risk & Compliance",
                desc: "Scores risk across financial, operational, legal, and strategic dimensions. Reads directly from Redis.",
                input: "Contract record (Redis)",
                output: "Risk flags, scores, escalation routing",
                parallel: true,
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                borderColor: "#F59E0B",
              },
              {
                num: "04",
                name: "Vendor Research",
                desc: "Calls Tavily for real-time vendor intelligence — news, pricing benchmarks, security incidents, and alternatives. Results cached in Redis for 24 hours.",
                input: "Vendor name + category",
                output: "Vendor intelligence object",
                parallel: true,
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  </svg>
                ),
                borderColor: "#F59E0B",
              },
              {
                num: "05",
                name: "Decision",
                desc: "Synthesizes contract terms, risk flags, and live vendor intel into a single recommendation: RENEW, RENEGOTIATE, or CANCEL — with confidence score and urgency level.",
                input: "Risk report + vendor intel",
                output: "Structured recommendation",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ),
                borderColor: "#2563EB",
              },
              {
                num: "06",
                name: "Action & Generation",
                desc: "Generates 5 stakeholder artifacts: Renewal Brief, Negotiation Prep, Vendor Email, CFO Summary, and Checklist. All marked Draft — nothing fires without approval.",
                input: "Decision package",
                output: "Draft artifacts (all types)",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                ),
                borderColor: "#22C55E",
              },
            ].map((a) => (
              <div
                key={a.num}
                className="group relative flex gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md"
                style={{ borderLeftWidth: "3px", borderLeftColor: a.borderColor }}
              >
                {/* Parallel connector */}
                {a.parallel && (
                  <div className="absolute -right-1 top-1/2 z-20 -translate-y-1/2">
                    <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                      PARALLEL
                    </span>
                  </div>
                )}

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${a.borderColor}10`, color: a.borderColor }}>
                  {a.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[12px] font-bold text-[#9CA3AF] font-mono">{a.num}</span>
                    <p className="font-(family-name:--font-space-grotesk) text-[17px] font-bold text-[#111827]">{a.name}</p>
                    {a.humanReview && (
                      <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#D97706]">HUMAN REVIEW</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#6B7280]">{a.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
                    <span className="text-[#9CA3AF]">
                      <span className="font-semibold text-[#6B7280]">In:</span> {a.input}
                    </span>
                    <span className="text-[#9CA3AF]">
                      <span className="font-semibold text-[#6B7280]">Out:</span> {a.output}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Parallel visual connector between agents 3 & 4 */}
            <div className="relative -my-1.5 ml-5 flex items-center gap-2 pl-2">
              <div className="h-px flex-1 bg-linear-to-r from-[#F59E0B]/40 via-[#F59E0B] to-[#F59E0B]/40" />
              <span className="text-[10px] font-bold text-[#F59E0B] whitespace-nowrap">← Agents 3 & 4 execute simultaneously →</span>
              <div className="h-px flex-1 bg-linear-to-r from-[#F59E0B]/40 via-[#F59E0B] to-[#F59E0B]/40" />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━ LIVE WALKTHROUGH ━━━━━━━━━━━━━━━━━━━ */}
      <section id="flow" className="bg-linear-to-b from-[#F1F5F9] to-[#E2E8F0] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="anim-rise text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#2563EB]">Live pipeline</p>
            <h2 className="font-(family-name:--font-space-grotesk) mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#111827]">
              Renewal Rescue: the 90-second story
            </h2>
            <p className="mt-3 text-[16px] text-[#9CA3AF]">
              Upload 4 Zoom contracts → complete renegotiation package.
            </p>
          </div>

          <div className="mt-14 relative">
            {/* Timeline line */}
            <div className="absolute left-5.75 top-6 bottom-6 w-0.5 bg-linear-to-b from-[#2563EB] via-[#F59E0B] to-[#22C55E] sm:left-6.75" aria-hidden="true" />

            <div className="space-y-5">
              {[
                {
                  time: "0:00",
                  title: "Upload 4 Zoom Documents",
                  desc: "MSA, Order Form, Amendment, Pricing Sheet. Watsonx Orchestrate creates the workflow and writes initial state to Redis.",
                  feed: "Upload received — 4 documents — Zoom Video Communications",
                  state: "blue" as const,
                },
                {
                  time: "0:08",
                  title: "Ingestion Agent Classifies",
                  desc: "All 4 documents classified and linked to the Zoom vendor workspace in under 8 seconds.",
                  feed: "Ingestion complete — 4 docs classified → Dispatching Extraction Agent",
                  state: "blue" as const,
                },
                {
                  time: "0:14",
                  title: "Extraction Agent Parses",
                  desc: "38 fields extracted. Notice period flagged at 58% confidence — system pauses for human confirmation.",
                  feed: '⚠ Notice period: "60 days" — confidence 58% — User confirmed',
                  state: "amber" as const,
                  highlight: true,
                },
                {
                  time: "0:24",
                  title: "Risk + Research Fire in Parallel",
                  desc: "Risk Agent reads from Redis → 4 flags, score 74/100. Research Agent calls Tavily → Zoom above-market pricing, 3 alternatives found.",
                  feed: "Risk: 2 critical, 2 high  ·  Research: price increase detected, 3 alternatives",
                  state: "red" as const,
                  highlight: true,
                },
                {
                  time: "0:41",
                  title: "Decision: RENEGOTIATE",
                  desc: "All inputs combined → RENEGOTIATE at 91% confidence, CRITICAL urgency, 34 days to act. Orchestrate routes to Action Agent.",
                  feed: "RENEGOTIATE — 91% confidence — CRITICAL — 34 days to act",
                  state: "blue" as const,
                  highlight: true,
                },
                {
                  time: "0:52",
                  title: "5 Artifacts Generated",
                  desc: "Renewal Brief, Negotiation Prep, Vendor Email, CFO Summary, Checklist. All marked Draft — Pending Approval.",
                  feed: "5 artifacts ready for review — all DRAFT_PENDING_APPROVAL",
                  state: "blue" as const,
                },
                {
                  time: "1:15",
                  title: "User Approves → Complete",
                  desc: "User reviews, personalizes the email, approves all five. Orchestrate logs to Redis audit stream. Workflow complete.",
                  feed: "All approved → Audit logged → Workflow COMPLETE",
                  state: "green" as const,
                },
              ].map((step, i) => {
                const dotColors = {
                  blue: "bg-[#2563EB] shadow-[0_0_0_4px_rgba(37,99,235,.2)]",
                  amber: "bg-[#F59E0B] shadow-[0_0_0_4px_rgba(245,158,11,.2)]",
                  red: "bg-[#DC2626] shadow-[0_0_0_4px_rgba(220,38,38,.2)]",
                  green: "bg-[#22C55E] shadow-[0_0_0_4px_rgba(34,197,94,.2)]",
                };
                const feedBorders = {
                  blue: "border-[#2563EB]/20 bg-[#EFF6FF]",
                  amber: "border-[#F59E0B]/20 bg-[#FFFBEB]",
                  red: "border-[#DC2626]/20 bg-[#FEF2F2]",
                  green: "border-[#22C55E]/20 bg-[#F0FDF4]",
                };
                const feedTextColors = {
                  blue: "text-[#2563EB]",
                  amber: "text-[#D97706]",
                  red: "text-[#DC2626]",
                  green: "text-[#16A34A]",
                };
                return (
                  <div key={i} className={`anim-rise d${i + 1} relative flex gap-4 sm:gap-6`}>
                    {/* Dot */}
                    <div className={`relative z-10 mt-5 h-3 w-3 shrink-0 rounded-full ${dotColors[step.state]} ${step.highlight ? "pulse-dot" : ""}`} style={{ marginLeft: "17px" }} />

                    {/* Card */}
                    <div className={`min-w-0 flex-1 rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${step.highlight ? "border-[#2563EB]/20 ring-1 ring-[#2563EB]/10" : "border-[#E5E7EB]"}`}>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-(family-name:--font-space-grotesk) text-[16px] font-bold text-[#111827]">{step.title}</p>
                        <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-bold text-[#64748B] font-mono">{step.time}</span>
                      </div>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-[#6B7280]">{step.desc}</p>

                      {/* Live feed line */}
                      <div className={`mt-3 rounded-lg border px-3.5 py-2 ${feedBorders[step.state]}`}>
                        <p className="flex items-center gap-2 text-[12px] font-mono">
                          <span className={`h-1.5 w-1.5 rounded-full ${dotColors[step.state].split(" ")[0]}`} />
                          <span className={`font-medium ${feedTextColors[step.state]}`}>{step.feed}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━ ARCHITECTURE ━━━━━━━━━━━━━━━━━━━ */}
      <section id="arch" className="bg-[#0F172A] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="anim-rise text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#60A5FA]">System architecture</p>
            <h2 className="font-(family-name:--font-space-grotesk) mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-white">
              How the pieces connect
            </h2>
          </div>

          {/* Layered architecture diagram */}
          <div className="mt-14 space-y-4">
            {/* Layer 1: UI */}
            <div className="float-card rounded-2xl border border-[#334155] bg-linear-to-r from-[#1E293B] to-[#1E293B]/80 p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB]/15">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-[#60A5FA]" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
                </div>
                <div>
                  <p className="font-(family-name:--font-space-grotesk) text-[15px] font-bold text-white">User Interface</p>
                  <p className="text-[12px] text-[#64748B]">Next.js 16 · React 19 · Tailwind v4</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Dashboard", "Upload", "Live Agent Feed", "Artifact Approval"].map((f) => (
                  <span key={f} className="rounded-md bg-[#334155] px-2.5 py-1 text-[11px] font-medium text-[#94A3B8]">{f}</span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="arch-arrow h-6 w-0.5" />
                <span className="text-[10px] font-bold text-[#475569]">HTTP / WebSocket</span>
                <div className="arch-arrow h-6 w-0.5" />
              </div>
            </div>

            {/* Layer 2: FastAPI */}
            <div className="float-card-alt rounded-2xl border border-[#334155] bg-linear-to-r from-[#1E293B] to-[#1E293B]/80 p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#059669]/15">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-[#34D399]" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                  <p className="font-(family-name:--font-space-grotesk) text-[15px] font-bold text-white">FastAPI Backend</p>
                  <p className="text-[12px] text-[#64748B]">18 routes · Port 8000</p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="arch-arrow h-8 w-0.5" />
            </div>

            {/* Layer 3: Orchestrate */}
            <div className="float-card rounded-2xl border border-[#4F46E5]/30 bg-linear-to-r from-[#4F46E5]/10 to-[#1E293B] p-5 shadow-lg ring-1 ring-[#4F46E5]/20">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4F46E5]/20">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-[#A5B4FC]" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                </div>
                <div>
                  <p className="font-(family-name:--font-space-grotesk) text-[15px] font-bold text-white">IBM Watsonx Orchestrate</p>
                  <p className="text-[12px] text-[#64748B]">Dispatch · Confidence routing · Approval gate · Audit trail</p>
                </div>
              </div>
            </div>

            {/* Split arrow */}
            <div className="flex justify-center gap-32">
              <div className="arch-arrow h-8 w-0.5" />
              <div className="arch-arrow h-8 w-0.5" />
            </div>

            {/* Layer 4: Agents + Redis side by side */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Agent Pipeline */}
              <div className="float-card-alt rounded-2xl border border-[#334155] bg-[#1E293B] p-5 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB]/15">
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-[#60A5FA]" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4m-9.66-6.34l2.83-2.83m9.66 0l2.83 2.83M1 12h4m14 0h4m-2.34-7.66l-2.83 2.83m-9.66 0L4.34 4.34"/></svg>
                  </div>
                  <p className="font-(family-name:--font-space-grotesk) text-[15px] font-bold text-white">Agent Pipeline</p>
                </div>
                <div className="mt-4 space-y-1.5">
                  {[
                    { n: "1", name: "Ingestion", color: "#60A5FA" },
                    { n: "2", name: "Extraction", color: "#60A5FA" },
                    { n: "3", name: "Risk", color: "#F59E0B", parallel: true },
                    { n: "4", name: "Research", color: "#F59E0B", parallel: true },
                    { n: "5", name: "Decision", color: "#60A5FA" },
                    { n: "6", name: "Generation", color: "#22C55E" },
                  ].map((agent) => (
                    <div key={agent.n} className="flex items-center gap-2.5 rounded-lg bg-[#0F172A] px-3 py-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold font-mono" style={{ backgroundColor: `${agent.color}20`, color: agent.color }}>{agent.n}</span>
                      <span className="text-[13px] font-medium text-[#CBD5E1]">{agent.name}</span>
                      {agent.parallel && <span className="ml-auto text-[9px] font-bold text-[#F59E0B]">∥</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Redis Backbone */}
              <div className="float-card rounded-2xl border border-[#DC2626]/20 bg-[#1E293B] p-5 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DC2626]/15">
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-[#FCA5A5]" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>
                  </div>
                  <p className="font-(family-name:--font-space-grotesk) text-[15px] font-bold text-white">Redis Backbone</p>
                </div>
                <div className="mt-4 space-y-1.5">
                  {[
                    { type: "Hash", use: "Contract records" },
                    { type: "Stream", use: "Agent message bus" },
                    { type: "Vector", use: "Semantic search" },
                    { type: "SortedSet", use: "Renewal deadlines" },
                    { type: "TTL", use: "Research cache (24h)" },
                    { type: "Stream", use: "Audit log" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg bg-[#0F172A] px-3 py-2">
                      <span className="rounded bg-[#DC2626]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#FCA5A5] font-mono">{r.type}</span>
                      <span className="text-[13px] text-[#94A3B8]">{r.use}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrow up from external */}
            <div className="flex justify-center">
              <div className="arch-arrow h-8 w-0.5" />
            </div>

            {/* Layer 5: External Intelligence */}
            <div className="float-card-alt rounded-2xl border border-[#334155] bg-linear-to-r from-[#1E293B] to-[#1E293B]/80 p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#059669]/15">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 text-[#34D399]" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/></svg>
                </div>
                <p className="font-(family-name:--font-space-grotesk) text-[15px] font-bold text-white">External Intelligence</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Anthropic Claude", "Tavily (via Orchestrate)", "PyMuPDF"].map((s) => (
                  <span key={s} className="rounded-md bg-[#334155] px-2.5 py-1 text-[11px] font-medium text-[#94A3B8]">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━ IMPACT ━━━━━━━━━━━━━━━━━━━ */}
      <section id="impact" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="anim-rise text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#2563EB]">Business impact</p>
            <h2 className="font-(family-name:--font-space-grotesk) mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#111827]">
              Measurable outcomes
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                metric: "14 → 2 hrs",
                label: "Weekly review time",
                note: "per manager",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ),
                tint: "from-[#EFF6FF] to-white",
                accent: "#2563EB",
              },
              {
                metric: "67% → 0%",
                label: "Missed auto-renewals",
                note: "surfaced 30+ days early",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                ),
                tint: "from-[#FEF2F2] to-white",
                accent: "#DC2626",
              },
              {
                metric: "Days → 90s",
                label: "Upload to recommendation",
                note: "end-to-end pipeline",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                ),
                tint: "from-[#FFFBEB] to-white",
                accent: "#F59E0B",
              },
              {
                metric: "$351K",
                label: "Annual value",
                note: "per 3-person team",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                ),
                tint: "from-[#ECFDF5] to-white",
                accent: "#059669",
              },
            ].map((m) => (
              <div
                key={m.label}
                className={`group rounded-2xl border border-[#E5E7EB] bg-linear-to-b ${m.tint} p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${m.accent}10`, color: m.accent }}>
                  {m.icon}
                </div>
                <p className="font-(family-name:--font-space-grotesk) mt-4 text-[32px] font-extrabold text-[#111827]">{m.metric}</p>
                <p className="mt-1 text-[14px] font-semibold text-[#374151]">{m.label}</p>
                <p className="mt-0.5 text-[12px] text-[#9CA3AF]">{m.note}</p>
              </div>
            ))}
          </div>

          {/* ROI Breakdown */}
          <div className="mt-10 rounded-2xl border border-[#E5E7EB] bg-white p-7 shadow-sm">
            <p className="font-(family-name:--font-space-grotesk) text-[18px] font-bold text-[#111827]">ROI breakdown <span className="text-[14px] font-normal text-[#9CA3AF]">— 3-person team, 300 contracts</span></p>
            <div className="mt-5 space-y-3">
              {[
                ["Recovered procurement productivity", "$153,000"],
                ["Avoided unwanted auto-renewals", "$72,000"],
                ["Renegotiation savings via benchmarks", "$60,000"],
                ["Legal review efficiency", "$30,000"],
                ["Reduced interruption overhead", "$36,000"],
              ].map(([item, value]) => (
                <div key={item} className="flex items-center justify-between border-b border-[#F1F5F9] pb-3 last:border-0">
                  <span className="text-[15px] text-[#6B7280]">{item}</span>
                  <span className="text-[15px] font-semibold text-[#111827] font-mono">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl bg-[#EFF6FF] px-4 py-3.5">
                <span className="font-(family-name:--font-space-grotesk) text-[16px] font-bold text-[#111827]">Total Annual Value</span>
                <span className="font-(family-name:--font-space-grotesk) text-[22px] font-extrabold text-[#2563EB]">$351,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━ DESIGN DECISIONS ━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-[#FAFAF9] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="anim-rise text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#2563EB]">Engineering decisions</p>
            <h2 className="font-(family-name:--font-space-grotesk) mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#111827]">
              Why we built it this way
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {[
              {
                q: "Why six agents instead of one?",
                a: "Each agent is independently testable, scored, and visible in the Live Feed. A monolithic agent can't parallelize, can't show meaningful progress, and can't tell you which step failed.",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4m-9.66-6.34l2.83-2.83m9.66 0l2.83 2.83M1 12h4m14 0h4m-2.34-7.66l-2.83 2.83m-9.66 0L4.34 4.34"/></svg>
                ),
              },
              {
                q: "Why Redis Streams for messaging?",
                a: "The UI subscribes to the same stream agents write to — so the Live Agent Feed comes for free. Workflows survive restarts. Every action is auditable.",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                ),
              },
              {
                q: "Why is the approval gate in Orchestrate?",
                a: "Application-layer guardrails can be bypassed by bugs. The gate is a workflow state in Orchestrate, not a conditional in code — that's what enterprise guardrails means.",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                ),
              },
              {
                q: "Why Tavily over generic search?",
                a: "Tavily returns clean, structured results built for AI agents. Generic search returns SEO-heavy pages requiring heavy post-processing. For vendor research, it's meaningfully more accurate.",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                ),
              },
            ].map((d) => (
              <div key={d.q} className="group rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#6B7280] transition-colors group-hover:bg-[#EFF6FF] group-hover:text-[#2563EB]">
                    {d.icon}
                  </div>
                  <div>
                    <p className="font-(family-name:--font-space-grotesk) text-[16px] font-bold text-[#111827]">{d.q}</p>
                    <p className="mt-2 text-[14.5px] leading-[1.7] text-[#6B7280]">{d.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━━━━━━━━ */}
      <footer className="bg-[#0F172A] py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-(family-name:--font-space-grotesk) text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold leading-tight text-white">
            Not a chatbot. Not a search box.<br />
            <span className="bg-linear-to-r from-[#60A5FA] to-[#2563EB] bg-clip-text text-transparent">A procurement operating system.</span>
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#flow" className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-[14px] font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:shadow-xl">
              See the live workflow
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
            </a>
            <a href="#arch" className="inline-flex items-center gap-2 rounded-full border border-[#334155] px-5 py-3 text-[14px] font-semibold text-[#94A3B8] transition-all hover:border-[#475569] hover:text-white">
              View architecture
            </a>
          </div>

          <div className="mt-14 flex items-center justify-center gap-6 border-t border-[#1E293B] pt-8">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2563EB]">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white" fill="currentColor">
                  <path d="M4 4h5v5H4V4zm7 0h5v5h-5V4zm-7 7h5v5H4v-5zm7 0h5v5h-5v-5z"/>
                </svg>
              </div>
              <span className="font-(family-name:--font-space-grotesk) text-[14px] font-bold text-[#94A3B8]">ContractIQ</span>
            </div>
            <span className="text-[13px] text-[#475569]">AI-powered contract intelligence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
