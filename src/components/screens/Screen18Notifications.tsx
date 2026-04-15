"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, BellOff, Calendar, Check, MapPin, Star, Ticket } from "lucide-react";
import Link from "next/link";

type NotificationType = "urgent" | "success" | "warning" | "action" | "info";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  cta?: string;
  ctaHref?: string;
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
    body: "You've used 80% of your March date budget.",
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
    id: "5",
    type: "info",
    title: "New venues near you",
    body: "Check out 5 new spots added in Lusaka.",
    time: "4 days ago",
    read: true,
  },
];

const TYPE_CONFIG: Record<
  NotificationType,
  { rowBg: string; borderL: string; iconBg: string; iconText: string; iconBorder: string; icon: React.ReactNode }
> = {
  urgent: {
    rowBg: "bg-[#FFF0F1]",
    borderL: "border-l-4 border-primary",
    iconBg: "bg-white",
    iconText: "text-primary",
    iconBorder: "border border-primary/10",
    icon: <Calendar size={20} strokeWidth={2.5} />,
  },
  success: {
    rowBg: "bg-[#F0FFF6]",
    borderL: "border-l-4 border-[#00C851]",
    iconBg: "bg-[#E8FFF0]",
    iconText: "text-[#00C851]",
    iconBorder: "border border-[#00C851]/20",
    icon: <Check size={20} strokeWidth={3} />,
  },
  warning: {
    rowBg: "bg-amber-50",
    borderL: "border-l-4 border-[#FF9500]",
    iconBg: "bg-[#FFF3E8]",
    iconText: "text-[#FF9500]",
    iconBorder: "border border-[#FF9500]/20",
    icon: <AlertCircle size={22} strokeWidth={2.5} />,
  },
  action: {
    rowBg: "bg-card",
    borderL: "border-l-4 border-amber-400",
    iconBg: "bg-background",
    iconText: "text-foreground",
    iconBorder: "border border-border",
    icon: <Star size={20} strokeWidth={2.5} />,
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

  return (
    <div
      className={`${cfg.rowBg} ${cfg.borderL} border-b border-border px-6 py-5 flex gap-4 items-start relative cursor-pointer${isInfo ? " opacity-70" : ""}`}
    >
      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute right-6 top-7 w-2.5 h-2.5 bg-primary rounded-full shadow-sm" />
      )}

      {/* Icon circle */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${cfg.iconBg} ${cfg.iconText} ${cfg.iconBorder}`}
      >
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <p className="font-extrabold text-foreground text-[16px] leading-tight mb-1.5">
          {notification.title}
        </p>
        <p className="text-[14px] text-muted-foreground font-medium leading-snug">
          {notification.body}
        </p>

        {/* Action buttons for action type */}
        {notification.type === "action" && notification.cta && notification.ctaHref && (
          <div className="flex items-center gap-2 mt-3">
            <Link href={notification.ctaHref}>
              <button className="flex items-center gap-1.5 bg-amber-500 text-white text-[12px] font-bold px-3.5 py-2 rounded-xl shadow-sm active:scale-95 transition-transform">
                <Ticket size={12} /> {notification.cta}
              </button>
            </Link>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground px-3 py-2 rounded-xl border border-border bg-card active:scale-95 transition-transform"
            >
              <BellOff size={12} /> Not for me
            </button>
          </div>
        )}

        <span className="text-xs text-muted-foreground font-bold mt-2 block">
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
  const today = visible.slice(0, 2);
  const earlier = visible.slice(2);
  const allRead = notifications.every((n) => n.read);

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Sticky header */}
      <div className="bg-card px-6 pt-14 pb-4 sticky top-0 z-20 shadow-sm border-b border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-foreground"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-foreground text-xl">Notifications</h1>
          </div>
          <button onClick={markAllRead} className="text-primary font-bold text-sm">
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

          <h2 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider px-6 py-5 bg-background border-t border-b border-border">
            Earlier this week
          </h2>
          <div>
            {earlier.map((n) => (
              <NotificationItem key={n.id} notification={n} onDismiss={dismiss} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
