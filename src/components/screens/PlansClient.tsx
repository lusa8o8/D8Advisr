"use client"

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/database";
import PlansEmpty from "@/components/screens/Screen_PlansEmpty";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#E5E5E5] text-[#222222]",
  saved: "bg-[#FF9500]/20 text-[#FF9500]",
  active: "bg-[#00C851]/20 text-[#00C851]",
  completed: "bg-[#555555]/20 text-[#555555]",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  saved: "Upcoming",
  active: "Upcoming",
  completed: "Completed",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const FILTER_TABS = ["All", "Upcoming", "Completed", "Drafts"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

function matchesFilter(plan: Plan, tab: FilterTab): boolean {
  if (tab === "All") return true;
  if (tab === "Upcoming") return plan.status === "active" || plan.status === "saved";
  if (tab === "Completed") return plan.status === "completed";
  if (tab === "Drafts") return plan.status === "draft";
  return true;
}

export default function PlansClient({ plans }: { plans: Plan[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  if (!plans.length) return <PlansEmpty />;

  const filtered = plans.filter(p => matchesFilter(p, activeFilter));

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#222222]">Your Plans</h1>
            <Link
              href="/plans/group/new"
              className="rounded-full border border-[#FF5A5F] px-4 py-1 text-xs font-semibold text-[#FF5A5F]"
            >
              + Group Plan
            </Link>
          </div>
          <p className="text-sm text-[#555555]">Plan something memorable every time.</p>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-[12px] font-bold transition-all shrink-0",
                  activeFilter === tab
                    ? "bg-[#FF5A5F] text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E5E5] bg-white p-8 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-[#222222]">No {activeFilter.toLowerCase()} plans</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((plan: Plan) => (
              <Link
                key={plan.id}
                href={`/plans/${plan.id}`}
                className="flex items-center justify-between rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3 text-sm no-underline transition hover:border-[#FF5A5F]"
              >
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[#222222]">{plan.title}</p>
                  {plan.occasion && (
                    <span className="inline-flex rounded-full bg-[#F7F7F7] px-3 py-1 text-[11px] font-semibold text-[#555555]">
                      {plan.occasion}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <span className={`rounded-full px-3 py-1 font-semibold ${STATUS_STYLES[plan.status] ?? STATUS_STYLES.draft}`}>
                    {STATUS_LABELS[plan.status] ?? plan.status.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-[#FF5A5F]">
                    K{plan.estimated_cost.toFixed(0)}
                  </span>
                  <span className="text-[#888888]">{formatDate(plan.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
