"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookmarkPlus, Car, Check, ChevronRight, Clock, Footprints, MapPin, RotateCcw, Share2, Sparkles, Wallet } from "lucide-react";
import type { Plan, PlanItem } from "@/types/database";

export type StopWithVenue = PlanItem & {
  venue_name: string;
};

type Screen09PlanOverviewProps = {
  plan: Plan;
  stops: StopWithVenue[];
  plannerNote?: string;
};

const STOP_GRADIENTS = [
  "from-rose-400 to-red-500",
  "from-amber-400 to-orange-500",
  "from-purple-500 to-indigo-600",
  "from-emerald-400 to-teal-500",
];

const STOP_EMOJIS = ["🍸", "🍽️", "🌙", "🎯"];
const STASH_PCT = 45;

export default function Screen09PlanOverview({
  plan,
  stops,
  plannerNote,
}: Screen09PlanOverviewProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const savePlan = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/plans/${plan.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "saved" }),
      });
      if (!response.ok) throw new Error("Unable to update status.");
      router.push(`/plans/${plan.id}`);
    } catch {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Dark hero */}
      <div className="relative bg-[#141414] px-6 pt-14 pb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl -ml-16 -mb-8 pointer-events-none" />

        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-14 left-6 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-transform z-10"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#FF9500] flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(255,90,95,0.5)] mb-5">
            <Sparkles size={28} className="text-white" />
          </div>
          <p className="text-white/50 text-[12px] font-bold uppercase tracking-widest mb-1">Your evening is planned</p>
          <h1 className="text-white font-black text-[26px] leading-tight mb-3">{plan.title}</h1>
          <div className="flex items-center gap-4 text-white/60 text-[12px] font-semibold">
            <span className="flex items-center gap-1.5"><Clock size={12} /> {plan.occasion ?? "Tonight"}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5"><MapPin size={12} /> Lusaka</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>{stops.length} stops</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 -mt-4 relative">
        {stops.map((stop, idx) => (
          <div key={stop.id}>
            <button
              type="button"
              onClick={() => router.push(`/venues/${stop.venue_id}`)}
              className="w-full bg-card rounded-3xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform mb-0 text-left border border-border"
            >
              {/* Gradient strip */}
              <div className={`h-28 relative overflow-hidden bg-gradient-to-br ${STOP_GRADIENTS[idx % STOP_GRADIENTS.length]}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute top-3 left-4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <span className="text-[12px] font-black text-gray-900">{idx + 1}</span>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {stop.time_slot}
                  </div>
                </div>
                <span className="absolute bottom-3 left-4 text-2xl drop-shadow-md">{STOP_EMOJIS[idx % STOP_EMOJIS.length]}</span>
              </div>

              {/* Body */}
              <div className="px-4 py-3.5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{stop.activity_type}</p>
                  <p className="font-bold text-foreground text-[15px] leading-tight truncate">{stop.venue_name}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">~{stop.estimated_time_minutes} min</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-black text-foreground text-[16px] leading-tight">K{stop.estimated_cost.toFixed(0)}</p>
                    <p className="text-[10px] text-muted-foreground">per person</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </div>
            </button>

            {/* Transport connector */}
            {idx < stops.length - 1 && (
              <div className="flex items-center gap-3 py-3 px-5">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-px h-2 bg-border" />
                  <div className="w-7 h-7 rounded-full bg-card border border-border shadow-sm flex items-center justify-center shrink-0">
                    {idx % 2 === 0
                      ? <Car size={13} className="text-blue-500" />
                      : <Footprints size={13} className="text-[#00C851]" />}
                  </div>
                  <div className="w-px h-2 bg-border" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold text-foreground">
                      {idx % 2 === 0 ? "Yango · est." : "Walk"} · ~5 min
                    </p>
                    <p className="text-[11px] text-muted-foreground">{stops[idx + 1].venue_name}</p>
                  </div>
                  <span className="text-[12px] font-bold text-muted-foreground">
                    {idx % 2 === 0 ? "~K50" : "Free"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cost breakdown */}
      <div className="mx-4 mt-2 bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost Breakdown · Per Person</p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {stops.map((stop, idx) => (
            <div key={stop.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{STOP_EMOJIS[idx % STOP_EMOJIS.length]}</span>
                <span className="text-[13px] font-semibold text-foreground">{stop.venue_name}</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">K{stop.estimated_cost.toFixed(0)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Car size={15} className="text-blue-400" />
              <span className="text-[13px] font-semibold text-foreground">Transport (est.)</span>
            </div>
            <span className="text-[13px] font-bold text-foreground">~K50</span>
          </div>
        </div>
        <div className="px-5 py-4 bg-background border-t border-border flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground text-[15px]">Total estimate</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">±10% depending on choices made</p>
          </div>
          <p className="font-black text-[22px] text-foreground">K{plan.estimated_cost.toFixed(0)}</p>
        </div>
      </div>

      {plannerNote && (
        <div className="mx-4 mt-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Planner Note</p>
          <p className="mt-2 text-sm italic text-muted-foreground">&ldquo;{plannerNote}&rdquo;</p>
        </div>
      )}

      {/* Stash CTA */}
      <div
        className="mx-4 mt-3 rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => router.push("/profile")}
      >
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shrink-0">
              <Wallet size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-[14px] leading-tight">Your Evening Fund</p>
              <p className="text-[12px] text-amber-700 font-medium">{STASH_PCT}% saved · K{Math.round(plan.estimated_cost * STASH_PCT / 100).toFixed(0)} of K{plan.estimated_cost.toFixed(0)}</p>
            </div>
            <ChevronRight size={16} className="text-amber-500 shrink-0" />
          </div>
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${STASH_PCT}%` }} />
          </div>
          <p className="text-[11px] text-amber-600 mt-1.5 font-medium">K{Math.round(plan.estimated_cost * (1 - STASH_PCT / 100)).toFixed(0)} more to cover this evening — keep going!</p>
        </div>
      </div>

      {/* Share nudge */}
      <div className="mx-4 mt-3">
        <button type="button" className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border bg-card text-muted-foreground font-semibold text-[13px] active:scale-[0.98] transition-transform hover:border-gray-300 shadow-sm">
          <Share2 size={15} /> Share this plan
        </button>
      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-4 bg-card border-t border-border shadow-[0_-10px_24px_rgba(0,0,0,0.05)] z-20">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/plans/generate")}
            className="w-14 h-14 rounded-2xl border-2 border-border flex items-center justify-center text-muted-foreground active:scale-95 transition-transform shrink-0 hover:border-gray-300"
          >
            <RotateCcw size={20} />
          </button>
          <button
            type="button"
            onClick={savePlan}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-[16px] transition-all active:scale-[0.98] bg-primary text-white shadow-[0_8px_20px_-6px_rgba(255,90,95,0.45)] hover:bg-primary/90 disabled:opacity-60"
          >
            {isUpdating
              ? <><Check size={20} strokeWidth={3} /> Saved!</>
              : <><BookmarkPlus size={20} /> Save This Plan</>}
          </button>
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-3">
          Tap <RotateCcw size={10} className="inline mx-0.5" /> to regenerate with the same vibe
        </p>
      </div>
    </div>
  );
}
