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
      className="w-full text-[#999999] font-medium text-sm py-4 text-center"
    >
      Sign Out
    </button>
  );
}
