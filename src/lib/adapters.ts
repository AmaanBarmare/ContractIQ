/**
 * Adapters to convert actual backend responses into UI-friendly shapes.
 *
 * The backend returns ContractRecord.model_dump() directly (flat structure),
 * artifacts use artifact_id/artifact_type/approval_status field names,
 * and agent events come from the Redis Stream via WebSocket.
 */

import type {
  AgentFeedEvent,
  BackendFlaggedField,
  ContractResponse,
  WorkflowArtifactsResponse,
  WorkflowDecisionResponse,
} from "@/lib/api-types";
import type {
  UiAgentEvent,
  UiArtifactPack,
  UiContractRecord,
  UiRecommendation,
  UiReviewField,
} from "@/lib/ui-types";

const DEFAULT_CONFIDENCE = 0;

const fieldConfidence = (confidence?: number) => confidence ?? DEFAULT_CONFIDENCE;

const parseCurrencyValue = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseIntegerValue = (value?: string | null) => {
  if (!value) return null;
  const match = value.match(/-?\d+/);
  return match ? Number.parseInt(match[0], 10) : null;
};

const parseBooleanValue = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (["yes", "true", "present", "included"].includes(normalized)) return true;
  if (["no", "false", "missing", "absent", "not present"].includes(normalized)) return false;
  return null;
};

const startCase = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const artifactStatusToApproval = (
  statuses: string[],
): UiArtifactPack["approvalStatus"] => {
  if (statuses.every((s) => s.includes("APPROVED"))) return "APPROVED";
  if (statuses.some((s) => s.includes("REJECTED"))) return "REJECTED";
  return "PENDING";
};

/**
 * Convert backend ContractResponse (flat ContractRecord.model_dump())
 * to the UI contract record shape.
 */
export function adaptContractResponse(
  response: ContractResponse,
): UiContractRecord {
  return {
    vendorName:
      response.vendor_name?.value?.trim() || "Unknown Vendor",
    annualValue: parseCurrencyValue(response.annual_value?.value),
    renewalDate: response.renewal_date?.value ?? null,
    noticePeriodDays:
      parseIntegerValue(response.notice_period_days?.value) ??
      parseIntegerValue(response.notice_period?.value),
    autoRenewal: parseBooleanValue(response.auto_renewal?.value),
    pricingModel: response.pricing_model?.value ?? null,
    terminationRights: response.termination_for_convenience?.value ?? null,
    liabilityCap: response.liability_cap?.value ?? null,
    dpaPresent: parseBooleanValue(response.dpa_present?.value),
    soc2Present: parseBooleanValue(response.soc2_type2?.value),
    extractionConfidence: {
      vendorName: fieldConfidence(response.vendor_name?.confidence),
      annualValue: fieldConfidence(response.annual_value?.confidence),
      renewalDate: fieldConfidence(response.renewal_date?.confidence),
      noticePeriodDays: Math.max(
        fieldConfidence(response.notice_period_days?.confidence),
        fieldConfidence(response.notice_period?.confidence),
      ),
      autoRenewal: fieldConfidence(response.auto_renewal?.confidence),
      pricingModel: fieldConfidence(response.pricing_model?.confidence),
      terminationRights: fieldConfidence(
        response.termination_for_convenience?.confidence,
      ),
      liabilityCap: fieldConfidence(response.liability_cap?.confidence),
      dpaPresent: fieldConfidence(response.dpa_present?.confidence),
      soc2Present: fieldConfidence(response.soc2_type2?.confidence),
    },
  };
}

export function adaptWorkflowDecisionResponse(
  response: WorkflowDecisionResponse,
): UiRecommendation {
  return {
    decision:
      response.recommendation === "ESCALATE_LEGAL" ||
      response.recommendation === "ESCALATE_SECURITY" ||
      response.recommendation === "DEFER"
        ? "ESCALATE"
        : response.recommendation,
    confidence: response.confidence,
    urgency: response.urgency,
    reasons:
      response.reasoning.length > 0
        ? response.reasoning
        : [response.primary_reason, response.risks_if_no_action]
            .filter((value): value is string => Boolean(value)),
    nextSteps: response.next_steps ?? [],
  };
}

/**
 * Convert backend artifacts response to UI artifact pack.
 * Backend uses artifact_type/approval_status (not type/status).
 */
export function adaptWorkflowArtifactsResponse(
  response: WorkflowArtifactsResponse,
): UiArtifactPack {
  const negotiationArtifact = response.artifacts.find((a) =>
    a.artifact_type.includes("RENEGOTIATION") || a.artifact_type.includes("NEGOTIATION"),
  );

  // Use cancellation letter or executive summary as the "email" artifact
  const emailArtifact = response.artifacts.find((a) =>
    a.artifact_type.includes("CANCELLATION"),
  ) ?? response.artifacts.find((a) =>
    a.artifact_type.includes("EXECUTIVE"),
  );

  return {
    negotiationPoints: negotiationArtifact
      ? negotiationArtifact.content
          .split("\n")
          .map((line) => line.replace(/^[\s*-]+/, "").trim())
          .filter((line) => line && !/^\|[-|\s]+\|$/.test(line))
      : [],
    draftEmail: emailArtifact?.content ?? "",
    approvalStatus: artifactStatusToApproval(
      response.artifacts.map((a) => a.approval_status),
    ),
  };
}

export function adaptBackendFlaggedFields(
  fields: BackendFlaggedField[],
): UiReviewField[] {
  return fields.map((field) => ({
    key: field.field,
    label: startCase(field.field),
    value: field.value ?? null,
    confidence: field.confidence ?? DEFAULT_CONFIDENCE,
    confirmed: field.confirmed ?? false,
    needsReview: (field.confirmed ?? false) === false,
    sourceText: field.sourceText ?? null,
  }));
}

export function adaptAgentFeedEvent(event: AgentFeedEvent): UiAgentEvent {
  const toneForEvent = (eventType: string): UiAgentEvent["tone"] => {
    if (eventType === "WORKFLOW_FAILED") return "alert";
    if (
      eventType.includes("COMPLETE") ||
      eventType === "WORKFLOW_APPROVED"
    )
      return "positive";
    return "neutral";
  };

  return {
    id: event.event_id ?? `${event.workflow_id}-${event.timestamp}`,
    agent: startCase(event.source_agent ?? "system"),
    action: event.event_type.replace(/_/g, " ").toLowerCase(),
    detail: event.payload
      ? Object.entries(event.payload)
          .slice(0, 3)
          .map(([k, v]) => `${startCase(k)}: ${String(v)}`)
          .join(" · ")
      : "",
    time: new Date(event.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    tone: toneForEvent(event.event_type),
  };
}
