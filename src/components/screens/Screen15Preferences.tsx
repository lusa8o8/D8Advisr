"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Screen15PreferencesProps = {
  defaultVibes: string[];
  budget: number;
  groupSize: number;
  planId?: string;
};

const VIBES = ["Romantic", "Fun", "Chill", "Adventurous", "Cultural", "Foodie", "Nightlife", "Outdoors"];

export default function Screen15Preferences({ defaultVibes, budget, groupSize }: Screen15PreferencesProps) {
  const router = useRouter();
  const [selectedVibes, setSelectedVibes] = useState<string[]>(defaultVibes);
  const [currentBudget, setCurrentBudget] = useState(budget);
  const [currentGroupSize, setCurrentGroupSize] = useState(groupSize);
  const [isSaving, setIsSaving] = useState(false);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((current) =>
      current.includes(vibe) ? current.filter((item) => item !== vibe) : [...current, vibe]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vibes: selectedVibes,
          budget: Number(currentBudget),
          groupSize: Number(currentGroupSize),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Unable to save preferences");
      }
      toast.success("Preferences saved!");
      router.push("/profile");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <button type="button" onClick={() => router.push("/profile")} className="text-sm font-semibold text-[#222222]">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-[#222222]">My Preferences</h1>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#222222]">Favourite Vibes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VIBES.map((vibe) => {
              const selected = selectedVibes.includes(vibe);
              return (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => toggleVibe(vibe)}
                  className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                    selected
                      ? "bg-[#FF5A5F] text-white"
                      : "border-[#E5E5E5] text-[#555555] bg-white"
                  }`}
                >
                  {vibe}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <label className="text-sm font-semibold text-[#222222]">Default Budget (ZMW)</label>
          <input
            type="number"
            className="mt-2 w-full rounded-2xl border border-[#E5E5E5] px-3 py-2 text-sm"
            value={currentBudget}
            min={0}
            onChange={(event) => setCurrentBudget(Number(event.target.value))}
          />
          <p className="text-xs text-[#888888]">Per person, per outing</p>
        </section>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <label className="text-sm font-semibold text-[#222222]">Typical Group Size</label>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentGroupSize((prev) => Math.max(prev - 1, 1))}
              className="rounded-full border border-[#E5E5E5] px-3 py-1 text-sm"
            >
              -
            </button>
            <span className="text-lg font-semibold text-[#222222]">{currentGroupSize}</span>
            <button
              type="button"
              onClick={() => setCurrentGroupSize((prev) => Math.min(prev + 1, 20))}
              className="rounded-full border border-[#E5E5E5] px-3 py-1 text-sm"
            >
              +
            </button>
          </div>
        </section>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
