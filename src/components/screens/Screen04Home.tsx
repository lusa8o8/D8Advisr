"use client"

import type { ElementType } from "react";
import { Filter, MapPin, Search, ShieldCheck, Award, Gem, Star, Ticket } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Venue } from "@/types/database";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import FilterModal, { FilterState } from "@/components/screens/Screen06FilterModal";
import { cn } from "@/lib/utils";
import {
  VENUE_CATEGORY_GROUPS,
  getCategoryEmoji,
  getCategoryLabel,
  getCategoryGroup,
} from "@/lib/constants/venue-categories";

// ─── Category / tier helpers ──────────────────────────────────────────────────

const GROUP_PILLS = ["All", ...VENUE_CATEGORY_GROUPS] as const;
type CategoryFilter = (typeof GROUP_PILLS)[number];

type Tier = "Verified" | "D8 Approved" | "Hidden Gem";
const TIER_STYLES: Record<Tier, { pill: string; icon: ElementType }> = {
  "Verified":    { pill: "bg-blue-600/80 text-white",   icon: ShieldCheck },
  "D8 Approved": { pill: "bg-amber-500/80 text-white",  icon: Award },
  "Hidden Gem":  { pill: "bg-purple-600/80 text-white", icon: Gem },
};
function venueTier(category: string): Tier {
  if (category === "restaurant" || category === "fine_dining" || category === "casual_dining") return "D8 Approved";
  if (category === "game_lodge" || category === "safari" || category === "resort") return "Hidden Gem";
  return "Verified";
}
function categoryGradient(category: string) {
  switch (category) {
    // Dining
    case "restaurant":
    case "fine_dining":
    case "casual_dining":
    case "rooftop_restaurant":
    case "brunch_spot":         return "from-rose-400 to-red-500";
    case "food_market":
    case "dessert":             return "from-orange-300 to-amber-400";
    case "cafe":                return "from-yellow-400 to-amber-500";
    // Drinks & Nightlife
    case "bar":
    case "pub_grill":
    case "brewery":             return "from-amber-400 to-orange-500";
    case "cocktail_bar":        return "from-pink-400 to-rose-500";
    case "wine_bar":            return "from-rose-600 to-red-700";
    case "rooftop_bar":         return "from-indigo-400 to-blue-500";
    case "jazz_bar":
    case "live_music":          return "from-pink-400 to-rose-500";
    case "nightclub":
    case "lounge":              return "from-purple-600 to-indigo-600";
    // Wellness & Stays
    case "resort":
    case "hotel":               return "from-teal-400 to-cyan-500";
    case "spa":
    case "yoga":                return "from-teal-300 to-green-400";
    case "pool":
    case "waterfront":          return "from-blue-400 to-cyan-500";
    // Nature & Outdoors
    case "game_lodge":
    case "safari":              return "from-amber-600 to-yellow-500";
    case "nature_reserve":
    case "park":
    case "hiking":
    case "adventure":           return "from-green-500 to-emerald-600";
    case "picnic":              return "from-lime-400 to-green-500";
    // Arts & Culture
    case "art_gallery":
    case "museum":              return "from-violet-400 to-purple-500";
    case "cinema":
    case "theatre":             return "from-red-400 to-orange-500";
    // Experiences
    case "karting":             return "from-orange-500 to-red-500";
    case "water_sports":        return "from-blue-400 to-cyan-500";
    case "activity":
    case "event_venue":         return "from-emerald-400 to-green-500";
    default:                    return "from-[#FF5A5F] to-rose-600";
  }
}
function eventBadgeLabel(category: string): string | null {
  if (category === "bar" || category === "jazz_bar" || category === "live_music") return "Live music this week";
  if (category === "activity" || category === "event_venue") return "Events this week";
  return null;
}

// ─── Experiences static data ──────────────────────────────────────────────────

const VIBE_COLORS: Record<string, string> = {
  "Romantic":    "bg-[#FFF0F1] text-primary",
  "Culture":     "bg-purple-50 text-purple-600",
  "Date Night":  "bg-green-50 text-[#00C851]",
  "Relaxing":    "bg-sky-50 text-sky-600",
  "Adventurous": "bg-orange-50 text-orange-600",
  "Group":       "bg-blue-50 text-blue-600",
};

