import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import {
  normalizeVenueName,
  normalizeCategory,
} from "@/lib/services/normalization-service";

// ── GET — queue (default) or approved venues (mode=approved) ─────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("mode") === "approved") {
    const { data, error } = await supabaseService
      .from("venues")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ venues: data ?? [] });
  }

  // Default: unprocessed raw_venues queue
  const { data, error } = await supabaseService
    .from("raw_venues")
    .select(
      "id, raw_name, raw_category, raw_address, raw_latitude, raw_longitude, raw_cuisine, osm_id"
    )
    .eq("processed", false)
    .order("ingested_at", { ascending: true })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ venues: data ?? [] });
}

// ── POST — approve raw_venue or manual add ────────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Approve flow: promote a raw_venue into the venues table
  if (body.action === "approve" && body.raw_venue_id) {
    const { data: raw, error: fetchErr } = await supabaseService
      .from("raw_venues")
      .select("*")
      .eq("id", body.raw_venue_id)
      .single();

    if (fetchErr || !raw) {
      return NextResponse.json({ error: "Raw venue not found" }, { status: 404 });
    }

    const name = body.name
      ? String(body.name).trim()
      : normalizeVenueName(raw.raw_name ?? "Unnamed Venue");

    const category = body.category ?? normalizeCategory(raw.raw_category ?? "other");
    const priceLevel: number = Number(body.price_level ?? 2);

    const { data: venue, error: insertErr } = await supabaseService
      .from("venues")
      .insert({
        name,
        city: "Lusaka",
        category,
        activity_type: category,
        address: raw.raw_address ?? null,
        latitude: raw.raw_latitude ?? -15.4167,
        longitude: raw.raw_longitude ?? 28.2833,
        price_level: priceLevel,
        price_range: `ZMW ${priceLevel * 100}-${priceLevel * 200}`,
        tags: raw.raw_cuisine ? [raw.raw_cuisine] : [],
        source: "overpass",
        confidence_score: 0.75,
        verification_score: 0.6,
        verified_at: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 });
    }

    // Mark raw as processed
    await supabaseService
      .from("raw_venues")
      .update({ processed: true })
      .eq("id", body.raw_venue_id);

    return NextResponse.json({ venue });
  }

  // Manual add — curator-entered venue, inserted directly (not from raw_venues)
  if (body.action === "manual") {
    const tierToScore: Record<string, number> = {
      "Verified": 0.6, "D8 Approved": 0.75, "Hidden Gem": 0.95,
    };
    const pl = Number(body.price_level ?? 2);

    const { data: venue, error: insertErr } = await supabaseService
      .from("venues")
      .insert({
        name:               String(body.name).trim(),
        city:               "Lusaka",
        category:           body.category ?? "restaurant",
        activity_type:      body.category ?? "restaurant",
        address:            body.address  ?? null,
        latitude:           -15.4167,
        longitude:          28.2833,
        price_level:        pl,
        price_range:        `ZMW ${pl * 100}–${pl * 200}`,
        tags:               [],
        source:             "manual",
        confidence_score:   0.6,
        verification_score: tierToScore[body.tier as string] ?? 0.6,
        verified_at:        new Date().toISOString(),
        is_active:          true,
      })
      .select()
      .single();

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 400 });

    // Optionally create venue_details row with phone / website / hours
    if (body.phone || body.website || body.hours) {
      await supabaseService.from("venue_details").insert({
        venue_id:    venue.id,
        description: null,
        website:     body.website ?? null,
        phone:       body.phone   ?? null,
        photos:      [],
        highlights:  [],
      });
    }

    return NextResponse.json({ venue });
  }

  // Legacy manual-add flow (kept as-is)
  const payload = {
    name: body.name,
    city: "Lusaka",
    category: body.category,
    activity_type: body.activity_type,
    address: body.address ?? null,
    latitude: body.latitude ?? -15.4167,
    longitude: body.longitude ?? 28.2833,
    price_level: body.price_level ?? 2,
    price_range: body.price_range ?? "ZMW 100-200",
    tags: body.tags ?? [],
    source: "manual",
    confidence_score: 0.7,
    verification_score: 0.5,
    verified_at: new Date().toISOString(),
    is_active: true,
  };

  const { data, error } = await supabaseService
    .from("venues")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ venue: data });
}

// ── PATCH — update an approved venue ─────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  const body = await request.json();

  // field/value format (used by image upload and field edits)
  if (body.field && body.venue_id) {
    const { field, venue_id, value } = body;

    // Append a URL to the image_urls array (+ set image_url if first)
    if (field === "image_urls_append") {
      const { data: current } = await supabaseService
        .from("venues")
        .select("image_url, image_urls")
        .eq("id", venue_id)
        .single();
      const currentUrls = (current?.image_urls as string[] | null) ?? [];
      const isFirst     = currentUrls.length === 0 && !current?.image_url;
      const newUrls     = [...currentUrls, value];
      const { error } = await supabaseService
        .from("venues")
        .update({ image_urls: newUrls, updated_at: new Date().toISOString(), ...(isFirst && { image_url: value }) })
        .eq("id", venue_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    // Remove a URL from image_urls and update primary
    if (field === "image_urls_remove") {
      const { newUrls, newPrimary } = value as { url: string; newUrls: string[]; newPrimary: string | null };
      const { error } = await supabaseService
        .from("venues")
        .update({ image_urls: newUrls, image_url: newPrimary, updated_at: new Date().toISOString() })
        .eq("id", venue_id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    // Generic single-field update (e.g. image_url, verified_at)
    const { error } = await supabaseService
      .from("venues")
      .update({ [field]: value ?? null, updated_at: new Date().toISOString() })
      .eq("id", venue_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const { id, ...fields } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Coerce opening_hours string → JSONB object
  if (typeof fields.opening_hours === "string") {
    fields.opening_hours = { default: fields.opening_hours };
  }
  // Coerce tags string → array
  if (typeof fields.tags === "string") {
    fields.tags = (fields.tags as string).split(",").map((t: string) => t.trim()).filter(Boolean);
  }

  const { data, error } = await supabaseService
    .from("venues")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ venue: data });
}

// ── DELETE — reject raw_venue (mark processed, skip promotion) ────────────────
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  const { error } = await supabaseService
    .from("raw_venues")
    .update({ processed: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
