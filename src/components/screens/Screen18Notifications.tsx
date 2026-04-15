"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, BellOff, Calendar, Check, MapPin, Star, Ticket, Users } from "lucide-react";
import Link from "next/link";

type NotificationType = "urgent" | "vibe_amber" | "vibe_sky" | "success" | "warning" | "action" | "social" | "info";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  emoji?: string;
  cta?: string;
  ctaHref?: string;
  timeColor?: string;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "urgent",
    title: "Your date is tonight!",
    body: "Romantic First Date Evening starts at 7:00 PM.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "jazz",
    type: "vibe_amber",
    title: "Matches your Romantic vibe",
    body: "Jazz & Wine Night at Latitude 15° — Fri · 7:30 PM · Only 8 spots left.",
    time: "4 hours ago",
    read: false,
    emoji: "🎷",
    cta: "View Event",
    ctaHref: "/home",
    timeColor: "text-amber-600",
  },
  {
    id: "cinema",
    type: "vibe_sky",
    title: "Matches your Date Night vibe",
    body: "Rooftop Cinema Night — Sat · 9:00 PM · Lusaka Sports Centre · K180/pp.",
    time: "6 hours ago",
    read: false,
    emoji: "🎬",
    cta: "Add to Plan",
    ctaHref: "/plans/generate",
    timeColor: "text-sky-600",
  },
  {
    id: "2",
    type: "success",
    title: "Plan completed",
    body: "You completed Romantic First Date Evening.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Budget Alert",
    body: "You've used 80% of your date budget this month.",
    time: "8 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "action",
    title: "Rate your last date!",
    body: "How was your time at Latitude 15°?",
    time: "2 days ago",
    read: true,
    cta: "Leave Review",
    ctaHref: "/plans",
  },
  {
    id: "social",
    type: "social",
    title: "Sarah accepted the plan",
    body: "Saturday Night Out is confirmed.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "New venues near you",
    body: "Check out 5 new spots added in Lusaka.",
    time: "4 days ago",
    read: true,
  },
];

type RowConfig = {
  rowBg: string;
  borderL: string;
  iconBg: string;
  iconText: string;
  iconBorder: string;
  icon: React.ReactNode;
};

