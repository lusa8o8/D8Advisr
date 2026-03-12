import { NextRequest, NextResponse } from "next/server";
import { getVenueById } from "@/lib/services/venue-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const venue = await getVenueById(params.id);
  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }
  return NextResponse.json({ venue });
}
