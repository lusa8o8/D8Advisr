"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Calendar, Check, MapPin, Star } from "lucide-react";
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

const ICON_CONFIG: Record<NotificationType, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  urgent: {
    bg: "bg-white",
    text: "text-[#FF5A5F]",
    border: "border border-[#FF5A5F]/10",
    icon: <Calendar size={20} />,
  },
  success: {
    bg: "bg-[#E8FFF0]",
    text: "text-[#00C851]",
    border: "border border-[#00C851]/20",
    icon: <Check size={20} strokeWidth={3} />,
  },
  warning: {
    bg: "bg-[#FFF3E8]",
    text: "text-[#FF9500]",
    border: "border border-[#FF9500]/20",
    icon: <AlertCircle size={22} />,
  },
  action: {
    bg: "bg-[#F7F7F7]",
    text: "text-[#222222]",
    border: "border border-[#EBEBEB]",
    icon: <Star size={20} />,
  },
  info: {
    bg: "bg-[#F7F7F7]",
    text: "text-[#555555]",
    border: "border border-[#EBEBEB]",
    icon: <MapPin size={20} />,
  },
};

function NotificationItem({ notification }: { notification: Notification }) {
  const icon = ICON_CONFIG[notification.type];
  const isUrgent = notification.type === "urgent";
  const isInfo = notification.type === "info";

  const containerClass = isUrgent
    ? "bg-[#FFF0F1] border-l-4 border-[#FF5A5F] px-6 py-5 flex gap-4 items-start relative cursor-pointer"
    : `bg-white border-b border-[#EBEBEB] px-6 py-5 flex gap-4 items-start cursor-pointer${isInfo ? " opacity-70" : ""}`;

  return (
    <div className={containerClass}>
      {/* Unread dot */}
      {!notification.read && (
        <span className="absolute right-6 top-7 w-2.5 h-2.5 bg-[#FF5A5F] rounded-full" />
      )}

      {/* Icon circle */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${icon.bg} ${icon.text} ${icon.border}`}>
        {icon.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-[#222222] text-[16px] mb-1.5">{notification.title}</p>
        <p className="text-[14px] text-[#555555] font-medium">{notification.body}</p>

        {notification.cta && notification.ctaHref && (
          <Link href={notification.ctaHref}>
            <button className="bg-[#F7F7F7] px-5 py-2.5 rounded-xl text-sm font-bold text-[#222222] border border-[#EBEBEB] shadow-sm mt-3">
              {notification.cta}
            </button>
          </Link>
        )}

        <span className="text-xs text-[#999999] font-bold mt-2 block">{notification.time}</span>
      </div>
    </div>
  );
}

export default function Screen18Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const today = notifications.slice(0, 2);
  const earlier = notifications.slice(2);
  const allRead = notifications.every((n) => n.read);

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      {/* Sticky header */}
      <div className="bg-white px-6 pt-14 pb-4 sticky top-0 z-20 shadow-sm border-b border-[#EBEBEB]">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center text-[#222222]"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-xl text-[#222222]">Notifications</span>
          <button
            onClick={markAllRead}
            className="text-[#FF5A5F] font-bold text-sm"
          >
            Mark all read
          </button>
        </div>
      </div>

      {allRead ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="text-5xl mb-4">🔔</div>
          <h2 className="text-xl font-bold text-[#222222] mb-2">All caught up!</h2>
          <p className="text-sm text-[#555555]">No new notifications right now.</p>
        </div>
      ) : (
        <>
          {/* Today section */}
          <p className="text-xs font-extrabold text-[#555555] uppercase tracking-wider px-6 py-5">
            Today
          </p>
          <div>
            {today.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>

          {/* Earlier this week section */}
          <div className="bg-[#F7F7F7] border-t border-b border-[#EBEBEB]">
            <p className="text-xs font-extrabold text-[#555555] uppercase tracking-wider px-6 py-5">
              Earlier this week
            </p>
          </div>
          <div>
            {earlier.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
