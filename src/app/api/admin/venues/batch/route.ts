import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import {
  normalizeVenueName,
  normalizeCategory,
} from "@/lib/services/normalization-service";

// ── POST — batch approve matching raw_venues ──────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { category, hasAddress } = body as { category?: string; hasAddress?: boolean };

  let query = supabaseService
    .from("raw_venues")
    .select("*")
    .eq("processed", false);

  if (category) query = (query as any).eq("raw_category", category);
  if (hasAddress) query = (query as any).not("raw_address", "is", null);

  const { data: rows, error: fetchErr } = await query;
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!rows || rows.length === 0) return NextResponse.json({ approved: 0 });

  const now = new Date().toISOString();
  const venueRows = rows.map((raw: any) => {
    const cat = normalizeCategory(raw.raw_category ?? "other");
    return {
      name: normalizeVenueName(raw.raw_name ?? "Unnamed Venue"),
      city: "Lusaka",
      category: cat,
      activity_type: cat,
      address: raw.raw_address ?? null,
      latitude: raw.raw_latitude ?? -15.4167,
      longitude: raw.raw_longitude ?? 28.2833,
      price_level: 2,
      price_range: "ZMW 200-400",
      tags: raw.raw_cuisine ? [raw.raw_cuisine] : [],
      source: "overpass",
      confidence_score: 0.75,
      verification_score: 0.6,
      verified_at: now,
      is_active: true,
    };
  });

  const { data: inserted, error: insertErr } = await supabaseService
    .from("venues")
    .insert(venueRows)
    .select("id");

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 400 });

  const ids = rows.map((r: any) => r.id);
  await supabaseService.from("raw_venues").update({ processed: true }).in("id", ids);

  return NextResponse.json({ approved: inserted?.length ?? 0 });
}

// ── DELETE — batch reject matching raw_venues ─────────────────────────────────
export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { category, hasNoAddress } = body as { category?: string; hasNoAddress?: boolean };

  let query = supabaseService
    .from("raw_venues")
    .select("id")
    .eq("processed", false);

  if (category)    query = (query as any).eq("raw_category", category);
  if (hasNoAddress) query = (query as any).is("raw_address", null);

  const { data: rows, error: fetchErr } = await query;
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!rows || rows.length === 0) return NextResponse.json({ rejected: 0 });

  const ids = rows.map((r: any) => r.id);
  const { error: updateErr } = await supabaseService
    .from("raw_venues")
    .update({ processed: true })
    .in("id", ids);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ rejected: ids.length });
}
