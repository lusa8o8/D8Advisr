import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import NotificationRow from "@/components/ui/NotificationRow";
import SignOutButton from "@/components/ui/SignOutButton";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#E5E5E5] text-[#222222]",
  saved: "bg-[#FF9500]/20 text-[#FF9500]",
  active: "bg-[#00C851]/20 text-[#00C851]",
  completed: "bg-[#555555]/20 text-[#555555]",
};

type RecentPlan = {
  id: string;
  title: string;
  status: string;
  estimated_cost: number;
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

  const [profileRes, planCountRes, completedCountRes, recentPlansRes] = await Promise.all([
    supabase.from("users").select("id,name,email,city").eq("id", user.id).maybeSingle(),
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
      .select("id,title,status,estimated_cost")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const profile = profileRes.data;
  const totalPlans = planCountRes.count ?? 0;
  const completedPlans = completedCountRes.count ?? 0;
  const recentPlans: RecentPlan[] = recentPlansRes.data ?? [];

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="overflow-hidden rounded-b-3xl bg-[#FF5A5F] px-6 pb-8 pt-10 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-[#FF5A5F]">
            {profile?.name?.split(" ").map((chunk: string) => chunk[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-bold">{profile?.name ?? "Guest"}</p>
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
            <div key={item.label} className="rounded-2xl border border-[#E5E5E5] bg-white p-4 text-center">
              <p className="text-2xl font-bold text-[#FF5A5F]">
                {item.suffix ?? ""}
                {item.value}
              </p>
              <p className="text-xs text-[#555555]">{item.label}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
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
                className="flex items-center justify-between rounded-2xl border border-[#E5E5E5] px-4 py-3 text-sm text-[#222222] transition hover:border-[#FF5A5F]"
              >
                <div>
                  <p className="font-semibold">{plan.title}</p>
                  <p className="text-xs text-[#555555]">{plan.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#FF5A5F]">K{plan.estimated_cost.toFixed(0)}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[plan.status] ?? STATUS_STYLES.draft}`}>
                    {plan.status}
                  </span>
                </div>
              </Link>
            ))}
            {!recentPlans.length && <p className="text-xs text-[#888888]">No recent plans</p>}
          </div>
        </section>

        <section className="space-y-3">
          <Link
            href="/profile/preferences"
            className="flex items-center justify-between rounded-2xl border border-[#E5E5E5] px-4 py-3 text-sm font-semibold text-[#222222]"
          >
            Preferences
            <span className="text-[#FF9500]">Edit</span>
          </Link>
          <NotificationRow />
          <SignOutButton />
        </section>
      </div>
    </div>
  );
}
