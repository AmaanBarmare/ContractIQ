import type { UiReviewField } from "@/lib/ui-types";

export enum UiWorkflowPhase {
  Idle = "idle",
  CreatingWorkflow = "creating_workflow",
  UploadingDocuments = "uploading_docs",
  Processing = "processing",
  ReviewRequired = "human_review_needed",
  Ready = "ready",
  Error = "error",
}

export type UiWorkflowState = {
  phase: UiWorkflowPhase;
  workflowId: string | null;
  vendorId: string | null;
  backendStatus: string | null;
  currentAgent: string | null;
  reviewFields: UiReviewField[];
  errorMessage: string | null;
  demoMode: boolean;
  demoModeReason: string | null;
  updatedAt: string | null;
};

export const initialUiWorkflowState: UiWorkflowState = {
  phase: UiWorkflowPhase.Idle,
  workflowId: null,
  vendorId: null,
  backendStatus: null,
  currentAgent: null,
  reviewFields: [],
  errorMessage: null,
  demoMode: false,
  demoModeReason: null,
  updatedAt: null,
};
