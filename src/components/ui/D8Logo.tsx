"use client";

type D8LogoProps = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
};

const sizeMap = {
  sm: 40,
  md: 56,
  lg: 80,
} as const;

export default function D8Logo({
  size = "md",
  showWordmark = false,
  className,
}: D8LogoProps) {
  const dimension = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div
        className="relative flex items-center justify-center rounded-[16px] bg-[#FF5A5F]"
        style={{ width: dimension, height: dimension }}
      >
        <span className="text-3xl font-bold text-white">D8</span>
        <span className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 rounded-full bg-[#00C851] p-1 text-[10px] font-bold text-white shadow-lg">
          ✓
        </span>
      </div>
      {showWordmark && (
        <span className="text-lg font-bold">
          <span className="text-[#FF5A5F]">D8</span>
          <span className="text-[#222222]">Advisr</span>
        </span>
      )}
    </div>
  );
}
