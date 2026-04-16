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

  const { data: transactions } = await (supabase as any)
    .from("fund_transactions")
    .select("id, amount, type, source, notes, created_at, sinking_funds(name, emoji)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return <Screen16Budget initialFunds={funds ?? []} initialTransactions={transactions ?? []} />;
}
