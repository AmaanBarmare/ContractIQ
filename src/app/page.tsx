"use client";

import { ArtifactReviewPanel } from "@/components/artifact-review-panel";
import { ContractSummaryCard } from "@/components/contract-summary-card";
import { LiveAgentFeed } from "@/components/live-agent-feed";
import { RecommendationCard } from "@/components/recommendation-card";
import { UploadPanel } from "@/components/upload-panel";
import { useWorkflow } from "@/hooks/use-workflow";
import { primaryDemoScenario, uploadItems } from "@/lib/mock-data";
import { UiWorkflowPhase } from "@/lib/workflow-state";

export default function Home() {
  const {
    workflowState,
    contractRecord,
    recommendation,
    artifactPack,
    agentEvents,
    vendorResearch,
    noticeDeadlineCallout,
    startWorkflow,
  } = useWorkflow();
  const hasWorkflowData =
    workflowState.vendorId !== null ||
    workflowState.phase === UiWorkflowPhase.Ready ||
    workflowState.phase === UiWorkflowPhase.ReviewRequired;
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
  const analysisSource =
    hasWorkflowData
      ? "parsed_content"
      : "fallback_demo";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_24%),radial-gradient(circle_at_80%_20%,_rgba(251,191,36,0.16),_transparent_20%),linear-gradient(180deg,_#07111f_0%,_#020817_52%,_#020617_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.9),transparent)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-8 rounded-[32px] border border-white/10 bg-white/6 px-6 py-6 shadow-2xl shadow-cyan-950/20 backdrop-blur md:px-8 md:py-8">
          {workflowState.demoMode ? (
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
              <span className="font-medium text-amber-100">Demo mode.</span>{" "}
              {workflowState.demoModeReason ??
                "Using the built-in Zoom scenario for a reliable live walkthrough."}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">ContractIQ</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Catch renewal risk and move to action on one page.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Upload a vendor packet, review extracted terms, see the decision,
                and approve the outbound draft without leaving the dashboard.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="hero-chip">
                <span className="hero-chip-label">Vendor</span>
                <span className="hero-chip-value">{displayedContractRecord.vendorName}</span>
              </div>
              <div className="hero-chip">
                <span className="hero-chip-label">Decision</span>
                <span className="hero-chip-value">{displayedRecommendation.decision}</span>
              </div>
              <div className="hero-chip">
                <span className="hero-chip-label">Next action</span>
                <span className="hero-chip-value">Approve vendor email</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-5">
            {[
              ["1", "Upload", "Add contract packet"],
              ["2", "Extract", "Parse key terms"],
              ["3", "Evaluate", "Surface risk and leverage"],
              ["4", "Recommend", "Make the call"],
              ["5", "Review", "Approve artifacts"],
            ].map(([number, label, title]) => (
              <div key={title} className="workflow-step">
                <span className="workflow-step-number">{number}</span>
                <div>
                  <p className="workflow-step-label">{label}</p>
                  <p className="workflow-step-title">{title}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <UploadPanel
            items={uploadItems}
            workflowPhase={workflowState.phase}
            errorMessage={workflowState.errorMessage}
            startWorkflow={startWorkflow}
          />
          <LiveAgentFeed events={displayedAgentEvents} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <ContractSummaryCard
            contract={displayedContractRecord}
            analysisSource={analysisSource}
          />
          <RecommendationCard
            deadlineCallout={displayedNoticeDeadlineCallout}
            recommendation={displayedRecommendation}
            vendorResearch={displayedVendorResearch}
          />
        </section>

        <section className="mt-6">
          <ArtifactReviewPanel artifactPack={displayedArtifactPack} />
        </section>
      </div>
    </main>
  );
}
