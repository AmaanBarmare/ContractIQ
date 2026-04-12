"use client";

import { use } from "react";
import Link from "next/link";

import { ArtifactReviewPanel } from "@/components/artifact-review-panel";
import { ContractSummaryCard } from "@/components/contract-summary-card";
import { LiveAgentFeed } from "@/components/live-agent-feed";
import { RecommendationCard } from "@/components/recommendation-card";
import { useWorkflow } from "@/hooks/use-workflow";
import { primaryDemoScenario } from "@/lib/mock-data";
import { UiWorkflowPhase } from "@/lib/workflow-state";

const pipelineSteps = [
  { key: "INGESTING", num: "1", label: "Ingest", title: "Parse documents" },
  { key: "EXTRACTING", num: "2", label: "Extract", title: "Pull key terms" },
  { key: "ANALYZING_RISK", num: "3", label: "Risk", title: "Surface risk" },
  { key: "RESEARCHING", num: "4", label: "Research", title: "Vendor intel" },
  { key: "DECIDING", num: "5", label: "Decide", title: "Make the call" },
  { key: "GENERATING", num: "6", label: "Generate", title: "Draft artifacts" },
];

const terminalStatuses = [
  "PENDING_APPROVAL",
  "COMPLETED",
  "APPROVED",
  "FAILED",
];

function stepState(
  stepKey: string,
  backendStatus: string | null,
): "done" | "active" | "pending" {
  if (!backendStatus) return "pending";
  const stepOrder = pipelineSteps.map((s) => s.key);
  const stepIdx = stepOrder.indexOf(stepKey);
  const currentIdx = stepOrder.indexOf(backendStatus);

  if (terminalStatuses.includes(backendStatus)) return "done";
  if (currentIdx < 0) return "pending";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export default function WorkflowPage({
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
    agentEvents,
    vendorResearch,
    noticeDeadlineCallout,
    approveArtifacts,
  } = useWorkflow(id);

  const isReady =
    workflowState.phase === UiWorkflowPhase.Ready ||
    workflowState.phase === UiWorkflowPhase.ReviewRequired;

  const hasWorkflowData =
    isReady ||
    workflowState.vendorId !== null;

  const displayedContractRecord = hasWorkflowData
    ? contractRecord
    : primaryDemoScenario.contractRecord;
  const displayedRecommendation = hasWorkflowData
    ? recommendation
    : primaryDemoScenario.recommendation;
  const displayedArtifactPack = hasWorkflowData
    ? artifactPack
    : primaryDemoScenario.artifactPack;
  const displayedAgentEvents = hasWorkflowData
    ? agentEvents
    : primaryDemoScenario.agentEvents;
  const displayedVendorResearch = hasWorkflowData
    ? vendorResearch
    : primaryDemoScenario.vendorResearch;
  const displayedNoticeDeadlineCallout = hasWorkflowData
    ? noticeDeadlineCallout
    : primaryDemoScenario.noticeDeadlineCallout;

  const analysisSource = hasWorkflowData ? "parsed_content" : "fallback_demo";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-5 py-8 sm:px-8 lg:px-10">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Workflow {id.slice(0, 12)}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {workflowState.backendStatus === "FAILED"
              ? "Workflow Failed"
              : isReady
                ? "Analysis Complete"
                : "Processing..."}
          </h1>
          {workflowState.demoMode && (
            <p className="mt-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-100">
              Demo mode: {workflowState.demoModeReason}
            </p>
          )}
        </div>
        {isReady && (
          <Link
            href={`/workflows/${id}/results`}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/20"
          >
            View full results
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}
      </header>

      {/* Pipeline progress */}
      <div className="mb-8 grid gap-2 lg:grid-cols-6">
        {pipelineSteps.map(({ key, num, label, title }) => {
          const state = stepState(key, workflowState.backendStatus);
          return (
            <div
              key={key}
              className={`workflow-step transition-all ${
                state === "done"
                  ? "border-emerald-400/30 bg-emerald-400/8"
                  : state === "active"
                    ? "border-cyan-400/40 bg-cyan-400/12 shadow-lg shadow-cyan-900/30"
                    : ""
              }`}
            >
              <span
                className={`workflow-step-number ${
                  state === "done"
                    ? "bg-emerald-400/25 text-emerald-200"
                    : state === "active"
                      ? "bg-cyan-400/25 text-cyan-100 animate-pulse"
                      : ""
                }`}
              >
                {state === "done" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  num
                )}
              </span>
              <div>
                <p className="workflow-step-label">{label}</p>
                <p className="workflow-step-title">{title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content: Agent Feed + Cards */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Left: Live Agent Feed */}
        <LiveAgentFeed events={displayedAgentEvents} />

        {/* Right: Summary cards stacked */}
        <div className="flex flex-col gap-6">
          <ContractSummaryCard
            contract={displayedContractRecord}
            analysisSource={analysisSource}
          />
          {isReady && (
            <RecommendationCard
              deadlineCallout={displayedNoticeDeadlineCallout}
              recommendation={displayedRecommendation}
              vendorResearch={displayedVendorResearch}
            />
          )}
        </div>
      </div>

      {/* Artifacts */}
      {isReady && (
        <section className="mt-6">
          <ArtifactReviewPanel
            artifactPack={displayedArtifactPack}
            onApprove={approveArtifacts}
            workflowId={workflowState.workflowId}
          />
        </section>
      )}
    </div>
  );
}
