"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ChevronLeft } from "lucide-react";
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
    if (plan.status === "draft" || plan.status === "saved") {
      return (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="rounded-xl bg-[#FF5A5F] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isUpdating}
            onClick={() => updateStatus("active", `/plans/${plan.id}/execute`)}
          >
            Start Experience
          </button>
          <button
            type="button"
            className="rounded-xl border border-[#FF5A5F] px-4 py-3 text-sm font-semibold text-[#FF5A5F]"
            onClick={() => router.push(`/plans/${plan.id}/edit`)}
          >
            Edit Plan
          </button>
        </div>
      );
    }
    if (plan.status === "active") {
      return (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="rounded-xl bg-[#00C851] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isUpdating}
            onClick={() => updateStatus("completed", `/plans/${plan.id}/feedback`)}
          >
            I'm Done!
          </button>
          <button
            type="button"
            className="rounded-xl border border-[#FF5A5F] px-4 py-3 text-sm font-semibold text-[#FF5A5F]"
            onClick={() => router.push(`/plans/${plan.id}/edit`)}
          >
            Edit Plan
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="rounded-xl border border-[#222222] px-4 py-3 text-sm font-semibold text-[#222222]"
          onClick={() => router.push(`/plans/${plan.id}/feedback`)}
        >
          View Feedback
        </button>
        <button
          type="button"
          className="rounded-xl border border-[#FF5A5F] px-4 py-3 text-sm font-semibold text-[#FF5A5F]"
          onClick={() => router.push(`/plans/generate`)}
        >
          Regenerate Similar
        </button>
      </div>
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
          <p className="text-sm font-semibold text-[#222222]">Your Itinerary</p>
          <div className="mt-4 space-y-3">
            {stops.map((stop, index) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => router.push(`/venues/${stop.venue_id}`)}
                className="flex items-center justify-between rounded-2xl border border-[#E5E5E5] bg-[#F9F9F9] p-3 text-left transition hover:border-[#FF5A5F]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF5A5F]/20 text-sm font-bold text-[#FF5A5F]">
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
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#E5E5E5] bg-white px-4 py-4 pb-20">
        {renderActions()}
      </div>
    </div>
  );
}

