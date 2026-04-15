"use client"

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabaseBrowserClient.auth.signOut();
    router.push("/");
    router.refresh();
    toast.success("Signed out");
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border border-border bg-card text-primary font-bold text-[15px] hover:bg-[#FFF0F1] active:scale-[0.98] transition-all"
    >
      <LogOut size={18} strokeWidth={2.5} />
      Sign Out
    </button>
  );
}
