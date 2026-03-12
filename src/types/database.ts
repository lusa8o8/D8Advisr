type ApiCostLogsRow = {
  id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  created_at: string;
};

type ApiCostLogsInsert = Omit<ApiCostLogsRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

type UserPreferencesRow = {
  user_id: string;
  activity_preferences: string[];
  budget_preference: number;
  group_size_preference: string;
  updated_at?: string;
};

type UserPreferencesInsert = Omit<UserPreferencesRow, "updated_at"> & {
  updated_at?: string;
};

export type Database = {
  public: {
    Tables: {
      api_cost_logs: {
        Row: ApiCostLogsRow;
        Insert: ApiCostLogsInsert;
        Update: Partial<ApiCostLogsRow>;
      };
      user_preferences: {
        Row: UserPreferencesRow;
        Insert: UserPreferencesInsert;
        Update: Partial<UserPreferencesRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
