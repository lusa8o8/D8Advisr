"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-background flex flex-col pb-10">
      {/* Sticky header */}
      <div className="bg-card px-6 pt-14 pb-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm border-b border-border">
        <button
          type="button"
          onClick={() => router.push("/plans")}
          className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-foreground text-lg">Create Group Plan</h1>
      </div>

      <div className="px-6 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-[#E8F4FF] rounded-full mx-auto flex items-center justify-center text-blue-500 mb-4 shadow-sm border border-blue-100">
            <Users size={30} />
          </div>
          <h2 className="text-[28px] font-extrabold text-foreground leading-tight">
            Planning something together?
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {/* Event name */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Event / Group Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah's Birthday Bash"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground font-semibold focus:outline-none focus:border-primary shadow-sm"
            />
          </div>

          {/* Who's coming */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
              Who's coming?
            </label>
            <div className="flex items-center gap-1 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center border-2 border-white shadow-sm z-10 relative text-sm">
                You
              </div>
              {participantCount > 1 && (
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center border-2 border-white shadow-sm z-20 relative -ml-3 text-sm">
                  +{participantCount - 1}
                </div>
              )}
              <button
                type="button"
                onClick={() => setParticipantCount((prev) => Math.min(prev + 1, 50))}
                className="w-12 h-12 rounded-full bg-background border-2 border-dashed border-gray-400 text-gray-500 font-bold flex items-center justify-center z-30 relative ml-2"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setParticipantCount((prev) => Math.max(prev - 1, 2))}
                className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center text-foreground font-bold"
              >
                −
              </button>
              <span className="text-lg font-bold text-foreground">{participantCount} people</span>
              <button
                type="button"
                onClick={() => setParticipantCount((prev) => Math.min(prev + 1, 50))}
                className="w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center text-foreground font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Occasion */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
              Occasion
            </label>
            <div className="flex flex-wrap gap-2.5">
              {OCCASIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOccasion(item)}
                  className={cn(
                    "px-5 py-3 rounded-full text-sm font-semibold transition-all active:scale-95",
                    occasion === item
                      ? "bg-foreground text-card shadow-md"
                      : "bg-card border border-border text-foreground shadow-sm"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Vibe */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
              Group Vibe
            </label>
            <div className="flex flex-wrap gap-2.5">
              {VIBES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setVibe(item)}
                  className={cn(
                    "px-5 py-3 rounded-full text-sm font-semibold transition-all active:scale-95",
                    vibe === item
                      ? "bg-foreground text-card shadow-md"
                      : "bg-card border border-border text-foreground shadow-sm"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Budget per person */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
              Budget / Person
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-bold">K</span>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-card border border-border rounded-xl pl-8 pr-4 py-4 text-foreground font-semibold focus:outline-none focus:border-primary shadow-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-[18px] rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.6)] active:scale-[0.98] transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? "Finding experiences..." : "Generate Group Plan ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}
