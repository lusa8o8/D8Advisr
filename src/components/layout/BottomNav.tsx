"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const active = pathname.startsWith("/home")
    ? "home"
    : pathname.startsWith("/plans")
    ? "plans"
    : pathname.startsWith("/profile")
    ? "profile"
    : "";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] pb-8 pt-4 px-8 flex justify-between items-center z-20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      <Link
        href="/home"
        className={`flex flex-col items-center gap-1.5 transition-colors ${
          active === "home" ? "text-[#FF5A5F]" : "text-[#999999] hover:text-[#555555]"
        }`}
      >
        <Home size={24} strokeWidth={active === "home" ? 2.5 : 2} />
        <span className={`text-[10px] ${active === "home" ? "font-bold" : "font-medium"}`}>
          Home
        </span>
      </Link>

      <Link
        href="/plans"
        className={`flex flex-col items-center gap-1.5 transition-colors ${
          active === "plans" ? "text-[#FF5A5F]" : "text-[#999999] hover:text-[#555555]"
        }`}
      >
        <Calendar size={24} strokeWidth={active === "plans" ? 2.5 : 2} />
        <span className={`text-[10px] ${active === "plans" ? "font-bold" : "font-medium"}`}>
          Plans
        </span>
      </Link>

      <Link
        href="/profile"
        className={`flex flex-col items-center gap-1.5 transition-colors ${
          active === "profile" ? "text-[#FF5A5F]" : "text-[#999999] hover:text-[#555555]"
        }`}
      >
        <User size={24} strokeWidth={active === "profile" ? 2.5 : 2} />
        <span className={`text-[10px] ${active === "profile" ? "font-bold" : "font-medium"}`}>
          Profile
        </span>
      </Link>
    </div>
  );
}
