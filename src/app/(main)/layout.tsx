import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen bg-background text-text-primary">
      <div className="pb-32">{children}</div>
      <BottomNav />
    </div>
  );
}
