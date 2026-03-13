import { redirect } from "next/navigation";
import Screen16Budget from "@/components/screens/Screen16Budget";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getBudgetSummary } from "@/lib/services/budget-service";

export default async function BudgetPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("budget_preference, default_vibe, group_size_preference")
    .eq("user_id", user.id)
    .maybeSingle();

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const summary = await getBudgetSummary(supabase, user.id, month);

  return (
    <Screen16Budget
      initialMonth={month}
      initialBudget={summary.budget}
      initialSpent={summary.spent}
      initialPlans={summary.plans}
      preferences={{
        vibes: (preferences?.default_vibe ?? "").split(",").filter(Boolean),
        groupSize: preferences?.group_size_preference ?? 1,
      }}
    />
  );
}
