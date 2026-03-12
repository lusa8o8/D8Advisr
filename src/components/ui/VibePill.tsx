"use client";

type VibePillProps = {
  label: string;
  selected?: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export default function VibePill({
  label,
  selected = false,
  onToggle,
  disabled = false,
}: VibePillProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
        selected
          ? "border-[#FF5A5F] bg-[#FF5A5F] text-white shadow-sm"
          : "border-[var(--border)] bg-transparent text-text-secondary hover:border-[#FF5A5F] hover:text-text-primary"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      {label}
    </button>
  );
}
