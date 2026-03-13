import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const STATUS_SCHEMA = z.object({
  status: z.string(),
});

const ALLOWED_STATUSES = ["draft", "saved", "active", "completed"] as const;

const normalizeStatus = (status: string) => (status === "confirmed" ? "active" : status);

const validateStatus = (status: string) => ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number]);

async function handleStatusUpdate(request: NextRequest, params: { id: string }) {
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

  const normalized = normalizeStatus(payload.data.status);

  if (!validateStatus(normalized)) {
    return NextResponse.json({ error: `Status must be one of ${ALLOWED_STATUSES.join(", ")}` }, { status: 400 });
  }

  const { error } = await supabase
    .from("plans")
    .update({ status: normalized })
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "updated", plan_status: normalized });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return handleStatusUpdate(request, params);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return handleStatusUpdate(request, params);
}

