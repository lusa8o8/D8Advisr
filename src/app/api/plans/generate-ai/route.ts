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
  title: z.string(),
  occasion: z.string().optional(),
  total_estimated_cost_per_person: z.union([z.string(), z.number()]),
  activities: z.array(
    z.object({
      venue_id: z.string(),
      venue_name: z.string(),
      activity_description: z.string(),
      start_time: z.string(),
      estimated_cost_per_person: z.union([z.string(), z.number()]),
      tips: z.string().optional().nullable(),
    })
  ),
  flow_notes: z.string().optional(),
});

const SYSTEM_PROMPT = `
You are D8Advisr, an expert local experience planner for Lusaka, Zambia.
You create personalised date and group plans using only real venues from the database.
You never invent or fabricate venue information.

Respond ONLY with a single valid JSON object with exactly these fields:
{
  "title": "Plan name", 
  "occasion": "occasion type", 
  "total_estimated_cost_per_person": 450, 
  "activities": [
    {
      "venue_id": "uuid from available venues",
      "venue_name": "venue name",
      "activity_description": "what to do there",
      "start_time": "18:30",
      "estimated_cost_per_person": 150,
      "tips": "optional tip"
    }
  ],
  "flow_notes": "overall plan narrative"
}

IMPORTANT:
- Use numeric values for all costs, not strings like "K450"
- venue_id must be a real UUID from the available venues list
- Include 2-3 activities maximum
- No markdown, no code fences, just raw JSON
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
    console.error("ZOD ISSUES:", JSON.stringify(planData.error.issues, null, 2));
    console.error("RAW JSON:", JSON.stringify(parsedJson, null, 2));
    return NextResponse.json(
      { error: "Plan output did not match expected schema." },
      { status: 502 }
    );
  }

  const planJson = planData.data;
  const parseCost = (val: string | number) =>
    typeof val === "string" ? parseFloat(val.replace(/[^0-9.]/g, "")) : val;

  const planName = planJson.title;
  const planOccasion = planJson.occasion ?? payload.data.occasion ?? "General";
  const totalCost = parseCost(planJson.total_estimated_cost_per_person);
  const groupSize = payload.data.plan_type === "group" ? payload.data.group_size ?? 2 : 1;

  const { data: createdPlan, error: planError } = await supabase
    .from("plans")
    .insert({
      user_id: user.id,
      title: planName,
      occasion: planOccasion,
      estimated_cost: totalCost,
      currency: "ZMW",
      status: "draft",
      city: "Lusaka",
      participant_count: groupSize,
      vibe: (payload.data.vibes ?? []).join(", "),
      source: "agent",
    })
    .select()
    .single();

  if (planError || !createdPlan) {
    return NextResponse.json({ error: planError?.message ?? "Plan save failed" }, { status: 500 });
  }

  const stopsPayload = planJson.activities.map((stop, index) => ({
    plan_id: createdPlan.id,
    venue_id: stop.venue_id,
    order_index: index + 1,
    activity_type: stop.activity_description,
    estimated_time_minutes: 90,
    estimated_cost: parseCost(stop.estimated_cost_per_person),
    time_slot: stop.start_time,
    notes: stop.tips ?? null,
  }));

  // Store planner_note in plan_items notes or as first stop note
  // Nothing to store separately - planner_note passed back in response
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
      planner_note: planJson.flow_notes ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate plan" },
      { status: 500 }
    );
  }
}
