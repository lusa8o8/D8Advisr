"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Repeat } from "lucide-react";
import type { Plan, PlanItem } from "@/types/database";

export type StopWithVenue = PlanItem & {
  venue_name: string;
};

type Screen09PlanOverviewProps = {
  plan: Plan;
  stops: StopWithVenue[];
  plannerNote?: string;
};

export default function Screen09PlanOverview({
  plan,
  stops,
  plannerNote,
}: Screen09PlanOverviewProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6">
        <header>
          <p className="text-sm font-semibold text-[#222222]">✨ Your Plan is Ready!</p>
          <h1 className="text-2xl font-bold text-[#FF5A5F]">{plan.title}</h1>
        </header>

        <section className="space-y-4">
          {stops.map((stop) => (
            <article
              key={stop.id}
              className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF5A5F]/10 text-sm font-semibold text-[#FF5A5F]">
                    {stop.order_index}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-[#222222]">
                      {stop.venue_name}
                    </p>
                    <p className="text-xs text-[#555555]">{stop.activity_type}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#888888]" />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-[#555555]">
                <span>Time: {stop.time_slot}</span>
                <span>~{stop.estimated_time_minutes} mins</span>
                <span>K{stop.estimated_cost.toFixed(0)}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-3 rounded-2xl border border-[#E5E5E5] bg-white p-4">
          <p className="text-sm font-semibold text-[#222222]">Cost Breakdown</p>
          <div className="space-y-2">
            {stops.map((stop) => (
              <div key={stop.id} className="flex items-center justify-between text-sm">
                <span>{stop.venue_name}</span>
                <span className="font-semibold text-[#222222]">K{stop.estimated_cost.toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-dashed border-[#E5E5E5] pt-3">
            <p className="text-xs text-[#555555]">Total Estimated</p>
            <p className="text-lg font-semibold text-[#222222]">K{plan.estimated_cost.toFixed(0)}</p>
            <p className="text-xs text-[#888888]">Estimates based on average spend</p>
          </div>
        </section>

        {plannerNote && (
          <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
            <p className="text-sm font-semibold text-[#222222]">Planner Note</p>
            <p className="mt-2 text-sm italic text-[#555555]">"{plannerNote}"</p>
          </section>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={async () => {
              setIsUpdating(true);
              try {
                const response = await fetch(`/api/plans/${plan.id}/status`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "confirmed" }),
                });
                if (!response.ok) {
                  throw new Error("Unable to update status.");
                }
                router.push("/plans");
              } catch {
                setIsUpdating(false);
              }
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#00C851] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isUpdating}
          >
            <Check size={16} />
            Accept Plan
          </button>
          <button
            type="button"
            onClick={() => router.push("/plans/generate")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#FF5A5F] px-6 py-3 text-sm font-semibold text-[#FF5A5F]"
          >
            <Repeat size={16} />
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}
