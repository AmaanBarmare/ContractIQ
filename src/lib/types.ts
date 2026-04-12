export type UploadItem = {
  name: string;
  type: string;
  size: string;
  status: "Ready" | "Scanning" | "Flagged";
};

export type AgentEvent = {
  id: string;
  agent: string;
  action: string;
  detail: string;
  time: string;
  tone: "neutral" | "positive" | "alert";
};

export type ContractRecord = {
  vendorName: string;
  annualValue: number | null;
  renewalDate: string | null;
  noticePeriodDays: number | null;
  autoRenewal: boolean | null;
  pricingModel: string | null;
  terminationRights: string | null;
  liabilityCap: string | null;
  dpaPresent: boolean | null;
  soc2Present: boolean | null;
  extractionConfidence: Record<string, number>;
};

export type VendorResearch = {
  vendorName: string;
  recentNews: string[];
  pricingSignals: string[];
  alternatives: string[];
  sources: string[];
};

export type Recommendation = {
  decision: "RENEW" | "RENEGOTIATE" | "CANCEL" | "ESCALATE";
  confidence: number;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasons: string[];
  nextSteps: string[];
};

export type ArtifactPack = {
  negotiationPoints: string[];
  draftEmail: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
};
