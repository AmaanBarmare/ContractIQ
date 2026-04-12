"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getUrgentRenewals } from "@/lib/api-client";
import type { UrgentRenewalsResponse } from "@/lib/api-types";

const urgencyBadge = (days: number) => {
  if (days <= 14)
    return {
      label: "CRITICAL",
      style: "bg-rose-500/15 text-rose-100 border-rose-400/30",
    };
  if (days <= 30)
    return {
      label: "HIGH",
      style: "bg-amber-500/15 text-amber-100 border-amber-400/30",
    };
  if (days <= 60)
    return {
      label: "MEDIUM",
      style: "bg-yellow-500/12 text-yellow-100 border-yellow-400/25",
    };
  return {
    label: "LOW",
    style: "bg-emerald-500/12 text-emerald-200 border-emerald-400/25",
  };
};

export default function RenewalsPage() {
  const [data, setData] = useState<UrgentRenewalsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUrgentRenewals(180)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const renewals = data?.urgent_renewals ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-10 sm:px-10">
      {/* Header */}
      <header className="mb-8">
        <p className="eyebrow">Renewal Command Center</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Upcoming Renewals
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
          Contracts with cancellation deadlines approaching. Act before notice windows close.
        </p>
      </header>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="hero-chip">
          <span className="hero-chip-label">Total urgent</span>
          <span className="hero-chip-value">{data?.count ?? "--"}</span>
        </div>
        <div className="hero-chip">
          <span className="hero-chip-label">Nearest deadline</span>
          <span className="hero-chip-value">
            {renewals.length > 0
              ? `${renewals[0].days_until_deadline} days`
              : "--"}
          </span>
        </div>
        <div className="hero-chip">
          <span className="hero-chip-label">Tracking window</span>
          <span className="hero-chip-value">180 days</span>
        </div>
      </div>

      {/* Table */}
      <div className="panel-surface">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
            <span className="ml-3 text-sm text-slate-400">Loading renewals...</span>
          </div>
        ) : renewals.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">
              No urgent renewals found. Upload contracts to start tracking.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition-colors hover:bg-cyan-400/20"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span>Vendor</span>
              <span>Days left</span>
              <span>Urgency</span>
            </div>
            {renewals.map((r) => {
              const badge = urgencyBadge(r.days_until_deadline);
              return (
                <div
                  key={r.vendor_id}
                  className="glass-subtle grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-xl px-4 py-3.5"
                >
                  <span className="text-sm font-medium text-white">
                    {r.vendor_id}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-white">
                    {r.days_until_deadline}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider ${badge.style}`}
                  >
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
