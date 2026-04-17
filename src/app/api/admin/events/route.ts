import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

// ── GET — list events (optionally filtered by venue_id) ──────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const venue_id = searchParams.get("venue_id");

  let query = supabaseService
    .from("events")
    .select("*, venues(name)")
    .order("starts_at", { ascending: false })
    .limit(50);

  if (venue_id) {
    query = query.eq("venue_id", venue_id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten venue name from join
  const events = (data ?? []).map((e: Record<string, unknown>) => ({
    ...e,
    venue_name: (e.venues as { name: string } | null)?.name ?? null,
    venues: undefined,
  }));

  return NextResponse.json({ events });
}

// ── POST — create event ───────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabaseService
    .from("events")
    .insert({
      venue_id:    body.venue_id,
      title:       String(body.title).trim(),
      description: body.description ?? null,
      vibe_tags:   body.vibe_tags ?? [],
      price:       Number(body.price ?? 0),
      currency:    "ZMW",
      starts_at:   body.starts_at,
      ends_at:     body.ends_at ?? null,
      source:      "manual",
      is_active:   body.is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data });
}

// ── PATCH — update event fields (e.g. toggle is_active) ──────────────────────
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { event_id, ...fields } = body;

  if (!event_id) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const { error } = await supabaseService
    .from("events")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", event_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// ── DELETE — hard delete event ────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { event_id } = body;

  if (!event_id) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const { error } = await supabaseService
    .from("events")
    .delete()
    .eq("id", event_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
