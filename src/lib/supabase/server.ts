import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { requireEnvVar } from "@/lib/env";

const supabaseUrl = requireEnvVar(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
const supabaseServerKey = requireEnvVar(
  "SUPABASE_SERVICE_ROLE_KEY",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export function createSupabaseServerClient() {
  return createServerClient<Database>(supabaseUrl, supabaseServerKey, {
    cookies: cookies(),
  });
}
