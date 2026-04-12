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
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-amber-50 text-amber-700 border-amber-200",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Low: "bg-slate-50 text-gray-600 border-slate-200",
};

const categoryColors: Record<string, string> = {
  renewal: "text-amber-600",
  commercial: "text-blue-600",
  legal: "text-red-600",
  security: "text-emerald-600",
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
    CRITICAL: "text-red-700 bg-red-50 border-red-200",
    HIGH: "text-amber-700 bg-amber-50 border-amber-200",
    MEDIUM: "text-yellow-700 bg-yellow-50 border-yellow-200",
    LOW: "text-emerald-700 bg-emerald-50 border-emerald-200",
  };

  return (
    <div className="page-shell max-w-7xl">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href={`/workflows/${id}`}
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to pipeline
          </Link>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Full analysis results
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Workflow {id.slice(0, 12)} — {displayedContractRecord.vendorName}
          </p>
        </div>
      </header>

      {risk && (
        <section className="panel-surface mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Risk Assessment</p>
              <p className="panel-title">Risk Score: {risk.overall_risk_score}/100</p>
            </div>
            <span
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                riskLevelStyles[risk.risk_level] ?? "text-gray-600"
              }`}
            >
              {risk.risk_level}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {Object.entries(risk.category_scores).map(([cat, score]) => (
              <div key={cat} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className={`text-xs font-semibold uppercase tracking-wider ${categoryColors[cat] ?? "text-gray-500"}`}>
                  {cat}
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{score}</p>
              </div>
            ))}
          </div>

          {risk.flags.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Risk Flags</p>
              {risk.flags.map((flag) => (
                <div
                  key={flag.id}
                  className={`rounded-xl border px-4 py-3 ${severityStyles[flag.severity] ?? ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white/80 px-2 py-0.5 text-[0.65rem] font-semibold uppercase">
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
                    <p className="mt-1 text-xs text-blue-600">
                      Action: {flag.recommended_action}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {risk.green_signals && risk.green_signals.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Positive Signals
              </p>
              <div className="flex flex-wrap gap-2">
                {risk.green_signals.map((signal, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

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
