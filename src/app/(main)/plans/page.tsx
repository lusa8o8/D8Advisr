import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Plan } from "@/types/database";
import PlansEmpty from '@/components/screens/Screen_PlansEmpty';

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#E5E5E5] text-[#222222]",
  saved: "bg-[#FF9500]/20 text-[#FF9500]",
  active: "bg-[#00C851]/20 text-[#00C851]",
  completed: "bg-[#555555]/20 text-[#555555]",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

type PlansPageProps = {};

export default async function PlansPage({}: PlansPageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

if (!plans || plans.length === 0) return <PlansEmpty />;  
return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#222222]">Your Plans</h1>
            <Link href="/plans/group/new" className="rounded-full border border-[#FF5A5F] px-4 py-1 text-xs font-semibold text-[#FF5A5F]">
              ?? Group Plan
            </Link>
          </div>
          <p className="text-sm text-[#555555]">Plan something memorable every time.</p>
        </header>

        {!plans?.length ? (
          <div className="rounded-2xl border border-dashed border-[#E5E5E5] bg-white p-6 text-center">
            <p className="text-lg font-semibold text-[#222222]">
              No plans yet — tap ? Surprise Me to generate one!
            </p>
            <Link
              href="/plans/generate"
              className="mt-4 inline-flex rounded-2xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white"
            >
              Surprise Me
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan: Plan) => (
              <Link
                key={plan.id}
                href={`/plans/${plan.id}`}
                className="flex items-center justify-between rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3 text-sm no-underline transition hover:border-[#FF5A5F]"
              >
                <div className="space-y-1">
                  <p className="text-base font-semibold text-[#222222]">{plan.title}</p>
                  {plan.occasion && (
                    <span className="inline-flex rounded-full bg-[#F7F7F7] px-3 py-1 text-[11px] font-semibold text-[#555555]">
                      {plan.occasion}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <span className={`rounded-full px-3 py-1 font-semibold ${STATUS_STYLES[plan.status] ?? STATUS_STYLES.draft}`}>
                    {plan.status.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-[#FF5A5F]">
                    K{plan.estimated_cost.toFixed(0)}
                  </span>
                  <span className="text-[#888888]">{formatDate(plan.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

