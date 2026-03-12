import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const body = await request.json();
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
