"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Heart, MapPin, Share, Star } from "lucide-react";
import { toast } from "sonner";
import type { VenueWithDetails } from "@/types/database";

const CATEGORY_EMOJIS: Record<string, string> = {
  restaurant: "🍽️",
  bar: "🍸",
  activity: "🎯",
  cafe: "☕",
  park: "🌿",
};

const DEFAULT_HIGHLIGHTS: Record<string, { emoji: string; label: string }[]> = {
  restaurant: [
    { emoji: "❤️", label: "Romantic Setting" },
    { emoji: "👥", label: "Great for Groups" },
    { emoji: "🌳", label: "Outdoor Seating" },
  ],
  bar: [
    { emoji: "🎵", label: "Live Atmosphere" },
    { emoji: "👥", label: "Great for Groups" },
    { emoji: "🍹", label: "Signature Drinks" },
  ],
  activity: [
    { emoji: "🎯", label: "Unique Experience" },
    { emoji: "👥", label: "Great for Groups" },
    { emoji: "⭐", label: "Top Rated" },
  ],
};

const formatCurrency = (amount: number) => `K${amount.toFixed(0)}`;

export default function Screen07VenueDetail({ venue }: { venue: VenueWithDetails }) {
  const router = useRouter();

  const heroEmoji = CATEGORY_EMOJIS[venue.category] ?? "✨";
  const priceIndicator = "$".repeat(Math.min(Math.max(venue.price_level ?? 1, 1), 4));

  const avgPrice = useMemo(() => {
    if (!venue.venue_prices.length) return 0;
    const total = venue.venue_prices.reduce((sum, price) => sum + price.price, 0);
    return total / venue.venue_prices.length;
  }, [venue.venue_prices]);

  const highlights: { emoji: string; label: string }[] = useMemo(() => {
    const rawHighlights = venue.venue_details?.highlights;
    if (rawHighlights?.length) {
      return rawHighlights.map((h) => ({ emoji: "❤️", label: h }));
    }
    return DEFAULT_HIGHLIGHTS[venue.category] ?? DEFAULT_HIGHLIGHTS.activity;
  }, [venue]);

  const getStarRating = (confidence: number) => {
    if (confidence >= 0.9) return (4.8 + (confidence - 0.9) * 2).toFixed(1);
    if (confidence >= 0.7) return (4.0 + (confidence - 0.7) * 3.5).toFixed(1);
    return (3.5 + (confidence - 0.5) * 2.5).toFixed(1);
  };

  const starRating = getStarRating(venue.confidence_score);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F7F7] pb-28">
      {/* Hero section */}
      <section className="relative h-[280px] w-full bg-[#FF5A5F]">
        <div className="flex h-full w-full items-center justify-center text-[64px]">
          {heroEmoji}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* CHANGE 2: Back + Share buttons */}
        <div className="absolute top-14 left-6 right-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => toast("Coming soon!")}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
          >
            <Share size={18} />
          </button>
        </div>
      </section>

      {/* CHANGE 1: Content card overlapping hero */}
      <div className="px-6 py-6 -mt-6 bg-white rounded-t-3xl relative z-10">
        {/* CHANGE 3: Category badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 bg-[#F7F7F7] text-[#555555] text-[11px] font-bold rounded-md uppercase tracking-wider">
            {venue.category}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#222222]">{venue.name}</h1>

        {/* CHANGE 4: Rating row */}
        <div className="flex items-center gap-4 mt-3 mb-5 border-b border-[#EBEBEB] pb-5">
          <div className="flex items-center gap-1.5">
            <Star size={16} className="fill-[#FF9500] text-[#FF9500]" />
            <span className="font-bold text-[15px] text-[#222222]">{starRating}</span>
            <span className="text-[#999999] text-sm">(24)</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-[#D1D1D1]"></span>
          {venue.address && (
            <div className="flex items-center gap-1 text-sm text-[#555555]">
              <MapPin size={14} />
              <span>Lusaka</span>
            </div>
          )}
          <span className="w-1 h-1 rounded-full bg-[#D1D1D1]"></span>
          <span className="font-bold text-[#FF5A5F] text-sm">{priceIndicator}</span>
        </div>

        {/* About */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#222222] mb-2">About</h2>
          <p className="text-sm text-[#555555] leading-relaxed">
            {venue.venue_details?.description ??
              "This venue delivers curated energy for your next experience."}
          </p>
        </div>

        {/* CHANGE 5: Highlights with emoji circles */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#222222] mb-3">Highlights</h2>
          <div className="flex flex-col gap-3">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF0F1] text-[#FF5A5F] flex items-center justify-center shrink-0">
                  {h.emoji}
                </div>
                <span className="text-[#222222] font-medium">{h.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing (if available) */}
        {venue.venue_prices.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#222222] mb-3">Pricing</h2>
            <div className="space-y-2">
              {venue.venue_prices.map((price) => (
                <div
                  key={price.id}
                  className="flex items-center justify-between rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] px-4 py-3"
                >
                  <p className="text-sm font-medium text-[#222222]">{price.item_name}</p>
                  <p className="text-sm font-bold text-[#222222]">{formatCurrency(price.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHANGE 6: Hours and price info card */}
        <div className="bg-[#F7F7F7] rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[#555555]">
              <Clock size={18} />
              <span className="font-medium text-sm">Open today · Lusaka</span>
            </div>
            <div className="bg-[#00C851]/10 text-[#00C851] px-3 py-1 rounded-full text-xs font-bold">
              ~K{venue.price_level ? venue.price_level * 100 : 150}/person
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE 7: Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] p-6 flex gap-4 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        <button className="w-14 h-14 rounded-xl border-2 border-[#EBEBEB] flex items-center justify-center text-[#555555] active:scale-95 transition-transform hover:bg-[#F7F7F7]">
          <Heart size={24} />
        </button>
        <button
          className="flex-1 bg-[#FF5A5F] text-white rounded-xl font-bold text-[17px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all"
          onClick={() => router.push(`/plans/generate?venueId=${venue.id}`)}
        >
          Add to Plan
        </button>
      </div>
    </div>
  );
}
