import type {
  AgentEvent,
  ArtifactPack,
  ContractRecord,
  Recommendation,
  UploadItem,
  VendorResearch,
} from "@/lib/types";

type DashboardScenario = {
  agentEvents: AgentEvent[];
  artifactPack: ArtifactPack;
  noticeDeadlineCallout: {
    label: string;
    value: string;
    detail: string;
  };
  recommendation: Recommendation;
  vendorResearch: VendorResearch;
};

type DemoScenario = DashboardScenario & {
  contractRecord: ContractRecord;
};

export const uploadItems: UploadItem[] = [
  {
    name: "Zoom Master Services Agreement.pdf",
    type: "Primary contract",
    size: "2.1 MB",
    status: "Ready",
  },
  {
    name: "Zoom Order Form FY26.pdf",
    type: "Supporting exhibit",
    size: "480 KB",
    status: "Scanning",
  },
  {
    name: "Zoom Security & Privacy Addendum.docx",
    type: "Supporting exhibit",
    size: "690 KB",
    status: "Ready",
  },
  {
    name: "Zoom Redlines from Legal.pdf",
    type: "Negotiation history",
    size: "1.4 MB",
    status: "Flagged",
  },
];

const vendorAlternatives = (vendorName: string) => {
  const name = vendorName.toLowerCase();

  if (name.includes("gong")) {
    return ["Clari Copilot", "Zoom Revenue Accelerator", "Jiminny"];
  }

  if (name.includes("zoominfo")) {
    return ["Apollo", "LinkedIn Sales Navigator", "Demandbase"];
  }

  if (name.includes("zoom")) {
    return ["Microsoft Teams", "Google Meet", "Webex Suite"];
  }

  return [
    "Comparable SaaS alternative",
    "Incumbent competitor",
    "Lower-cost option",
  ];
};

const vendorSignals = (contract: ContractRecord) => {
  const name = contract.vendorName.toLowerCase();

  if (name.includes("gong")) {
    return {
      recentNews: [
        "Gong continues expanding AI forecasting and pipeline tooling into renewal bundles.",
        "Recent packaging updates put more premium features behind broader platform commitments.",
      ],
      pricingSignals: [
        "The current proposal shows a renewal uplift above recent revenue-intelligence benchmarks for similar seat counts.",
        "Expansion language in the order form favors broader bundle adoption over core renewal flexibility.",
      ],
    };
  }

  if (name.includes("zoominfo")) {
    return {
      recentNews: [
        "ZoomInfo continues repositioning AI workflow features inside larger bundled GTM packages.",
        "Recent packaging updates put more value behind credit consumption and premium add-ons.",
      ],
      pricingSignals: [
        "Comparable data-provider renewals have landed below the quoted seat and credit pricing in this packet.",
        "The current proposal assumes higher credit spend without preserving prior-year flexibility on license mix.",
      ],
    };
  }

  if (name.includes("zoom")) {
    return {
      recentNews: [
        "Zoom continues bundling AI Companion and Phone features into enterprise renewals, which is increasing package size.",
        "Recent product messaging emphasizes broader workplace suite adoption, not just core meetings usage.",
      ],
      pricingSignals: [
        "Comparable collaboration renewals this quarter landed 11-14% below the quoted per-host rate in the current order form.",
        "The renewal quote includes an 8% uplift and removes prior seat-flex language on unused webinar licenses.",
      ],
    };
  }

  return {
    recentNews: [
      `${contract.vendorName} is pushing broader platform packaging into the renewal discussion.`,
      "The latest proposal emphasizes expansion value more than flexibility on the core term.",
    ],
    pricingSignals: [
      "The packet reads like a standard SaaS renewal with benchmark pressure on price and flexibility.",
      "The current draft preserves auto-renewal mechanics and weak downgrade protections.",
    ],
  };
};

const noticeWindowLabel = (contract: ContractRecord) => {
  const days = contract.noticePeriodDays ?? 30;
  const remaining = Math.max(14, days - 11);

  return `${remaining} days until notice deadline`;
};

const recommendationReasons = (
  contract: ContractRecord,
  alternatives: string[],
) => [
  `The notice window is closing, and the ${contract.autoRenewal ? "auto-renewal" : "renewal"} clause is still live.`,
  `The quoted renewal price on ${contract.vendorName} appears above current benchmark ranges.`,
  `${contract.terminationRights ?? "Termination language"} leaves too little flexibility if usage changes.`,
  `${alternatives.join(", ")} give us real negotiating leverage.`,
];

const recommendationNextSteps = (contract: ContractRecord) => [
  `Confirm the ${contract.noticePeriodDays ?? 30}-day notice period in the uploaded packet today.`,
  `Push ${contract.vendorName} for lower pricing, a capped uplift, and better exit flexibility.`,
  `Send the vendor email before the notice deadline tightens further.`,
];

const negotiationTalkingPoints = (
  contract: ContractRecord,
  alternatives: string[],
) => [
  `Reset ${contract.vendorName} renewal pricing to current market benchmarks for this category.`,
  "Cap annual uplift at 3% and preserve downgrade flexibility through the next term.",
  `Replace "${contract.terminationRights ?? "current termination language"}" with stronger customer exit protections.`,
  `Tighten the liability cap from ${contract.liabilityCap ?? "the current position"} to standard SaaS terms.`,
  `Keep pressure from ${alternatives.slice(0, 2).join(" and ")} explicit in the negotiation.`,
];