const EXPERIENCES = [
  {
    id: "x1",
    name: "Candlelight Jazz Dinner",
    location: "A historic venue · Lusaka CBD",
    date: "Fri this week",
    time: "8:00 PM",
    price: "K350",
    vibes: ["Romantic", "Culture"],
    emoji: "🕯️",
    gradient: "from-rose-500 to-pink-600",
    urgency: "Only 12 spots left",
  },
  {
    id: "x2",
    name: "Rooftop Cinema Night",
    location: "Rooftop venue · Kabulonga",
    date: "Sat this week",
    time: "9:00 PM",
    price: "K180",
    vibes: ["Date Night", "Relaxing"],
    emoji: "🎬",
    gradient: "from-indigo-500 to-purple-600",
    urgency: null,
  },
  {
    id: "x3",
    name: "Night Market & Live Art",
    location: "Open-air · Arcades",
    date: "Sun this week",
    time: "6:00 PM",
    price: "Free",
    vibes: ["Adventurous", "Group"],
    emoji: "🎨",
    gradient: "from-emerald-400 to-teal-500",
    urgency: null,
  },
];

// ─── Filter logic ─────────────────────────────────────────────────────────────

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
  if (lat == null || lon == null) return Infinity;
  const dLat = toRadians(lat - centerCoords.lat);
  const dLon = toRadians(lon - centerCoords.lon);
  const lat1 = toRadians(centerCoords.lat);
  const lat2 = toRadians(lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c * 0.621371;
}

function matchesCategoryFilter(venue: Venue, filter: CategoryFilter) {
  if (filter === "All") return true;
  const group = getCategoryGroup(venue.category);
  return group === filter;
}

