import type {
  AgentEvent,
  ArtifactPack,
  ContractRecord,
  Recommendation,
} from "@/lib/types";

export type UiContractRecord = ContractRecord;

export type UiRecommendation = Recommendation;

export type UiArtifactPack = ArtifactPack;

export type UiAgentEvent = AgentEvent;

export type UiReviewField = {
  key: string;
  label: string;
  value: string | null;
  confidence: number;
  confirmed: boolean;
  needsReview: boolean;
  sourceText?: string | null;
};
