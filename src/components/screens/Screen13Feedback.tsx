"use client"

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Plan, PlanItem } from "@/types/database";

const HIGHLIGHTS = [
  "Romantic",
  "Fun",
  "Would Return",
  "Worth the Price",
  "Great Service",
  "Perfect Timing",
  "Good Value",
];

type FeedbackStop = PlanItem & {
  venue_name: string;
};

type Screen13FeedbackProps = {
  plan: Plan;
  stops: FeedbackStop[];
};

const StarButton = ({ size, filled, onClick }: { size: number; filled: boolean; onClick: () => void }) => (
  <button
    type="button"
    className="text-transparent"
    aria-label="rating"
    onClick={onClick}
  >
    <span
      className="transition"
      style={{
        width: size,
        height: size,
        fontSize: size,
        color: filled ? "#FF9500" : "#E5E5E5",
      }}
    >
      ★
    </span>
  </button>
);

export default function Screen13Feedback({ plan, stops }: Screen13FeedbackProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [venueRatings, setVenueRatings] = useState<Record<string, number>>(
    stops.reduce((acc, stop) => ({ ...acc, [stop.venue_id]: 0 }), {})
  );
  const [highlights, setHighlights] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const actualCost = useMemo(
    () => stops.reduce((sum, stop) => sum + stop.estimated_cost, 0),
    [stops]
  );

  const toggleHighlight = (value: string) => {
    setHighlights((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const handleSubmit = async () => {
    if (!overallRating) return;
    setIsSaving(true);
    try {
      const venuePayload = stops.map((stop) => ({
        venue_id: stop.venue_id,
        quality: venueRatings[stop.venue_id] ?? 0,
        value: venueRatings[stop.venue_id] ?? 0,
        vibe: venueRatings[stop.venue_id] ?? 0,
      }));

      const response = await fetch(`/api/plans/${plan.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overall_rating: overallRating,
          venue_ratings: venuePayload,
          highlights,
          notes,
          actual_cost: actualCost,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Unable to submit feedback");
      }

      toast.success("Thanks for your feedback! 🎉");
      window.location.href = "/plans";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Feedback failed");
    } finally {
      setIsSaving(false);
    }
  };

  // CHANGE 3: Dynamic rating label
  const ratingLabel =
    overallRating === 0
      ? "Tap to rate"
      : overallRating === 5
      ? "Incredible!"
      : overallRating >= 3
      ? "Good"
      : "Could be better";

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-24">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <header>
          <p className="text-2xl font-bold text-[#222222]">How was it? ✨</p>
          <p className="text-sm text-[#555555]">{plan.title}</p>
        </header>

        {/* CHANGE 6: Overall rating wrapped in card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#EBEBEB] flex flex-col items-center mb-6">
          <p className="text-sm font-semibold text-[#222222] mb-2">Overall Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <StarButton
                key={value}
                size={40}
                filled={overallRating >= value}
                onClick={() => setOverallRating(value)}
              />
            ))}
          </div>
          {/* CHANGE 3: Dynamic label */}
          <p className="font-bold text-[#222222] text-lg mt-2">{ratingLabel}</p>
        </div>

        <section className="space-y-3">
          {stops.map((stop) => (
            <div key={stop.id} className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
              <p className="text-base font-semibold text-[#222222]">{stop.venue_name}</p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <StarButton
                    key={`${stop.id}-${value}`}
                    size={24}
                    filled={(venueRatings[stop.venue_id] ?? 0) >= value}
                    onClick={() =>
                      setVenueRatings((current) => ({ ...current, [stop.venue_id]: value }))
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* CHANGE 4: Selected highlight chip → bg-[#222222] */}
        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#222222]">Highlights</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {HIGHLIGHTS.map((highlight) => {
              const selected = highlights.includes(highlight);
              return (
                <button
                  type="button"
                  key={highlight}
                  onClick={() => toggleHighlight(highlight)}
                  className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                    selected
                      ? "bg-[#222222] text-white border-[#222222]"
                      : "bg-white border-[#EBEBEB] text-[#555555]"
                  }`}
                >
                  {highlight}
                </button>
              );
            })}
          </div>
        </section>

        {/* CHANGE 2: Notes label → "Any memories to log?" */}
        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <label className="text-sm font-semibold text-[#222222]">Any memories to log?</label>
          <textarea
            className="mt-2 w-full resize-none rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] p-3 text-sm text-[#222222]"
            placeholder="Share more about your experience..."
            maxLength={500}
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <p className="mt-2 text-right text-xs text-[#888888]">{notes.length}/500</p>
        </section>

        {/* CHANGE 1: Save Review button — green */}
        <button
          type="button"
          disabled={!overallRating || isSaving}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-[#00C851] px-6 py-4 font-bold text-[16px] text-white shadow-[0_8px_20px_-6px_rgba(0,200,81,0.5)] disabled:opacity-60 active:scale-[0.98] transition-all"
        >
          {isSaving ? "Saving..." : "Save Review"}
        </button>

        {/* CHANGE 5: Share to Feed placeholder */}
        <button
          type="button"
          onClick={() => toast("Coming soon!")}
          className="w-full bg-white text-[#222222] border-2 border-[#EBEBEB] py-4 rounded-xl font-bold text-[16px] active:scale-[0.98] transition-all mt-3"
        >
          Share to Feed
        </button>
      </div>
    </div>
  );
}
