import Screen19ReviewComplete from "@/components/screens/Screen19ReviewComplete";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ReviewCompletePageProps = {
  params: {
    id: string;
  };
};

export default async function ReviewCompletePage({ params }: ReviewCompletePageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("id, user_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!plan || plan.user_id !== user.id) {
    return null;
  }

  return <Screen19ReviewComplete planId={plan.id} />;
}
