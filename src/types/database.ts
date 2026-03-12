export type Venue = {
  id: string;
  name: string;
  city: string;
  category: string;
  activity_type: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price_level: number | null;
  price_range: string | null;
  opening_hours: Record<string, string> | null;
  verification_score: number;
  confidence_score: number;
  verified_at: string | null;
  source: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type VenueDetails = {
  id: string;
  venue_id: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  photos: string[];
  highlights: string[];
};

export type VenuePrice = {
  id: string;
  venue_id: string;
  item_name: string;
  price: number;
  currency: string;
  last_verified: string;
  confidence_score: number;
  source: string;
};

export type VenueWithDetails = Venue & {
  venue_details: VenueDetails | null;
  venue_prices: VenuePrice[];
};

export type PlanStop = {
  venueId: string;
  venueName: string;
  activityType: string;
  orderIndex: number;
  estimatedCost: number;
  estimatedTimeMinutes: number;
  timeSlot: string;
};

export type GeneratedPlan = {
  title: string;
  occasion: string;
  vibe: string;
  estimatedCost: number;
  currency: string;
  durationMinutes: number;
  stops: PlanStop[];
};

export type Plan = {
  id: string;
  user_id: string;
  title: string;
  city: string;
  estimated_cost: number;
  currency: string;
  duration_minutes: number | null;
  occasion: string | null;
  vibe: string | null;
  participant_count: number | null;
  source: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type PlanItem = {
  id: string;
  plan_id: string;
  venue_id: string;
  order_index: number;
  activity_type: string | null;
  estimated_time_minutes: number | null;
  estimated_cost: number;
  time_slot: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RawVenue = {
  id: string;
  source: string;
  raw_name: string | null;
  raw_address: string | null;
  raw_category: string | null;
  raw_price: string | null;
  raw_hours: string | null;
  raw_latitude: number | null;
  raw_longitude: number | null;
  raw_rating: number | null;
  raw_data: Record<string, unknown> | null;
  processed: boolean;
  ingested_at: string;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  budget_preference: number;
  activity_preferences: string[];
  default_vibe: string | null;
  group_size_preference: number;
  last_updated: string;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  plan_id: string | null;
  title: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  target_date: string | null;
  auto_save_amount: number;
  auto_save_frequency: string;
  is_active: boolean;
  created_at: string;
};

export type ExperienceLog = {
  id: string;
  user_id: string;
  plan_id: string | null;
  actual_cost: number | null;
  currency: string;
  overall_rating: number | null;
  notes: string | null;
  highlights: string[];
  created_at: string;
};

export type VenueInsert = Omit<
  Venue,
  "id" | "created_at" | "updated_at" | "verification_score" | "confidence_score"
> & {
  verification_score?: number;
  confidence_score?: number;
};

export type VenueDetailsInsert = Omit<VenueDetails, "id">;
export type VenuePriceInsert = Omit<VenuePrice, "id">;

export type RawVenueInsert = Omit<RawVenue, "id" | "processed"> & {
  processed?: boolean;
};

export type UserPreferencesInsert = Omit<UserPreferences, "id">;
export type SavingsGoalInsert = Omit<SavingsGoal, "id">;
export type ExperienceLogInsert = Omit<ExperienceLog, "id">;

export type Database = {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          city: string;
          estimated_cost: number;
          currency: string;
          duration_minutes: number | null;
          occasion: string | null;
          vibe: string | null;
          participant_count: number | null;
          source: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          city: string;
          estimated_cost: number;
          currency: string;
          duration_minutes?: number | null;
          occasion?: string | null;
          vibe?: string | null;
          participant_count?: number | null;
          source?: string | null;
          status: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          title: string;
          city: string;
          estimated_cost: number;
          currency: string;
          duration_minutes: number | null;
          occasion: string | null;
          vibe: string | null;
          participant_count: number | null;
          source: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        }>;
      };
      plan_items: {
        Row: {
          id: string;
          plan_id: string;
          venue_id: string;
          order_index: number;
          activity_type: string | null;
          estimated_time_minutes: number | null;
          estimated_cost: number;
          time_slot: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          plan_id: string;
          venue_id: string;
          order_index: number;
          activity_type?: string | null;
          estimated_time_minutes?: number | null;
          estimated_cost: number;
          time_slot?: string | null;
          notes?: string | null;
        };
        Update: Partial<{
          id: string;
          plan_id: string;
          venue_id: string;
          order_index: number;
          activity_type: string | null;
          estimated_time_minutes: number | null;
          estimated_cost: number;
          time_slot: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        }>;
      };
      venues: {
        Row: Venue;
        Insert: VenueInsert;
        Update: Partial<Venue>;
      };
      venue_details: {
        Row: VenueDetails;
        Insert: VenueDetailsInsert;
        Update: Partial<VenueDetails>;
      };
      venue_prices: {
        Row: VenuePrice;
        Insert: VenuePriceInsert;
        Update: Partial<VenuePrice>;
      };
      raw_venues: {
        Row: RawVenue;
        Insert: RawVenueInsert;
        Update: Partial<RawVenue>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: UserPreferencesInsert;
        Update: Partial<UserPreferences>;
      };
      savings_goals: {
        Row: SavingsGoal;
        Insert: SavingsGoalInsert;
        Update: Partial<SavingsGoal>;
      };
      experience_logs: {
        Row: ExperienceLog;
        Insert: ExperienceLogInsert;
        Update: Partial<ExperienceLog>;
      };
      api_cost_logs: {
        Row: {
          id: string;
          model: string;
          input_tokens: number;
          output_tokens: number;
          cost_usd: number;
          created_at: string;
        };
        Insert: Omit<
          {
            id: string;
            model: string;
            input_tokens: number;
            output_tokens: number;
            cost_usd: number;
            created_at: string;
          },
          "id" | "created_at"
        >;
        Update: Partial<{
          id: string;
          model: string;
          input_tokens: number;
          output_tokens: number;
          cost_usd: number;
          created_at: string;
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
