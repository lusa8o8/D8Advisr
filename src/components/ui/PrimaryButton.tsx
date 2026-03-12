"use client";

import clsx from "clsx";

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
};

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  type = "button",
  className,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onPress}
      disabled={disabled || loading}
      className={clsx(
        "w-full rounded-[12px] bg-[#FF5A5F] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#e54e53] disabled:opacity-60",
        className
      )}
    >
      {loading ? (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white border-t-transparent" />
      ) : (
        label
      )}
    </button>
  );
}
