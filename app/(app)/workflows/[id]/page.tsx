"use client";

import { use, useState, useEffect, useCallback } from "react";

import { ArtifactReviewPanel } from "@/components/artifact-review-panel";
import { ContractSummaryCard } from "@/components/contract-summary-card";
import { LiveAgentFeed } from "@/components/live-agent-feed";
import { RecommendationCard } from "@/components/recommendation-card";
import { useWorkflow } from "@/hooks/use-workflow";
import { primaryDemoScenario } from "@/lib/mock-data";
import { UiWorkflowPhase } from "@/lib/workflow-state";

/* ── Pipeline step metadata ── */
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

/* ── Wizard step definitions ── */
const WIZARD_STEPS = [
  { id: "processing", label: "Agent Pipeline", icon: "play" },
  { id: "extraction", label: "Extracted Terms", icon: "doc" },
  { id: "decision", label: "Decision", icon: "target" },
  { id: "artifacts", label: "Artifacts", icon: "check" },
] as const;

type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

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

/* ── Agent name → friendly display ── */
const agentDisplayMap: Record<string, { step: number; label: string; description: string }> = {
  ingestion_agent:  { step: 1, label: "Ingestion Agent",      description: "Parsing and classifying uploaded documents" },
  extraction_agent: { step: 2, label: "Extraction Agent",     description: "Pulling key contract terms and fields" },
  risk_agent:       { step: 3, label: "Risk & Compliance Agent", description: "Analyzing risk flags and compliance issues" },
  research_agent:   { step: 4, label: "Vendor Research Agent", description: "Gathering real-time vendor intelligence via Tavily" },
  decision_agent:   { step: 5, label: "Decision Agent",       description: "Synthesizing findings into a recommendation" },
  generation_agent: { step: 6, label: "Generation Agent",     description: "Drafting stakeholder-ready artifacts" },
};

/* ── Loading spinner for agent processing ── */
function AgentProcessingOverlay({ agentName }: { agentName: string | null }) {
  const info = agentName ? agentDisplayMap[agentName] : null;

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-500" />
      </div>
      {info ? (
        <>
          <p className="mt-5 text-sm font-semibold tracking-wide text-blue-600 uppercase">
            Step {info.step} of 6
          </p>
          <p className="font-display mt-1 text-xl font-bold text-gray-900">
            {info.label} is working…
          </p>
          <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
            {info.description}
          </p>
        </>
      ) : (
        <p className="font-display mt-6 text-xl font-bold text-gray-900">
          Agents processing…
        </p>
      )}
      <p className="mt-3 max-w-sm text-center text-xs text-gray-400">
        Watch the live feed below to see each agent publish events to the Redis stream in real time.
      </p>
    </div>
  );
}

