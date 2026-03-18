"use client"

import { Filter } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Venue } from "@/types/database";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { VenueCard } from "@/components/ui/VenueCard";
import FilterModal, { FilterState } from "@/components/screens/Screen06FilterModal";
import Screen05Map from "@/components/screens/Screen05Map";

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
  priceLevel: 2,
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

export type Screen04HomeProps = {
  initialVenues: Venue[];
  firstName: string;
};

export default function Screen04Home({ initialVenues, firstName }: Screen04HomeProps) {
  const router = useRouter();
  const [view, setView] = useState<"feed" | "map">("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [serverVenues, setServerVenues] = useState<Venue[]>(initialVenues);
  const [displayVenues, setDisplayVenues] = useState<Venue[]>(initialVenues);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterDraft, setFilterDraft] = useState<FilterState>(createDefaultFilters());
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(createDefaultFilters());

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

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    }
    if (hour < 17) {
      return "Good afternoon";
    }
    return "Good evening";
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

  const handleSaveVenue = (venue: Venue) => {
    console.log("Save venue:", venue.name);
  };

  const hasVenues = displayVenues.length > 0;

  return (
    <section className="flex min-h-screen w-full flex-col bg-[#F7F7F7] pb-32">
      <TopBar />
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 px-4 pt-4">

        <div>
          <p className="text-lg font-semibold text-[#222222]">
            {greeting}, {firstName} 👋
          </p>
          <p className="text-sm text-[#555555]">Curated venues and surprise plans await.</p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-[#E5E5E5] bg-white px-4 py-2">
          <input
            type="search"
            className="w-full border-0 bg-transparent p-0 text-sm text-[#222222] focus:outline-none"
            placeholder="Find venues, activities, mood..."
            aria-label="Search venues"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="rounded-full bg-[#FF5A5F] p-2 text-white"
          >
            <Filter size={18} />
          </button>
        </div>

        <div className="flex overflow-x-auto pb-3">
          <div className="flex gap-2">
            {CATEGORY_OPTIONS.map((category) => (
              <CategoryPill
                key={category}
                label={category}
                selected={selectedCategory === category}
                onSelect={() => setSelectedCategory(category as CategoryFilter)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 rounded-full bg-white px-2 py-1.5 shadow-sm">
          {["feed", "map"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option as "feed" | "map")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                view === option ? "bg-[#FF5A5F] text-white" : "text-[#555555]"
              }`}
            >
              {option === "feed" ? "Feed" : "Map"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
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
          ) : view === "feed" ? (
            displayVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onPress={() => handleVenueSelect(venue)}
                onSave={() => handleSaveVenue(venue)}
              />
            ))
          ) : (
            <Screen05Map
              venues={displayVenues}
              onCardPress={handleVenueSelect}
              onCardSave={handleSaveVenue}
            />
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

      <div className="fixed bottom-24 left-1/2 z-20 -translate-x-1/2">
        <button
          type="button"
          onClick={() => router.push("/plans/generate")}
          className="flex items-center justify-center rounded-[999px] bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF5A5F]/40"
        >
          ✨ Surprise Me
        </button>
      </div>
    </section>
  );
}
