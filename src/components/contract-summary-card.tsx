import type { ContractRecord } from "@/lib/types";

const formatCurrency = (value: number | null) =>
  value === null
    ? "Unknown"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);

const formatBoolean = (value: boolean | null) =>
  value === null ? "Unknown" : value ? "Yes" : "No";

const sourceLabels = {
  parsed_content: "Parsed from uploaded content",
  filename_assisted: "Inferred from filenames",
  fallback_demo: "Demo fallback record",
} as const;

export function ContractSummaryCard({
  contract,
  analysisSource,
}: {
  contract: ContractRecord;
  analysisSource: keyof typeof sourceLabels;
}) {
  const rows = [
    ["vendorName", "Vendor", contract.vendorName],
    ["annualValue", "Annual value", formatCurrency(contract.annualValue)],
    ["renewalDate", "Renewal date", contract.renewalDate ?? "Unknown"],
    [
      "noticePeriodDays",
      "Notice period",
      contract.noticePeriodDays === null
        ? "Unknown"
        : `${contract.noticePeriodDays} days`,
    ],
    ["autoRenewal", "Auto-renewal", formatBoolean(contract.autoRenewal)],
    ["pricingModel", "Pricing model", contract.pricingModel ?? "Unknown"],
    [
      "terminationRights",
      "Termination rights",
      contract.terminationRights ?? "Unknown",
    ],
    ["liabilityCap", "Liability cap", contract.liabilityCap ?? "Unknown"],
    ["dpaPresent", "DPA present", formatBoolean(contract.dpaPresent)],
    ["soc2Present", "SOC 2 present", formatBoolean(contract.soc2Present)],
  ] as const;

  return (
    <section className="panel-surface h-full">
      <p className="eyebrow">Contract summary</p>
      <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">
        Step 3 · Review extracted terms
      </p>
      <h2 className="panel-title">Extracted renewal record</h2>
      <p className="panel-copy">
        This extracted record feeds the risk review and recommendation. Scan the
        key terms first, then confirm anything uncertain.
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
        Analysis source · {sourceLabels[analysisSource]}
      </p>

      <div className="mt-6 rounded-3xl border border-amber-300/25 bg-amber-400/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-100/90">
          Low-confidence field
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-lg font-semibold text-white">
            Notice period extracted as{" "}
            {contract.noticePeriodDays === null
              ? "Unknown"
              : `${contract.noticePeriodDays} days`}
          </p>
          <span className="rounded-full border border-amber-300/30 bg-amber-300/12 px-3 py-1 text-xs font-semibold text-amber-100">
            {Math.round((contract.extractionConfidence.noticePeriodDays ?? 0.58) * 100)}% confidence
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-amber-50/85">
          This field needs human confirmation before any vendor outreach.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {rows.map(([field, label, value]) => {
          const confidence = contract.extractionConfidence[field] ?? 0;
          const confidenceClass =
            confidence < 0.7
              ? "border-amber-300/30 bg-amber-400/10 text-amber-100"
              : "border-emerald-300/20 bg-emerald-400/8 text-emerald-100";

          return (
            <div key={label} className="glass-subtle rounded-2xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="metric-label">{label}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-white sm:text-[0.95rem]">
                    {value}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${confidenceClass}`}
                >
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
