import { createSupabaseServerClient } from "@/lib/supabase/server";
import Screen05Map from "@/components/screens/Screen05Map";

export default async function MapPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("venues")
    .select("id, name, category")
    .eq("city", "Lusaka")
    .eq("is_active", true)
    .limit(5);

  return <Screen05Map venues={data ?? []} />;
}
