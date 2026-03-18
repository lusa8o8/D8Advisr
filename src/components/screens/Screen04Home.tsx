"use client"

import { Filter, Search, Star, Heart, ChevronRight } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Venue } from "@/types/database";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import FilterModal, { FilterState } from "@/components/screens/Screen06FilterModal";

const CATEGORY_OPTIONS = [
  "All",
  "Date Night",
  "Adventure",
  "Food",
  "Nightlife",
  "Outdoors",
  "Culture",
] as const;

type CategoryFilter = (typeof CATEGORY_OPTIONS)[number];

const createDefaultFilters = (): FilterState => ({
  category: undefined,
  priceLevel: 1000,
  distance: 10,
  moods: [],
});

const centerCoords = { lat: -15.4167, lon: 28.2833 };

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceFromCenter(lat?: number | null, lon?: number | null) {
  if (lat == null || lon == null) {
    return Infinity;
  }

  const dLat = toRadians(lat - centerCoords.lat);
  const dLon = toRadians(lon - centerCoords.lon);
  const lat1 = toRadians(centerCoords.lat);
  const lat2 = toRadians(lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = 6371 * c;
  return km * 0.621371;
}

function matchesCategoryFilter(venue: Venue, filter: CategoryFilter) {
  const tags = (venue.tags ?? []).map((tag) => tag.toLowerCase());
  const activity = venue.activity_type?.toLowerCase() ?? "";

  switch (filter) {
    case "Date Night":
      return (
        venue.category === "restaurant" ||
        tags.includes("romantic") ||
        activity.includes("romantic")
      );
    case "Adventure":
      return (
        activity.includes("adventure") || tags.includes("adventure") || venue.category === "activity"
      );
    case "Food":
      return venue.category === "restaurant" || venue.category === "cafe";
    case "Nightlife":
      return venue.category === "bar";
    case "Outdoors":
      return venue.category === "park" || tags.includes("outdoor") || activity.includes("outdoor");
    case "Culture":
      return tags.includes("cultural") || activity.includes("cultural");
    default:
      return true;
  }
}

function matchesMood(venue: Venue, moods: string[]) {
  if (!moods.length) {
    return true;
  }

  const check = (value?: string | null) => value?.toLowerCase();
  const activity = check(venue.activity_type);
  const tags = (venue.tags ?? []).map((tag) => tag.toLowerCase());

  return moods.some((mood) => {
    const lower = mood.toLowerCase();
    return activity?.includes(lower) || tags.includes(lower);
  });
}

function categoryGradient(category: string) {
  switch (category) {
    case "restaurant": return "from-rose-400 to-red-500";
    case "bar": return "from-amber-400 to-orange-500";
    case "activity": return "from-emerald-400 to-green-500";
    default: return "from-[#FF5A5F] to-rose-600";
  }
}

export type Screen04HomeProps = {
  initialVenues: Venue[];
  firstName: string;
};

export default function Screen04Home({ initialVenues, firstName }: Screen04HomeProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [serverVenues, setServerVenues] = useState<Venue[]>(initialVenues);
  const [displayVenues, setDisplayVenues] = useState<Venue[]>(initialVenues);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterDraft, setFilterDraft] = useState<FilterState>(createDefaultFilters());
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(createDefaultFilters());
  const [view, setView] = useState<"feed" | "map">("feed");

  useEffect(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filtered = serverVenues.filter((venue) => {
      const matchesSearch =
        !normalizedSearch ||
        venue.name.toLowerCase().includes(normalizedSearch) ||
        venue.activity_type?.toLowerCase().includes(normalizedSearch) ||
        (venue.tags ?? []).some((tag) => tag.toLowerCase().includes(normalizedSearch));

      const matchesCategory = matchesCategoryFilter(venue, selectedCategory);
      const venueDistance = distanceFromCenter(venue.latitude, venue.longitude);
      const withinPrice =
        !appliedFilters.priceLevel ||
        (venue.price_level ?? appliedFilters.priceLevel) <= appliedFilters.priceLevel;
      const withinDistance = venueDistance <= appliedFilters.distance;
      const moodMatches = matchesMood(venue, appliedFilters.moods);
      const serverCategoryMatch =
        !appliedFilters.category || venue.category === appliedFilters.category;

      return (
        matchesSearch &&
        matchesCategory &&
        withinPrice &&
        withinDistance &&
        moodMatches &&
        serverCategoryMatch
      );
    });

    setDisplayVenues(filtered);
  }, [serverVenues, searchQuery, selectedCategory, appliedFilters]);

  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }, []);

  const handleApplyFilters = async (filters: FilterState) => {
    setIsLoading(true);
    setError("");
    setAppliedFilters(filters);

    try {
      const params = new URLSearchParams({
        city: "Lusaka",
        limit: "20",
      });

      if (filters.category) {
        params.set("category", filters.category);
      }

      if (filters.priceLevel) {
        params.set("priceLevel", filters.priceLevel.toString());
      }

      const response = await fetch(`/api/venues/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch venues");
      }

      const payload = await response.json();
      setServerVenues(payload.venues ?? []);
    } catch (err) {
      setError("Couldn't load venues");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    const defaults = createDefaultFilters();
    setFilterDraft(defaults);
    handleApplyFilters(defaults);
  };

  const handleVenueSelect = (venue: Venue) => {
    router.push(`/venues/${venue.id}`);
  };

  const hasVenues = displayVenues.length > 0;

  return (
    <section className="flex min-h-screen w-full flex-col bg-[#F7F7F7]">
      <TopBar />

      {/* CHANGE 6 — Section spacing */}
      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">

        {/* Greeting + Search */}
        <div className="px-6 pt-6 pb-2">
          {/* CHANGE 1 — Greeting */}
          <h1 className="text-[28px] font-bold text-[#222222] mb-5">
            Good {timeOfDay}, {firstName} 👋
          </h1>

          {/* CHANGE 2 — Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Find venues, activities, moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#EBEBEB] rounded-2xl shadow-sm font-medium text-[#222222] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20"
            />
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#F7F7F7] p-2 rounded-xl text-[#222222]"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* CHANGE 3 — Category pills */}
        <div className="px-6 py-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x pb-2">
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category as CategoryFilter)}
                className={
                  selectedCategory === category
                    ? "snap-start whitespace-nowrap px-5 py-2.5 rounded-full font-semibold text-sm bg-[#222222] text-white shadow-md"
                    : "snap-start whitespace-nowrap px-5 py-2.5 rounded-full font-semibold text-sm bg-white text-[#555555] border border-[#EBEBEB]"
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle + Cards */}
        <div className="px-6">
          {/* CHANGE 4 — Feed/Map toggle */}
          <div className="bg-white rounded-full p-1 shadow-sm flex border border-[#EBEBEB] mb-4">
            <button
              type="button"
              onClick={() => setView("feed")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                view === "feed" ? "bg-[#FF5A5F] text-white shadow-sm" : "text-[#555555]"
              }`}
            >
              Feed
            </button>
            <button
              type="button"
              onClick={() => router.push("/map")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                view === "map" ? "bg-[#FF5A5F] text-white shadow-sm" : "text-[#555555]"
              }`}
            >
              Map
            </button>
          </div>

          {/* CHANGE 5 — Venue cards */}
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white px-6 py-10 text-center">
              <p className="text-lg font-semibold text-[#222222]">Couldn't load venues</p>
              <p className="text-sm text-[#555555]">Try again or adjust your filters.</p>
              <button
                type="button"
                onClick={() => handleApplyFilters(appliedFilters)}
                className="rounded-2xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : !hasVenues ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white px-6 py-10 text-center">
              <p className="text-lg font-semibold text-[#222222]">No venues found in Lusaka yet</p>
              <p className="text-sm text-[#555555]">
                Check back soon — we're adding new spots!
              </p>
            </div>
          ) : (
            displayVenues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => handleVenueSelect(venue)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#EBEBEB] cursor-pointer hover:shadow-md transition-shadow mb-5"
              >
                {/* Hero */}
                <div className={`h-40 bg-gradient-to-br ${categoryGradient(venue.category)} relative flex items-center justify-center`}>
                  <span className="text-5xl opacity-30">
                    {venue.category === "restaurant" ? "🍽️" : venue.category === "bar" ? "🍸" : venue.category === "activity" ? "🏛️" : "📍"}
                  </span>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#222222] flex items-center gap-1 shadow-sm">
                    <Star size={12} className="fill-[#FF9500] text-[#FF9500]" />
                    {venue.confidence_score
                      ? (venue.confidence_score * 5).toFixed(1)
                      : "4.8"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[18px] text-[#222222]">{venue.name}</h3>
                    <span className="font-bold text-[15px] text-[#FF5A5F]">
                      {"K".repeat(venue.price_level ?? 2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 font-medium capitalize">
                    {venue.category}{venue.activity_type ? ` · ${venue.activity_type}` : ""}
                  </p>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); }}
                      className="w-9 h-9 rounded-full bg-[#F7F7F7] flex items-center justify-center"
                    >
                      <Heart size={18} className="text-[#555555]" />
                    </button>
                    <ChevronRight size={20} className="text-[#EBEBEB]" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <FilterModal
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        draft={filterDraft}
        setDraft={setFilterDraft}
        onApply={(filters) => handleApplyFilters(filters)}
        onReset={handleResetFilters}
      />

      <button
        type="button"
        onClick={() => router.push("/plans/generate")}
        className="fixed bottom-28 right-6 bg-[#FF5A5F] text-white px-5 py-4 rounded-full font-bold text-sm shadow-[0_8px_25px_-6px_rgba(255,90,95,0.6)] flex items-center gap-2 active:scale-95 transition-transform z-30"
      >
        ✨ Surprise Me
      </button>
    </section>
  );
}
