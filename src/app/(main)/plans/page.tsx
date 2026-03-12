import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PlansPage() {
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

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <header>
          <h1 className="text-2xl font-bold text-[#222222]">Your Plans</h1>
          <p className="text-sm text-[#555555]">
            Tap a plan to review or regenerate.
          </p>
        </header>

        {!plans?.length ? (
          <div className="rounded-2xl border border-dashed border-[#E5E5E5] bg-white p-6 text-center">
            <p className="text-lg font-semibold text-[#222222]">
              No plans yet — tap Surprise Me to generate one!
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
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/plans/${plan.id}`}
                className="flex items-center justify-between rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3 text-sm no-underline transition hover:border-[#FF5A5F]"
              >
                <div>
                  <p className="text-base font-semibold text-[#222222]">{plan.title}</p>
                  <p className="text-xs text-[#555555]">{plan.occasion}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#FF5A5F]">
                    K{plan.estimated_cost.toFixed(0)}
                  </p>
                  <p className="text-xs text-[#888888]">{plan.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
