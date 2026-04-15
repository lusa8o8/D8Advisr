"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, Navigation, Phone, Share } from "lucide-react";
import type { Plan, PlanItem } from "@/types/database";

type ExecutionStop = PlanItem & {
  venue_name: string;
  venue?: {
    address: string | null;
  };
};

type Screen12ExecutionTrackerProps = {
  plan: Plan;
  stops: ExecutionStop[];
};

export default function Screen12ExecutionTracker({ plan, stops }: Screen12ExecutionTrackerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const currentStop = stops[currentIndex];
  const totalStops = stops.length;

  // kept for potential future use
  const _progressSteps = useMemo(
    () => stops.map((stop, index) => ({
      label: stop.venue_name,
      status: index < currentIndex ? "completed" : index === currentIndex ? "current" : "pending",
    })),
    [stops, currentIndex]
  );

  const markComplete = () => {
    if (currentIndex + 1 >= totalStops) {
      setShowModal(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const goToMaps = () => {
    const address = currentStop?.venue?.address ?? currentStop?.venue_name;
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, "_blank");
  };

  if (!currentStop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky header */}
      <div className="bg-card px-6 pt-14 pb-6 shadow-sm sticky top-0 z-20 border-b border-border">
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-foreground active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
            Step {currentIndex + 1} of {totalStops}
          </div>
          <div className="w-10" />
        </div>
        <h1 className="text-[28px] font-bold text-foreground leading-tight">You&apos;re on your date! 🗺️</h1>
      </div>

      <div className="px-6 py-8">
        {/* Progress tracker */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-border -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-4 h-1 bg-[#00C851] -translate-y-1/2 z-0 transition-all"
            style={{ width: currentIndex > 0 ? `${(currentIndex / (totalStops - 1)) * (100 - (8 / totalStops) * 100)}%` : "0%" }}
          />
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className={`flex items-center justify-center font-bold relative z-10 shadow-md transition-all
                ${index < currentIndex
                  ? "w-10 h-10 rounded-full bg-[#00C851] text-white"
                  : index === currentIndex
                  ? "w-12 h-12 rounded-full bg-primary text-white shadow-[0_0_0_4px_rgba(255,90,95,0.2)]"
                  : "w-10 h-10 rounded-full bg-card border-2 border-border text-muted-foreground"
                }`}
            >
              {index < currentIndex ? <Check size={20} strokeWidth={3} /> : index + 1}
            </div>
          ))}
        </div>

        {/* Current stop card */}
        <div className="bg-card rounded-3xl p-6 shadow-lg border border-border mb-6">
          <div className="bg-primary/5 text-primary w-max px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-primary/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> IN PROGRESS
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">{currentStop.venue_name}</h2>
          <p className="text-muted-foreground font-medium mb-6">
            {currentStop.time_slot}
            {currentStop.estimated_time_minutes ? ` · ${currentStop.estimated_time_minutes} min` : ""}
          </p>

          <div className="bg-background rounded-2xl p-4 flex items-center gap-4 mb-6 border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
              <Navigation size={24} />
            </div>
            <div>
              <p className="font-bold text-foreground text-[15px]">Navigation active</p>
              <p className="text-sm text-muted-foreground">
                {currentStop.venue?.address ?? "Getting directions…"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={goToMaps}
              className="flex-1 rounded-xl border-2 border-primary px-4 py-3.5 text-sm font-bold text-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              🗺️ Directions
            </button>
            <button
              type="button"
              onClick={markComplete}
              className="flex-1 bg-[#00C851] text-white rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(0,200,81,0.5)] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              Mark Complete <Check size={18} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Up Next preview */}
        {currentIndex + 1 < totalStops && (
          <div className="bg-background rounded-2xl p-5 border border-dashed border-border flex items-center justify-between opacity-80">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Up Next ({stops[currentIndex + 1].time_slot})
              </p>
              <h3 className="font-bold text-foreground">{stops[currentIndex + 1].venue_name}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center text-lg">
              →
            </div>
          </div>
        )}
      </div>

      {/* Quick actions footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 pb-8 z-20">
        <div className="flex justify-around px-2">
          <button type="button" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center text-foreground group-hover:bg-border/50 transition-colors">
              <Phone size={22} />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">Call Venue</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center text-foreground group-hover:bg-border/50 transition-colors">
              <Share size={22} />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">Share Live</span>
          </button>
          <button type="button" className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-[#FFF3E8] border border-[#FF9500]/20 flex items-center justify-center text-[#FF9500] group-hover:bg-[#ffe6cc] transition-colors">
              <AlertCircle size={22} />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">Get Help</span>
          </button>
        </div>
      </div>

      {/* Completion modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4 z-50">
          <div className="rounded-3xl bg-card p-8 text-center shadow-2xl w-full max-w-sm border border-border">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-2xl font-bold text-foreground mb-2">You did it!</p>
            <p className="text-sm text-muted-foreground mb-6">How was your experience?</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => router.push(`/plans/${plan.id}/feedback`)}
                className="rounded-xl bg-primary text-primary-foreground px-4 py-3.5 font-bold hover:bg-primary/90 transition-colors"
              >
                Leave Feedback
              </button>
              <button
                type="button"
                onClick={() => router.push("/plans")}
                className="rounded-xl border border-border px-4 py-3.5 font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
