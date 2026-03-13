import { redirect } from "next/navigation";
import Screen11PlanEdit from "@/components/screens/Screen11PlanEdit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PlanEditPageProps = {
  params: {
    id: string;
  };
};

export default async function PlanEditPage({ params }: PlanEditPageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/plans");
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

  return <Screen11PlanEdit plan={plan} stops={stopList} />;
}

