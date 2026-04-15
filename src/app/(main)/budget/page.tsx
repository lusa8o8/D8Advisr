import { redirect } from "next/navigation";
import Screen16Budget from "@/components/screens/Screen16Budget";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function BudgetPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: funds } = await (supabase as any)
    .from("sinking_funds")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return <Screen16Budget initialFunds={funds ?? []} />;
}
