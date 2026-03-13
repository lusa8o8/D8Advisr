"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, User } from "lucide-react";

const WalletIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
    <path d="M2 9h20" />
    <circle cx="18" cy="12" r="2" />
  </svg>
)

const tabs = [
  { label: "Home", href: "/home", icon: House },
  { label: "Plans", href: "/plans", icon: CalendarDays },
  { label: "Budget", href: "/budget", icon: WalletIcon },
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
