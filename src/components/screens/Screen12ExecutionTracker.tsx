"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
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

  const progressSteps = useMemo(
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
    <div className="min-h-screen bg-[#222222] pb-32 text-white">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <header className="space-y-1">
          <p className="text-sm text-white/70">You're on your date! ???</p>
          <h1 className="text-3xl font-bold text-[#FF5A5F]">{plan.title}</h1>
        </header>

        <div className="flex items-center gap-2">
          {progressSteps.map((step, index) => (
            <div
              key={step.label}
              className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                step.status === "completed"
                  ? "border-[#00C851] bg-[#00C851]"
                  : step.status === "current"
                  ? "border-[#FF5A5F]"
                  : "border-white/30"
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <section className="rounded-2xl bg-white p-4 text-[#222222] shadow-lg">
          <p className="text-xs text-[#555]">Current Stop</p>
          <h2 className="text-xl font-bold">{currentStop.venue_name}</h2>
          <p className="text-sm text-[#555]">{currentStop.activity_type}</p>
          <p className="text-sm text-[#555]">{currentStop.time_slot}</p>
          <p className="text-xs text-[#888]">{currentStop.venue?.address}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={goToMaps}
              className="flex-1 rounded-xl border border-[#FF5A5F] px-4 py-3 text-sm font-semibold text-[#FF5A5F]"
            >
              ?? Directions
            </button>
            <button
              type="button"
              onClick={markComplete}
              className="flex-1 rounded-xl bg-[#00C851] px-4 py-3 text-sm font-semibold text-white"
            >
              ? Mark Complete
            </button>
          </div>
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4">
          <div className="rounded-2xl bg-white p-6 text-center text-[#222222]">
            <p className="text-2xl font-bold">?? You did it!</p>
            <p className="mt-2 text-sm text-[#555]">How was your experience?</p>
            <div className="mt-4 flex flex-col gap-3">
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
                className="rounded-xl border border-[#888] px-4 py-3 text-sm font-semibold text-[#888888]"
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


