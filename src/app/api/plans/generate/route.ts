import { NextRequest, NextResponse } from "next/server";
import { generatePlan } from "@/lib/services/plan-generator-service";
import { estimatePlanCost } from "@/lib/services/pricing-service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    budget = 300,
    currency = "ZMW",
    participants = 2,
    activityType,
    occasion,
    vibe,
    city = "Lusaka",
  } = body;

  const plan = await generatePlan({
    city,
    budget,
    currency,
    participants,
    activityType,
    occasion,
    vibe,
  });

  if (!plan) {
    return NextResponse.json(
      { error: "Could not generate plan with available venues" },
      { status: 422 }
    );
  }

  const costEstimate = estimatePlanCost({
    stops: plan.stops,
    participants,
    currency,
  });

  return NextResponse.json({ plan, costEstimate });
}