const TYPE_CONFIG: Record<NotificationType, RowConfig> = {
  urgent: {
    rowBg: "bg-[#FFF0F1] hover:bg-[#ffe5e6]",
    borderL: "border-l-4 border-primary",
    iconBg: "bg-white",
    iconText: "text-primary",
    iconBorder: "border border-primary/10",
    icon: <Calendar size={20} strokeWidth={2.5} />,
  },
  vibe_amber: {
    rowBg: "bg-amber-50 hover:bg-amber-100/50",
    borderL: "border-l-4 border-amber-400",
    iconBg: "bg-white",
    iconText: "text-amber-500",
    iconBorder: "border border-amber-200",
    icon: null,
  },
  vibe_sky: {
    rowBg: "bg-sky-50 hover:bg-sky-100/50",
    borderL: "border-l-4 border-sky-400",
    iconBg: "bg-white",
    iconText: "text-sky-500",
    iconBorder: "border border-sky-200",
    icon: null,
  },
  success: {
    rowBg: "bg-card hover:bg-background",
    borderL: "",
    iconBg: "bg-[#E8FFF0]",
    iconText: "text-[#00C851]",
    iconBorder: "border border-[#00C851]/20",
    icon: <Check size={20} strokeWidth={3} />,
  },
  warning: {
    rowBg: "bg-card hover:bg-background",
    borderL: "",
    iconBg: "bg-[#FFF3E8]",
    iconText: "text-[#FF9500]",
    iconBorder: "border border-[#FF9500]/20",
    icon: <AlertCircle size={22} strokeWidth={2.5} />,
  },
  action: {
    rowBg: "bg-card hover:bg-background",
    borderL: "",
    iconBg: "bg-background",
    iconText: "text-foreground",
    iconBorder: "border border-border",
    icon: <Star size={20} strokeWidth={2.5} />,
  },
  social: {
    rowBg: "bg-card hover:bg-background",
    borderL: "",
    iconBg: "bg-[#E8F4FF]",
    iconText: "text-[#007AFF]",
    iconBorder: "border border-blue-200",
    icon: <Users size={20} strokeWidth={2.5} />,
  },
  info: {
    rowBg: "bg-card",
    borderL: "",
    iconBg: "bg-background",
    iconText: "text-muted-foreground",
    iconBorder: "border border-border",
    icon: <MapPin size={20} strokeWidth={2.5} />,
  },
};

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[notification.type];
  const isInfo = notification.type === "info";
  const isVibeMatch = notification.type === "vibe_amber" || notification.type === "vibe_sky";
  const timeColor = notification.timeColor ?? (
    notification.type === "urgent" ? "text-primary" : "text-muted-foreground"
  );
  const ctaBg = notification.type === "vibe_amber" ? "bg-amber-500" : notification.type === "vibe_sky" ? "bg-sky-500" : "";

  return (
    <div
      className={`${cfg.rowBg} ${cfg.borderL} border-b border-border px-6 py-5 flex gap-4 items-start relative cursor-pointer transition-colors${isInfo ? " opacity-70" : ""}`}
    >
      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute right-6 top-7 w-2.5 h-2.5 bg-primary rounded-full shadow-sm" />
      )}

      {/* Icon circle */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg} ${cfg.iconText} ${cfg.iconBorder} shadow-sm`}>
        {notification.emoji ? (
          <span className="text-2xl">{notification.emoji}</span>
        ) : (
          cfg.icon
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${!notification.read ? "pr-6" : ""}`}>
        <p className="font-extrabold text-foreground text-[16px] leading-tight mb-1.5">
          {notification.title}
        </p>
        <p className="text-[14px] text-muted-foreground font-medium leading-snug mb-1">
          {notification.body}
        </p>

        {/* Vibe-match action buttons */}
        {isVibeMatch && notification.cta && notification.ctaHref && (
          <div className="flex items-center gap-2 mt-2">
            <Link href={notification.ctaHref}>
              <button type="button" className={`flex items-center gap-1.5 ${ctaBg} text-white text-[12px] font-bold px-3.5 py-2 rounded-xl shadow-sm active:scale-95 transition-transform`}>
                <Ticket size={12} /> {notification.cta}
              </button>
            </Link>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground px-3 py-2 rounded-xl border border-border bg-white active:scale-95 transition-transform"
            >
              <BellOff size={12} /> Not for me
            </button>
          </div>
        )}

        {/* Action type CTA (Rate your last date etc) */}
        {notification.type === "action" && notification.cta && notification.ctaHref && (
          <div className="mt-2">
            <Link href={notification.ctaHref}>
              <button type="button" className="bg-background px-5 py-2.5 rounded-xl text-sm font-bold text-foreground border border-border shadow-sm hover:border-gray-400 transition-colors active:scale-95">
                {notification.cta}
              </button>
            </Link>
          </div>
        )}

        <span className={`text-xs font-bold mt-2 block ${timeColor}`}>
          {notification.time}
        </span>
      </div>
    </div>
  );
}

export default function Screen18Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const visible = notifications.filter((n) => !dismissed.includes(n.id));
  const today = visible.slice(0, 4);
  const earlier = visible.slice(4);
  const allRead = notifications.every((n) => n.read);

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Sticky header */}
      <div className="bg-card px-6 pt-14 pb-4 sticky top-0 z-20 shadow-sm border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-foreground hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-foreground text-xl">Notifications</h1>
          </div>
          <button type="button" onClick={markAllRead} className="text-primary font-bold text-sm hover:opacity-80">
            Mark all read
          </button>
        </div>
      </div>

      {allRead && visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="text-5xl mb-4">🔔</div>
          <h2 className="text-xl font-bold text-foreground mb-2">All caught up!</h2>
          <p className="text-sm text-muted-foreground">No new notifications right now.</p>
        </div>
      ) : (
        <>
          <h2 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider px-6 py-5">
            Today
          </h2>
          <div>
            {today.map((n) => (
              <NotificationItem key={n.id} notification={n} onDismiss={dismiss} />
            ))}
          </div>

          {earlier.length > 0 && (
            <>
              <h2 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider px-6 py-5 mt-2 bg-background border-t border-b border-border">
                Earlier this week
              </h2>
              <div>
                {earlier.map((n) => (
                  <NotificationItem key={n.id} notification={n} onDismiss={dismiss} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
