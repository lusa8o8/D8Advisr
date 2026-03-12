import Link from "next/link";

const tabs = [
  { label: "Home", href: "/home" },
  { label: "Plans", href: "/plans" },
  { label: "Profile", href: "/profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3 text-sm font-medium text-text-secondary">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="text-text-secondary transition hover:text-text-primary"
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
