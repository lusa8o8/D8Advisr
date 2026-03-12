import { NextRequest, NextResponse } from "next/server";
import { searchVenues } from "@/lib/services/venue-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "Lusaka";
  const category = searchParams.get("category") ?? undefined;
  const priceLevel = searchParams.has("priceLevel")
    ? Number(searchParams.get("priceLevel"))
    : undefined;
  const limit = searchParams.has("limit")
    ? Number(searchParams.get("limit"))
    : 20;

  const venues = await searchVenues({
    city,
    category: category || undefined,
    priceLevel,
    limit,
  });

  return NextResponse.json({ venues, count: venues.length });
}
