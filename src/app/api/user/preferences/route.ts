import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const BODY_SCHEMA = z.object({
  vibes: z.array(z.string()),
  budget: z.number().min(0),
  groupSize: z.number().int().min(1).max(20),
});

export async function PATCH(request: NextRequest) {
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

  const { data: preference, error } = await supabase
    .from("user_preferences")
    .update({
      default_vibe: payload.data.vibes.join(","),
      budget_preference: payload.data.budget,
      group_size_preference: payload.data.groupSize,
      last_updated: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ preferences: preference });
}
