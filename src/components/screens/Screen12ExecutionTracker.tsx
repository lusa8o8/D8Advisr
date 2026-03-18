"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, Phone, Share } from "lucide-react";
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
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      {/* CHANGE 2: Sticky white header */}
      <div className="bg-white px-6 pt-14 pb-6 shadow-sm sticky top-0 z-20 border-b border-[#EBEBEB]">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center text-[#222222]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-sm font-bold text-[#555555] tracking-wider uppercase">
            Stop {currentIndex + 1} of {totalStops}
          </div>
          <div className="w-10"></div>
        </div>
        <h1 className="text-[28px] font-bold text-[#222222] leading-tight">
          You're on your date! 🗺️
        </h1>
      </div>

      {/* CHANGE 3: Progress tracker with connecting line */}
      <div className="flex justify-between items-center mb-8 relative px-6 pt-6">
        <div className="absolute top-[50%] left-10 right-10 h-1 bg-[#EBEBEB] -translate-y-1/2 z-0"></div>
        <div
          className="absolute top-[50%] left-10 h-1 bg-[#00C851] -translate-y-1/2 z-0 transition-all"
          style={{ width: currentIndex > 0 ? "50%" : "0%" }}
        ></div>
        {stops.map((stop, index) => (
          <div
            key={stop.id}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold relative z-10 shadow-md
              ${index < currentIndex
                ? "bg-[#00C851] text-white"
                : index === currentIndex
                ? "bg-[#FF5A5F] text-white shadow-[0_0_0_4px_rgba(255,90,95,0.2)]"
                : "bg-white border-2 border-[#EBEBEB] text-[#999999]"
              }`}
          >
            {index < currentIndex ? <Check size={20} strokeWidth={3} /> : index + 1}
          </div>
        ))}
      </div>

      {/* CHANGE 4: Current stop card — light theme */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#EBEBEB] mx-6 mb-6">
        <div className="bg-[#FFF0F1] text-[#FF5A5F] w-max px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-[#FF5A5F]/10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-pulse"></span>
          IN PROGRESS
        </div>
        <h2 className="text-2xl font-bold text-[#222222]">{currentStop.venue_name}</h2>
        <p className="text-[#555555] text-sm mt-1">{currentStop.activity_type}</p>
        <p className="text-[#555555] text-sm">{currentStop.time_slot}</p>
        {currentStop.venue?.address && (
          <p className="text-xs text-[#888888] mt-1">{currentStop.venue.address}</p>
        )}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={goToMaps}
            className="flex-1 rounded-xl border-2 border-[#FF5A5F] px-4 py-3 text-sm font-semibold text-[#FF5A5F] flex items-center justify-center gap-2"
          >
            🗺️ Directions
          </button>
          <button
            type="button"
            onClick={markComplete}
            className="flex-1 rounded-xl bg-[#00C851] px-4 py-3 text-sm font-semibold text-white"
          >
            Mark Complete
          </button>
        </div>
      </div>

      {/* CHANGE 5: Up Next preview */}
      {currentIndex + 1 < totalStops && (
        <div className="mx-6 bg-[#F7F7F7] rounded-2xl p-5 border border-dashed border-[#EBEBEB] flex items-center justify-between opacity-80">
          <div>
            <p className="text-xs font-bold text-[#999999] uppercase tracking-wider mb-1">Up Next</p>
            <h3 className="font-bold text-[#222222]">{stops[currentIndex + 1].venue_name}</h3>
            <p className="text-sm text-[#555555]">{stops[currentIndex + 1].time_slot}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg">
            →
          </div>
        </div>
      )}

      {/* CHANGE 6: Fixed footer quick actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] p-4 pb-8 z-20">
        <div className="flex justify-around px-2">
          <button className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-center text-[#222222]">
              <Phone size={22} />
            </div>
            <span className="text-[11px] font-semibold text-[#555555]">Call Venue</span>
          </button>
          <button className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-center text-[#222222]">
              <Share size={22} />
            </div>
            <span className="text-[11px] font-semibold text-[#555555]">Share Live</span>
          </button>
          <button className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[#FFF3E8] border border-[#FF9500]/20 flex items-center justify-center text-[#FF9500]">
              <AlertCircle size={22} />
            </div>
            <span className="text-[11px] font-semibold text-[#555555]">Get Help</span>
          </button>
        </div>
      </div>

      {/* CHANGE 7: Completion modal — light theme */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4 z-50">
          <div className="rounded-3xl bg-white p-8 text-center text-[#222222] shadow-2xl w-full max-w-sm">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-2xl font-bold text-[#222222] mb-2">You did it!</p>
            <p className="text-sm text-[#555555] mb-6">How was your experience?</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => router.push(`/plans/${plan.id}/feedback`)}
                className="rounded-xl bg-[#FF5A5F] px-4 py-3 text-sm font-semibold text-white"
              >
                Leave Feedback
              </button>
              <button
                type="button"
                onClick={() => router.push("/plans")}
                className="rounded-xl border border-[#EBEBEB] px-4 py-3 text-sm font-semibold text-[#888888]"
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
