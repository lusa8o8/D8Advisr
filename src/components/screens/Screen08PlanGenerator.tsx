"use client"

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const OCCASION_OPTIONS = [
  "Date Night",
  "First Date",
  "Anniversary",
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

const ANIM_MESSAGES = [
  "Reading your vibe...",
  "Scouting the best spots...",
  "Crafting your evening...",
  "Almost ready...",
];

const PATH_8 = "M 28,45 C 10,45 10,4 28,4 C 46,4 46,45 28,45 C 10,45 10,86 28,86 C 46,86 46,45 28,45";

function D8LoadingOverlay() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [msgKey, setMsgKey] = useState(0);

  useEffect(() => {
    const cycle = setInterval(() => {
      setMsgIdx((i) => (i + 1) % ANIM_MESSAGES.length);
      setMsgKey((k) => k + 1);
    }, 1100);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: "#141414" }}>
      <style>{`
        @keyframes d8-trace { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -100; } }
        @keyframes d8-msg { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes d8-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes d8-glow { 0%, 100% { opacity: 0.08; transform: scale(1); } 50% { opacity: 0.18; transform: scale(1.12); } }
      `}</style>

      <div className="absolute rounded-full" style={{ width: 220, height: 220, background: "radial-gradient(circle, rgba(255,90,95,0.5) 0%, transparent 70%)", animation: "d8-glow 2.4s ease-in-out infinite" }} />

      <div className="absolute" style={{ animation: "d8-ring 8s linear infinite" }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(255,90,95,0.12)" strokeWidth="1" strokeDasharray="4 8" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative flex items-end gap-0.5" style={{ marginBottom: 40 }}>
        <span style={{ fontSize: 84, fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-3px" }}>D</span>
        <svg viewBox="0 0 56 90" width="55" height="83" style={{ overflow: "visible", marginBottom: 1 }}>
          <path d={PATH_8} fill="none" stroke="rgba(255,90,95,0.10)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={PATH_8} pathLength="100" fill="none" stroke="#FF5A5F" strokeWidth="13" strokeOpacity="0.18" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="25 75" style={{ animation: "d8-trace 1.8s linear infinite" }} />
          <path d={PATH_8} pathLength="100" fill="none" stroke="#FF5A5F" strokeWidth="8" strokeOpacity="0.35" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22 78" style={{ animation: "d8-trace 1.8s linear infinite" }} />
          <path d={PATH_8} pathLength="100" fill="none" stroke="#FF5A5F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="18 82" style={{ animation: "d8-trace 1.8s linear infinite", filter: "drop-shadow(0 0 5px rgba(255,90,95,1)) drop-shadow(0 0 10px rgba(255,90,95,0.7))" }} />
        </svg>
      </div>

      <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 22 }} />

      <div style={{ height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p key={msgKey} style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: "0.025em", animation: "d8-msg 0.4s ease-out forwards", margin: 0 }}>
          {ANIM_MESSAGES[msgIdx]}
        </p>
      </div>

      <div style={{ display: "flex", gap: 5, marginTop: 18 }}>
        {ANIM_MESSAGES.map((_, i) => (
          <div key={i} style={{ height: 5, borderRadius: 3, background: i === msgIdx ? "#FF5A5F" : "rgba(255,255,255,0.12)", width: i === msgIdx ? 22 : 5, transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: i === msgIdx ? "0 0 8px rgba(255,90,95,0.6)" : "none" }} />
        ))}
      </div>
    </div>
  );
}

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
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("mode") === "group") {
      setPlanType("group");
    }
  }, [searchParams]);

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

  const canGenerate = useMemo(() => budget > 0 && !isLoading, [budget, isLoading]);

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
    if (!canGenerate) return;

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

      router.push(`/plans/${payload.plan_id}/overview`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate plan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      {/* CHANGE 4: Sticky white header with Sparkles */}
      <div className="px-6 pt-14 pb-8 bg-white shadow-sm rounded-b-3xl sticky top-0 z-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#555555] mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        {searchParams.get("venue_name") && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFF0F1] border border-[#FFD0D1] rounded-full mb-4">
            <span className="text-[11px] font-bold text-[#FF5A5F] uppercase tracking-wider">Building around</span>
            <span className="text-[12px] font-bold text-[#222222]">{searchParams.get("venue_name")}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-[#FF5A5F]" size={28} />
          <h1 className="text-[28px] font-bold text-[#222222]">Build Your Plan</h1>
        </div>

        {/* CHANGE 5: Toggle pill style */}
        <div className="bg-[#F7F7F7] p-1 rounded-xl flex mb-6">
          <button
            type="button"
            onClick={() => setPlanType("date")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              planType === "date"
                ? "bg-white shadow-sm text-[#222222]"
                : "text-[#555555]"
            }`}
          >
            Solo / Date
          </button>
          <button
            type="button"
            onClick={() => setPlanType("group")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              planType === "group"
                ? "bg-white shadow-sm text-[#222222]"
                : "text-[#555555]"
            }`}
          >
            Group
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
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
          <p className="text-sm font-semibold text-[#222222]">Vibe / Mood</p>
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
          className="mt-4 flex items-center justify-center rounded-2xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 active:scale-[0.98] transition-all"
        >
          {isLoading ? "🤔 Finding the perfect plan..." : "Generate My Plan ✨"}
        </button>
      </div>

      {isLoading && <D8LoadingOverlay />}
    </div>
  );
}
