"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import VibePill from "@/components/ui/VibePill";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

const vibeOptions = [
  "Foodie",
  "Outdoor",
  "Romantic",
  "Adventure",
  "Nightlife",
  "Cultural",
  "Sports",
  "Relaxing",
  "Live Music",
  "Coffee",
  "Artsy",
  "Casual",
];

const groupOptions = [
  { label: "Just Me", value: 1 },
  { label: "Partner", value: 2 },
  { label: "Small Group (3-4)", value: 3 },
  { label: "Big Group (5+)", value: 4 },
];

type Screen03PreferencesProps = {
  userId: string;
  currency: string;
};

export default function Screen03Preferences({
  userId,
  currency,
}: Screen03PreferencesProps) {
  const router = useRouter();
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [budget, setBudget] = useState(150);
  const [groupSize, setGroupSize] = useState<number>(groupOptions[1].value);
  const [loading, setSaving] = useState(false);

  const toggleVibe = (label: string) => {
    setSelectedVibes((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    );
  };

  const handleSubmit = async () => {
    if (!selectedVibes.length) return;
    setSaving(true);
    const payload: Database["public"]["Tables"]["user_preferences"]["Insert"] = {
      user_id: userId,
      activity_preferences: selectedVibes,
      budget_preference: budget,
      group_size_preference: groupSize,
      default_vibe: null,
      last_updated: new Date().toISOString(),
    };

    const { error } = await supabaseBrowserClient
      .from("user_preferences")
      .upsert(payload as any, { onConflict: "user_id" });

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Preferences saved");
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] overflow-y-auto pb-32">
      {/* CHANGE 1: Sticky header */}
      <div className="px-6 pt-14 pb-6 sticky top-0 bg-white z-20 border-b border-[#EBEBEB]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center text-[#222222] mb-6"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[32px] font-bold text-[#222222] leading-tight mb-2">
          What do you love?
        </h1>
        <p className="text-[#555555] text-[15px] leading-relaxed">
          Select a few vibes to help us curate the perfect experiences for you.
        </p>
      </div>

      {/* CHANGE 5: Content wrapper */}
      <div className="px-6 py-8 flex flex-col gap-8">

        {/* CHANGE 2: Vibes section */}
        <section>
          <h3 className="font-bold text-[#222222] text-[17px] mb-3">Favourite Vibes</h3>
          <div className="flex flex-wrap gap-2">
            {vibeOptions.map((vibe) => (
              <VibePill
                key={vibe}
                label={vibe}
                selected={selectedVibes.includes(vibe)}
                onToggle={() => toggleVibe(vibe)}
              />
            ))}
          </div>
        </section>

        {/* CHANGE 3: Budget slider card */}
        <div className="bg-white rounded-3xl p-6 border border-[#EBEBEB] shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-[#222222] text-[17px]">Typical Budget</h3>
              <p className="text-sm text-[#555555]">Per night out</p>
            </div>
            <span className="text-2xl font-bold text-[#FF5A5F]">K{budget}</span>
          </div>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-[#FF5A5F] h-2 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[#999999] font-medium mt-3">
            <span>K50</span>
            <span>K1000+</span>
          </div>
        </div>

        {/* CHANGE 2: Group size section */}
        <section>
          <h3 className="font-bold text-[#222222] text-[17px] mb-3">Group Size</h3>
          <div className="flex flex-wrap gap-2">
            {groupOptions.map((option) => (
              <VibePill
                key={option.value}
                label={option.label}
                selected={groupSize === option.value}
                onToggle={() => setGroupSize(option.value)}
              />
            ))}
          </div>
        </section>

      </div>

      {/* CHANGE 4: Fixed continue button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-6 pb-8 border-t border-[#EBEBEB] shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-30">
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedVibes.length}
          className="w-full bg-[#FF5A5F] text-white py-[18px] rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? "Saving..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}
