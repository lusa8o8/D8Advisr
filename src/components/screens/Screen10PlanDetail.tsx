"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ChevronLeft, Edit3, Map } from "lucide-react";
import { toast } from "sonner";
import type { Plan, PlanItem } from "@/types/database";

export type PlanStopWithVenue = PlanItem & {
  venue_name: string;
  venue?: {
    name: string;
    address: string | null;
  };
};

const STATUS_MAP: Record<string, { label: string; color: string; text: string }> = {
  draft: { label: "Draft", color: "bg-[#E5E5E5]", text: "text-[#222222]" },
  saved: { label: "Saved", color: "bg-[#FF9500]/20", text: "text-[#FF9500]" },
  active: { label: "Active", color: "bg-[#00C851]/20", text: "text-[#00C851]" },
  completed: { label: "Completed", color: "bg-[#555555]/20", text: "text-[#555555]" },
};

const getStatusConfig = (status: string) => STATUS_MAP[status] ?? STATUS_MAP.draft;

function statusBadge(status: string) {
  const config = getStatusConfig(status);
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.color} ${config.text}`}>
      {config.label}
    </span>
  );
}

function formatCost(value: number) {
  return `K${value.toFixed(0)}`;
}

export default function Screen10PlanDetail({ plan, stops }: { plan: Plan; stops: PlanStopWithVenue[] }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const totalEstimated = useMemo(() => stops.reduce((sum, stop) => sum + stop.estimated_cost, 0), [stops]);

  const updateStatus = async (status: string, next?: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/plans/${plan.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Could not update status");
      if (next) {
        router.push(next);
      } else {
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderActions = () => {
    if (plan.status === "completed") {
      return (
        <>
          <button
            type="button"
            className="flex-1 rounded-xl border-2 border-[#EBEBEB] py-4 text-sm font-bold text-[#222222]"
            onClick={() => router.push(`/plans/${plan.id}/feedback`)}
          >
            View Feedback
          </button>
          <button
            type="button"
            className="flex-1 bg-[#FF5A5F] text-white rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all"
            onClick={() => router.push("/plans/generate")}
          >
            Plan Again
          </button>
        </>
      );
    }

    // draft, saved, active
    return (
      <>
        <button
          type="button"
          className="w-14 h-14 rounded-xl border-2 border-[#EBEBEB] flex items-center justify-center shrink-0"
          onClick={() => router.push(`/plans/${plan.id}/execute`)}
        >
          <Map size={24} />
        </button>
        <button
          type="button"
          className="flex-1 bg-[#FF5A5F] text-white rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all disabled:opacity-60"
          disabled={isUpdating}
          onClick={() => updateStatus("active", `/plans/${plan.id}/execute`)}
        >
          Let's Go!
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <button type="button" className="flex items-center gap-2 text-sm font-semibold text-[#222222]" onClick={() => router.push("/plans")}>
            <ChevronLeft size={20} />
            Back
          </button>
          {statusBadge(plan.status)}
        </div>
        <h1 className="text-2xl font-bold text-[#222222]">{plan.title}</h1>
        <p className="text-sm text-[#555555]">{plan.occasion}</p>
        {plan.status === "active" && (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FF9500]/20 px-3 py-1 text-xs font-semibold text-[#FF9500]">
            <BadgeCheck size={14} />
            UPCOMING
          </div>
        )}
        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          {/* CHANGE 4: Edit Plan inline with itinerary header */}
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-[#222222]">Your Itinerary</p>
            <button
              onClick={() => router.push(`/plans/${plan.id}/edit`)}
              className="text-[#FF5A5F] font-semibold text-sm flex items-center gap-1"
            >
              <Edit3 size={14} /> Edit Plan
            </button>
          </div>
          {/* CHANGE 3: Timeline connecting line */}
          <div className="mt-4 space-y-3 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#EBEBEB] before:content-['']">
            {stops.map((stop, index) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => router.push(`/venues/${stop.venue_id}`)}
                className="relative z-10 flex items-center justify-between rounded-2xl border border-[#E5E5E5] bg-[#F9F9F9] p-3 text-left transition hover:border-[#FF5A5F] w-full"
              >
                <div className="flex items-center gap-3">
                  {/* CHANGE 2: Dark stop number circles */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#222222] text-sm font-bold text-white shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[#222222]">{stop.venue_name}</p>
                    <p className="text-xs text-[#555555]">{stop.activity_type ?? "Experience"}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end text-xs text-[#555555]">
                  <span>{stop.time_slot}</span>
                  <span>{stop.estimated_time_minutes} mins</span>
                  <span className="font-semibold text-[#FF5A5F]">{formatCost(stop.estimated_cost)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#222222]">Cost Review</p>
          <div className="mt-3 space-y-2">
            {stops.map((stop) => (
              <div key={stop.id} className="flex items-center justify-between text-sm text-[#555555]">
                <span>{stop.venue_name}</span>
                <span className="font-semibold text-[#222222]">{formatCost(stop.estimated_cost)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-dashed border-[#E5E5E5] pt-3">
            <p className="text-xs text-[#555555]">Total Estimated</p>
            <p className="text-lg font-semibold text-[#222222]">{formatCost(totalEstimated)}</p>
            <p className="text-xs text-[#888888]">Estimates based on average spend per person</p>
          </div>
        </section>
      </div>
      {/* CHANGE 1: New bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] p-6 flex gap-4 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        {renderActions()}
      </div>
    </div>
  );
}
