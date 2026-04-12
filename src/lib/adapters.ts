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
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};

const parseIntegerValue = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const match = value.match(/-?\d+/);

  return match ? Number.parseInt(match[0], 10) : null;
};

const parseBooleanValue = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (["yes", "true", "present", "included"].includes(normalized)) {
    return true;
  }

  if (["no", "false", "missing", "absent", "not present"].includes(normalized)) {
    return false;
  }

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
  if (statuses.every((status) => status.includes("APPROVED"))) {
    return "APPROVED";
  }

  if (statuses.some((status) => status.includes("REJECTED"))) {
    return "REJECTED";
  }

  return "PENDING";
};

const eventTone = (eventType: AgentFeedEvent["event_type"]): UiAgentEvent["tone"] => {
  if (
    eventType === "WORKFLOW_ERROR" ||
    eventType === "HUMAN_REVIEW_REQUIRED"
  ) {
    return "alert";
  }

  if (eventType === "AGENT_COMPLETE" || eventType === "WORKFLOW_COMPLETE") {
    return "positive";
  }

  return "neutral";
};

const eventAction = (event: AgentFeedEvent) => {
  if (event.event_type === "HUMAN_REVIEW_REQUIRED") {
    return "Requested human review";
  }

  if (event.event_type === "ARTIFACTS_READY") {
    return "Prepared review artifacts";
  }

  if (event.event_type === "WORKFLOW_COMPLETE") {
    return "Completed workflow";
  }

  return event.message;
};

const eventDetail = (event: AgentFeedEvent) => {
  if (event.data && Object.keys(event.data).length > 0) {
    const summary = Object.entries(event.data)
      .slice(0, 2)
      .map(([key, value]) => `${startCase(key)}: ${String(value)}`)
      .join(" · ");

    if (summary) {
      return summary;
    }
  }

  return event.message;
};

export function adaptContractResponse(
  response: ContractResponse,
): UiContractRecord {
  const record = response.contract_record;

  return {
    vendorName:
      record.vendor_name?.value?.trim() || response.vendor_name || "Unknown Vendor",
    annualValue: parseCurrencyValue(record.annual_value?.value),
    renewalDate: record.renewal_date?.value ?? null,
    noticePeriodDays:
      parseIntegerValue(record.notice_period_days?.value) ??
      parseIntegerValue(record.notice_period?.value),
    autoRenewal: parseBooleanValue(record.auto_renewal?.value),
    pricingModel: record.pricing_model?.value ?? null,
    terminationRights: record.termination_for_convenience?.value ?? null,
    liabilityCap: record.liability_cap?.value ?? null,
    dpaPresent: parseBooleanValue(record.dpa_present?.value),
    soc2Present: parseBooleanValue(record.soc2_type2?.value),
    extractionConfidence: {
      vendorName: fieldConfidence(record.vendor_name?.confidence),
      annualValue: fieldConfidence(record.annual_value?.confidence),
      renewalDate: fieldConfidence(record.renewal_date?.confidence),
      noticePeriodDays: Math.max(
        fieldConfidence(record.notice_period_days?.confidence),
        fieldConfidence(record.notice_period?.confidence),
      ),
      autoRenewal: fieldConfidence(record.auto_renewal?.confidence),
      pricingModel: fieldConfidence(record.pricing_model?.confidence),
      terminationRights: fieldConfidence(
        record.termination_for_convenience?.confidence,
      ),
      liabilityCap: fieldConfidence(record.liability_cap?.confidence),
      dpaPresent: fieldConfidence(record.dpa_present?.confidence),
      soc2Present: fieldConfidence(record.soc2_type2?.confidence),
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

export function adaptWorkflowArtifactsResponse(
  response: WorkflowArtifactsResponse,
): UiArtifactPack {
  const negotiationArtifact = response.artifacts.find((artifact) =>
    artifact.type.includes("NEGOTIATION"),
  );
  const emailArtifact = response.artifacts.find((artifact) =>
    artifact.type.includes("EMAIL"),
  );

  return {
    negotiationPoints: negotiationArtifact
      ? negotiationArtifact.content
          .split("\n")
          .map((line) => line.replace(/^[\s*-]+/, "").trim())
          .filter(Boolean)
      : [],
    draftEmail: emailArtifact?.content ?? "",
    approvalStatus: artifactStatusToApproval(
      response.artifacts.map((artifact) => artifact.status),
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
  return {
    id: event.trace_id ?? `${event.workflow_id}-${event.timestamp}`,
    agent: startCase(event.source_agent ?? "workflow"),
    action: eventAction(event),
    detail: eventDetail(event),
    time: new Date(event.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    tone: eventTone(event.event_type),
  };
}
