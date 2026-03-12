import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

type VenueInsert = {
  name: string;
  city: string;
  category: string;
  activity_type: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price_level?: number | null;
  price_range?: string | null;
  tags?: string[];
  confidence_score?: number;
  verification_score?: number;
  source?: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LUSAKA_VENUES: VenueInsert[] = [];

async function seedVenues() {
  console.log("Starting Lusaka venue seed...");
  console.log(`Venues to insert: ${LUSAKA_VENUES.length}`);

  if (!LUSAKA_VENUES.length) {
    console.log("No venues to seed. Populate LUSAKA_VENUES next.");
    return;
  }

  for (const venue of LUSAKA_VENUES) {
    const { data: existing } = await supabase
      .from("venues")
      .select("id")
      .eq("name", venue.name)
      .eq("city", venue.city)
      .single();

    if (existing) {
      console.log(`Skipping duplicate: ${venue.name}`);
      continue;
    }

    const { data, error } = await supabase
      .from("venues")
      .insert(venue)
      .select()
      .single();

    if (error) {
      console.error(`Failed: ${venue.name}`, error.message);
    } else {
      console.log(`Inserted: ${venue.name} (${data.id})`);
    }
  }

  console.log("Seed complete.");
}

seedVenues().catch(console.error);
