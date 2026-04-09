"use client"

import { useEffect, useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type BudgetPlan = {
  id: string;
  plan_id: string;
  title: string;
  actual_cost: number;
  created_at: string;
};

type SinkingFund = {
  id: string;
  name: string;
  emoji: string;
  goal_amount: number;
  current_amount: number;
  auto_save_amount: number | null;
  auto_save_frequency: string | null;
  is_locked: boolean | null;
};

type Screen16BudgetProps = {
  initialMonth: string;
  initialBudget: number;
  initialSpent: number;
  initialPlans: BudgetPlan[];
  initialFunds: SinkingFund[];
  preferences: { vibes: string[]; groupSize: number };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatMonthLabel = (month: string) =>
  new Date(`${month}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function cardTheme(pct: number) {
  if (pct >= 100) return { bg: "bg-[#0D2B1A]", bar: "bg-[#00C851]", track: "bg-black/40", text: "text-white", sub: "text-white/70" };
  if (pct >= 70)  return { bg: "bg-gradient-to-br from-[#1a1a2e] to-[#2d1b1e]", bar: "bg-gradient-to-r from-[#FF9500] to-[#FF5A5F]", track: "bg-white/10", text: "text-white", sub: "text-white/70" };
  if (pct >= 30)  return { bg: "bg-gradient-to-br from-gray-900 to-gray-800", bar: "bg-gradient-to-r from-amber-400 to-[#FF9500]", track: "bg-white/10", text: "text-white", sub: "text-white/60" };
  return { bg: "bg-white border border-[#EBEBEB]", bar: "bg-[#DEDEDE]", track: "bg-[#F0F0F0]", text: "text-[#222222]", sub: "text-[#888888]" };
}

const EMOJI_OPTIONS = ["💰", "🎷", "💍", "🎬", "⛷️", "🍷", "🎭", "🏆", "✈️", "🎉", "🌴", "🎊", "🎸", "🍕", "🌅", "🎯"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Screen16Budget({
  initialMonth,
  initialBudget,
  initialSpent,
  initialPlans,
  initialFunds,
  preferences,
}: Screen16BudgetProps) {
  // Monthly budget state (existing)
  const [month, setMonth] = useState(initialMonth);
  const [budget, setBudget] = useState(initialBudget);
  const [spent, setSpent] = useState(initialSpent);
  const [plans, setPlans] = useState(initialPlans);
  const [isLoading, setIsLoading] = useState(false);
  const [goalInput, setGoalInput] = useState(initialBudget);

  // Sinking funds state
  const [funds, setFunds] = useState<SinkingFund[]>(initialFunds);
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const [fundAction, setFundAction] = useState<{ id: string; type: "deposit" | "withdraw" } | null>(null);
  const [fundActionAmount, setFundActionAmount] = useState("");

  // Create fund modal
  const [showModal, setShowModal] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalEmoji, setModalEmoji] = useState("💰");
  const [modalGoal, setModalGoal] = useState("");
  const [modalAutoSave, setModalAutoSave] = useState("");
  const [modalFreq, setModalFreq] = useState<"weekly" | "monthly">("weekly");
  const [modalSaving, setModalSaving] = useState(false);

  const progressColor = spent / budget < 0.8 ? "#00C851" : spent / budget < 1 ? "#FF9500" : "#FF5A5F";

  useEffect(() => { setGoalInput(initialBudget); }, [initialBudget]);

  // ── Monthly budget helpers ────────────────────────────────────────────────

  const changeMonth = (offset: number) => {
    const date = new Date(`${month}-01`);
    date.setMonth(date.getMonth() + offset);
    const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    fetchBudget(next);
  };

  const fetchBudget = async (targetMonth: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/budget?month=${targetMonth}`);
      if (!res.ok) throw new Error("Unable to load budget data");
      const data = await res.json();
      setMonth(data.month); setBudget(data.budget); setSpent(data.spent);
      setPlans(data.plans); setGoalInput(data.budget);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Budget load failed");
    } finally { setIsLoading(false); }
  };

  const handleSetGoal = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibes: preferences.vibes, budget: Number(goalInput), groupSize: preferences.groupSize }),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? "Update failed"); }
      setBudget(Number(goalInput));
      toast.success("Budget goal updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Goal update failed");
    } finally { setIsLoading(false); }
  };

  // ── Sinking fund actions ──────────────────────────────────────────────────

  const handleCreateFund = async () => {
    if (!modalName || !modalGoal) { toast.error("Name and goal are required"); return; }
    setModalSaving(true);
    try {
      const res = await fetch("/api/user/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: modalName,
          emoji: modalEmoji,
          goal_amount: Number(modalGoal),
          auto_save_amount: modalAutoSave ? Number(modalAutoSave) : null,
          auto_save_frequency: modalAutoSave ? modalFreq : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      setFunds((prev) => [data.fund, ...prev]);
      setShowModal(false);
      setModalName(""); setModalEmoji("💰"); setModalGoal(""); setModalAutoSave("");
      toast.success("Fund created!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally { setModalSaving(false); }
  };

  const handleFundTransaction = async (fund: SinkingFund, type: "deposit" | "withdraw") => {
    const amt = Number(fundActionAmount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    try {
      const res = await fetch("/api/user/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: type, fund_id: fund.id, amount: amt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Transaction failed");
      if (type === "withdraw" && data.penalty > 0) {
        toast.warning(`Early withdrawal — K${data.penalty} penalty applied`);
      } else {
        toast.success(type === "deposit" ? `K${amt} added!` : `K${amt} withdrawn`);
      }
      setFunds((prev) => prev.map((f) => f.id === fund.id ? data.fund : f));
      setFundAction(null);
      setFundActionAmount("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction failed");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">

      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white border-b border-[#EBEBEB] flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-[11px] font-bold text-[#999999] uppercase tracking-widest">Budget</p>
          <h1 className="text-xl font-bold text-[#222222]">Your Stash</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-10 h-10 bg-[#FF5A5F] rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">

        {/* Monthly spend card */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-bold text-[#222222]">{formatMonthLabel(month)}</h2>
            <div className="flex gap-1.5 text-sm">
              <button type="button" onClick={() => changeMonth(-1)} className="rounded-full border border-[#EBEBEB] w-8 h-8 flex items-center justify-center text-[#555555]">&lt;</button>
              <button type="button" onClick={() => changeMonth(1)} className="rounded-full border border-[#EBEBEB] w-8 h-8 flex items-center justify-center text-[#555555]">&gt;</button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#555555]">Monthly Budget</p>
              <button type="button" className="text-sm font-semibold text-[#FF9500]" onClick={() => setGoalInput(budget)}>✎ Edit</button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#FF5A5F]">K{budget}</span>
              <span className="text-sm text-[#888888]">target</span>
            </div>
            <div className="h-2 rounded-full bg-[#E5E5E5]">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((spent / (budget || 1)) * 100, 100)}%`, backgroundColor: progressColor }} />
            </div>
            <p className="text-sm text-[#555555]">K{spent.toFixed(0)} spent of K{budget}</p>
          </div>

          {/* Plans list */}
          <div className="mt-3 rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#222222]">This Month&apos;s Plans</p>
              {isLoading && <p className="text-xs text-[#888888]">Loading…</p>}
            </div>
            <div className="space-y-3">
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
          </div>

          {/* Goal setter */}
          <div className="mt-3 rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#222222] mb-3">Set Budget Goal</p>
            <div className="flex items-center gap-3">
              <input type="number" min={0} className="flex-1 rounded-2xl border border-[#E5E5E5] px-3 py-2 text-sm" value={goalInput} onChange={(e) => setGoalInput(Number(e.target.value))} />
              <button type="button" onClick={handleSetGoal} disabled={isLoading} className="rounded-xl bg-[#FF5A5F] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Set Goal</button>
            </div>
          </div>
        </section>

        {/* ── Sinking Funds ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-bold text-[#222222]">Sinking Funds</h2>
            <span className="text-[12px] text-[#888888] font-medium">{funds.length} active</span>
          </div>

          {funds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">💰</span>
              <p className="font-bold text-[#222222] text-[15px]">No stash yet</p>
              <p className="text-[13px] text-[#888888]">Start saving for your next date night</p>
              <button type="button" onClick={() => setShowModal(true)} className="mt-2 bg-[#FF5A5F] text-white px-6 py-2.5 rounded-xl font-bold text-[14px]">+ Create Fund</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {funds.map((fund) => {
                const pct = fund.goal_amount > 0 ? Math.round((fund.current_amount / fund.goal_amount) * 100) : 0;
                const unlocked = pct >= 100;
                const theme = cardTheme(pct);
                const isExpanded = expandedFund === fund.id;
                const activeTx = fundAction?.id === fund.id ? fundAction.type : null;

                return (
                  <div
                    key={fund.id}
                    className={`rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${theme.bg}`}
                    onClick={() => { setExpandedFund(isExpanded ? null : fund.id); setFundAction(null); setFundActionAmount(""); }}
                  >
                    <div className="p-5">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${unlocked ? "bg-[#00C851]/20" : "bg-white/10"}`}>
                            {fund.emoji}
                          </div>
                          <div>
                            <p className={`font-bold text-[16px] leading-tight ${theme.text}`}>{fund.name}</p>
                            {fund.auto_save_amount && (
                              <span className={`text-[11px] font-semibold mt-0.5 inline-block ${theme.sub}`}>
                                K{fund.auto_save_amount}/{fund.auto_save_frequency ?? "wk"} auto
                              </span>
                            )}
                          </div>
                        </div>
                        {unlocked ? (
                          <span className="bg-[#00C851] text-white text-[11px] font-bold px-3 py-1 rounded-full">✓ Ready</span>
                        ) : (
                          <div className="text-right">
                            <p className={`text-2xl font-black ${theme.text}`}>{pct}%</p>
                            <p className={`text-[11px] ${theme.sub}`}>complete</p>
                          </div>
                        )}
                      </div>

                      {/* Amounts */}
                      <div className="flex justify-between items-end mb-3">
                        <span className={`text-[22px] font-extrabold ${theme.text}`}>K{fund.current_amount.toLocaleString()}</span>
                        <span className={`text-sm font-medium ${theme.sub}`}>of K{fund.goal_amount.toLocaleString()}</span>
                      </div>

                      {/* Progress bar */}
                      <div className={`h-2.5 rounded-full overflow-hidden ${theme.track}`}>
                        <div className={`h-full rounded-full transition-all duration-700 ${theme.bar}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>

                    {/* Expanded actions */}
                    {isExpanded && (
                      <div className={`border-t px-5 pb-5 pt-4 ${pct >= 30 ? "border-white/10" : "border-[#EBEBEB]"}`} onClick={(e) => e.stopPropagation()}>
                        {!activeTx ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setFundAction({ id: fund.id, type: "deposit" })}
                              className="flex-1 bg-[#00C851] text-white py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                            >
                              <Plus size={15} /> Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setFundAction({ id: fund.id, type: "withdraw" })}
                              className={`flex-1 py-3 rounded-xl font-bold text-[14px] flex items-center justify-center active:scale-95 transition-transform ${
                                pct >= 30 ? "bg-white/10 text-white border border-white/20" : "bg-[#F7F7F7] text-[#555555] border border-[#EBEBEB]"
                              }`}
                            >
                              Withdraw
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className={`text-[12px] font-bold uppercase tracking-wider ${theme.sub}`}>
                              {activeTx === "deposit" ? "How much to add?" : "How much to withdraw?"}
                              {activeTx === "withdraw" && fund.is_locked && pct < 100 && (
                                <span className="ml-2 text-[#FF9500] normal-case">10% early penalty</span>
                              )}
                            </p>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${pct >= 30 ? "text-white/60" : "text-[#888888]"}`}>K</span>
                                <input
                                  type="number"
                                  value={fundActionAmount}
                                  onChange={(e) => setFundActionAmount(e.target.value)}
                                  placeholder="0"
                                  className={`w-full pl-8 pr-3 py-2.5 rounded-xl font-bold text-sm outline-none ${
                                    pct >= 30 ? "bg-white/10 text-white placeholder-white/30 border border-white/20" : "bg-[#F7F7F7] text-[#222222] border border-[#EBEBEB]"
                                  }`}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleFundTransaction(fund, activeTx)}
                                className="bg-[#FF5A5F] text-white px-4 rounded-xl font-bold text-sm flex items-center gap-1"
                              >
                                <Check size={14} /> OK
                              </button>
                              <button
                                type="button"
                                onClick={() => { setFundAction(null); setFundActionAmount(""); }}
                                className={`px-3 rounded-xl ${pct >= 30 ? "bg-white/10 text-white" : "bg-[#F7F7F7] text-[#555555]"}`}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add another fund CTA */}
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full border-2 border-dashed border-[#EBEBEB] rounded-3xl py-5 flex items-center justify-center gap-3 text-[#888888] hover:border-[#FF5A5F] hover:text-[#FF5A5F] transition-colors"
              >
                <Plus size={20} />
                <span className="font-bold text-[15px]">Start a new stash</span>
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ── Create Fund Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-t-3xl px-6 pt-5 pb-12 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[18px] font-bold text-[#222222]">Start a new stash</h3>
              <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] flex items-center justify-center text-[#555555]">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-[#888888] mb-5">What are you saving for?</p>

            <div className="flex flex-col gap-4">
              {/* Emoji picker */}
              <div>
                <p className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Pick an emoji</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setModalEmoji(e)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        modalEmoji === e ? "bg-[#FFF0F1] border-2 border-[#FF5A5F] scale-110" : "bg-[#F7F7F7] border border-[#EBEBEB]"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5 block">Fund name</label>
                <input
                  type="text"
                  placeholder="e.g. Anniversary Dinner"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-[#222222] font-medium outline-none focus:border-[#FF5A5F]"
                />
              </div>

              {/* Goal + Auto-save */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5 block">Goal (K)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={modalGoal}
                    onChange={(e) => setModalGoal(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-[#222222] font-medium outline-none focus:border-[#FF5A5F]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5 block">Auto-save (K)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={modalAutoSave}
                    onChange={(e) => setModalAutoSave(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-xl px-4 py-3 text-[#222222] font-medium outline-none focus:border-[#FF5A5F]"
                  />
                </div>
              </div>

              {/* Frequency */}
              {modalAutoSave && (
                <div className="flex gap-2">
                  {(["weekly", "monthly"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setModalFreq(f)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        modalFreq === f ? "bg-[#FF5A5F] text-white" : "bg-[#F7F7F7] text-[#555555] border border-[#EBEBEB]"
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateFund}
                disabled={modalSaving || !modalName || !modalGoal}
                className="w-full bg-[#FF5A5F] text-white py-4 rounded-xl font-bold text-[16px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {modalSaving ? "Creating…" : "Create Stash ✨"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
