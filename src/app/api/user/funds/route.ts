import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: funds } = await (supabase as any)
    .from("sinking_funds")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return NextResponse.json({ funds: funds ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action } = body;

  // ── Create a new fund ──────────────────────────────────────────────────────
  if (action === "create") {
    const { name, emoji, goal_amount, auto_save_amount, auto_save_frequency } = body;
    if (!name || !goal_amount) {
      return NextResponse.json({ error: "name and goal_amount are required" }, { status: 400 });
    }
    const { data, error } = await (supabase as any)
      .from("sinking_funds")
      .insert({
        user_id: user.id,
        name,
        emoji: emoji ?? "💰",
        goal_amount: Number(goal_amount),
        current_amount: 0,
        currency: "ZMW",
        auto_save_amount: auto_save_amount ? Number(auto_save_amount) : null,
        auto_save_frequency: auto_save_frequency ?? null,
        status: "active",
        is_locked: false,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ fund: data });
  }

  // ── Deposit into a fund ────────────────────────────────────────────────────
  if (action === "deposit") {
    const { fund_id, amount } = body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const { data: fund } = await (supabase as any)
      .from("sinking_funds")
      .select("current_amount")
      .eq("id", fund_id)
      .eq("user_id", user.id)
      .single();

    if (!fund) return NextResponse.json({ error: "Fund not found" }, { status: 404 });

    await (supabase as any).from("fund_transactions").insert({
      fund_id,
      user_id: user.id,
      amount: amt,
      type: "deposit",
      source: "manual",
    });

    const { data: updated, error } = await (supabase as any)
      .from("sinking_funds")
      .update({ current_amount: fund.current_amount + amt })
      .eq("id", fund_id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ fund: updated });
  }

  // ── Withdraw from a fund ───────────────────────────────────────────────────
  if (action === "withdraw") {
    const { fund_id, amount } = body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const { data: fund } = await (supabase as any)
      .from("sinking_funds")
      .select("current_amount, is_locked, goal_amount")
      .eq("id", fund_id)
      .eq("user_id", user.id)
      .single();

    if (!fund) return NextResponse.json({ error: "Fund not found" }, { status: 404 });
    if (amt > fund.current_amount) return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });

    const isEarly = fund.is_locked && fund.current_amount < fund.goal_amount;
    const penalty = isEarly ? +(amt * 0.1).toFixed(2) : 0;

    await (supabase as any).from("fund_transactions").insert({
      fund_id,
      user_id: user.id,
      amount: amt,
      type: "withdrawal",
      source: "manual",
      notes: isEarly ? `Early withdrawal — 10% penalty: K${penalty}` : null,
    });

    const { data: updated, error } = await (supabase as any)
      .from("sinking_funds")
      .update({ current_amount: Math.max(0, fund.current_amount - amt) })
      .eq("id", fund_id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ fund: updated, penalty });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
