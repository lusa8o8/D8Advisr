"use client";
import Link from "next/link";
import { Bell, Settings } from "lucide-react";

export default function TopBar() {
  return (
    <div className="px-6 pt-14 pb-4 flex justify-between items-center sticky top-0 z-20 bg-white shadow-sm">
      <Link href="/home" className="flex items-baseline gap-0">
        <span className="font-bold text-2xl text-[#FF5A5F] tracking-tight">D8</span>
        <span className="font-bold text-2xl text-[#222222] tracking-tight">Advisr</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/notifications" className="relative text-[#222222]">
          <Bell size={24} />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF5A5F] rounded-full border-2 border-white"></span>
        </Link>
        <Link href="/profile/preferences" className="text-[#222222]">
          <Settings size={24} />
        </Link>
      </div>
    </div>
  );
}
