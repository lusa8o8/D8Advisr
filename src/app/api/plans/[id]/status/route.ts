import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const STATUS_SCHEMA = z.object({
  status: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = STATUS_SCHEMA.safeParse(await request.json());

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

  const normalizedStatus =
    payload.data.status === "confirmed" ? "active" : payload.data.status;

  const { error } = await supabase
    .from("plans")
    .update({ status: normalizedStatus })
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "updated" });
}
