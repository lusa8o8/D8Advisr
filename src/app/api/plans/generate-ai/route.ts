import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { anthropicClient, logApiCost } from "@/lib/anthropic/client";
import { searchVenues, getVenueById } from "@/lib/services/venue-service";
import { z } from "zod";

const BODY_SCHEMA = z.object({
  occasion: z.string().optional(),
  vibes: z.array(z.string()).optional(),
  budget: z.number().positive(),
  group_size: z.number().min(1).optional(),
  plan_type: z.enum(["date", "group"]),
  when_text: z.string().optional(),
  venue_id: z.string().optional(),
});

const PLAN_SCHEMA = z.object({
  plan_name: z.string(),
  occasion: z.string(),
  total_estimated_cost: z.number(),
  currency: z.literal("ZMW"),
  stops: z.array(
    z.object({
      order: z.number(),
      venue_id: z.string(),
      venue_name: z.string(),
      activity: z.string(),
      duration_minutes: z.number(),
      estimated_cost: z.number(),
      arrival_time: z.string(),
      notes: z.string().optional().nullable(),
    })
  ),
  planner_note: z.string().optional(),
});

const SYSTEM_PROMPT = `
You are D8Advisr, an expert local experience planner for Lusaka, Zambia.
You create personalised date and group plans using only real venues from the database.
You never invent or fabricate venue information.
Always consult the provided venue search output before recommending anything.
Build plans that feel curated, not generic. Consider flow, timing, and budget carefully.
Respond only with a single JSON object matching the agreed schema.
`;

export async function POST(request: NextRequest) {
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

  try {
    const venues = await searchVenues({
      city: "Lusaka",
      limit: 8,
    });

    const selectedVenue = payload.data.venue_id
      ? await getVenueById(payload.data.venue_id)
      : null;

    const venueContext = [
      ...(selectedVenue ? [selectedVenue] : []),
      ...venues.slice(0, 5),
    ]
      .map((venue) => ({
        id: venue.id,
        name: venue.name,
        category: venue.category,
        activity_type: venue.activity_type,
        price_level: venue.price_level,
        confidence_score: venue.confidence_score,
        address: venue.address,
      }))
      .slice(0, 6);

    const userPrompt = `
Plan request:
- type: ${payload.data.plan_type}
- occasion: ${payload.data.occasion ?? "Any"}
- vibes: ${(payload.data.vibes ?? []).join(", ") || "Any"}
- budget per person: K${payload.data.budget}
- group size: ${payload.data.group_size ?? 1}
- when: ${payload.data.when_text ?? "Flexible"}
${selectedVenue ? `- focused venue: ${selectedVenue.name} (${selectedVenue.activity_type ?? selectedVenue.category})` : ""}
Available venues:
${JSON.stringify(venueContext, null, 2)}
Return the agreed JSON plan only.
`;

    const combinedPrompt = [SYSTEM_PROMPT.trim(), userPrompt.trim()].join("\n\n");

    const response = await anthropicClient.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: combinedPrompt }],
        },
      ],
    });

  const textOutput = response.content
    .map((block) => ("text" in block ? block.text : ""))
    .join("\n");
  const jsonMatch = textOutput.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return NextResponse.json(
      { error: "Could not understand Anthropic plan response." },
      { status: 502 }
    );
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json(
      { error: "Plan JSON is malformed" },
      { status: 502 }
    );
  }

  const planData = PLAN_SCHEMA.safeParse(parsedJson);

  if (!planData.success) {
    return NextResponse.json(
      { error: "Plan output did not match expected schema." },
      { status: 502 }
    );
  }

  const planJson = planData.data;
  const planName = planJson.plan_name;
  const planOccasion = planJson.occasion;
  const totalCost = planJson.total_estimated_cost;
  const groupSize = payload.data.plan_type === "group" ? payload.data.group_size ?? 2 : 1;

  const { data: createdPlan, error: planError } = await supabase
    .from("plans")
    .insert({
      user_id: user.id,
      name: planName,
      occasion: planOccasion,
      total_cost: totalCost,
      currency: planJson.currency,
      status: "generated",
      city: "Lusaka",
      group_size: groupSize,
      plan_data: planJson,
    })
    .select()
    .single();

  if (planError || !createdPlan) {
    return NextResponse.json({ error: planError?.message ?? "Plan save failed" }, { status: 500 });
  }

  const stopsPayload = planJson.stops.map((stop) => ({
    plan_id: createdPlan.id,
    venue_id: stop.venue_id,
    order_index: stop.order,
    activity: stop.activity,
    duration_minutes: stop.duration_minutes,
    estimated_cost: stop.estimated_cost,
    arrival_time: stop.arrival_time,
    notes: stop.notes ?? null,
  }));

  const { error: stopsError } = await supabase.from("plan_items").insert(stopsPayload);

  if (stopsError) {
    return NextResponse.json({ error: stopsError.message }, { status: 500 });
  }

  const usage = response.usage;
  const inputTokens = usage?.input_tokens ?? 0;
  const outputTokens = usage?.output_tokens ?? 0;
  const modelData = response.model;
  const modelName =
    typeof modelData === "string"
      ? modelData
      : (modelData as { id?: string }).id ?? "claude-sonnet-4-20250514";
  const costUsd = inputTokens * (3 / 1_000_000) + outputTokens * (15 / 1_000_000);

  await supabase.from("api_cost_logs").insert({
    user_id: user.id,
    model: modelName,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: costUsd,
    endpoint: "/api/plans/generate-ai",
  });

  logApiCost(modelName, inputTokens, outputTokens);

    return NextResponse.json({
      plan_id: createdPlan.id,
      plan: planJson,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate plan" },
      { status: 500 }
    );
  }
}
