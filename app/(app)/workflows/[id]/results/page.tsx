"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

import { ArtifactReviewPanel } from "@/components/artifact-review-panel";
import { ContractSummaryCard } from "@/components/contract-summary-card";
import { RecommendationCard } from "@/components/recommendation-card";
import { useWorkflow } from "@/hooks/use-workflow";
import { getWorkflowRisk } from "@/lib/api-client";
import type { WorkflowRiskResponse } from "@/lib/api-types";
import { primaryDemoScenario } from "@/lib/mock-data";
import { UiWorkflowPhase } from "@/lib/workflow-state";

const severityStyles: Record<string, string> = {
  Critical: "bg-rose-500/15 text-rose-100 border-rose-400/30",
  High: "bg-amber-500/15 text-amber-100 border-amber-400/30",
  Medium: "bg-yellow-500/12 text-yellow-100 border-yellow-400/25",
  Low: "bg-slate-500/12 text-slate-200 border-slate-400/25",
};

const categoryColors: Record<string, string> = {
  renewal: "text-amber-300",
  commercial: "text-cyan-300",
  legal: "text-rose-300",
  security: "text-emerald-300",
};

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    workflowState,
    contractRecord,
    recommendation,
    artifactPack,
    vendorResearch,
    noticeDeadlineCallout,
    approveArtifacts,
  } = useWorkflow(id);

  const [risk, setRisk] = useState<WorkflowRiskResponse | null>(null);

  useEffect(() => {
    getWorkflowRisk(id).then(setRisk).catch(() => {});
  }, [id]);

  const isReady =
    workflowState.phase === UiWorkflowPhase.Ready ||
    workflowState.phase === UiWorkflowPhase.ReviewRequired;
  const hasWorkflowData = isReady || workflowState.vendorId !== null;

  const displayedContractRecord = hasWorkflowData
    ? contractRecord
    : primaryDemoScenario.contractRecord;
  const displayedRecommendation = hasWorkflowData
    ? recommendation
    : primaryDemoScenario.recommendation;
  const displayedArtifactPack = hasWorkflowData
    ? artifactPack
    : primaryDemoScenario.artifactPack;
  const displayedVendorResearch = hasWorkflowData
    ? vendorResearch
    : primaryDemoScenario.vendorResearch;
  const displayedNoticeDeadlineCallout = hasWorkflowData
    ? noticeDeadlineCallout
    : primaryDemoScenario.noticeDeadlineCallout;
  const analysisSource = hasWorkflowData ? "parsed_content" : "fallback_demo";

  const riskLevelStyles: Record<string, string> = {
    CRITICAL: "text-rose-300 bg-rose-500/15 border-rose-400/30",
    HIGH: "text-amber-300 bg-amber-500/15 border-amber-400/30",
    MEDIUM: "text-yellow-300 bg-yellow-500/12 border-yellow-400/25",
    LOW: "text-emerald-300 bg-emerald-500/12 border-emerald-400/25",
  };

  return (
    <div className="page-shell max-w-7xl">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href={`/workflows/${id}`}
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to pipeline
          </Link>
          <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
            Full analysis results
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Workflow {id.slice(0, 12)} — {displayedContractRecord.vendorName}
          </p>
        </div>
      </header>

      {/* Risk Report */}
      {risk && (
        <section className="panel-surface mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Risk Assessment</p>
              <p className="panel-title">Risk Score: {risk.overall_risk_score}/100</p>
            </div>
            <span
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider uppercase ${
                riskLevelStyles[risk.risk_level] ?? "text-slate-300"
              }`}
            >
              {risk.risk_level}
            </span>
          </div>

          {/* Category scores */}
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {Object.entries(risk.category_scores).map(([cat, score]) => (
              <div key={cat} className="glass-subtle rounded-xl px-4 py-3">
                <p className={`text-xs font-semibold uppercase tracking-wider ${categoryColors[cat] ?? "text-slate-300"}`}>
                  {cat}
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">{score}</p>
              </div>
            ))}
          </div>

          {/* Flags */}
          {risk.flags.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Flags</p>
              {risk.flags.map((flag) => (
                <div
                  key={flag.id}
                  className={`rounded-xl border px-4 py-3 ${severityStyles[flag.severity] ?? ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase">
                      {flag.severity}
                    </span>
                    <span className="text-sm font-medium">{flag.signal}</span>
                  </div>
                  {flag.detail && (
                    <p className="mt-1.5 text-xs leading-relaxed opacity-80">
                      {flag.detail}
                    </p>
                  )}
                  {flag.recommended_action && (
                    <p className="mt-1 text-xs text-cyan-300/80">
                      Action: {flag.recommended_action}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Green signals */}
          {risk.green_signals && risk.green_signals.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400/80">
                Positive Signals
              </p>
              <div className="flex flex-wrap gap-2">
                {risk.green_signals.map((signal, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 text-xs text-emerald-200"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Contract + Recommendation side by side */}
      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <ContractSummaryCard
          contract={displayedContractRecord}
          analysisSource={analysisSource}
        />
        <RecommendationCard
          deadlineCallout={displayedNoticeDeadlineCallout}
          recommendation={displayedRecommendation}
          vendorResearch={displayedVendorResearch}
        />
      </div>

      {/* Artifacts */}
      <section className="mt-6">
        <ArtifactReviewPanel
          artifactPack={displayedArtifactPack}
          onApprove={approveArtifacts}
          workflowId={workflowState.workflowId}
        />
      </section>
    </div>
  );
}
