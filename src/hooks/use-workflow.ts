"use client";

import { useState } from "react";

import {
  adaptBackendFlaggedFields,
  adaptContractResponse,
  adaptWorkflowArtifactsResponse,
  adaptWorkflowDecisionResponse,
} from "@/lib/adapters";
import {
  approveWorkflowArtifacts,
  confirmWorkflowField,
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
  startWorkflow: (files: File[]) => Promise<void>;
  confirmField: (fieldName: string, confirmedValue: string) => Promise<void>;
  approveArtifacts: (artifactType: string) => Promise<void>;
};

const POLL_INTERVAL_MS = 1200;
const MAX_POLL_ATTEMPTS = 8;

const wait = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const toBackendFlaggedFields = (
  flaggedFields: WorkflowStatusResponse["flagged_fields"],
): BackendFlaggedField[] =>
  Object.entries(flaggedFields ?? {}).map(([field, value]) => ({
    field,
    value: value.value ?? null,
    confidence: value.confidence ?? 0,
    confirmed: value.confirmed ?? false,
    sourceText: value.source_text ?? null,
  }));

const nextPhaseFromWorkflow = (reviewFields: UiReviewField[]) =>
  reviewFields.some((field) => field.needsReview)
    ? UiWorkflowPhase.ReviewRequired
    : UiWorkflowPhase.Processing;

export function useWorkflow(): UseWorkflowResult {
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

  const hydrateWorkflow = async (workflowId: string) => {
    let latestWorkflow: WorkflowStatusResponse | null = null;

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      latestWorkflow = await getWorkflow(workflowId);

      const reviewFields = adaptBackendFlaggedFields(
        toBackendFlaggedFields(latestWorkflow.flagged_fields),
      );

      setWorkflowState((current) => ({
        ...current,
        workflowId,
        vendorId: latestWorkflow?.vendor_id ?? null,
        backendStatus: latestWorkflow?.status ?? null,
        currentAgent: latestWorkflow?.current_agent ?? null,
        reviewFields,
        updatedAt: latestWorkflow?.updated_at ?? null,
        phase: nextPhaseFromWorkflow(reviewFields),
        errorMessage: null,
        demoMode: false,
        demoModeReason: null,
      }));

      if (latestWorkflow.vendor_id || reviewFields.length > 0) {
        break;
      }

      await wait(POLL_INTERVAL_MS);
    }

    if (!latestWorkflow?.vendor_id) {
      applyDemoFallback(
        "Backend workflow started, but contract output was not ready. Showing demo mode.",
      );
      return;
    }

    const contractResponse = await getContract(latestWorkflow.vendor_id);
    const nextContractRecord = adaptContractResponse(contractResponse);
    const fallbackScenario = applyContractFallbacks(nextContractRecord);

    setWorkflowState((current) => ({
      ...current,
      vendorId: latestWorkflow.vendor_id ?? null,
    }));

    try {
      await getWorkflowRisk(workflowId);
    } catch {
      // Risk is not yet rendered directly in the current UI.
    }

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

    try {
      const artifactsResponse = await getWorkflowArtifacts(workflowId);
      const nextArtifactPack = adaptWorkflowArtifactsResponse(artifactsResponse);

      setArtifactPack({
        negotiationPoints:
          nextArtifactPack.negotiationPoints.length > 0
            ? nextArtifactPack.negotiationPoints
            : fallbackScenario.artifactPack.negotiationPoints,
        draftEmail:
          nextArtifactPack.draftEmail || fallbackScenario.artifactPack.draftEmail,
        approvalStatus: nextArtifactPack.approvalStatus,
      });
    } catch {
      setArtifactPack(fallbackScenario.artifactPack);
    }

      setWorkflowState((current) => ({
        ...current,
        phase: current.reviewFields.some((field) => field.needsReview)
          ? UiWorkflowPhase.ReviewRequired
          : UiWorkflowPhase.Ready,
        errorMessage: null,
        demoMode: false,
        demoModeReason: null,
      }));
  };

  const startWorkflow = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setWorkflowState({
      ...initialUiWorkflowState,
      phase: UiWorkflowPhase.CreatingWorkflow,
    });

    try {
      const workflow = await createWorkflow({
        workflow_type: "RENEWAL_RESCUE",
        vendor_name: "Zoom Video Communications",
        triggered_by: "MANUAL",
      });

      setWorkflowState((current) => ({
        ...current,
        workflowId: workflow.workflow_id,
        backendStatus: workflow.status,
        updatedAt: workflow.created_at,
        phase: UiWorkflowPhase.UploadingDocuments,
      }));

      await uploadWorkflowDocuments(workflow.workflow_id, files);

      setWorkflowState((current) => ({
        ...current,
        phase: UiWorkflowPhase.Processing,
      }));

      await hydrateWorkflow(workflow.workflow_id);
    } catch (error) {
      applyDemoFallback(
        error instanceof Error
          ? `${error.message} Showing demo mode instead.`
          : "Backend workflow unavailable. Showing demo mode instead.",
      );
    }
  };

  const confirmFieldAction = async (
    fieldName: string,
    confirmedValue: string,
  ) => {
    if (!workflowState.workflowId) {
      return;
    }

    try {
      await confirmWorkflowField(workflowState.workflowId, fieldName, confirmedValue);

      setWorkflowState((current) => ({
        ...current,
        reviewFields: current.reviewFields.map((field) =>
          field.key === fieldName
            ? {
                ...field,
                value: confirmedValue,
                confirmed: true,
                needsReview: false,
              }
            : field,
        ),
        phase: UiWorkflowPhase.Processing,
        errorMessage: null,
      }));

      await hydrateWorkflow(workflowState.workflowId);
    } catch (error) {
      setWorkflowState((current) => ({
        ...current,
        phase: UiWorkflowPhase.Error,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Unable to confirm the field.",
      }));
    }
  };

  const approveArtifactsAction = async (artifactType: string) => {
    if (!workflowState.workflowId) {
      return;
    }

    try {
      await approveWorkflowArtifacts(workflowState.workflowId, artifactType);

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
    confirmField: confirmFieldAction,
    approveArtifacts: approveArtifactsAction,
  };
}
