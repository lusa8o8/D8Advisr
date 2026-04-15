"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Screen15PreferencesProps = {
  defaultVibes: string[];
  budget: number;
  groupSize: number;
  planId?: string;
};

const VIBES = ["Romantic", "Fun", "Chill", "Adventurous", "Cultural", "Foodie", "Nightlife", "Outdoors"];
const ACTIVITY_TYPES = ["Outdoors", "Live Music", "Museums", "Nightlife", "Workouts", "Food Tours", "Art & Culture", "Sports"];

export default function Screen15Preferences({ defaultVibes, budget, groupSize }: Screen15PreferencesProps) {
  const router = useRouter();
  const [selectedVibes, setSelectedVibes] = useState<string[]>(defaultVibes);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>(["Live Music", "Outdoors"]);
  const [currentBudget, setCurrentBudget] = useState(budget ?? 150);
  const [currentGroupSize, setCurrentGroupSize] = useState(groupSize);
  const [isSaving, setIsSaving] = useState(false);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((current) =>
      current.includes(vibe) ? current.filter((item) => item !== vibe) : [...current, vibe]
    );
  };

  const toggleActivityType = (type: string) => {
    setSelectedActivityTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
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
    <div className="min-h-screen bg-background flex flex-col pb-28">
      {/* Sticky header */}
      <div className="bg-card px-6 pt-14 pb-4 flex justify-between items-center sticky top-0 z-20 shadow-sm border-b border-border">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-foreground text-lg">My Preferences</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 py-8 flex flex-col gap-10">
        <p className="text-muted-foreground text-[15px] font-medium leading-relaxed">
          Update your preferences so D8Advisr can generate perfectly tailored plans.
        </p>

        {/* Activity Types */}
        <div>
          <h3 className="font-bold text-foreground mb-4 text-[16px]">Activity Types</h3>
          <div className="flex flex-wrap gap-2.5">
            {ACTIVITY_TYPES.map((type) => {
              const selected = selectedActivityTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleActivityType(type)}
                  className={cn(
                    "px-4 py-2.5 rounded-full font-semibold text-sm transition-all",
                    selected
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 border border-primary"
                      : "bg-card text-muted-foreground border border-border"
                  )}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vibes */}
        <div>
          <h3 className="font-bold text-foreground mb-4 text-[16px]">Favourite Vibes</h3>
          <div className="flex flex-wrap gap-2.5">
            {VIBES.map((vibe) => {
              const selected = selectedVibes.includes(vibe);
              return (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => toggleVibe(vibe)}
                  className={cn(
                    "px-4 py-2.5 rounded-full font-semibold text-sm transition-all",
                    selected
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 border border-primary"
                      : "bg-card text-muted-foreground border border-border"
                  )}
                >
                  {vibe}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget slider */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-foreground text-[16px]">Default Budget</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Per person, per outing</p>
            </div>
            <span className="text-xl font-bold text-primary">K{currentBudget}</span>
          </div>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={currentBudget}
            onChange={(e) => setCurrentBudget(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-background rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-medium mt-3">
            <span>K50</span>
            <span>K1000+</span>
          </div>
        </div>

        {/* Veg / Vegan toggle */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-bold text-foreground text-[16px] mb-1">Vegetarian / Vegan</h3>
            <p className="text-xs text-muted-foreground">Only show meat-free options</p>
          </div>
          <div className="w-12 h-7 bg-border rounded-full relative cursor-pointer">
            <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm" />
          </div>
        </div>

        {/* Group size */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
          <h3 className="font-bold text-foreground text-[16px] mb-4">Typical Group Size</h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentGroupSize((prev) => Math.max(prev - 1, 1))}
              className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center text-foreground font-bold text-lg"
            >
              −
            </button>
            <span className="text-2xl font-bold text-foreground w-8 text-center">{currentGroupSize}</span>
            <button
              type="button"
              onClick={() => setCurrentGroupSize((prev) => Math.min(prev + 1, 20))}
              className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center text-foreground font-bold text-lg"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-6 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-30">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary text-primary-foreground py-[18px] rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-60"
        >
          <Save size={20} />
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
