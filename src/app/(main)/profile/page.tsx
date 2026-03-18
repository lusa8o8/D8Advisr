import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/ui/SignOutButton";
import { ChevronRight, Heart } from "lucide-react";

type RecentPlan = {
  id: string;
  title: string;
  status: string;
  estimated_cost: number;
  created_at: string;
  occasion: string | null;
  rating?: number | null;
};

function occasionEmoji(occasion: string | null): { emoji: string; bg: string } {
  const o = occasion?.toLowerCase() ?? "";
  if (o.includes("anniversary")) return { emoji: "💍", bg: "bg-[#FFF0F1]" };
  if (o.includes("first date") || o.includes("date night")) return { emoji: "🍷", bg: "bg-[#FFF0F1]" };
  if (o.includes("night out")) return { emoji: "🎉", bg: "bg-[#F0F8FF]" };
  return { emoji: "🎉", bg: "bg-[#F0F8FF]" };
}

export default async function ProfilePage() {
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

  const initials = profile?.name
    ?.split(" ")
    .map((chunk: string) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      {/* CHANGE 1: Header with pb-20 to allow card overlap */}
      <div className="overflow-hidden rounded-b-3xl bg-[#FF5A5F] px-6 pb-20 pt-10 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-bold text-[#FF5A5F] shadow-lg">
            {initials}
          </div>
          <div>
            <p className="text-xl font-bold">{profile?.name ?? "Guest"}</p>
            {memberSince && <p className="text-xs text-white/80">Member since {memberSince}</p>}
            <p className="text-sm text-[#FFB3B5]">{profile?.email}</p>
            <p className="text-xs">📍 Lusaka, Zambia</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4">
        {/* CHANGE 1: Profile stats card with -mt-16 overlap */}
        {/* CHANGE 2 + 3: Stats colors and border separators */}
        <div className="-mt-16 relative z-10 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#EBEBEB] p-6">
          <div className="w-full grid grid-cols-3 gap-2 border-t border-[#EBEBEB] pt-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#222222]">{totalPlans}</p>
              <p className="text-xs text-[#555555] mt-1">Plans Created</p>
            </div>
            <div className="text-center border-l border-r border-[#EBEBEB]">
              <p className="text-2xl font-bold text-[#222222]">{completedPlans}</p>
              <p className="text-xs text-[#555555] mt-1">Dates Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#00C851]">K0</p>
              <p className="text-xs text-[#555555] mt-1">Budget Saved</p>
            </div>
          </div>
        </div>

        {/* CHANGE 4: Recent plans with emoji icon */}
        <section className="rounded-2xl border border-[#EBEBEB] bg-white p-4 shadow-sm">
          <header className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#222222]">Recent Plans</p>
            <Link href="/plans" className="text-xs font-semibold text-[#FF5A5F]">
              View all
            </Link>
          </header>
          <div className="space-y-3">
            {recentPlans.map((plan) => {
              const { emoji, bg } = occasionEmoji(plan.occasion);
              return (
                <Link
                  key={plan.id}
                  href={`/plans/${plan.id}`}
                  className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#EBEBEB] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-2xl shrink-0`}>
                      {emoji}
                    </div>
                    <div>
                      <p className="font-bold text-[#222222] text-sm">{plan.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {plan.rating ? (
                          <span className="text-xs font-semibold text-[#FF9500]">⭐ {plan.rating.toFixed(1)}</span>
                        ) : null}
                        <span className="text-xs text-[#555555]">
                          {new Date(plan.created_at).toLocaleString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#999999] shrink-0" />
                </Link>
              );
            })}
            {!recentPlans.length && <p className="text-xs text-[#888888]">No recent plans</p>}
          </div>
        </section>

        {/* CHANGE 5: Merged menu card */}
        <div className="bg-white rounded-3xl p-2 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#EBEBEB]">
          <Link
            href="/profile/preferences"
            className="w-full flex items-center justify-between p-4 border-b border-[#F7F7F7]"
          >
            <div className="flex items-center gap-3 text-[#222222]">
              <div className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#555555]">
                <Heart size={16} />
              </div>
              <span className="font-semibold text-[15px]">My Preferences</span>
            </div>
            <ChevronRight size={18} className="text-[#999999]" />
          </Link>
          <Link
            href="/budget"
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3 text-[#222222]">
              <div className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#00C851]">
                <span className="font-bold text-sm">$</span>
              </div>
              <span className="font-semibold text-[15px]">Budget &amp; Sinking Fund</span>
            </div>
            <ChevronRight size={18} className="text-[#999999]" />
          </Link>
        </div>

        {/* CHANGE 6: Subtle sign out */}
        <SignOutButton />
      </div>
    </div>
  );
}
