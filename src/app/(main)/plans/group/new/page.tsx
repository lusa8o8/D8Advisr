import { redirect } from "next/navigation";
import Screen17GroupPlan from "@/components/screens/Screen17GroupPlan";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function GroupPlanPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <Screen17GroupPlan />;
}
