"use client"

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const OCCASION_OPTIONS = [
  "Birthday",
  "Anniversary",
  "First Date",
  "Casual Hangout",
  "Celebration",
  "Just Because",
];

const VIBE_OPTIONS = ["Romantic", "Fun", "Chill", "Adventurous", "Cultural", "Foodie"];

const GENERATING_MESSAGES = [
  "Checking Lusaka's best spots...",
  "Building your perfect evening...",
  "Almost ready...",
];

type Screen08PlanGeneratorProps = {
  initialVenueId?: string;
};

export default function Screen08PlanGenerator({ initialVenueId }: Screen08PlanGeneratorProps) {
  const router = useRouter();
  const [planType, setPlanType] = useState<"date" | "group">("date");
  const [budget, setBudget] = useState(500);
  const [groupSize, setGroupSize] = useState(2);
  const [whenText, setWhenText] = useState("");
  const [occasionSelection, setOccasionSelection] = useState<string[]>([]);
  const [vibeSelection, setVibeSelection] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
      interval = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % GENERATING_MESSAGES.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const canGenerate = useMemo(() => budget > 0 && (!isLoading), [budget, isLoading]);

  const toggleOccasion = (value: string) => {
    setOccasionSelection((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const toggleVibe = (value: string) => {
    setVibeSelection((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/plans/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: occasionSelection[0] ?? "Night Out",
          vibes: vibeSelection,
          budget,
          group_size: planType === "group" ? groupSize : 1,
          plan_type: planType,
          when_text: whenText,
          venue_id: initialVenueId,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not generate plan.");
      }

      router.push(`/plans/${payload.plan_id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate plan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#555555]"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div>
          <h1 className="text-3xl font-bold text-[#222222]">Generate a Plan</h1>
          <p className="text-sm text-[#555555]">Tell us what you're looking for</p>
        </div>

        <div className="flex gap-3">
          {["date", "group"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPlanType(type as "date" | "group")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
                planType === type
                  ? "bg-[#FF5A5F] text-white"
                  : "border border-[#E5E5E5] text-[#555555]"
              }`}
            >
              {type === "date" ? "Solo / Date" : "Group"}
            </button>
          ))}
        </div>

        <div className="space-y-2 rounded-2xl border border-[#E5E5E5] bg-white p-4">
          <p className="text-sm font-semibold text-[#222222]">Occasion</p>
          <div className="flex flex-wrap gap-2">
            {OCCASION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOccasion(option)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  occasionSelection.includes(option)
                    ? "bg-[#FF5A5F] text-white"
                    : "border border-[#E5E5E5] text-[#555555]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-[#E5E5E5] bg-white p-4">
          <p className="text-sm font-semibold text-[#222222]">Vibe</p>
          <div className="flex flex-wrap gap-2">
            {VIBE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleVibe(option)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  vibeSelection.includes(option)
                    ? "bg-[#FF5A5F] text-white"
                    : "border border-[#E5E5E5] text-[#555555]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-[#E5E5E5] bg-white p-4">
          <label className="text-sm font-semibold text-[#222222]">Budget (ZMW)</label>
          <input
            type="number"
            min={0}
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="w-full rounded-2xl border border-[#E5E5E5] px-3 py-2 text-base text-[#222222] outline-none focus:border-[#FF5A5F]"
          />
          <p className="text-xs text-[#555555]">
            Per person for solo/date, total for group
          </p>
        </div>

        {planType === "group" && (
          <div className="space-y-2 rounded-2xl border border-[#E5E5E5] bg-white p-4">
            <p className="text-sm font-semibold text-[#222222]">How many people?</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGroupSize((prev) => Math.max(prev - 1, 2))}
                className="rounded-full border border-[#E5E5E5] px-3 py-1 text-lg font-semibold text-[#555555]"
              >
                -
              </button>
              <span className="text-lg font-semibold text-[#222222]">{groupSize}</span>
              <button
                type="button"
                onClick={() => setGroupSize((prev) => Math.min(prev + 1, 20))}
                className="rounded-full border border-[#E5E5E5] px-3 py-1 text-lg font-semibold text-[#555555]"
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-2xl border border-[#E5E5E5] bg-white p-4">
          <label className="text-sm font-semibold text-[#222222]">When? (optional)</label>
          <input
            type="text"
            value={whenText}
            onChange={(event) => setWhenText(event.target.value)}
            placeholder="Tonight, This weekend, Saturday evening..."
            className="w-full rounded-2xl border border-[#E5E5E5] px-3 py-2 text-base text-[#222222] outline-none focus:border-[#FF5A5F]"
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="mt-4 flex items-center justify-center rounded-2xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? "🤔 Finding the perfect plan..." : "✨ Generate My Plan"}
        </button>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center">
            <Sparkles size={32} className="mx-auto text-[#FF5A5F]" />
            <p className="mt-4 text-sm font-semibold text-[#222222]">
              {GENERATING_MESSAGES[statusIndex]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
