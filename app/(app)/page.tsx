"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoRunway } from "@/components/demo-runway";
import { UploadPanel } from "@/components/upload-panel";
import { useWorkflow } from "@/hooks/use-workflow";
import { uploadItems } from "@/lib/mock-data";
import { getSpendSummary, getUrgentRenewals } from "@/lib/api-client";
import type { SpendSummaryResponse, UrgentRenewalsResponse } from "@/lib/api-types";

const SCRIPT = [
  {
    title: "1 · Upload",
    body: "Drop the Zoom packet (4 PDFs). This kicks off Watsonx Orchestrate and writes the workflow to Redis.",
  },
  {
    title: "2 · Watch the feed",
    body: "The Live Agent Feed is the same Redis Stream the UI subscribes to — narrate each hop for judges.",
  },
  {
    title: "3 · Approve artifacts",
    body: "Decision + drafts land behind the human gate. Approve to prove enterprise guardrails, not vibes.",
  },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { workflowState, startWorkflow } = useWorkflow();

  const [spend, setSpend] = useState<SpendSummaryResponse | null>(null);
  const [renewals, setRenewals] = useState<UrgentRenewalsResponse | null>(null);

  useEffect(() => {
    getSpendSummary().then(setSpend).catch(() => {});
    getUrgentRenewals().then(setRenewals).catch(() => {});
  }, []);

  const handleStartWorkflow = async (files: File[]) => {
    const workflowId = await startWorkflow(files);
    if (workflowId) {
      router.push(`/workflows/${workflowId}`);
    }
  };

  return (
    <div className="page-shell max-w-6xl">
      <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-zinc-900/90 via-zinc-950 to-black p-5 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="relative grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,22rem)] lg:items-start">
          <div className="min-w-0">
            <p className="eyebrow">Renewal rescue · demo mode</p>
            <h1 className="font-display mt-4 text-balance text-[clamp(1.875rem,4vw+1rem,3.15rem)] font-bold leading-[1.08] tracking-[-0.025em] text-white sm:mt-5">
              <span className="block sm:inline">Turn a file drop</span>{" "}
              <span className="block sm:inline">
                into a{" "}
                <span className="bg-linear-to-r from-teal-200 to-teal-400/90 bg-clip-text text-transparent">
                  board-ready decision.
                </span>
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-[0.9375rem] leading-relaxed text-zinc-400 sm:mt-6 sm:text-base lg:text-lg">
              Six agents, one orchestrated workflow, one stream of truth. Built to show judges{" "}
              <span className="font-semibold text-zinc-200">IBM Watsonx Orchestrate</span>,{" "}
              <span className="font-semibold text-zinc-200">Redis</span>, and{" "}
              <span className="font-semibold text-zinc-200">Tavily</span> in the same breath.
            </p>
          </div>
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/4 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-sm sm:p-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-teal-300/90">90-second story arc</p>
            <ol className="mt-4 space-y-3.5 sm:space-y-4">
              {SCRIPT.map((s) => (
                <li key={s.title} className="border-l-2 border-orange-400/45 pl-4">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide text-orange-200/90 sm:text-xs">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">The six-agent runway</p>
            <h2 className="font-display mt-2 text-xl font-bold text-white sm:text-2xl">What fires after upload</h2>
          </div>
          <p className="max-w-sm text-xs text-zinc-500 sm:text-sm">
            Scroll on mobile — each box maps to a stage judges hear in the pitch.
          </p>
        </div>
        <DemoRunway />
      </section>

      <div className="stagger-in mb-10 grid gap-4 sm:grid-cols-3">
        <div className="hero-chip transition-transform hover:-translate-y-1">
          <span className="hero-chip-label">Total annual spend</span>
          <span className="hero-chip-value">
            {spend
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(spend.total_annual_spend)
              : "—"}
          </span>
        </div>
        <div className="hero-chip transition-transform hover:-translate-y-1">
          <span className="hero-chip-label">Vendors tracked</span>
          <span className="hero-chip-value">{spend ? spend.vendor_count : "—"}</span>
        </div>
        <div className="hero-chip transition-transform hover:-translate-y-1">
          <span className="hero-chip-label">Urgent renewals</span>
          <span className="hero-chip-value">{renewals ? renewals.count : "—"}</span>
        </div>
      </div>

      <UploadPanel
        items={uploadItems}
        workflowPhase={workflowState.phase}
        errorMessage={workflowState.errorMessage}
        startWorkflow={handleStartWorkflow}
      />

      {spend && spend.vendors.length > 0 && (
        <section className="mt-16">
          <div className="mb-6">
            <p className="eyebrow">Portfolio</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-white">Jump back in</h2>
            <p className="mt-1 text-sm text-zinc-500">Open a workflow you already ran — instant recap for Q&amp;A.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {spend.vendors.map((v) => (
              <button
                key={v.workflow_id}
                type="button"
                onClick={() => router.push(`/workflows/${v.workflow_id}`)}
                className="group glass-subtle cursor-pointer rounded-2xl border border-transparent px-5 py-4 text-left transition-all hover:border-teal-500/30 hover:bg-teal-500/5"
              >
                <p className="text-sm font-semibold text-white">{v.vendor}</p>
                <p className="mt-1.5 text-xs text-zinc-500 transition-colors group-hover:text-zinc-400">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(v.annual_value)}
                  <span className="text-zinc-600">/yr</span>
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
