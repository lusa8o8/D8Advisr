"use client"

import { toast } from "sonner";

export default function NotificationRow() {
  return (
    <button
      type="button"
      onClick={() => toast("Coming soon")}
      className="flex items-center justify-between rounded-2xl border border-[#E5E5E5] px-4 py-3 text-sm font-semibold text-[#555555]"
    >
      Notifications
    </button>
  );
}
