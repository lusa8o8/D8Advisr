import Screen15Preferences from "@/components/screens/Screen15Preferences";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PreferencesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("budget_preference, default_vibe, group_size_preference")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <Screen15Preferences
      defaultVibes={(preferences?.default_vibe ?? "").split(",").filter(Boolean)}
      budget={preferences?.budget_preference ?? 500}
      groupSize={preferences?.group_size_preference ?? 1}
    />
  );
}
