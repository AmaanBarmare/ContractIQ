"use client";

import { useEffect, useRef, useState } from "react";

import {
  adaptBackendFlaggedFields,
  adaptContractResponse,
  adaptWorkflowArtifactsResponse,
  adaptWorkflowDecisionResponse,
} from "@/lib/adapters";
import {
  approveWorkflowArtifacts,
  createWorkflow,
  getContract,
  getWorkflow,
  getWorkflowArtifacts,
  getWorkflowDecision,
  getWorkflowRisk,
  uploadWorkflowDocuments,
} from "@/lib/api-client";
import type { BackendFlaggedField, WorkflowStatusResponse } from "@/lib/api-types";
import {
  deriveDashboardScenarioFromContract,
  primaryDemoScenario,
} from "@/lib/mock-data";
import type {
  AgentEvent,
  ArtifactPack,
  ContractRecord,
  Recommendation,
  VendorResearch,
} from "@/lib/types";
import {
  initialUiWorkflowState,
  UiWorkflowPhase,
  type UiWorkflowState,
} from "@/lib/workflow-state";
import type { UiReviewField } from "@/lib/ui-types";

type NoticeDeadlineCallout = {
  label: string;
  value: string;
  detail: string;
};

type UseWorkflowResult = {
  workflowState: UiWorkflowState;
  contractRecord: ContractRecord;
  recommendation: Recommendation;
  artifactPack: ArtifactPack;
  agentEvents: AgentEvent[];
  vendorResearch: VendorResearch;
  noticeDeadlineCallout: NoticeDeadlineCallout;
  startWorkflow: (files: File[]) => Promise<string | null>;
  approveArtifacts: () => Promise<void>;
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60;

const wait = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

/**
 * Build flagged field list from contract data.
 * The backend stores flagged_fields as a string[] of field names on the contract,
 * so we derive the review fields from the contract response itself.
 */
const buildFlaggedFieldsFromContract = (
  contractData: Record<string, unknown> | null,
): BackendFlaggedField[] => {
  if (!contractData) return [];
  const flagged = (contractData.flagged_fields ?? []) as string[];
  return flagged.map((fieldName) => {
    const field = contractData[fieldName] as
      | { value?: string; confidence?: number; confirmed?: boolean }
      | undefined;
    return {
      field: fieldName,
      value: field?.value ?? null,
      confidence: field?.confidence ?? 0,
      confirmed: field?.confirmed ?? false,
    };
  });
};

export function useWorkflow(existingWorkflowId?: string): UseWorkflowResult {
  const [workflowState, setWorkflowState] =
    useState<UiWorkflowState>(initialUiWorkflowState);
  const [contractRecord, setContractRecord] = useState<ContractRecord>(
    primaryDemoScenario.contractRecord,
  );
  const [recommendation, setRecommendation] = useState<Recommendation>(
    primaryDemoScenario.recommendation,
  );
  const [artifactPack, setArtifactPack] = useState<ArtifactPack>(
    primaryDemoScenario.artifactPack,
  );
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>(
    primaryDemoScenario.agentEvents,
  );
  const [vendorResearch, setVendorResearch] = useState<VendorResearch>(
    primaryDemoScenario.vendorResearch,
  );
  const [noticeDeadlineCallout, setNoticeDeadlineCallout] =
    useState<NoticeDeadlineCallout>(primaryDemoScenario.noticeDeadlineCallout);

  // Auto-hydrate when initialized with an existing workflow ID
  const didHydrate = useRef(false);
  useEffect(() => {
    if (existingWorkflowId && !didHydrate.current) {
      didHydrate.current = true;
      setWorkflowState((c) => ({
        ...c,
        workflowId: existingWorkflowId,
        phase: UiWorkflowPhase.Processing,
      }));
      hydrateWorkflow(existingWorkflowId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingWorkflowId]);

  const applyDemoFallback = (reason: string) => {
    setContractRecord(primaryDemoScenario.contractRecord);
    setRecommendation(primaryDemoScenario.recommendation);
    setArtifactPack(primaryDemoScenario.artifactPack);
    setAgentEvents(primaryDemoScenario.agentEvents);
    setVendorResearch(primaryDemoScenario.vendorResearch);
    setNoticeDeadlineCallout(primaryDemoScenario.noticeDeadlineCallout);
    setWorkflowState((current) => ({
      ...current,
      phase: UiWorkflowPhase.Ready,
      workflowId: null,
      vendorId: null,
      backendStatus: "DEMO_FALLBACK",
      currentAgent: null,
      reviewFields: [],
      errorMessage: null,
      demoMode: true,
      demoModeReason: reason,
      updatedAt: null,
    }));
  };

  const applyContractFallbacks = (nextContractRecord: ContractRecord) => {
    const scenario = deriveDashboardScenarioFromContract(nextContractRecord);

    setContractRecord(nextContractRecord);
    setAgentEvents(scenario.agentEvents);
    setVendorResearch(scenario.vendorResearch);
    setNoticeDeadlineCallout(scenario.noticeDeadlineCallout);

    return scenario;
  };

  /**
   * Poll the workflow until it reaches a terminal status or has contract data,
   * then hydrate all dashboard panels from the backend.
   */
  const hydrateWorkflow = async (workflowId: string) => {
    let latestWorkflow: WorkflowStatusResponse | null = null;

    // Poll until the pipeline finishes (PENDING_APPROVAL, COMPLETED, or FAILED)
    const terminalStatuses = ["PENDING_APPROVAL", "COMPLETED", "FAILED"];
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      latestWorkflow = await getWorkflow(workflowId);

      setWorkflowState((current) => ({
        ...current,
        workflowId,
        vendorId: latestWorkflow?.vendor_id ?? null,
        backendStatus: latestWorkflow?.status ?? null,
        currentAgent: latestWorkflow?.current_agent ?? null,
        updatedAt: latestWorkflow?.updated_at ?? null,
        phase: UiWorkflowPhase.Processing,
        errorMessage: null,
        demoMode: false,
        demoModeReason: null,
      }));

      if (
        latestWorkflow.status &&
        terminalStatuses.includes(latestWorkflow.status)
      ) {
        break;
      }

      await wait(POLL_INTERVAL_MS);
    }

    if (latestWorkflow?.status === "FAILED") {
      applyDemoFallback(
        `Workflow failed: ${latestWorkflow.error ?? "unknown error"}. Showing demo mode.`,
      );
      return;
    }

    // Fetch contract data using workflow_id (not vendor_id)
    let contractData: Record<string, unknown> | null = null;
    try {
      const contractResponse = await getContract(workflowId);
      contractData = contractResponse as unknown as Record<string, unknown>;
      const nextContractRecord = adaptContractResponse(contractResponse);
      const fallbackScenario = applyContractFallbacks(nextContractRecord);

      // Build review fields from flagged fields on the contract
      const reviewFields = adaptBackendFlaggedFields(
        buildFlaggedFieldsFromContract(contractData),
      );

      setWorkflowState((current) => ({
        ...current,
        vendorId: latestWorkflow?.vendor_id ?? null,
        reviewFields,
      }));

      // Fetch risk (for future UI use)
      try {
        await getWorkflowRisk(workflowId);
      } catch {
        // Risk not critical for UI display
      }

      // Fetch decision
      try {
        const decisionResponse = await getWorkflowDecision(workflowId);
        setRecommendation(adaptWorkflowDecisionResponse(decisionResponse));
        setNoticeDeadlineCallout({
          label: "Notice deadline",
          value: `${decisionResponse.days_to_act} days until notice deadline`,
          detail:
            decisionResponse.primary_reason ||
            fallbackScenario.noticeDeadlineCallout.detail,
        });
      } catch {
        setRecommendation(fallbackScenario.recommendation);
        setNoticeDeadlineCallout(fallbackScenario.noticeDeadlineCallout);
      }

      // Fetch artifacts
      try {
        const artifactsResponse = await getWorkflowArtifacts(workflowId);
        const nextArtifactPack =
          adaptWorkflowArtifactsResponse(artifactsResponse);

        setArtifactPack({
          negotiationPoints:
            nextArtifactPack.negotiationPoints.length > 0
              ? nextArtifactPack.negotiationPoints
              : fallbackScenario.artifactPack.negotiationPoints,
          draftEmail:
            nextArtifactPack.draftEmail ||
            fallbackScenario.artifactPack.draftEmail,
          approvalStatus: nextArtifactPack.approvalStatus,
        });
      } catch {
        setArtifactPack(fallbackScenario.artifactPack);
      }

      setWorkflowState((current) => ({
        ...current,
        phase: current.reviewFields.some((f) => f.needsReview)
          ? UiWorkflowPhase.ReviewRequired
          : UiWorkflowPhase.Ready,
        errorMessage: null,
        demoMode: false,
        demoModeReason: null,
      }));
    } catch {
      applyDemoFallback(
        "Backend workflow started, but contract output was not ready. Showing demo mode.",
      );
    }
  };

  const startWorkflow = async (files: File[]): Promise<string | null> => {
    if (files.length === 0) return null;

    setWorkflowState({
      ...initialUiWorkflowState,
      phase: UiWorkflowPhase.CreatingWorkflow,
    });

    try {
      // POST /api/workflows — no request body
      const workflow = await createWorkflow();

      setWorkflowState((current) => ({
        ...current,
        workflowId: workflow.workflow_id,
        backendStatus: workflow.status,
        phase: UiWorkflowPhase.UploadingDocuments,
      }));

      await uploadWorkflowDocuments(workflow.workflow_id, files);

      setWorkflowState((current) => ({
        ...current,
        phase: UiWorkflowPhase.Processing,
      }));

      // Don't hydrate here — the workflow page will handle it
      return workflow.workflow_id;
    } catch (error) {
      applyDemoFallback(
        error instanceof Error
          ? `${error.message} Showing demo mode instead.`
          : "Backend workflow unavailable. Showing demo mode instead.",
      );
      return null;
    }
  };

  const approveArtifactsAction = async () => {
    if (!workflowState.workflowId) return;

    try {
      await approveWorkflowArtifacts(workflowState.workflowId);

      setArtifactPack((current) => ({
        ...current,
        approvalStatus: "APPROVED",
      }));

      setWorkflowState((current) => ({
        ...current,
        phase: UiWorkflowPhase.Ready,
        errorMessage: null,
      }));
    } catch (error) {
      setWorkflowState((current) => ({
        ...current,
        phase: UiWorkflowPhase.Error,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Unable to approve artifacts.",
      }));
    }
  };

  return {
    workflowState,
    contractRecord,
    recommendation,
    artifactPack,
    agentEvents,
    vendorResearch,
    noticeDeadlineCallout,
    startWorkflow,
    approveArtifacts: approveArtifactsAction,
  };
}
