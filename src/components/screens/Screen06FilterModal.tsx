"use client"

import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { CategoryPill } from "@/components/ui/CategoryPill";

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetClose />
        </SheetHeader>

        <div className="mt-4 space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-[#222222]">Category</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <CategoryPill
                  key={option.value}
                  label={option.label}
                  selected={draft.category === option.value}
                  onSelect={() => setDraft({ ...draft, category: option.value })}
                />
              ))}
            </div>
          </section>

          <section className="space-y-3">
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

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#222222]">Distance</p>
              <span className="text-xs text-[#555555]">Up to {draft.distance} mi</span>
            </div>
            <Slider
              min={1}
              max={20}
              step={1}
              value={[draft.distance]}
              onValueChange={(value) => setDraft({ ...draft, distance: value[0] })}
            />
          </section>

          <section className="space-y-3">
            <p className="text-sm font-semibold text-[#222222]">Mood</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((moodOption) => (
                <CategoryPill
                  key={moodOption}
                  label={moodOption}
                  selected={draft.moods.includes(moodOption)}
                  onSelect={() => handleMoodToggle(moodOption)}
                />
              ))}
            </div>
          </section>
        </div>

        <SheetFooter>
          <button
            type="button"
            onClick={resetFilters}
            className="flex-1 rounded-2xl border border-[#E5E5E5] px-4 py-3 text-sm font-semibold text-[#555555]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onOpenChange(false);
            }}
            className="flex-1 rounded-2xl bg-[#FF5A5F] px-4 py-3 text-sm font-semibold text-white"
          >
            Apply Filters
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
