import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { requireEnvVar } from "@/lib/env";

const supabaseUrl = requireEnvVar(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
const supabaseAnonKey = requireEnvVar(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabaseBrowserClient = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
