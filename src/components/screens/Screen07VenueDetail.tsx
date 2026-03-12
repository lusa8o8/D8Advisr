"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, MapPin, Star } from "lucide-react";
import type { VenueWithDetails } from "@/types/database";

const CATEGORY_EMOJIS: Record<string, string> = {
  restaurant: "🍽️",
  bar: "🍸",
  activity: "🎯",
  cafe: "☕",
  park: "🌿",
};

const tabs = ["overview", "highlights", "pricing"] as const;

const formatCurrency = (amount: number) => `K${amount.toFixed(0)}`;

export default function Screen07VenueDetail({ venue }: { venue: VenueWithDetails }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("overview");

  const heroEmoji = CATEGORY_EMOJIS[venue.category] ?? "✨";

  const priceIndicator = "$".repeat(Math.min(Math.max(venue.price_level ?? 1, 1), 4));

  const openingHours = venue.opening_hours?.["default"] ?? null;

  const avgPrice = useMemo(() => {
    if (!venue.venue_prices.length) {
      return 0;
    }
    const total = venue.venue_prices.reduce((sum, price) => sum + price.price, 0);
    return total / venue.venue_prices.length;
  }, [venue.venue_prices]);

  const highlightedPrices = useMemo(() => {
    if (!venue.venue_prices.length) return [];
    return venue.venue_prices;
  }, [venue.venue_prices]);

  const getStarRating = (confidence: number) => {
    if (confidence >= 0.9) return (4.8 + (confidence - 0.9) * 2).toFixed(1);
    if (confidence >= 0.7) return (4.0 + (confidence - 0.7) * 3.5).toFixed(1);
    return (3.5 + (confidence - 0.5) * 2.5).toFixed(1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7] pb-28">
      <section className="relative h-[240px] w-full bg-[#FF5A5F]">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 rounded-full border border-white bg-white/20 p-2 text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-2xl bg-white/20 px-3 py-1 text-sm text-white">
          <Star size={16} />
          {venue.confidence_score.toFixed(1)}
        </div>
        <div className="flex h-full w-full items-center justify-center text-[48px] text-white">
          {heroEmoji}
        </div>
      </section>

      <section className="space-y-3 px-5 py-5">
        <h1 className="text-2xl font-bold text-[#222222]">{venue.name}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#FF5A5F]">
            {venue.category}
          </span>
          <span className="text-sm text-[#555555]">{priceIndicator}</span>
        </div>
        {venue.address && (
          <div className="flex items-center gap-2 text-sm text-[#555555]">
            <MapPin size={16} />
            <span>{venue.address}</span>
          </div>
        )}
        {openingHours && (
          <div className="flex items-center gap-2 text-sm text-[#555555]">
            <Clock size={16} />
            <span>{openingHours}</span>
          </div>
        )}
      </section>

      <section className="mt-2 flex border-b border-[#E5E5E5]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 border-b-2 px-4 py-3 text-center text-sm font-semibold ${
              activeTab === tab
                ? "border-[#FF5A5F] text-[#222222]"
                : "border-transparent text-[#555555]"
            }`}
          >
            {tab === "overview" ? "Overview" : tab === "highlights" ? "Highlights" : "Pricing"}
          </button>
        ))}
      </section>

      <section className="flex-1 px-5 py-4">
        {activeTab === "overview" && (
          <>
            <h2 className="text-sm font-semibold text-[#222222]">About</h2>
            <p className="mt-2 text-sm text-[#555555]">
              {venue.venue_details?.description ??
                "This venue delivers curated energy for your next experience."}
            </p>
          </>
        )}

        {activeTab === "highlights" && (
          <div className="flex flex-wrap gap-2">
            {venue.venue_details?.highlights?.length ? (
              venue.venue_details.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full bg-[#F7F7F7] px-3 py-1 text-xs font-semibold text-[#222222]"
                >
                  {highlight}
                </span>
              ))
            ) : (
              <p className="text-sm text-[#555555]">No highlights available yet.</p>
            )}
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
              <p className="text-xs text-[#555555]">Average spend per person</p>
              <p className="text-2xl font-semibold text-[#FF5A5F]">
                {formatCurrency(avgPrice)}
              </p>
            </div>
            <div className="space-y-3">
              {highlightedPrices.map((price) => (
                <div
                  key={price.id}
                  className="flex items-center justify-between rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">{price.item_name}</p>
                    <p className="text-xs text-[#555555]">{price.currency}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#222222]">{formatCurrency(price.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#555555]">Average cost</p>
            <p className="text-lg font-semibold text-[#FF5A5F]">{formatCurrency(avgPrice)}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/plans/generate?venueId=${venue.id}`)}
            className="rounded-xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white"
          >
            Add to Plan
          </button>
        </div>
      </footer>
    </div>
  );
}
