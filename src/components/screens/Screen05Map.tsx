"use client"

import type { Venue } from "@/types/database";
import { VenueCard } from "@/components/ui/VenueCard";

type Screen05MapProps = {
  venues: Venue[];
  onCardPress: (venue: Venue) => void;
  onCardSave: (venue: Venue) => void;
};

export default function Screen05Map({
  venues,
  onCardPress,
  onCardSave,
}: Screen05MapProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-[#E5E5E5] bg-[#F0F0F0] p-6 text-center">
        <p className="text-lg font-semibold text-[#222222]">Map view coming soon</p>
        <p className="text-sm text-[#555555]">We'll show venue locations here</p>
      </div>

      <div className="space-y-4">
        {venues.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            onPress={() => onCardPress(venue)}
            onSave={() => onCardSave(venue)}
          />
        ))}
      </div>
    </div>
  );
}
