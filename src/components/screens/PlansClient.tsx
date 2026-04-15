"use client"

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Filter, MapPin, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/database";
import PlansEmpty from "@/components/screens/Screen_PlansEmpty";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  saved: "Upcoming",
  active: "Upcoming",
  completed: "Completed",
  rejected: "Rejected",
};

const STATUS_PILL: Record<string, string> = {
  draft: "bg-amber-100 text-amber-600",
  saved: "bg-[#00C851]/10 text-[#00C851]",
  active: "bg-[#00C851]/10 text-[#00C851]",
  completed: "bg-gray-100 text-gray-500",
  rejected: "bg-gray-100 text-gray-400",
};

const VIBE_EMOJI: Record<string, string> = {
  romantic: "🍷", fun: "🎳", chill: "☕", adventurous: "🧗",
  cultural: "🎨", foodie: "🍽️", nightlife: "🎶", outdoors: "🌿",
};

const VIBE_COLOR: Record<string, string> = {
  romantic: "from-rose-400/20 to-red-400/10",
  fun: "from-blue-400/20 to-indigo-400/10",
  chill: "from-teal-400/20 to-cyan-400/10",
  adventurous: "from-orange-400/20 to-amber-400/10",
  cultural: "from-purple-400/20 to-violet-400/10",
  foodie: "from-yellow-400/20 to-amber-400/10",
  nightlife: "from-indigo-400/20 to-purple-400/10",
  outdoors: "from-green-400/20 to-emerald-400/10",
};

const OCCASION_EMOJI: Record<string, string> = {
  birthday: "🎂", anniversary: "💍", "work outing": "💼",
  farewell: "👋", "just for fun": "🎉", other: "✨",
};

function getPlanEmoji(plan: Plan): string {
  const vibe = (plan.vibe ?? "").toLowerCase();
  const occ = (plan.occasion ?? "").toLowerCase();
  return OCCASION_EMOJI[occ] ?? VIBE_EMOJI[vibe] ?? "🗓️";
}

function getPlanColor(plan: Plan): string {
  const vibe = (plan.vibe ?? "").toLowerCase();
  return VIBE_COLOR[vibe] ?? "from-gray-200/30 to-gray-100/10";
}

function getPlanTypeLabel(plan: Plan): string {
  if ((plan.participant_count ?? 1) > 1) return `👥 Group · ${plan.participant_count} people`;
  if (plan.occasion) return `🎉 ${plan.occasion}`;
  if (plan.vibe) return `✨ ${plan.vibe}`;
  return "🗓️ Solo";
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatDuration = (mins?: number | null) => {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
};

const FILTER_TABS = ["All", "Upcoming", "Completed", "Drafts"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

function matchesFilter(plan: Plan, tab: FilterTab): boolean {
  if (tab === "All") return true;
  if (tab === "Upcoming") return plan.status === "active" || plan.status === "saved";
  if (tab === "Completed") return plan.status === "completed";
  if (tab === "Drafts") return plan.status === "draft";
  return true;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlansClient({ plans }: { plans: Plan[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  if (!plans.length) return <PlansEmpty />;

  const filtered = plans.filter((p) => matchesFilter(p, activeFilter));
  const upcomingCount = plans.filter((p) => p.status === "active" || p.status === "saved").length;
  const completedCount = plans.filter((p) => p.status === "completed").length;

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      {/* Header */}
      <div className="bg-white px-6 pt-14 pb-5 border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-[24px] font-black text-gray-900 leading-tight">My Plans</h1>
            <p className="text-[13px] text-gray-400 font-medium mt-0.5">
              {upcomingCount > 0
                ? `${upcomingCount} upcoming · ${completedCount} completed`
                : `${completedCount} plans completed`}
            </p>
          </div>
          <button className="w-10 h-10 rounded-2xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 active:scale-95 transition-transform shadow-sm">
            <Filter size={18} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-[12px] font-bold transition-all shrink-0",
                activeFilter === tab
                  ? "bg-[#FF5A5F] text-white shadow-sm"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Plan list */}
      <div className="px-4 pt-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <span className="text-5xl mb-4">📋</span>
            <p className="font-bold text-gray-800 text-[17px] mb-1">Nothing here yet</p>
            <p className="text-gray-400 text-[13px]">Plans you save will appear here.</p>
          </div>
        ) : (
          filtered.map((plan: Plan) => {
            const duration = formatDuration(plan.duration_minutes);
            const statusLabel = STATUS_LABELS[plan.status] ?? plan.status;
            const statusPill = STATUS_PILL[plan.status] ?? STATUS_PILL.draft;

            return (
              <Link
                key={plan.id}
                href={`/plans/${plan.id}`}
                className="block bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden active:scale-[0.98] transition-transform"
              >
                {/* Gradient colour band */}
                <div className={cn("h-2 w-full bg-gradient-to-r", getPlanColor(plan))} />

                <div className="p-4">
                  {/* Top row: emoji + title + status */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0">
                      {getPlanEmoji(plan)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                        {getPlanTypeLabel(plan)}
                      </p>
                      <p className="font-bold text-gray-900 text-[16px] leading-tight truncate">
                        {plan.title}
                      </p>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0", statusPill)}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-[12px] text-gray-500 font-medium mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-gray-400" />
                      {formatDate(plan.created_at)}
                    </span>
                    {duration && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" />
                        {duration}
                      </span>
                    )}
                    {plan.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400" />
                        {plan.city}
                      </span>
                    )}
                  </div>

                  {/* Location chips — vibe + occasion tags */}
                  <div className="flex items-center gap-1.5 mb-3 overflow-hidden">
                    {plan.vibe && (
                      <span className="text-[11px] bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">
                        {plan.vibe}
                      </span>
                    )}
                    {plan.occasion && (
                      <span className="text-[11px] bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full truncate max-w-[120px]">
                        {plan.occasion}
                      </span>
                    )}
                  </div>

                  {/* Bottom: cost + action */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[13px] font-bold text-gray-900">
                      K{plan.estimated_cost.toFixed(0)}{" "}
                      <span className="font-normal text-gray-400 text-[11px]">est. total</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {plan.status === "completed" && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className="fill-gray-200 text-gray-200"
                            />
                          ))}
                        </div>
                      )}
                      {(plan.status === "saved" || plan.status === "active") && (
                        <span className="text-[11px] font-bold text-[#00C851] bg-[#00C851]/10 px-2.5 py-1 rounded-full">
                          View →
                        </span>
                      )}
                      {plan.status === "draft" && (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                          Resume
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* New plan dashed button */}
      <div className="mx-4 mt-4">
        <Link
          href="/plans/generate"
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-semibold text-[14px] active:scale-[0.98] transition-transform"
        >
          <Plus size={18} />
          Plan a new evening
        </Link>
      </div>
    </div>
  );
}
