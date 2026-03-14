import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { searchVenues } from '@/lib/services/venue-service';
import { anthropicClient, logApiCost } from '@/lib/anthropic/client';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { occasion, vibes, budget, group_size, plan_type, when_text } = body;

    if (!occasion || !vibes || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: occasion, vibes, budget' },
        { status: 400 }
      );
    }

    const venues = await searchVenues({ city: 'Lusaka', limit: 8 });

    if (!venues || venues.length === 0) {
      return NextResponse.json(
        { error: 'No venues available. Please try again later.' },
        { status: 503 }
      );
    }

    const venueContext = venues.map(v =>
      `${v.name} (${v.category}, ${v.activity_type}, price level ${v.price_level}, ${v.address})`
    ).join('\n');

    const prompt = `You are a Lusaka date and experience planner. Generate a plan for:
Occasion: ${occasion}
Vibe: ${Array.isArray(vibes) ? vibes.join(', ') : vibes}
Budget: K${budget} per person
Group size: ${group_size || 2}
When: ${when_text || 'this evening'}
Type: ${plan_type || 'date'}

Available venues in Lusaka:
${venueContext}

Respond with valid JSON only, no markdown, no explanation:
{
  "title": "plan title",
  "occasion": "${occasion}",
  "total_estimated_cost_per_person": number,
  "flow_notes": "brief note about the evening flow",
  "activities": [
    {
      "venue_name": "exact venue name from list",
      "activity_type": "dining|drinks|activity|entertainment",
      "time_slot": "19:00",
      "estimated_time_minutes": 90,
      "estimated_cost": number,
      "notes": "what to do here"
    }
  ]
}`;

    const response = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const rawText = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');

    let planData;
    try {
      planData = JSON.parse(rawText);
    } catch {
      console.error('Failed to parse Claude response:', rawText);
      return NextResponse.json(
        { error: 'Plan generation failed. Please try again.', code: 'PARSE_ERROR' },
        { status: 500 }
      );
    }

    logApiCost(
  'claude-sonnet-4-20250514',
  response.usage.input_tokens,
  response.usage.output_tokens
);

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .insert({
        user_id: user.id,
        title: planData.title,
        city: 'Lusaka',
        estimated_cost: planData.total_estimated_cost_per_person,
        currency: 'ZMW',
        occasion: planData.occasion,
        vibe: Array.isArray(vibes) ? vibes[0] : vibes,
        participant_count: group_size || 2,
        source: 'agent',
        status: 'draft',
      })
      .select()
      .single();

    if (planError || !plan) {
      console.error('Failed to save plan:', planError);
      return NextResponse.json(
        { error: 'Failed to save plan. Please try again.', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    const venueMap = Object.fromEntries(venues.map(v => [v.name, v]));

    const items = await Promise.all(
      planData.activities.map(async (activity: any, index: number) => {
        const venue = venueMap[activity.venue_name];
        if (!venue) return null;

        const { error: itemError } = await supabase
          .from('plan_items')
          .insert({
            plan_id: plan.id,
            venue_id: venue.id,
            order_index: index,
            activity_type: activity.activity_type,
            estimated_time_minutes: activity.estimated_time_minutes,
            estimated_cost: activity.estimated_cost,
            time_slot: activity.time_slot,
            notes: activity.notes,
          });

        if (itemError) console.error('Failed to save plan item:', itemError);
        return venue;
      })
    );

    return NextResponse.json({
      plan_id: plan.id,
      plan: planData,
      planner_note: planData.flow_notes,
    });

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Plan generation failed. Please try again.', code: 'AI_GENERATION_FAILED' },
      { status: 500 }
    );
  }
}