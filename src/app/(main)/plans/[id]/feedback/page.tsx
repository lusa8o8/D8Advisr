import Screen13Feedback from "@/components/screens/Screen13Feedback";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type FeedbackPageProps = {
  params: {
    id: string;
  };
};

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: plan }, { data: stops }] = await Promise.all([
    supabase.from("plans").select("*").eq("id", params.id).maybeSingle(),
    supabase
      .from("plan_items")
      .select("*, venue:venues(id,name)")
      .eq("plan_id", params.id)
      .order("order_index"),
  ]);

  if (!plan || plan.user_id !== user.id) {
    return null;
  }

  const enrichedStops =
    stops?.map((stop) => ({
      ...stop,
      venue_name: stop.venue?.name ?? stop.venue_id,
    })) ?? [];

  return <Screen13Feedback plan={plan} stops={enrichedStops} />;
}
