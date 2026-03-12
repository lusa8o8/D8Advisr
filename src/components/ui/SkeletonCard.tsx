"use client"

export function SkeletonCard() {
  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-transparent bg-white shadow-sm">
      <div className="h-[160px] w-full bg-gradient-to-br from-[#ff9a9e] to-[#ff5a5f] opacity-70 animate-pulse" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded-full bg-[#e0e0e0] animate-pulse" />
        <div className="h-4 w-1/2 rounded-full bg-[#e0e0e0] animate-pulse" />
        <div className="h-3 w-full rounded-full bg-[#e0e0e0] animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-12 rounded-full bg-[#e0e0e0] animate-pulse" />
          <div className="h-8 w-20 rounded-full bg-[#e0e0e0] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
