"use client"

import { useRouter } from "next/navigation";
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
      className="flex items-center justify-between rounded-2xl border border-[#888888] px-4 py-3 text-sm font-semibold text-[#888888]"
    >
      Sign Out
    </button>
  );
}
