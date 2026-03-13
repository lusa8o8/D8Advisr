"use client"

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type BudgetPlan = {
  id: string;
  plan_id: string;
  title: string;
  actual_cost: number;
  created_at: string;
};

type Screen16BudgetProps = {
  initialMonth: string;
  initialBudget: number;
  initialSpent: number;
  initialPlans: BudgetPlan[];
  preferences: {
    vibes: string[];
    groupSize: number;
  };
};

const formatMonthLabel = (month: string) =>
  new Date(`${month}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function Screen16Budget({
  initialMonth,
  initialBudget,
  initialSpent,
  initialPlans,
  preferences,
}: Screen16BudgetProps) {
  const [month, setMonth] = useState(initialMonth);
  const [budget, setBudget] = useState(initialBudget);
  const [spent, setSpent] = useState(initialSpent);
  const [plans, setPlans] = useState(initialPlans);
  const [isLoading, setIsLoading] = useState(false);
  const [goalInput, setGoalInput] = useState(initialBudget);

  const ratio = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const progressPercentage = Math.min((spent / (budget || 1)) * 100, 100);
  const progressColor = spent / budget < 0.8 ? "#00C851" : spent / budget < 1 ? "#FF9500" : "#FF5A5F";

  const changeMonth = (offset: number) => {
    const date = new Date(`${month}-01`);
    date.setMonth(date.getMonth() + offset);
    const nextMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    fetchBudget(nextMonth);
  };

  const fetchBudget = async (targetMonth: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/budget?month=${targetMonth}`);
      if (!res.ok) {
        throw new Error("Unable to load budget data");
      }
      const data = await res.json();
      setMonth(data.month);
      setBudget(data.budget);
      setSpent(data.spent);
      setPlans(data.plans);
      setGoalInput(data.budget);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Budget load failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetGoal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vibes: preferences.vibes,
          budget: Number(goalInput),
          groupSize: preferences.groupSize,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Unable to update goal");
      }
      setBudget(Number(goalInput));
      toast.success("Budget goal updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Goal update failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setGoalInput(initialBudget);
  }, [initialBudget]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#555555]">Budget</p>
            <h1 className="text-2xl font-bold text-[#222222]">{formatMonthLabel(month)}</h1>
          </div>
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="rounded-full border border-[#E5E5E5] px-3 py-1"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="rounded-full border border-[#E5E5E5] px-3 py-1"
            >
              &gt;
            </button>
          </div>
        </header>

        <section className="space-y-3 rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#555555]">Monthly Budget</p>
            <button
              type="button"
              className="text-sm font-semibold text-[#FF9500]"
              onClick={() => setGoalInput(budget)}
            >
              ✎ Edit
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#FF5A5F]">K{budget}</span>
            <span className="text-sm text-[#888888]">target</span>
          </div>
          <div className="h-2 rounded-full bg-[#E5E5E5]">
            <div
              className="h-full rounded-full"
              style={{ width: `${progressPercentage}%`, backgroundColor: progressColor }}
            />
          </div>
          <p className="text-sm text-[#555555]">
            K{spent.toFixed(0)} spent of K{budget}
          </p>
        </section>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#222222]">This Month's Plans</p>
            {isLoading && <p className="text-xs text-[#888888]">Loading...</p>}
          </div>
          <div className="mt-3 space-y-3">
            {!plans.length && <p className="text-xs text-[#888888]">No completed plans this month</p>}
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-[#222222]">{plan.title}</p>
                  <p className="text-xs text-[#555555]">{formatDate(plan.created_at)}</p>
                </div>
                <span className="text-sm font-semibold text-[#FF5A5F]">K{plan.actual_cost.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#222222]">Savings Goal</p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="number"
              min={0}
              className="flex-1 rounded-2xl border border-[#E5E5E5] px-3 py-2 text-sm"
              value={goalInput}
              onChange={(event) => setGoalInput(Number(event.target.value))}
            />
            <button
              type="button"
              onClick={handleSetGoal}
              className="rounded-xl bg-[#FF5A5F] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Set Goal
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
