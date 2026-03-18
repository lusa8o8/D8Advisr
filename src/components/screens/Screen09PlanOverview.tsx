"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Check, ChevronRight, MapPin, Repeat } from "lucide-react";
import type { Plan, PlanItem } from "@/types/database";

export type StopWithVenue = PlanItem & {
  venue_name: string;
};

type Screen09PlanOverviewProps = {
  plan: Plan;
  stops: StopWithVenue[];
  plannerNote?: string;
};

const STOP_COLORS = [
  "bg-[#FFF0F1]",
  "bg-[#F0F8FF]",
  "bg-[#FFFBEB]",
];

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
        {/* CHANGE 1 + 2: Green hero with emoji circle */}
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-[#00C851]/10 text-[#00C851] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-[#00C851]">Your Plan is Ready!</h1>
          <p className="text-sm text-[#555555] mt-1">We've curated the perfect evening.</p>
        </div>

        <header>
          <p className="text-sm font-semibold text-[#222222]">Your Plan Overview</p>
          <h1 className="text-2xl font-bold text-[#FF5A5F]">{plan.title}</h1>
          {/* CHANGE 3: Metadata row */}
          <div className="flex items-center gap-3 text-sm text-[#555555] font-medium mt-1">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {plan.occasion ?? "Tonight"}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#D1D1D1]"></span>
            <span className="flex items-center gap-1">
              <MapPin size={14} /> Lusaka
            </span>
          </div>
        </header>

        {/* CHANGE 4 + 5: Timeline line + colored stop circles */}
        <section>
          <div className="flex flex-col gap-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#EBEBEB]">
            {stops.map((stop, index) => (
              <article
                key={stop.id}
                className="relative z-10 rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-sm text-xl font-semibold text-[#222222] shrink-0 ${STOP_COLORS[index % STOP_COLORS.length]}`}>
                      {stop.order_index + 1}
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
          </div>
        </section>

        {/* CHANGE 6: Cost section */}
        <section className="space-y-3 rounded-2xl border border-[#E5E5E5] bg-white p-4">
          <p className="text-sm font-semibold text-[#222222]">Estimated Total</p>
          <div className="space-y-2">
            {stops.map((stop) => (
              <div key={stop.id} className="flex items-center justify-between text-sm">
                <span>{stop.venue_name}</span>
                <span className="font-semibold text-[#222222]">K{stop.estimated_cost.toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#EBEBEB]">
            <span className="font-semibold text-[#555555]">Estimated Total</span>
            <span className="font-bold text-2xl text-[#222222]">K{plan.estimated_cost.toFixed(0)}</span>
          </div>
        </section>

        {plannerNote && (
          <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
            <p className="text-sm font-semibold text-[#222222]">Planner Note</p>
            <p className="mt-2 text-sm italic text-[#555555]">"{plannerNote}"</p>
          </section>
        )}

        <div className="space-y-3 w-full">
          <button
            type="button"
            onClick={async () => {
              setIsUpdating(true);
              try {
                const response = await fetch(`/api/plans/${plan.id}/status`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "saved" }),
                });
                if (!response.ok) {
                  throw new Error("Unable to update status.");
                }
                router.push(`/plans/${plan.id}`);
              } catch {
                setIsUpdating(false);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00C851] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isUpdating}
          >
            <Check size={16} />
            Accept Plan ✓
          </button>
          <button
            type="button"
            onClick={() => router.push(`/plans/${plan.id}/edit`)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#FF5A5F] px-6 py-3 text-sm font-semibold text-[#FF5A5F]"
          >
            <Repeat size={16} />
            Tweak Plan
          </button>
          <button
            type="button"
            onClick={() => router.push("/plans/generate")}
            className="text-sm text-[#555555] text-center w-full py-2"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
