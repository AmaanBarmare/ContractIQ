"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getUrgentRenewals } from "@/lib/api-client";
import type { UrgentRenewalsResponse } from "@/lib/api-types";

const urgencyBadge = (days: number) => {
  if (days <= 14)
    return {
      label: "CRITICAL",
      style: "bg-red-50 text-red-700 border-red-200",
    };
  if (days <= 30)
    return {
      label: "HIGH",
      style: "bg-amber-50 text-amber-700 border-amber-200",
    };
  if (days <= 60)
    return {
      label: "MEDIUM",
      style: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
  return {
    label: "LOW",
    style: "bg-emerald-50 text-emerald-700 border-emerald-200",
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
    <div className="page-shell max-w-5xl">
      <header className="mb-10">
        <p className="eyebrow">Renewal command center</p>
        <h1 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-[2.35rem]">
          Upcoming renewals
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
          Cancellation deadlines ranked by urgency — the same sorted set Redis maintains for portfolio alerts.
        </p>
      </header>

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

      <div className="panel-surface">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            <span className="ml-3 text-sm text-gray-400">Loading renewals...</span>
          </div>
        ) : renewals.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">
              No urgent renewals found. Upload contracts to start tracking.
            </p>
            <Link href="/" className="btn-primary mt-5">
              Go to dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-2 text-[0.68rem] font-semibold uppercase tracking-widest text-gray-400">
              <span>Vendor</span>
              <span>Days left</span>
              <span>Urgency</span>
            </div>
            {renewals.map((r) => {
              const badge = urgencyBadge(r.days_until_deadline);
              return (
                <div
                  key={r.vendor_id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {r.vendor_id}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-gray-900">
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
