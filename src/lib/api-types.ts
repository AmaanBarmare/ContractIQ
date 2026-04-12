export type BackendWorkflowType =
  | "RENEWAL_RESCUE"
  | "NEW_VENDOR_REVIEW"
  | "SPEND_OPTIMIZATION"
  | "EXECUTIVE_REPORT";

export type BackendWorkflowTrigger =
  | "MANUAL"
  | "AUTO_RENEWAL_ALERT"
  | "SCHEDULED";

export type WorkflowCreateRequest = {
  workflow_type: BackendWorkflowType;
  vendor_name: string;
  triggered_by: BackendWorkflowTrigger;
};

export type WorkflowCreateResponse = {
  workflow_id: string;
  status: string;
  created_at: string;
};

export type ExtractedFieldResponse = {
  value?: string | null;
  confidence?: number;
  source_text?: string | null;
  confirmed?: boolean;
};

export type BackendContractRecordResponse = {
  vendor_name?: ExtractedFieldResponse;
  annual_value?: ExtractedFieldResponse;
  pricing_model?: ExtractedFieldResponse;
  seat_count?: ExtractedFieldResponse;
  renewal_date?: ExtractedFieldResponse;
  cancellation_deadline?: ExtractedFieldResponse;
  notice_period?: ExtractedFieldResponse;
  notice_period_days?: ExtractedFieldResponse;
  auto_renewal?: ExtractedFieldResponse;
  termination_for_convenience?: ExtractedFieldResponse;
  liability_cap?: ExtractedFieldResponse;
  dpa_present?: ExtractedFieldResponse;
  governing_law?: ExtractedFieldResponse;
  soc2_type2?: ExtractedFieldResponse;
  breach_notification_sla?: ExtractedFieldResponse;
  renewal_owner?: ExtractedFieldResponse;
};

export type ContractResponse = {
  vendor_id: string;
  vendor_name: string;
  extraction_status: string;
  overall_confidence?: number;
  contract_record: BackendContractRecordResponse;
  missing_fields?: string[];
  last_updated?: string;
};

export type BackendFlaggedField = {
  field: string;
  value?: string | null;
  confidence?: number;
  confirmed?: boolean;
  sourceText?: string | null;
};

export type WorkflowStatusResponse = {
  workflow_id: string;
  status: string;
  vendor_id?: string | null;
  current_agent?: string | null;
  steps_completed?: string[];
  steps_pending?: string[];
  flagged_fields?: Record<string, ExtractedFieldResponse>;
  created_at?: string;
  updated_at?: string;
};

export type WorkflowDocumentUploadItem = {
  file_id: string;
  filename: string;
  status: string;
};

export type WorkflowDocumentUploadResponse = {
  workflow_id: string;
  uploaded: WorkflowDocumentUploadItem[];
  message: string;
};

export type WorkflowRiskFlagResponse = {
  id: string;
  category: "renewal" | "commercial" | "legal" | "security";
  severity: "Critical" | "High" | "Medium" | "Low";
  signal: string;
  detail?: string;
  color: "RED" | "YELLOW" | "GREEN";
  recommended_action?: string;
};

export type WorkflowRiskResponse = {
  workflow_id: string;
  overall_risk_score: number;
  risk_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category_scores: Record<string, number>;
  flags: WorkflowRiskFlagResponse[];
  green_signals?: string[];
  confidence?: number;
};

export type WorkflowDecisionResponse = {
  workflow_id: string;
  recommendation:
    | "RENEW"
    | "RENEGOTIATE"
    | "CANCEL"
    | "ESCALATE_LEGAL"
    | "ESCALATE_SECURITY"
    | "DEFER";
  confidence: number;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  days_to_act: number;
  primary_reason: string;
  reasoning: string[];
  risks_if_no_action?: string;
  potential_savings?: string | null;
  negotiation_leverage?: string[];
  next_steps?: string[];
  stakeholder_checklist?: Record<string, string[]>;
};

export type WorkflowArtifactResponse = {
  id: string;
  type: string;
  title: string;
  status: string;
  content: string;
  created_at?: string;
};

export type WorkflowArtifactsResponse = {
  workflow_id: string;
  artifacts: WorkflowArtifactResponse[];
};

export type ConfirmWorkflowFieldRequest = {
  field: string;
  confirmed_value: string;
  action: "CONFIRM" | "CORRECT";
  corrected_value: string | null;
};

export type ConfirmWorkflowFieldResponse = {
  workflow_id: string;
  field: string;
  confirmed: boolean;
  confirmed_value: string;
  workflow_resumed: boolean;
};

export type ApproveWorkflowArtifactsRequest = {
  approved_artifact_ids: string[];
  edits?: Record<string, string>;
};

export type ApproveWorkflowArtifactsResponse = {
  workflow_id: string;
  status: string;
  approved_count: number;
  approval_timestamp: string;
  audit_log_id?: string;
};

export type AgentFeedEvent = {
  workflow_id: string;
  event_type:
    | "WORKFLOW_STARTED"
    | "AGENT_STARTED"
    | "AGENT_ACTION"
    | "AGENT_COMPLETE"
    | "HUMAN_REVIEW_REQUIRED"
    | "HUMAN_CONFIRMED"
    | "ARTIFACTS_READY"
    | "WORKFLOW_COMPLETE"
    | "WORKFLOW_ERROR";
  source_agent?: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  trace_id?: string;
};
