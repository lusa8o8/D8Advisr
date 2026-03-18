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
      className={`px-5 py-3 rounded-full font-semibold text-[15px] transition-all active:scale-95 ${
        selected
          ? "bg-[#FF5A5F] text-white border border-[#FF5A5F] shadow-[0_4px_12px_-4px_rgba(255,90,95,0.6)]"
          : "border border-[#EBEBEB] bg-white text-[#555555]"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      {label}
    </button>
  );
}
