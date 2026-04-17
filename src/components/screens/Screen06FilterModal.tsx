"use client"

import { X } from "lucide-react";

export type FilterState = {
  category?: string;
  priceLevel: number;
  distance: number;
  moods: string[];
};

// Top 8 most relevant category chips for discovery
const CATEGORY_OPTIONS = [
  { label: "Dining",       value: "restaurant",  emoji: "🍽️" },
  { label: "Cocktail Bar", value: "cocktail_bar", emoji: "🍸" },
  { label: "Resort",       value: "resort",       emoji: "🏖️" },
  { label: "Game Lodge",   value: "game_lodge",   emoji: "🦁" },
  { label: "Live Music",   value: "live_music",   emoji: "🎵" },
  { label: "Art Gallery",  value: "art_gallery",  emoji: "🎨" },
  { label: "Adventure",    value: "adventure",    emoji: "🧗" },
  { label: "Cafe",         value: "cafe",         emoji: "☕" },
];

const MOOD_OPTIONS = ["Romantic", "Fun", "Chill", "Adventurous"];

type FilterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: FilterState;
  setDraft: (state: FilterState) => void;
  onApply: (state: FilterState) => void;
  onReset: () => void;
};

export default function FilterModal({
  open,
  onOpenChange,
  draft,
  setDraft,
  onApply,
  onReset,
}: FilterModalProps) {
  if (!open) return null;

  const handleMoodToggle = (mood: string) => {
    setDraft({
      ...draft,
      moods: draft.moods.includes(mood)
        ? draft.moods.filter((item) => item !== mood)
        : [...draft.moods, mood],
    });
  };

  const resetFilters = () => {
    setDraft({ category: undefined, priceLevel: 1000, distance: 10, moods: [] });
    onReset();
  };

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* CHANGE 7 — Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="bg-card w-full rounded-t-3xl pt-6 pb-10 px-6 flex flex-col max-h-[90%] overflow-y-auto shadow-2xl relative">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Filters</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 bg-background rounded-full flex items-center justify-center text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {/* Category */}
          <section>
            <h3 className="font-bold text-foreground mb-3 text-sm">Category</h3>
            <div className="flex flex-wrap gap-2">
              {/* "All" clear chip */}
              <button
                type="button"
                onClick={() => setDraft({ ...draft, category: undefined })}
                className={
                  !draft.category
                    ? "bg-primary text-primary-foreground border border-primary px-4 py-2 rounded-full text-sm font-semibold"
                    : "bg-background border border-border text-foreground px-4 py-2 rounded-full text-sm font-medium"
                }
              >
                All
              </button>
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraft({ ...draft, category: draft.category === option.value ? undefined : option.value })}
                  className={
                    draft.category === option.value
                      ? "bg-primary text-primary-foreground border border-primary px-4 py-2 rounded-full text-sm font-semibold"
                      : "bg-background border border-border text-foreground px-4 py-2 rounded-full text-sm font-medium"
                  }
                >
                  {option.emoji} {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* Price Range */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-foreground text-sm">Price Range</h3>
              <span className="text-primary font-bold text-sm">K50 — K{draft.priceLevel}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={draft.priceLevel}
              onChange={(e) => setDraft({ ...draft, priceLevel: Number(e.target.value) })}
              className="w-full accent-primary h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-bold mt-2">
              <span>K50</span>
              <span>K1000+</span>
            </div>
          </section>

          {/* Distance */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-foreground text-sm">Distance</h3>
              <span className="text-muted-foreground font-medium text-sm">Up to {draft.distance} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={draft.distance}
              onChange={(e) => setDraft({ ...draft, distance: Number(e.target.value) })}
              className="w-full accent-primary h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-bold mt-2">
              <span>1 km</span>
              <span>20 km</span>
            </div>
          </section>

          {/* Date */}
          <section>
            <h3 className="font-bold text-foreground mb-3 text-sm">Date</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Today",    day: new Date().getDate() },
                { label: "Tomorrow", day: new Date().getDate() + 1 },
                { label: new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-US", { weekday: "short" }), day: new Date().getDate() + 2 },
                { label: new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-US", { weekday: "short" }), day: new Date().getDate() + 3 },
              ].map((d, i) => (
                <div key={d.label} className={`rounded-xl py-3 flex flex-col items-center justify-center ${i === 0 ? "bg-primary text-white" : "bg-background border border-border text-foreground"}`}>
                  <span className={`text-xs font-medium mb-1 ${i === 0 ? "opacity-90" : "text-gray-500"}`}>{d.label}</span>
                  <span className="text-xl font-bold">{d.day}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Mood */}
          <section>
            <h3 className="font-bold text-foreground mb-3 text-sm">Mood</h3>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => handleMoodToggle(mood)}
                  className={
                    draft.moods.includes(mood)
                      ? "bg-primary text-primary-foreground border border-primary px-4 py-2 rounded-full text-sm font-semibold"
                      : "bg-background border border-border text-foreground px-4 py-2 rounded-full text-sm font-medium"
                  }
                >
                  {mood}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={resetFilters}
            className="text-foreground font-semibold text-sm underline underline-offset-4"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-primary text-white py-4 rounded-xl font-bold text-[16px] shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
