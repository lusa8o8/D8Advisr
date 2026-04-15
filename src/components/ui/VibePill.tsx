"use client";

type VibePillProps = {
  label: string;
  emoji?: string;
  selected?: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export default function VibePill({
  label,
  emoji,
  selected = false,
  onToggle,
  disabled = false,
}: VibePillProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-[14px] transition-all active:scale-95 border ${
        selected
          ? "bg-primary text-white border-primary shadow-[0_4px_12px_-4px_rgba(255,90,95,0.5)]"
          : "bg-card text-foreground border-border hover:border-gray-300"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  );
}
