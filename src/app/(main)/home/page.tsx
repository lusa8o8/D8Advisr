import { redirect } from "next/navigation";
import Screen04Home from "@/components/screens/Screen04Home";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { searchVenues } from "@/lib/services/venue-service";
import SkeletonCard from '@/components/screens/SkeletonCard';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const firstName =
    user.user_metadata?.first_name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "there";

  const venues = await searchVenues({ city: "Lusaka", limit: 20 });

  if (!venues || venues.length === 0) return <div className="space-y-4 px-4 pt-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  return <Screen04Home firstName={firstName} initialVenues={venues} />;
}
