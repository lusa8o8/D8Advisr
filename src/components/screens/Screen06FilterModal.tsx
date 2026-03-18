"use client"

import { X } from "lucide-react";

export type FilterState = {
  category?: string;
  priceLevel: number;
  distance: number;
  moods: string[];
};

const CATEGORY_OPTIONS = [
  { label: "Dining", value: "restaurant" },
  { label: "Activity", value: "activity" },
  { label: "Nightlife", value: "bar" },
  { label: "Outdoors", value: "park" },
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

      {/* CHANGE 1 — Modal container */}
      <div className="bg-white w-full rounded-t-3xl pt-6 pb-10 px-6 flex flex-col max-h-[90%] overflow-y-auto shadow-2xl relative">

        {/* CHANGE 2 — Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#222222]">Filters</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 bg-[#F7F7F7] rounded-full flex items-center justify-center text-[#222222]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Category */}
          <section>
            {/* CHANGE 3 — Section label */}
            <h3 className="font-bold text-[#222222] mb-3 text-sm">Category</h3>
            {/* CHANGE 4 — Category chips */}
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraft({ ...draft, category: option.value })}
                  className={
                    draft.category === option.value
                      ? "bg-[#FF5A5F] text-white border border-[#FF5A5F] px-4 py-2 rounded-full text-sm font-semibold"
                      : "bg-white border border-[#EBEBEB] text-[#555555] px-4 py-2 rounded-full text-sm font-medium"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* Price Range */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[#222222] text-sm">Price Range</h3>
              <span className="text-[#FF5A5F] font-bold text-sm">K50 — K{draft.priceLevel}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={draft.priceLevel}
              onChange={(e) => setDraft({ ...draft, priceLevel: Number(e.target.value) })}
              className="w-full accent-[#FF5A5F] h-1.5 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[#999999] font-bold mt-2">
              <span>K50</span>
              <span>K1000+</span>
            </div>
          </section>

          {/* CHANGE 5 — Distance slider */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[#222222] text-sm">Distance</h3>
              <span className="text-[#FF5A5F] font-bold text-sm">Up to {draft.distance} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={draft.distance}
              onChange={(e) => setDraft({ ...draft, distance: Number(e.target.value) })}
              className="w-full accent-[#FF5A5F] h-1.5 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-[#999999] font-bold mt-2">
              <span>1 km</span>
              <span>20 km</span>
            </div>
          </section>

          {/* Mood */}
          <section>
            <h3 className="font-bold text-[#222222] mb-3 text-sm">Mood</h3>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => handleMoodToggle(mood)}
                  className={
                    draft.moods.includes(mood)
                      ? "bg-[#FF5A5F] text-white border border-[#FF5A5F] px-4 py-2 rounded-full text-sm font-semibold"
                      : "bg-white border border-[#EBEBEB] text-[#555555] px-4 py-2 rounded-full text-sm font-medium"
                  }
                >
                  {mood}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* CHANGE 6 — Bottom action buttons */}
        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={resetFilters}
            className="text-[#222222] font-semibold text-sm underline underline-offset-4"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-[#FF5A5F] text-white py-4 rounded-xl font-bold text-[16px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
