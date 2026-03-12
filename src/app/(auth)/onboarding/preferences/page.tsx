import { redirect } from "next/navigation";
import Screen03Preferences from "@/components/screens/Screen03Preferences";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PreferencesPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const currency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "ZMW";

  return (
    <Screen03Preferences
      userId={session.user.id}
      currency={currency}
    />
  );
}
