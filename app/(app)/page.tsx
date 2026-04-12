"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { UploadPanel } from "@/components/upload-panel";
import { useWorkflow } from "@/hooks/use-workflow";
import { uploadItems } from "@/lib/mock-data";
import { getSpendSummary, getUrgentRenewals } from "@/lib/api-client";
import type { SpendSummaryResponse, UrgentRenewalsResponse } from "@/lib/api-types";

export default function DashboardPage() {
  const router = useRouter();
  const { workflowState, startWorkflow } = useWorkflow();

  const [spend, setSpend] = useState<SpendSummaryResponse | null>(null);
  const [renewals, setRenewals] = useState<UrgentRenewalsResponse | null>(null);

  useEffect(() => {
    getSpendSummary().then(setSpend).catch(() => {});
    getUrgentRenewals().then(setRenewals).catch(() => {});
  }, []);

  const handleStartWorkflow = async (files: File[]) => {
    const workflowId = await startWorkflow(files);
    if (workflowId) {
      router.push(`/workflows/${workflowId}`);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      {/* Hero */}
      <header className="mb-10">
        <p className="eyebrow">ContractIQ</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          AI-powered contract intelligence for procurement teams.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Upload a vendor packet and let six AI agents extract terms, surface risk,
          research the vendor, and draft your next move — all in under 90 seconds.
        </p>
      </header>

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="hero-chip">
          <span className="hero-chip-label">Total annual spend</span>
          <span className="hero-chip-value">
            {spend
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(spend.total_annual_spend)
              : "--"}
          </span>
        </div>
        <div className="hero-chip">
          <span className="hero-chip-label">Vendors tracked</span>
          <span className="hero-chip-value">
            {spend ? spend.vendor_count : "--"}
          </span>
        </div>
        <div className="hero-chip">
          <span className="hero-chip-label">Urgent renewals</span>
          <span className="hero-chip-value">
            {renewals ? renewals.count : "--"}
          </span>
        </div>
      </div>

      {/* Upload panel */}
      <UploadPanel
        items={uploadItems}
        workflowPhase={workflowState.phase}
        errorMessage={workflowState.errorMessage}
        startWorkflow={handleStartWorkflow}
      />

      {/* Recent workflows hint */}
      {spend && spend.vendors.length > 0 && (
        <section className="mt-10">
          <p className="eyebrow mb-4">Recent contracts</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {spend.vendors.map((v) => (
              <button
                key={v.workflow_id}
                type="button"
                onClick={() => router.push(`/workflows/${v.workflow_id}`)}
                className="glass-subtle cursor-pointer rounded-2xl px-5 py-4 text-left transition-colors hover:bg-white/8"
              >
                <p className="text-sm font-medium text-white">{v.vendor}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(v.annual_value)}
                  /yr
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
