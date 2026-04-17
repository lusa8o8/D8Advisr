export type VenueCategoryGroup =
  | "Dining"
  | "Drinks & Nightlife"
  | "Wellness & Stays"
  | "Nature & Outdoors"
  | "Arts & Culture"
  | "Experiences";

export type VenueCategory = {
  value: string;
  label: string;
  group: VenueCategoryGroup;
  emoji: string;
};

export const VENUE_CATEGORIES: VenueCategory[] = [
  // ── Dining ────────────────────────────────────────────────────────────────
  { value: "fine_dining",         label: "Fine Dining",         group: "Dining",              emoji: "🍽️" },
  { value: "casual_dining",       label: "Casual Dining",       group: "Dining",              emoji: "🍴" },
  { value: "rooftop_restaurant",  label: "Rooftop Restaurant",  group: "Dining",              emoji: "🌆" },
  { value: "brunch_spot",         label: "Brunch Spot",         group: "Dining",              emoji: "🥞" },
  { value: "cafe",                label: "Cafe & Coffee",       group: "Dining",              emoji: "☕" },
  { value: "dessert",             label: "Dessert & Ice Cream", group: "Dining",              emoji: "🍦" },
  { value: "food_market",         label: "Food Market",         group: "Dining",              emoji: "🛒" },
  { value: "restaurant",          label: "Restaurant",          group: "Dining",              emoji: "🍽️" },

  // ── Drinks & Nightlife ────────────────────────────────────────────────────
  { value: "cocktail_bar",        label: "Cocktail Bar",        group: "Drinks & Nightlife",  emoji: "🍸" },
  { value: "wine_bar",            label: "Wine Bar",            group: "Drinks & Nightlife",  emoji: "🍷" },
  { value: "rooftop_bar",         label: "Rooftop Bar",         group: "Drinks & Nightlife",  emoji: "🌃" },
  { value: "jazz_bar",            label: "Jazz Bar",            group: "Drinks & Nightlife",  emoji: "🎷" },
  { value: "lounge",              label: "Lounge",              group: "Drinks & Nightlife",  emoji: "🛋️" },
  { value: "pub_grill",           label: "Pub & Grill",         group: "Drinks & Nightlife",  emoji: "🍺" },
  { value: "nightclub",           label: "Nightclub",           group: "Drinks & Nightlife",  emoji: "🎧" },
  { value: "bar",                 label: "Bar",                 group: "Drinks & Nightlife",  emoji: "🍻" },
  { value: "brewery",             label: "Brewery",             group: "Drinks & Nightlife",  emoji: "🍺" },

  // ── Wellness & Stays ──────────────────────────────────────────────────────
  { value: "resort",              label: "Resort",              group: "Wellness & Stays",    emoji: "🏖️" },
  { value: "spa",                 label: "Spa & Wellness",      group: "Wellness & Stays",    emoji: "💆" },
  { value: "hotel",               label: "Hotel Experience",    group: "Wellness & Stays",    emoji: "🏨" },
  { value: "pool",                label: "Pool & Swim",         group: "Wellness & Stays",    emoji: "🏊" },
  { value: "yoga",                label: "Yoga & Mindfulness",  group: "Wellness & Stays",    emoji: "🧘" },

  // ── Nature & Outdoors ─────────────────────────────────────────────────────
  { value: "game_lodge",          label: "Game Lodge",          group: "Nature & Outdoors",   emoji: "🦁" },
  { value: "safari",              label: "Safari & Wildlife",   group: "Nature & Outdoors",   emoji: "🐘" },
  { value: "nature_reserve",      label: "Nature Reserve",      group: "Nature & Outdoors",   emoji: "🌿" },
  { value: "waterfront",          label: "Waterfront",          group: "Nature & Outdoors",   emoji: "🌊" },
  { value: "hiking",              label: "Hiking & Trails",     group: "Nature & Outdoors",   emoji: "🥾" },
  { value: "picnic",              label: "Picnic Spot",         group: "Nature & Outdoors",   emoji: "🧺" },
  { value: "park",                label: "Park",                group: "Nature & Outdoors",   emoji: "🌳" },

  // ── Arts & Culture ────────────────────────────────────────────────────────
  { value: "live_music",          label: "Live Music",          group: "Arts & Culture",      emoji: "🎵" },
  { value: "art_gallery",         label: "Art Gallery",         group: "Arts & Culture",      emoji: "🎨" },
  { value: "museum",              label: "Museum",              group: "Arts & Culture",      emoji: "🏛️" },
  { value: "cinema",              label: "Cinema",              group: "Arts & Culture",      emoji: "🎬" },
  { value: "theatre",             label: "Theatre",             group: "Arts & Culture",      emoji: "🎭" },

  // ── Experiences ───────────────────────────────────────────────────────────
  { value: "adventure",           label: "Adventure",           group: "Experiences",         emoji: "🧗" },
  { value: "karting",             label: "Go-Kart Racing",      group: "Experiences",         emoji: "🏎️" },
  { value: "mini_golf",           label: "Mini Golf",           group: "Experiences",         emoji: "⛳" },
  { value: "bowling",             label: "Bowling",             group: "Experiences",         emoji: "🎳" },
  { value: "escape_room",         label: "Escape Room",         group: "Experiences",         emoji: "🔐" },
  { value: "cooking_class",       label: "Cooking Class",       group: "Experiences",         emoji: "👨‍🍳" },
  { value: "dance_class",         label: "Dance Class",         group: "Experiences",         emoji: "💃" },
  { value: "horse_riding",        label: "Horse Riding",        group: "Experiences",         emoji: "🐴" },
  { value: "water_sports",        label: "Water Sports",        group: "Experiences",         emoji: "🚣" },
  { value: "event_venue",         label: "Event Venue",         group: "Experiences",         emoji: "🎪" },
  { value: "activity",            label: "Activity",            group: "Experiences",         emoji: "⭐" },
];

export const VENUE_CATEGORY_GROUPS: VenueCategoryGroup[] = [
  "Dining",
  "Drinks & Nightlife",
  "Wellness & Stays",
  "Nature & Outdoors",
  "Arts & Culture",
  "Experiences",
];

export function getCategoryEmoji(category: string): string {
  return VENUE_CATEGORIES.find(c => c.value === category)?.emoji ?? "📍";
}

export function getCategoryLabel(category: string): string {
  return VENUE_CATEGORIES.find(c => c.value === category)?.label ?? category;
}

export function getCategoryGroup(category: string): VenueCategoryGroup | undefined {
  return VENUE_CATEGORIES.find(c => c.value === category)?.group;
}
