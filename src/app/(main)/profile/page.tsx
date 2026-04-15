import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/ui/SignOutButton";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { Award, ChevronRight, Heart, Settings, Star } from "lucide-react";

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
    <div className="min-h-screen bg-background pb-32">

      {/* Header banner */}
      <div className="bg-primary px-6 pt-14 pb-20 relative text-primary-foreground rounded-b-[40px] shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Profile</h1>
          <Link
            href="/profile/preferences"
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>

      <div className="px-6 -mt-16 mb-8 relative z-10">
        {/* Profile card overlapping banner */}
        <div className="bg-card rounded-3xl p-6 shadow-lg border border-border flex flex-col items-center">
          {/* Avatar sits at -mt-16 to overlap the banner */}
          <div className="relative -mt-16 mb-4">
            <ProfileAvatar initials={initials} />
          </div>

          <h2 className="text-[22px] font-bold text-foreground">{profile?.name ?? "Guest"}</h2>
          {memberSince && (
            <p className="text-sm text-muted-foreground mb-6 font-medium mt-1">Member since {memberSince}</p>
          )}

          <div className="w-full grid grid-cols-3 gap-2 border-t border-border pt-5">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-foreground">{totalPlans}</span>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center mt-1">Plans<br />Created</span>
            </div>
            <div className="flex flex-col items-center border-l border-r border-border">
              <span className="text-2xl font-black text-foreground">{completedPlans}</span>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center mt-1">Dates<br />Done</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-[#00C851]">K0</span>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center mt-1">Budget<br />Saved</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-col gap-6">

        {/* Badges */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-[17px] font-bold text-foreground">Badges</h3>
            <Link href="/badges" className="text-sm font-semibold text-primary">View All</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {[
              { emoji: "🔥", label: "Streak x3" },
              { emoji: "🍕", label: "Foodie" },
              { emoji: "💰", label: "Saver" },
            ].map((badge) => (
              <div key={badge.label} className="bg-card min-w-[85px] h-[85px] rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm border border-border shrink-0">
                <span className="text-3xl">{badge.emoji}</span>
                <span className="text-[11px] font-bold text-foreground">{badge.label}</span>
              </div>
            ))}
            {/* Locked slot */}
            <div className="bg-background min-w-[85px] h-[85px] rounded-2xl flex flex-col items-center justify-center gap-1.5 border border-dashed border-border opacity-60 shrink-0">
              <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-muted-foreground mb-0.5">
                <Award size={14} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">Locked</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card rounded-3xl p-2 shadow-sm border border-border">
          <Link
            href="/profile/preferences"
            className="w-full flex items-center justify-between p-4 border-b border-border hover:bg-background transition-colors rounded-t-2xl"
          >
            <div className="flex items-center gap-4 text-foreground">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground border border-border">
                <Heart size={18} />
              </div>
              <span className="font-semibold text-[16px]">My Preferences</span>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </Link>
          <Link
            href="/budget"
            className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors rounded-b-2xl"
          >
            <div className="flex items-center gap-4 text-foreground">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-[#00C851] border border-border">
                <span className="font-bold text-[18px]">K</span>
              </div>
              <span className="font-semibold text-[16px]">Budget &amp; Sinking Fund</span>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </Link>
        </div>

        {/* Recent Plans */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-[17px] font-bold text-foreground">Recent Plans</h3>
            <Link href="/plans" className="text-sm font-semibold text-primary">View all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {recentPlans.map((plan) => {
              const { emoji, bg } = occasionEmoji(plan.occasion);
              return (
                <Link
                  key={plan.id}
                  href={`/plans/${plan.id}`}
                  className="bg-card p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center text-2xl shrink-0 border border-primary/10`}>
                      {emoji}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-[16px]">{plan.title}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium">
                        {plan.rating ? (
                          <>
                            <Star size={12} className="fill-[#FF9500] text-[#FF9500]" />
                            <span className="font-bold text-foreground">{plan.rating.toFixed(1)}</span>
                            <span>·</span>
                          </>
                        ) : null}
                        <span>
                          {new Date(plan.created_at).toLocaleString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground shrink-0" />
                </Link>
              );
            })}
            {!recentPlans.length && (
              <p className="text-sm text-muted-foreground px-1">No plans yet — start your first date night!</p>
            )}
          </div>
        </div>

        {/* Sign Out */}
        <div className="pt-2 pb-2">
          <SignOutButton />
          <p className="text-center text-[11px] text-muted-foreground mt-3 font-medium">D8Advisr · v1.0</p>
        </div>
      </div>
    </div>
  );
}
