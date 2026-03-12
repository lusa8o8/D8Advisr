import type { GeneratedPlan, PlanStop, Venue } from "@/types/database";
import { searchVenues } from "@/lib/services/venue-service";

const PRICE_LEVEL_FALLBACK: Record<number, number> = {
  1: 50,
  2: 120,
  3: 250,
  4: 400,
};

function getEstimatedCostForVenue(venue: Venue, participants: number) {
  const base = PRICE_LEVEL_FALLBACK[venue.price_level ?? 2] ?? 120;
  return base * participants;
}

function buildTimeSlot(start: string, index: number) {
  const [hour, minute] = start.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  const minutesToAdd = index * 75;
  date.setMinutes(date.getMinutes() + minutesToAdd);
  return date.toTimeString().slice(0, 5);
}

export async function generatePlan(params: {
  city: string;
  budget: number;
  currency: string;
  participants: number;
  activityType?: string;
  occasion?: string;
  vibe?: string;
  startTime?: string;
}): Promise<GeneratedPlan | null> {
  const candidates = await searchVenues({ city: params.city, limit: 50 });
  const filtered = candidates.filter(
    (venue) => venue.confidence_score >= 0.5 && venue.is_active
  );

  if (filtered.length < 2) {
    return null;
  }

  const stops: PlanStop[] = [];
  const firstVenue = filtered[0];
  stops.push({
    venueId: firstVenue.id,
    venueName: firstVenue.name,
    activityType: firstVenue.activity_type,
    orderIndex: 1,
    estimatedCost: getEstimatedCostForVenue(firstVenue, params.participants),
    estimatedTimeMinutes: 75,
    timeSlot: buildTimeSlot(params.startTime ?? "19:00", 0),
  });

  const secondVenue = filtered.find(
    (venue) => venue.category !== firstVenue.category
  );

  if (secondVenue) {
    stops.push({
      venueId: secondVenue.id,
      venueName: secondVenue.name,
      activityType: secondVenue.activity_type,
      orderIndex: 2,
      estimatedCost: getEstimatedCostForVenue(
        secondVenue,
        params.participants
      ),
      estimatedTimeMinutes: 75,
      timeSlot: buildTimeSlot(params.startTime ?? "19:00", 1),
    });
  }

  const thirdVenue = filtered.find(
    (venue) =>
      venue.category !== firstVenue.category &&
      venue.category !== secondVenue?.category &&
      venue.id !== firstVenue.id &&
      venue.id !== secondVenue?.id
  );

  if (thirdVenue) {
    stops.push({
      venueId: thirdVenue.id,
      venueName: thirdVenue.name,
      activityType: thirdVenue.activity_type,
      orderIndex: stops.length + 1,
      estimatedCost: getEstimatedCostForVenue(
        thirdVenue,
        params.participants
      ),
      estimatedTimeMinutes: 75,
      timeSlot: buildTimeSlot(params.startTime ?? "19:00", 2),
    });
  }

  if (stops.length < 2) {
    return null;
  }

  const totalCost = stops.reduce((sum, stop) => sum + stop.estimatedCost, 0);

  if (totalCost > params.budget) {
    return null;
  }

  const vibesMap: Record<string, string> = {
    romantic: "Romantic Evening in Lusaka",
    fun: "Fun Night Out in Lusaka",
    adventure: "Adventure Night in Lusaka",
  };

  const planTitle =
    vibesMap[params.vibe?.toLowerCase() ?? ""] ??
    "A Night Out in Lusaka";

  const occasion = params.occasion ?? "Evening out";
  const vibe = params.vibe ?? "focused";

  return {
    title: planTitle,
    occasion,
    vibe,
    estimatedCost: Number(totalCost.toFixed(2)),
    currency: params.currency,
    durationMinutes: stops.length * 75,
    stops,
  };
}
