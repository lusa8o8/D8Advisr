import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminPanel from "@/components/screens/AdminPanel";

export default async function CuratorPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Middleware already redirects unauthenticated users — belt-and-suspenders
  if (!session) {
    redirect("/");
  }

  // is_admin gate: checked against NEXT_PUBLIC_ADMIN_EMAIL env var
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmail || session.user.email !== adminEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <p className="text-center text-sm font-semibold text-muted-foreground">
          Access denied.
        </p>
      </div>
    );
  }

  return <AdminPanel />;
}
