import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { requireEnvVar } from "@/lib/env";

const supabaseUrl = requireEnvVar(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
const supabaseKey = requireEnvVar(
  "SUPABASE_SERVICE_ROLE_KEY",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request: NextRequest) {
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: request.cookies,
  });

  const { error } = await supabase.auth.exchangeCodeForSession(request.url);
  if (error) {
    console.error("Supabase OAuth callback failed", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.redirect(new URL("/onboarding/preferences", request.url));
}
