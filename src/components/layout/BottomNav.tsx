"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, User } from "lucide-react";

const tabs = [
  { label: "Home", href: "/home", icon: House },
  { label: "Plans", href: "/plans", icon: CalendarDays },
  { label: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-[#E5E5E5] bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      <div
        className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 text-xs font-semibold text-[#888888]"
            >
              <Icon
                size={22}
                className={isActive ? "text-[#FF5A5F]" : "text-[#888888]"}
              />
              <span className={isActive ? "text-[#FF5A5F]" : "text-[#888888]"}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
