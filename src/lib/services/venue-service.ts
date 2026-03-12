import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Database,
  Venue,
  VenueWithDetails,
} from "@/types/database";

type SearchParams = {
  city: string;
  category?: string;
  priceLevel?: number;
  tags?: string[];
  limit?: number;
};

export async function searchVenues(params: SearchParams): Promise<Venue[]> {
  try {
    const client = createSupabaseServerClient();
    let query = client
      .from("venues")
      .select("*")
      .eq("is_active", true)
      .eq("city", params.city);

    if (params.category) {
      query = query.eq("category", params.category);
    }

    if (params.priceLevel) {
      query = query.eq("price_level", params.priceLevel);
    }

    if (params.tags?.length) {
      query = query.overlaps("tags", params.tags);
    }

    const { data, error } = await query
      .order("confidence_score", { ascending: false })
      .limit(params.limit ?? 20);

    if (error) {
      console.error("searchVenues error", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("searchVenues unexpected", error);
    return [];
  }
}

export async function getVenueById(
  id: string
): Promise<VenueWithDetails | null> {
  const client = createSupabaseServerClient();
  const { data, error } = await client
    .from("venues")
    .select(
      `
      *,
      venue_details:venue_details(
        *,
        highlights
      ),
      venue_prices:venue_prices(*)
    `
    )
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getVenueById error", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  if (!data) {
    return null;
  }

  const {
    venue_details,
    venue_prices,
    ...venueFields
  } = data as unknown as VenueWithDetails;

  return {
    ...(venueFields as Omit<VenueWithDetails, "venue_details" | "venue_prices">),
    venue_details: venue_details ?? null,
    venue_prices: venue_prices ?? [],
  } as VenueWithDetails;
}

export async function getVenuesByIds(ids: string[]): Promise<Venue[]> {
  if (!ids.length) {
    return [];
  }

  const client = createSupabaseServerClient();
  const { data, error } = await client
    .from("venues")
    .select("*")
    .in("id", ids)
    .eq("is_active", true);

  if (error) {
    console.error("getVenuesByIds error", error.message);
    return [];
  }

  return data ?? [];
}

export async function getVenueCount(city: string): Promise<number> {
  const client = createSupabaseServerClient();
  const { data, error, count } = await client
    .from("venues")
    .select("id", { count: "exact", head: false })
    .eq("city", city)
    .eq("is_active", true);

  if (error) {
    console.error("getVenueCount error", error.message);
    return 0;
  }

  return count ?? data?.length ?? 0;
}
