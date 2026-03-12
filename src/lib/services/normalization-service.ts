import { supabaseService } from "@/lib/supabase/service";
import type { VenueInsert } from "@/types/database";

export function normalizeCategory(rawCategory: string): string {
  const normalized = rawCategory.toLowerCase();

  if (["cafe", "coffee shop", "coffee"].includes(normalized)) {
    return "cafe";
  }

  if (["restaurant", "dining", "food"].includes(normalized)) {
    return "restaurant";
  }

  if (["bar", "pub", "lounge"].includes(normalized)) {
    return "bar";
  }

  if (["activity", "entertainment", "sport"].includes(normalized)) {
    return "activity";
  }

  if (["park", "garden", "outdoor"].includes(normalized)) {
    return "park";
  }

  return "other";
}

export function normalizePriceLevel(rawPrice: string): number {
  const value = rawPrice.toLowerCase();

  if (value.includes("$$$$") || value.includes("zwm 400")) {
    return 4;
  }

  if (value.includes("$$$") || value.includes("zwm 200")) {
    return 3;
  }

  if (value.includes("$$") || value.includes("zwm 100")) {
    return 2;
  }

  return 1;
}

export function normalizeVenueName(rawName: string): string {
  return rawName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export async function processRawVenue(rawVenueId: string) {
  const { data: rawVenue, error: fetchError } = await supabaseService
    .from("raw_venues")
    .select("*")
    .eq("id", rawVenueId)
    .single();

  if (fetchError || !rawVenue) {
    return { success: false, error: fetchError?.message ?? "Not found" };
  }

  if (rawVenue.processed) {
    return { success: true };
  }

  const name = normalizeVenueName(rawVenue.raw_name ?? "Unnamed Venue");
  const category = normalizeCategory(rawVenue.raw_category ?? "other");
  const priceLevel = normalizePriceLevel(rawVenue.raw_price ?? "");
  const city = "Lusaka";

  const { data: duplicate } = await supabaseService
    .from("venues")
    .select("id")
    .ilike("name", `%${name}%`)
    .eq("city", city)
    .limit(1)
    .single();

  if (duplicate) {
    await supabaseService
      .from("raw_venues")
      .update({ processed: true })
      .eq("id", rawVenueId);

    return { success: true, venueId: duplicate.id };
  }

  const venueData: VenueInsert = {
    name,
    city,
    category,
    activity_type: category,
    address: rawVenue.raw_address,
    latitude: rawVenue.raw_latitude,
    longitude: rawVenue.raw_longitude,
    price_level: priceLevel,
    price_range: rawVenue.raw_price,
    opening_hours: rawVenue.raw_hours
      ? { default: rawVenue.raw_hours }
      : null,
    verification_score: rawVenue.raw_rating ?? 0.5,
    confidence_score: 0.7,
    verified_at: new Date().toISOString(),
    source: rawVenue.source,
    tags: [],
    is_active: true,
  };

  const insert = await supabaseService
    .from("venues")
    .insert(venueData)
    .select("id")
    .single();

  if (insert.error) {
    return { success: false, error: insert.error.message };
  }

  await supabaseService
    .from("raw_venues")
    .update({ processed: true })
    .eq("id", rawVenueId);

  return { success: true, venueId: insert.data?.id };
}
