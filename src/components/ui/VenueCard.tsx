"use client"

import { Heart, Star, ChevronRight } from "lucide-react";
import type { Venue } from "@/types/database";

type VenueCardProps = {
  venue: Venue;
  onPress: () => void;
  onSave: () => void;
};

const CATEGORY_EMOJIS: Record<string, string> = {
  restaurant: "🍽️",
  bar: "🍸",
  activity: "🎯",
  cafe: "☕",
  park: "🌿",
};

const CENTER_COORDS = { lat: -15.4167, lon: 28.2833 };

function calculateDistance(lat?: number | null, lon?: number | null) {
  if (lat == null || lon == null) {
    return null;
  }

  const rad = Math.PI / 180;
  const dLat = (lat - CENTER_COORDS.lat) * rad;
  const dLon = (lon - CENTER_COORDS.lon) * rad;
  const lat1 = CENTER_COORDS.lat * rad;
  const lat2 = lat * rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = 6371 * c;
  const distanceMiles = distanceKm * 0.621371;
  return distanceMiles;
}

function formatRating(confidence: number) {
  if (confidence >= 0.9) {
    return (4.8 + (confidence - 0.9) * 2).toFixed(1);
  }

  if (confidence >= 0.7) {
    return (4 + (confidence - 0.7) * 3.5).toFixed(1);
  }

  return (3.5 + (confidence - 0.5) * 2).toFixed(1);
}

function formatActivity(activity: string) {
  return activity
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getPriceIndicator(level?: number | null) {
  const priceLevel = Math.min(Math.max(level ?? 1, 1), 4);
  return "$".repeat(priceLevel);
}

export function VenueCard({ venue, onPress, onSave }: VenueCardProps) {
  const rating = formatRating(venue.confidence_score);
  const distance = calculateDistance(venue.latitude, venue.longitude);
  const distanceLabel =
    distance != null ? `${distance.toFixed(1)} mi` : "Distance unknown";
  const description =
    venue.activity_type?.replace(/_/g, " ") ?? "Great vibe, curated just for you.";
  const heroEmoji = CATEGORY_EMOJIS[venue.category] ?? CATEGORY_EMOJIS.activity;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onPress();
        }
      }}
      className="w-full cursor-pointer overflow-hidden rounded-[24px] border border-transparent bg-white shadow-sm transition hover:border-[#FF5A5F]/50 hover:shadow-md"
    >
      <div className="relative h-[160px] w-full bg-[#FF5A5F] text-6xl text-white">
        <div className="flex h-full w-full items-center justify-center text-5xl">
          {heroEmoji}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#222222]">
          <Star size={12} className="text-[#FF5A5F]" />
          {rating}
        </div>
      </div>

      <div className="space-y-2 px-4 py-4">
        <p className="text-base font-semibold text-[#222222]">{venue.name}</p>
        <p className="text-xs text-[#555555]">
          {formatActivity(venue.activity_type)} • {distanceLabel}
        </p>
        <p
          className="text-xs text-[#555555]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>
        <div className="flex items-center justify-between text-xs text-[#555555]">
          <span className="font-semibold">{getPriceIndicator(venue.price_level)}</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSave();
              }}
              className="rounded-full border border-[#E5E5E5] p-2 transition hover:border-[#FF5A5F]"
            >
              <Heart size={16} className="text-[#FF5A5F]" />
            </button>
            <ChevronRight size={18} className="text-[#222222]" />
          </div>
        </div>
      </div>
    </div>
  );
}
