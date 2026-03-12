"use client"

import { cn } from "@/lib/utils";

type CategoryPillProps = {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
};

export function CategoryPill({
  label,
  selected = false,
  onSelect,
}: CategoryPillProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition",
        selected
          ? "border-transparent bg-[#FF5A5F] text-white shadow-lg shadow-[#FF5A5F]/30"
          : "border-[#E5E5E5] bg-white text-[#555555] hover:border-[#FF5A5F] hover:text-[#FF5A5F]"
      )}
    >
      {label}
    </button>
  );
}
