"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Edit3, Map, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { Plan, PlanItem } from "@/types/database";

export type PlanStopWithVenue = PlanItem & {
  venue_name: string;
  venue?: {
    name: string;
    address: string | null;
  };
};

function formatCost(value: number) {
  return `K${value.toFixed(0)}`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <div className="bg-[#FFF3E8] text-[#FF9500] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-[#FF9500]/20">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" /> Upcoming
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className="bg-border/50 text-muted-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
        Completed
      </div>
    );
  }
  if (status === "saved") {
    return (
      <div className="bg-[#FFF3E8] text-[#FF9500] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#FF9500]/20">
        Saved
      </div>
    );
  }
  return (
    <div className="bg-border/50 text-muted-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
      Draft
    </div>
  );
}

export default function Screen10PlanDetail({ plan, stops }: { plan: Plan; stops: PlanStopWithVenue[] }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const totalEstimated = useMemo(() => stops.reduce((sum, stop) => sum + stop.estimated_cost, 0), [stops]);
  const budgetPct = Math.min(100, Math.round((totalEstimated / plan.estimated_cost) * 100));
  const underBudget = totalEstimated <= plan.estimated_cost;

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
            className="flex-1 rounded-xl border-2 border-border py-4 text-sm font-bold text-foreground active:scale-[0.98] transition-all"
            onClick={() => router.push(`/plans/${plan.id}/feedback`)}
          >
            View Feedback
          </button>
          <button
            type="button"
            className="flex-1 bg-primary text-primary-foreground rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all hover:bg-primary/90"
            onClick={() => router.push("/plans/generate")}
          >
            Plan Again
          </button>
        </>
      );
    }

    return (
      <>
        <button
          type="button"
          className="w-14 h-14 rounded-xl border-2 border-border flex items-center justify-center text-foreground active:scale-95 transition-transform hover:bg-background"
          onClick={() => router.push(`/plans/${plan.id}/execute`)}
        >
          <Map size={24} />
        </button>
        <button
          type="button"
          className="flex-1 bg-primary text-primary-foreground rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all disabled:opacity-60 hover:bg-primary/90"
          disabled={isUpdating}
          onClick={() => updateStatus("active", `/plans/${plan.id}/execute`)}
        >
          Let&apos;s Go! &rarr;
        </button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky header */}
      <div className="bg-card px-6 pt-14 pb-6 shadow-sm z-10 sticky top-0 border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={() => router.push("/plans")}
            className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-foreground active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
          <StatusBadge status={plan.status} />
          <button
            type="button"
            className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-foreground active:scale-95 transition-transform"
          >
            <Share2 size={18} />
          </button>
        </div>
        <h1 className="text-[28px] font-bold text-foreground leading-tight mb-2">{plan.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5"><Clock size={16} /> {plan.occasion ?? "Tonight"}</span>
        </div>
      </div>

      <div className="px-6 py-6 pb-28">
        {/* Itinerary */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Itinerary</h2>
          <button
            type="button"
            onClick={() => router.push(`/plans/${plan.id}/edit`)}
            className="text-primary font-semibold text-sm flex items-center gap-1 hover:opacity-80"
          >
            <Edit3 size={14} /> Edit Plan
          </button>
        </div>

        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border mb-8">
          <div className="flex flex-col gap-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-background before:content-['']">
            {stops.map((stop, index) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => router.push(`/venues/${stop.venue_id}`)}
                className="flex gap-4 relative z-10 text-left w-full"
              >
                <div className="w-10 h-10 rounded-full bg-foreground text-card border-2 border-card flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-foreground text-[16px]">{stop.venue_name}</h3>
                    <span className="font-bold text-[#00C851]">{formatCost(stop.estimated_cost)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="bg-background px-2 py-0.5 rounded text-xs font-semibold text-foreground">{stop.time_slot}</span>
                    <span>·</span>
                    <span>{stop.activity_type ?? "Experience"}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cost Review */}
        <h2 className="text-xl font-bold text-foreground mb-4">Cost Review</h2>
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border mb-6">
          {stops.map((stop) => (
            <div key={stop.id} className="flex justify-between text-[15px] mb-3">
              <span className="text-muted-foreground font-medium">{stop.venue_name}</span>
              <span className="font-semibold text-foreground">{formatCost(stop.estimated_cost)}</span>
            </div>
          ))}

          <div className="border-t border-border pt-4 mb-5 mt-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground text-[17px]">Total Estimate</span>
              <span className="font-bold text-2xl text-foreground">{formatCost(totalEstimated)}</span>
            </div>
          </div>

          {/* Budget bar */}
          <div className="bg-background p-4 rounded-xl border border-border/50">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className={`flex items-center gap-1 ${underBudget ? "text-[#00C851]" : "text-primary"}`}>
                <div className={`w-2 h-2 rounded-full ${underBudget ? "bg-[#00C851]" : "bg-primary"}`} />
                {underBudget ? "Under Budget" : "Over Budget"}
              </span>
              <span className="text-muted-foreground">Target: {formatCost(plan.estimated_cost)}</span>
            </div>
            <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${underBudget ? "bg-[#00C851]" : "bg-primary"}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-6 flex gap-4 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        {renderActions()}
      </div>
    </div>
  );
}
