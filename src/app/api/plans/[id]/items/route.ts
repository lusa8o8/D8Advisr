import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const ITEMS_SCHEMA = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      time_slot: z.string(),
      estimated_cost: z.number().nonnegative(),
      estimated_time_minutes: z.number().nonnegative(),
    })
  ),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = ITEMS_SCHEMA.safeParse(await request.json());

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
    .select("id, user_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!plan || plan.user_id !== user.id) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  for (const item of payload.data.items) {
    const { error } = await supabase
      .from("plan_items")
      .update({
        time_slot: item.time_slot,
        estimated_cost: item.estimated_cost,
        estimated_time_minutes: item.estimated_time_minutes,
      })
      .eq("id", item.id)
      .eq("plan_id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const totalEstimate = payload.data.items.reduce((sum, item) => sum + item.estimated_cost, 0);

  const { error: planError } = await supabase
    .from("plans")
    .update({ estimated_cost: totalEstimate })
    .eq("id", params.id);

  if (planError) {
    return NextResponse.json({ error: planError.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", estimated_cost: totalEstimate });
}