function matchesMood(venue: Venue, moods: string[]) {
  if (!moods.length) return true;
  const activity = venue.activity_type?.toLowerCase();
  const tags = (venue.tags ?? []).map((t) => t.toLowerCase());
  return moods.some((mood) => {
    const lower = mood.toLowerCase();
    return activity?.includes(lower) || tags.includes(lower);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

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
      return matchesSearch && matchesCategory && withinPrice && withinDistance && moodMatches && serverCategoryMatch;
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
      const params = new URLSearchParams({ city: "Lusaka", limit: "20" });
      if (filters.category) params.set("category", filters.category);
      if (filters.priceLevel) params.set("priceLevel", filters.priceLevel.toString());
      const response = await fetch(`/api/venues/search?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch venues");
      const payload = await response.json();
      setServerVenues(payload.venues ?? []);
    } catch {
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

  const hasVenues = displayVenues.length > 0;

  return (
    <section className="flex min-h-screen w-full flex-col bg-background">
      <TopBar />

      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">

        {/* Greeting + Search */}
        <div className="px-6 pt-6 pb-2">
          <h1 className="text-[28px] font-bold text-foreground mb-5">
            Good {timeOfDay}, {firstName} 👋
          </h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Find venues, activities, moods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-card border border-border/50 rounded-2xl shadow-sm font-medium text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background p-2 rounded-xl text-foreground"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="px-6 py-4 flex gap-2.5 overflow-x-auto no-scrollbar snap-x">
          {GROUP_PILLS.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setSelectedCategory(pill as CategoryFilter)}
              className={cn(
                "snap-start whitespace-nowrap px-4 py-2 rounded-full font-semibold text-sm transition-all",
                selectedCategory === pill
                  ? "bg-foreground text-card shadow-md"
                  : "bg-card text-muted-foreground border border-border hover:border-gray-300"
              )}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Experiences Near You */}
        <div className="mb-6">
          <div className="flex justify-between items-center px-6 mb-3">
            <div>
              <h2 className="text-[17px] font-bold text-foreground leading-tight">Experiences Near You</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Curated one-off events worth your evening</p>
            </div>
            <Ticket size={18} className="text-primary" />
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar px-6 snap-x pb-1">
            {EXPERIENCES.map((exp) => (
              <div
                key={exp.id}
                onClick={() => router.push("/plans/generate")}
                className="snap-start shrink-0 w-60 bg-card rounded-2xl border border-border shadow-sm overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
              >
                {/* Image area */}
                <div className={`h-24 bg-gradient-to-br ${exp.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center text-4xl drop-shadow-lg">
                    {exp.emoji}
                  </span>
                  {exp.urgency && (
                    <span className="absolute top-2.5 right-2.5 bg-white/90 text-[#FF9500] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {exp.urgency}
                    </span>
                  )}
                  {exp.price === "Free" && (
                    <span className="absolute top-2.5 right-2.5 bg-[#E8FFF0] text-[#00C851] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Free
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-3.5">
                  <p className="font-bold text-foreground text-[14px] leading-tight mb-1">{exp.name}</p>
                  <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{exp.location}</p>
                  <p className="text-[11px] text-muted-foreground mb-2.5">{exp.date} · {exp.time}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {exp.vibes.map((v) => (
                        <span
                          key={v}
                          className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", VIBE_COLORS[v] ?? "bg-gray-100 text-gray-600")}
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                    {exp.price !== "Free" && (
                      <span className="text-[12px] font-bold text-foreground ml-1 shrink-0">{exp.price}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Venue feed */}
        <div className="px-6 mb-2">
          <h2 className="text-[17px] font-bold text-foreground">Venues for You</h2>
        </div>
        <div className="px-6 flex flex-col gap-5 pb-6">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
              <p className="text-lg font-semibold text-foreground">Couldn&apos;t load venues</p>
              <p className="text-sm text-muted-foreground">Try again or adjust your filters.</p>
              <button
                type="button"
                onClick={() => handleApplyFilters(appliedFilters)}
                className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : !hasVenues ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center">
              <p className="text-lg font-semibold text-foreground">No venues found in Lusaka yet</p>
              <p className="text-sm text-muted-foreground">Check back soon — we&apos;re adding new spots!</p>
            </div>
          ) : (
            displayVenues.map((venue) => {
              const tier = venueTier(venue.category);
              const tierStyle = TIER_STYLES[tier];
              const TierIcon = tierStyle.icon;
              const eventBadge = eventBadgeLabel(venue.category);
              return (
                <div
                  key={venue.id}
                  onClick={() => router.push(`/venues/${venue.id}`)}
                  className="bg-card rounded-3xl overflow-hidden shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
                >
                  {/* Hero */}
                  {venue.image_url ? (
                    <div className="h-44 relative overflow-hidden">
                      <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                      {/* Tier badge — top left */}
                      <div className={cn(
                        "absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm text-[11px] font-bold shadow-sm",
                        tierStyle.pill
                      )}>
                        <TierIcon size={11} strokeWidth={2.5} />
                        {tier}
                      </div>
                      {/* Rating — top right */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-foreground flex items-center gap-1 shadow-sm">
                        <Star size={12} className="fill-[#FF9500] text-[#FF9500]" />
                        {venue.confidence_score ? (venue.confidence_score * 5).toFixed(1) : "4.8"}
                      </div>
                      {/* Emoji icon — bottom left */}
                      <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl border border-white/30">
                        {getCategoryEmoji(venue.category)}
                      </div>
                      {/* Event badge — bottom right */}
                      {eventBadge && (
                        <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Ticket size={10} /> {eventBadge}
                        </div>
                      )}
                    </div>
                  ) : (
                  <div className={`h-44 bg-gradient-to-br ${categoryGradient(venue.category)} relative flex items-center justify-center`}>
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                    {/* Emoji */}
                    <span className="text-5xl opacity-30 relative z-0">{getCategoryEmoji(venue.category)}</span>

                    {/* Tier badge — top left */}
                    <div className={cn(
                      "absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm text-[11px] font-bold shadow-sm",
                      tierStyle.pill
                    )}>
                      <TierIcon size={11} strokeWidth={2.5} />
                      {tier}
                    </div>

                    {/* Rating — top right */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-foreground flex items-center gap-1 shadow-sm">
                      <Star size={12} className="fill-[#FF9500] text-[#FF9500]" />
                      {venue.confidence_score ? (venue.confidence_score * 5).toFixed(1) : "4.8"}
                    </div>

                    {/* Emoji icon — bottom left */}
                    <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl border border-white/30">
                      {getCategoryEmoji(venue.category)}
                    </div>

                    {/* Event badge — bottom right */}
                    {eventBadge && (
                      <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Ticket size={10} /> {eventBadge}
                      </div>
                    )}
                  </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-[18px] text-foreground leading-tight">{venue.name}</h3>
                      <span className={cn("font-bold text-[15px]", venue.price_level === 0 ? "text-[#00C851]" : "text-primary")}>
                        {"K".repeat(Math.min(venue.price_level ?? 2, 4))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 font-medium capitalize">
                      <span>{getCategoryEmoji(venue.category)} {getCategoryLabel(venue.category)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span>Lusaka</span>
                      </div>
                    </div>
                    {venue.activity_type && (
                      <p className="text-muted-foreground text-[14px] leading-relaxed line-clamp-2 capitalize">
                        {venue.activity_type}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
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
        className="fixed bottom-28 right-6 bg-primary text-white px-5 py-4 rounded-full font-bold text-sm shadow-[0_8px_25px_-6px_rgba(255,90,95,0.6)] flex items-center gap-2 active:scale-95 transition-transform z-30"
      >
        ✨ Surprise Me
      </button>
    </section>
  );
}
