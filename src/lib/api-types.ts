/**
 * API types matching the actual ContractIQ FastAPI backend.
 *
 * These types reflect the real response shapes from:
 *   - app/routers/*.py
 *   - app/models/*.py (Pydantic model_dump output)
 *   - app/services/redis_client.py
 */

// -- Workflow --

export type WorkflowCreateResponse = {
  workflow_id: string;
  status: string;
};

export type WorkflowStatusResponse = {
  workflow_id: string;
  status: string;
  vendor_id?: string | null;
  vendor_name?: string | null;
  current_agent?: string | null;
  document_count?: string | null;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
  error?: string | null;
};

export type WorkflowDocumentUploadResponse = {
  workflow_id: string;
  documents_uploaded: number;
  status: string;
};

// -- Contract (ExtractedField from Pydantic) --

export type ExtractedFieldResponse = {
  value?: string | null;
  confidence?: number;
  source_text?: string | null;
  confirmed?: boolean;
};

/**
 * Contract response is the raw ContractRecord.model_dump() —
 * each field is an ExtractedField, plus aggregate fields at top level.
 */
export type ContractResponse = {
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
  overall_confidence?: number;
  flagged_fields?: string[];
  missing_fields?: string[];
};

// -- Risk --

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

// -- Decision --

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

// -- Artifacts --

export type WorkflowArtifactResponse = {
  artifact_id: string;
  artifact_type: string;
  title: string;
  content: string;
  approval_status: string;
  approved_by?: string | null;
  approved_at?: string | null;
};

export type WorkflowArtifactsResponse = {
  workflow_id: string;
  artifacts: WorkflowArtifactResponse[];
};

// -- Approve --

export type ApproveWorkflowResponse = {
  status: string;
  workflow_id: string;
};

// -- Flagged fields (derived from contract data) --

export type BackendFlaggedField = {
  field: string;
  value?: string | null;
  confidence?: number;
  confirmed?: boolean;
  sourceText?: string | null;
};

// -- Spend summary --

export type SpendSummaryResponse = {
  total_annual_spend: number;
  vendor_count: number;
  vendors: Array<{
    vendor: string;
    annual_value: number;
    workflow_id: string;
  }>;
};

// -- Urgent renewals --

export type UrgentRenewalsResponse = {
  urgent_renewals: Array<{
    vendor_id: string;
    days_until_deadline: number;
  }>;
  count: number;
};

// -- Agent feed events (WebSocket) --

export type AgentFeedEvent = {
  event_id: string;
  workflow_id: string;
  source_agent: string;
  event_type: string;
  payload: Record<string, unknown>;
  timestamp: string;
};
