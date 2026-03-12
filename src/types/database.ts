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

export type Database = {
  public: {
    Tables: {
      api_cost_logs: {
        Row: ApiCostLogsRow;
        Insert: ApiCostLogsInsert;
        Update: Partial<ApiCostLogsRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
