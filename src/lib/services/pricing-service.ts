import type { PlanStop } from "@/types/database";

export function estimatePlanCost(params: {
  stops: PlanStop[];
  participants: number;
  currency: string;
}) {
  const totalEstimate = Number(
    params.stops
      .reduce((sum, stop) => sum + stop.estimatedCost, 0)
      .toFixed(2)
  );

  const perPersonEstimate =
    params.participants > 0
      ? Number((totalEstimate / params.participants).toFixed(2))
      : totalEstimate;

  const breakdown = params.stops.map((stop) => ({
    venueName: stop.venueName,
    cost: Number(stop.estimatedCost.toFixed(2)),
  }));

  return {
    totalEstimate,
    perPersonEstimate,
    confidenceScore: 0.7,
    currency: params.currency,
    breakdown,
  };
}
