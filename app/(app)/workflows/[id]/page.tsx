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
    <div className="page-shell max-w-7xl">
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="eyebrow">Workflow {id.slice(0, 12)}…</p>
          <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-[2.15rem]">
            {workflowState.backendStatus === "FAILED"
              ? "Workflow failed"
              : isReady
                ? "Analysis complete"
                : "Agents running…"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500">
            Point at the feed: every line is an event your backend published — that is the Redis story.
          </p>
          {workflowState.demoMode && (
            <p className="mt-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
              <span className="font-bold uppercase tracking-wider text-amber-700">Demo mode</span>
              <span className="text-amber-700/80">{workflowState.demoModeReason}</span>
            </p>
          )}
        </div>
        {isReady && (
          <Link href={`/workflows/${id}/results`} className="btn-primary shrink-0 self-start md:self-center">
            Full analysis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}
      </header>

      <div className="mb-10 min-w-0">
        <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">
          Six-agent pipeline
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-2 lg:overflow-visible lg:pb-0">
          {pipelineSteps.map(({ key, num, label, title }) => {
            const state = stepState(key, workflowState.backendStatus);
            return (
            <div
              key={key}
              className={`workflow-step shrink-0 snap-center sm:min-w-38 lg:min-w-0 transition-all duration-300 ${
                state === "done"
                  ? "border-emerald-200 bg-emerald-50"
                  : state === "active"
                    ? "border-blue-300 bg-blue-50 shadow-md"
                    : "border-slate-200 opacity-95"
              }`}
            >
              <span
                className={`workflow-step-number ${
                  state === "done"
                    ? "bg-emerald-100 text-emerald-700"
                    : state === "active"
                      ? "bg-blue-100 text-blue-700 animate-pulse"
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
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <LiveAgentFeed events={displayedAgentEvents} />

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
