import { redirect } from "next/navigation";
import Screen07VenueDetail from "@/components/screens/Screen07VenueDetail";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getVenueById } from "@/lib/services/venue-service";

type VenuePageProps = {
  params: {
    id: string;
  };
};

export default async function VenueDetailPage({ params }: VenuePageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const venue = await getVenueById(params.id);

  if (!venue) {
    redirect("/home");
  }

  return <Screen07VenueDetail venue={venue} />;
}
