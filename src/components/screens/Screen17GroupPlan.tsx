"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Work Outing",
  "Farewell",
  "Just for Fun",
  "Other",
];

const VIBES = ["Fun", "Chill", "Adventurous", "Cultural", "Foodie", "Nightlife"];

export default function Screen17GroupPlan() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [participantCount, setParticipantCount] = useState(2);
  const [budget, setBudget] = useState(500);
  const [vibe, setVibe] = useState(VIBES[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/plans/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          vibes: [vibe],
          budget,
          group_size: participantCount,
          plan_type: "group",
          when_text: "this weekend",
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Unable to generate plan");
      }

      const data = await response.json();
      if (data.plan_id) {
        router.push(`/plans/${data.plan_id}/overview`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Plan generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <header>
          <button type="button" onClick={() => router.push("/plans")} className="text-sm font-semibold text-[#222222]">
            ← Back
          </button>
          <h1 className="mt-3 text-2xl font-bold text-[#222222]">Create Group Plan</h1>
        </header>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <label className="text-sm font-semibold text-[#222222]">Event Name</label>
          <input
            className="mt-2 w-full rounded-2xl border border-[#E5E5E5] px-3 py-2 text-sm"
            placeholder="Event name"
            value={eventName}
            onChange={(event) => setEventName(event.target.value)}
          />
        </section>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#222222]">Occasion</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {OCCASIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setOccasion(item)}
                className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                  occasion === item
                    ? "bg-[#FF5A5F] text-white"
                    : "border-[#E5E5E5] text-[#555555] bg-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm space-y-3">
          <label className="text-sm font-semibold text-[#222222]">Number of People</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setParticipantCount((prev) => Math.max(prev - 1, 2))}
              className="rounded-full border border-[#E5E5E5] px-3 py-1 text-sm"
            >
              -
            </button>
            <span className="text-lg font-semibold text-[#222222]">{participantCount}</span>
            <button
              type="button"
              onClick={() => setParticipantCount((prev) => Math.min(prev + 1, 50))}
              className="rounded-full border border-[#E5E5E5] px-3 py-1 text-sm"
            >
              +
            </button>
          </div>
          <label className="text-sm font-semibold text-[#222222]">Budget per Person (ZMW)</label>
          <input
            type="number"
            min={0}
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="mt-2 w-full rounded-2xl border border-[#E5E5E5] px-3 py-2 text-sm"
          />
        </section>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#222222]">Group Vibe</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VIBES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setVibe(item)}
                className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                  vibe === item
                    ? "bg-[#FF5A5F] text-white"
                    : "border-[#E5E5E5] text-[#555555] bg-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isLoading ? "Finding experiences..." : "Find Group Experiences"}
        </button>
      </div>
    </div>
  );
}
