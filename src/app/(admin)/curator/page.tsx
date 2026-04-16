import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminPanel from "@/components/screens/AdminPanel";

export default async function CuratorPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Query users table for is_admin flag
  const { data: profile } = await (supabase as any)
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  // Fallback: also allow by email in case is_admin column not yet set
  const isAdmin =
    profile?.is_admin === true ||
    user.email === "lusamalungisha@gmail.com";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl mb-2">🔒</p>
          <p className="font-bold text-[#222222]">
            Access Denied
          </p>
          <p className="text-sm text-[#555555] mt-1">
            Admin only
          </p>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
}
