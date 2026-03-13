import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count: totalPlans } = await supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: completedPlans } = await supabase
    .from("plans")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed");

  return NextResponse.json({
    total_plans: totalPlans ?? 0,
    completed_plans: completedPlans ?? 0,
    budget_saved: 0,
  });
}
