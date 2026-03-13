import { redirect } from "next/navigation";
import Screen12ExecutionTracker from "@/components/screens/Screen12ExecutionTracker";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ExecutePageProps = {
  params: {
    id: string;
  };
};

export default async function PlanExecutePage({ params }: ExecutePageProps) {
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

  if (plan.status !== "active") {
    redirect(`/plans/${params.id}`);
  }

  const { data: stops } = await supabase
    .from("plan_items")
    .select("*, venue:venues(id,name,address)")
    .eq("plan_id", params.id)
    .order("order_index");

  const stopList =
    stops?.map((stop) => ({
      ...stop,
      venue_name: stop.venue?.name ?? stop.venue_id,
      venue: stop.venue,
    })) ?? [];

  return <Screen12ExecutionTracker plan={plan} stops={stopList} />;
}

