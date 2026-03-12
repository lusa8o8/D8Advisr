import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { requireEnvVar } from "@/lib/env";

const supabaseUrl = requireEnvVar(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
const supabaseKey = requireEnvVar(
  "SUPABASE_SERVICE_ROLE_KEY",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function updateSession() {
  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: cookies(),
  });

  await supabase.auth.getSession();
}
