"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/ui/PrimaryButton";
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
  { label: "Just Me", value: "just_me" },
  { label: "Partner", value: "partner" },
  { label: "Small Group (3-4)", value: "small_group" },
  { label: "Big Group (5+)", value: "big_group" },
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
  const [groupSize, setGroupSize] = useState(groupOptions[1].value);
  const [saving, setSaving] = useState(false);

  const toggleVibe = (label: string) => {
    setSelectedVibes((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    );
  };

  const handleContinue = async () => {
    if (!selectedVibes.length) return;
    setSaving(true);
    const payload: Database["public"]["Tables"]["user_preferences"]["Insert"] = {
      user_id: userId,
      activity_preferences: selectedVibes,
      budget_preference: budget,
      group_size_preference: groupSize,
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
    <div className="flex min-h-screen flex-col justify-between gap-6 bg-background px-6 py-8 text-text-secondary">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-sm font-semibold text-text-secondary transition hover:text-text-primary"
          >
            &larr; Back
          </button>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className={`h-2 w-2 rounded-full ${
                  dot === 0 ? "bg-[#FF5A5F]" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-text-primary">What do you love?</h1>
          <p className="text-sm text-text-secondary">
            Select a few vibes to help us curate the perfect dates for you.
          </p>
        </div>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-text-primary">Vibes</p>
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

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">Typical Budget</p>
            <span className="text-sm font-semibold text-text-primary">
              {currency} {budget === 500 ? "500+" : budget}
            </span>
          </div>
          <p className="text-xs text-text-secondary">Per night out</p>
          <input
            type="range"
            min={25}
            max={500}
            step={5}
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="w-full accent-[#FF5A5F]"
          />
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-text-primary">I usually go out with</p>
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

      <div className="sticky bottom-0 left-0 right-0 mx-auto w-full max-w-3xl rounded-t-3xl bg-[#F7F7F7] px-6 py-4">
        <PrimaryButton
          label="Continue →"
          onPress={handleContinue}
          disabled={!selectedVibes.length}
          loading={saving}
        />
      </div>
    </div>
  );
}
