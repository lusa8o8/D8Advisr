import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/ui/SignOutButton";
import { ChevronRight, DollarSign, Heart } from "lucide-react";

type RecentPlan = {
  id: string;
  title: string;
  status: string;
  estimated_cost: number;
  created_at: string;
  occasion: string | null;
  rating?: number | null;
};

type ProfilePageProps = {};

export default async function ProfilePage({}: ProfilePageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [
    profileRes,
    planCountRes,
    completedCountRes,
    recentPlansRes,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id,name,email,city,created_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("plans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("plans")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed"),
    supabase
      .from("plans")
      .select(
        "id,title,status,estimated_cost,occasion,created_at,experience_logs(overall_rating)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const profile = profileRes.data;
  const totalPlans = planCountRes.count ?? 0;
  const completedPlans = completedCountRes.count ?? 0;
  const recentPlans: RecentPlan[] = (recentPlansRes.data ?? []).map((plan: any) => ({
    id: plan.id,
    title: plan.title,
    status: plan.status,
    estimated_cost: plan.estimated_cost,
    created_at: plan.created_at,
    occasion: plan.occasion ?? null,
    rating: plan.experience_logs?.[0]?.overall_rating ?? null,
  }));
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="overflow-hidden rounded-b-3xl bg-[#FF5A5F] px-6 pb-8 pt-10 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-[#FF5A5F]">
            {profile?.name
              ?.split(" ")
              .map((chunk: string) => chunk[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-bold">{profile?.name ?? "Guest"}</p>
            {memberSince && <p className="text-xs text-white/80">Member since {memberSince}</p>}
            <p className="text-sm text-[#FFB3B5]">{profile?.email}</p>
            <p className="text-xs">📍 Lusaka, Zambia</p>
          </div>
        </div>
      </div>

      <div className="-mt-6 mx-auto flex max-w-xl flex-col gap-4 px-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Plans Created", value: totalPlans },
            { label: "Dates Done", value: completedPlans },
            { label: "Budget Saved", value: 0, suffix: "K" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#E5A5E5] bg-white p-4 text-center">
              <p className="text-2xl font-bold text-[#FF5A5F]">
                {item.suffix ?? ""}
                {item.value}
              </p>
              <p className="text-xs text-[#555555]">{item.label}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-[#E5A5E5] bg-white p-4">
          <header className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#222222]">Recent Plans</p>
            <Link href="/plans" className="text-xs font-semibold text-[#FF5A5F]">
              View all
            </Link>
          </header>
          <div className="mt-3 space-y-3">
            {recentPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/plans/${plan.id}`}
                className="flex items-center justify-between rounded-2xl border border-[#E5A5E5] px-4 py-3 text-sm text-[#222222] transition hover:border-[#FF5A5F]"
              >
                <div>
                  <p className="font-semibold">{plan.title}</p>
                  <p className="text-xs text-[#555555]">
                    {new Date(plan.created_at).toLocaleString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#FF5A5F]">K{plan.estimated_cost.toFixed(0)}</p>
                  {plan.rating ? (
                    <span className="text-xs font-semibold text-[#FF9500]">⭐ {plan.rating.toFixed(1)}</span>
                  ) : (
                    plan.occasion && (
                      <span className="rounded-full bg-[#F7F7F7] px-3 py-1 text-xs font-semibold text-[#555555]">
                        {plan.occasion}
                      </span>
                    )
                  )}
                </div>
              </Link>
            ))}
            {!recentPlans.length && <p className="text-xs text-[#888888]">No recent plans</p>}
          </div>
        </section>

        <section className="space-y-3">
          <Link
            href="/budget"
            className="flex items-center justify-between rounded-2xl border border-[#E5A5E5] bg-white px-4 py-3 text-sm font-semibold text-[#222222]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00C851] text-sm font-bold text-white">
                <DollarSign size={16} />
              </span>
              <p>Budget &amp; Sinking Fund</p>
            </div>
            <ChevronRight size={16} className="text-[#555555]" />
          </Link>
          <Link
            href="/profile/preferences"
            className="flex items-center justify-between rounded-2xl border border-[#E5A5E5] bg-white px-4 py-3 text-sm font-semibold text-[#222222]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF5A5F] text-sm font-bold text-white">
                <Heart size={16} />
              </span>
              <p>My Preferences</p>
            </div>
            <ChevronRight size={16} className="text-[#555555]" />
          </Link>
          <SignOutButton />
        </section>
      </div>
    </div>
  );
}
