import { redirect } from "next/navigation";
import Screen09PlanOverview from "@/components/screens/Screen09PlanOverview";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PlanPageProps = {
  params: {
    id: string;
  };
};

export default async function PlanDetailPage({ params }: PlanPageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!plan || plan.user_id !== user.id) {
    redirect("/plans");
  }

  const { data: stops } = await supabase
    .from("plan_items")
    .select("*, venue:venues(id,name)")
    .eq("plan_id", params.id)
    .order("order_index");

  const stopList =
    stops?.map((stop) => ({
      ...stop,
      venue_name: stop.venue?.name ?? stop.venue_id,
    })) ?? [];

  return (
    <Screen09PlanOverview
      plan={plan}
      stops={stopList}
      plannerNote={undefined}
    />
  );
}
