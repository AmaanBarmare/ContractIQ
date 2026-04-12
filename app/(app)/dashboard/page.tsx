"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DemoRunway } from "@/components/demo-runway";
import { UploadPanel } from "@/components/upload-panel";
import { useWorkflow } from "@/hooks/use-workflow";
import { uploadItems } from "@/lib/mock-data";
import { deleteWorkflow, getSpendSummary, getUrgentRenewals } from "@/lib/api-client";
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

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDeleteWorkflow = (workflowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(workflowId);
  };

  const confirmDeleteWorkflow = async () => {
    if (!spend || !confirmDelete) return;
    try {
      await deleteWorkflow(confirmDelete);
    } catch {
      // Still remove from UI even if backend fails (e.g. already deleted)
    }
    const removed = spend.vendors.find((v) => v.workflow_id === confirmDelete);
    setSpend({
      ...spend,
      vendors: spend.vendors.filter((v) => v.workflow_id !== confirmDelete),
      vendor_count: spend.vendor_count - 1,
      total_annual_spend: spend.total_annual_spend - (removed?.annual_value ?? 0),
    });
    setConfirmDelete(null);
  };

  return (
    <div className="page-shell max-w-6xl">
      {/* Stats row */}
      <div className="stagger-in mb-8 grid gap-4 sm:grid-cols-3">
        <div className="hero-chip transition-transform hover:-translate-y-1">
          <span className="hero-chip-label">Total annual spend</span>
          <span className="hero-chip-value">
            {spend
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(spend.total_annual_spend)
              : "—"}
          </span>
        </div>
        <div className="hero-chip transition-transform hover:-translate-y-1">
          <span className="hero-chip-label">Vendors tracked</span>
          <span className="hero-chip-value">{spend ? spend.vendor_count : "—"}</span>
        </div>
        <div className="hero-chip transition-transform hover:-translate-y-1">
          <span className="hero-chip-label">Urgent renewals</span>
          <span className="hero-chip-value">{renewals ? renewals.count : "—"}</span>
        </div>
      </div>

      {/* Agent runway */}
      <section className="mb-10">
        <DemoRunway />
      </section>

      {/* Upload */}
      <UploadPanel
        items={uploadItems}
        workflowPhase={workflowState.phase}
        errorMessage={workflowState.errorMessage}
        startWorkflow={handleStartWorkflow}
      />

      {/* Previous workflows */}
      {spend && spend.vendors.length > 0 && (
        <section className="mt-16">
          <div className="mb-6">
            <p className="eyebrow">Previous workflows</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-gray-900">Jump back in</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {spend.vendors.map((v) => (
              <div
                key={v.workflow_id}
                className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => router.push(`/workflows/${v.workflow_id}`)}
                  className="block w-full text-left"
                >
                  <p className="text-sm font-semibold text-gray-900">{v.vendor}</p>
                  <p className="mt-1.5 text-xs text-gray-400 transition-colors group-hover:text-gray-500">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(v.annual_value)}
                    <span className="text-gray-300">/yr</span>
                  </p>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteWorkflow(v.workflow_id, e)}
                  className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="Delete workflow"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-base font-semibold text-gray-900">Delete workflow?</p>
            <p className="mt-2 text-sm text-gray-500">
              This will remove the workflow from your dashboard. This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteWorkflow}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