/* ── Step icon helper ── */
function StepIcon({ icon, active, done }: { icon: string; active: boolean; done: boolean }) {
  const color = done ? "text-emerald-600" : active ? "text-blue-600" : "text-gray-400";
  if (icon === "play")
    return (
      <svg className={`h-4 w-4 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    );
  if (icon === "doc")
    return (
      <svg className={`h-4 w-4 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    );
  if (icon === "target")
    return (
      <svg className={`h-4 w-4 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    );
  return (
    <svg className={`h-4 w-4 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Main page ── */
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

  /* ── Wizard step state ── */
  const [currentStep, setCurrentStep] = useState<WizardStepId>("processing");

  // Auto-advance from processing to extraction when pipeline completes
  useEffect(() => {
    if (isReady && currentStep === "processing") {
      setCurrentStep("extraction");
    }
  }, [isReady, currentStep]);

  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  const canGoNext = (() => {
    if (currentStep === "processing" && !isReady) return false;
    return currentStepIndex < WIZARD_STEPS.length - 1;
  })();

  const canGoPrev = currentStepIndex > 0;

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    setCurrentStep(WIZARD_STEPS[currentStepIndex + 1].id);
  }, [canGoNext, currentStepIndex]);

  const goPrev = useCallback(() => {
    if (!canGoPrev) return;
    setCurrentStep(WIZARD_STEPS[currentStepIndex - 1].id);
  }, [canGoPrev, currentStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && canGoNext) goNext();
      if (e.key === "ArrowLeft" && canGoPrev) goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canGoNext, canGoPrev, goNext, goPrev]);

  const isProcessing = !isReady && workflowState.backendStatus !== "FAILED";

  return (
    <div className="page-shell max-w-7xl">
      {/* ── Wizard step indicator ── */}
      <nav className="mb-8">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {WIZARD_STEPS.map((step, idx) => {
            const isCurrent = step.id === currentStep;
            const isDone = idx < currentStepIndex;
            const isClickable =
              isDone || (step.id === "processing") || isReady;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && setCurrentStep(step.id)}
                className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : isDone
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-gray-100 text-gray-400"
                } ${isClickable && !isCurrent ? "cursor-pointer" : ""} ${!isClickable ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <StepIcon icon={step.icon} active={isCurrent} done={isDone} />
                <span className="hidden whitespace-nowrap sm:inline">{step.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Mini pipeline progress bar */}
        <div className="mt-4 flex gap-1.5">
          {pipelineSteps.map(({ key }) => {
            const state = stepState(key, workflowState.backendStatus);
            return (
              <div
                key={key}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  state === "done"
                    ? "bg-emerald-400"
                    : state === "active"
                      ? "bg-blue-400 animate-pulse"
                      : "bg-gray-200"
                }`}
              />
            );
          })}
        </div>
      </nav>

      {/* ── Step content ── */}
      <div className="wizard-step-content min-h-[60vh]">
        {/* STEP 1: Processing / Live Feed */}
        {currentStep === "processing" && (
          <div className="animate-rise">
            <header className="mb-6">
              <p className="eyebrow">Pipeline</p>
              <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                {workflowState.backendStatus === "FAILED"
                  ? "Workflow failed"
                  : isReady
                    ? "Pipeline complete"
                    : "Agents running…"}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Every line is an event your backend published to Redis Streams — that is the Redis story.
              </p>
              {workflowState.demoMode && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <span className="font-bold uppercase tracking-wider text-amber-700">Demo mode</span>
                  <span className="text-amber-700/80">{workflowState.demoModeReason}</span>
                </p>
              )}
            </header>

            {/* Pipeline steps strip */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-6 lg:gap-2 lg:overflow-visible lg:pb-0">
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

            {/* Show loading spinner if still processing */}
            {isProcessing && (
              <AgentProcessingOverlay agentName={workflowState.currentAgent} />
            )}

            {/* Live feed */}
            <LiveAgentFeed events={displayedAgentEvents} />
          </div>
        )}

        {/* STEP 2: Extracted Terms */}
        {currentStep === "extraction" && (
          <div className="animate-rise">
            <header className="mb-6">
              <p className="eyebrow">Extraction</p>
              <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Extracted contract terms
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Review the key terms extracted by the AI agents. Confirm any low-confidence fields before proceeding.
              </p>
            </header>
            <ContractSummaryCard
              contract={displayedContractRecord}
              analysisSource={analysisSource}
            />
          </div>
        )}

        {/* STEP 3: Decision / Recommendation */}
        {currentStep === "decision" && (
          <div className="animate-rise">
            <header className="mb-6">
              <p className="eyebrow">Decision</p>
              <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                AI recommendation
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Based on risk analysis and vendor research, here is the recommended action for this contract.
              </p>
            </header>
            <RecommendationCard
              deadlineCallout={displayedNoticeDeadlineCallout}
              recommendation={displayedRecommendation}
              vendorResearch={displayedVendorResearch}
            />
          </div>
        )}

        {/* STEP 4: Artifacts */}
        {currentStep === "artifacts" && (
          <div className="animate-rise">
            <header className="mb-6">
              <p className="eyebrow">Artifacts</p>
              <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Review & approve
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                These drafts were generated by the AI agents. Review and approve before sending.
              </p>
            </header>
            <ArtifactReviewPanel
              artifactPack={displayedArtifactPack}
              onApprove={approveArtifacts}
              workflowId={workflowState.workflowId}
            />
          </div>
        )}
      </div>

      {/* ── Navigation bar ── */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className={`btn-ghost ${!canGoPrev ? "invisible" : ""}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Previous
        </button>

        <div className="flex items-center gap-2">
          {WIZARD_STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? "w-6 bg-blue-500"
                  : idx < currentStepIndex
                    ? "bg-emerald-400"
                    : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {currentStep === "processing" && !isReady ? (
          <span className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Processing…
          </span>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className={`btn-primary ${!canGoNext ? "invisible" : ""}`}
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
