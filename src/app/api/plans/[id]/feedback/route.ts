import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const BODY_SCHEMA = z.object({
  overall_rating: z.number().min(1).max(5),
  venue_ratings: z.array(
    z.object({
      venue_id: z.string(),
      quality: z.number().min(0).max(5),
      value: z.number().min(0).max(5),
      vibe: z.number().min(0).max(5),
    })
  ),
  highlights: z.array(z.string()),
  notes: z.string().optional().nullable(),
  actual_cost: z.number().min(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = BODY_SCHEMA.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.message }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: plan } = await supabase
    .from("plans")
    .select("id, user_id, status")
    .eq("id", params.id)
    .maybeSingle();

  if (!plan || plan.user_id !== user.id) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const { data: experience, error: experienceError } = await supabase
    .from("experience_logs")
    .insert({
      user_id: user.id,
      plan_id: params.id,
      actual_cost: payload.data.actual_cost,
      currency: "ZMW",
      overall_rating: payload.data.overall_rating,
      notes: payload.data.notes ?? "",
      highlights: payload.data.highlights.join(", "),
    })
    .select()
    .single();

  if (experienceError || !experience) {
    return NextResponse.json({ error: experienceError?.message ?? "Log failed" }, { status: 500 });
  }

  for (const rating of payload.data.venue_ratings) {
    const { error } = await supabase.from("experience_venue_feedback").insert({
      experience_id: experience.id,
      venue_id: rating.venue_id,
      actual_price: payload.data.actual_cost,
      venue_quality_rating: rating.quality,
      value_rating: rating.value,
      vibe_rating: rating.vibe,
      issue_flag: false,
      highlights: null,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (plan.status !== "completed") {
    await supabase.from("plans").update({ status: "completed" }).eq("id", params.id);
  }

  return NextResponse.json({ success: true });
}