const draftVendorEmail = (contract: ContractRecord) => `Hi ${contract.vendorName} team,

We reviewed the renewal packet and would like to reopen a few commercial items before we finalize the next term. Based on our internal benchmark review, the quoted pricing appears high for the current deployment, and the current contract language does not give us enough flexibility if usage changes during the term.

To move forward, we need updated pricing, a capped annual uplift, and better flexibility around termination or downgrade rights. We would also like to revisit the current liability position so it is more in line with our standard SaaS terms.

If you can send revised pricing and redlines this week, we can review quickly ahead of the notice deadline.

Best,
Procurement Team`;

const buildAgentEvents = (contract: ContractRecord, alternatives: string[]): AgentEvent[] => [
  {
    id: `${contract.vendorName}-evt-1`,
    agent: "Ingestion Agent",
    action: "Classified SaaS renewal packet",
    detail: `Mapped the upload to MSA, order form, DPA, and supporting negotiation docs for ${contract.vendorName}.`,
    time: "08:21",
    tone: "neutral",
  },
  {
    id: `${contract.vendorName}-evt-2`,
    agent: "Extraction Agent",
    action: "Parsed commercial terms",
    detail: `Captured annual value, renewal date, pricing model, and liability position for ${contract.vendorName}.`,
    time: "08:24",
    tone: "positive",
  },
  {
    id: `${contract.vendorName}-evt-3`,
    agent: "Extraction Agent",
    action: "Flagged notice period for confirmation",
    detail: `Notice period extracted as ${contract.noticePeriodDays ?? 30} days with low confidence. Human check required.`,
    time: "08:26",
    tone: "alert",
  },
  {
    id: `${contract.vendorName}-evt-4`,
    agent: "Risk Agent",
    action: "Identified renewal and pricing risk",
    detail: `${contract.autoRenewal ? "Auto-renewal remains active" : "Renewal timing is active"}, pricing is elevated, and termination language is vendor-favorable.`,
    time: "08:29",
    tone: "alert",
  },
  {
    id: `${contract.vendorName}-evt-5`,
    agent: "Vendor Research Agent",
    action: "Found benchmark pressure and alternatives",
    detail: `Current package reads above market, with ${alternatives.slice(0, 2).join(" and ")} available as leverage.`,
    time: "08:33",
    tone: "neutral",
  },
  {
    id: `${contract.vendorName}-evt-6`,
    agent: "Decision Agent",
    action: "Recommended renegotiate",
    detail: `Escalated a renegotiation path for ${contract.vendorName} based on timing, pricing, and flexibility gaps.`,
    time: "08:37",
    tone: "positive",
  },
];

export function deriveDashboardScenarioFromContract(
  contract: ContractRecord,
): DashboardScenario {
  const alternatives = vendorAlternatives(contract.vendorName);
  const signals = vendorSignals(contract);

  return {
    agentEvents: buildAgentEvents(contract, alternatives),
    artifactPack: {
      negotiationPoints: negotiationTalkingPoints(contract, alternatives),
      draftEmail: draftVendorEmail(contract),
      approvalStatus: "PENDING",
    },
    noticeDeadlineCallout: {
      label: "Notice deadline",
      value: noticeWindowLabel(contract),
      detail: `We can act now, but the ${contract.noticePeriodDays ?? 30}-day notice clause still needs a final human check before outreach.`,
    },
    recommendation: {
      decision: "RENEGOTIATE",
      confidence: 0.91,
      urgency: "CRITICAL",
      reasons: recommendationReasons(contract, alternatives),
      nextSteps: recommendationNextSteps(contract),
    },
    vendorResearch: {
      vendorName: contract.vendorName,
      recentNews: signals.recentNews,
      pricingSignals: signals.pricingSignals,
      alternatives,
      sources: [
        `Prior ${contract.vendorName} renewal packet`,
        "Internal procurement benchmark sheet",
        "Public pricing and packaging review",
      ],
    },
  };
}

const primaryDemoContractRecord: ContractRecord = {
  vendorName: "Zoom",
  annualValue: 214800,
  renewalDate: "2026-07-31",
  noticePeriodDays: 45,
  autoRenewal: true,
  pricingModel:
    "Annual enterprise subscription with named host licenses and webinar add-ons",
  terminationRights:
    "Termination for cause only after cure period; no convenience termination right",
  liabilityCap:
    "18 months of fees with carve-outs for confidentiality, IP, and data incidents",
  dpaPresent: true,
  soc2Present: true,
  extractionConfidence: {
    vendorName: 0.99,
    annualValue: 0.96,
    renewalDate: 0.95,
    noticePeriodDays: 0.58,
    autoRenewal: 0.91,
    pricingModel: 0.89,
    terminationRights: 0.87,
    liabilityCap: 0.83,
    dpaPresent: 0.98,
    soc2Present: 0.96,
  },
};

export const primaryDemoScenario: DemoScenario = {
  contractRecord: primaryDemoContractRecord,
  ...deriveDashboardScenarioFromContract(primaryDemoContractRecord),
};
