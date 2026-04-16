"use client"

import { useState } from "react";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Flame, Heart, Plus, Sparkles, Users, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type FundType = "experience" | "group" | "anniversary" | "milestone";

type FundTransaction = {
  id: string;
  amount: number;
  type: "deposit" | "withdrawal";
  source: string | null;
  notes: string | null;
  created_at: string;
  sinking_funds: { name: string; emoji: string } | null;
};

type Screen16BudgetProps = {
  initialFunds: SinkingFund[];
  initialTransactions: FundTransaction[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectFundType(fund: SinkingFund): FundType {
  const n = (fund.name + fund.emoji).toLowerCase();
  if (n.includes("💍") || n.includes("anniversary") || n.includes("wedding") || n.includes("engage")) return "anniversary";
  if (n.includes("group") || n.includes("trip") || n.includes("👥") || n.includes("friends")) return "group";
  if (n.includes("🏆") || n.includes("milestone") || n.includes("big") || n.includes("goal")) return "milestone";
  return "experience";
}

const TYPE_META: Record<FundType, { label: string; icon: React.ReactNode; color: string }> = {
  experience: { label: "Experience",   icon: <Sparkles size={11} />, color: "text-primary bg-[#FFF0F1]" },
  group:       { label: "Group",       icon: <Users size={11} />,    color: "text-blue-600 bg-blue-50" },
  anniversary: { label: "Anniversary", icon: <Heart size={11} />,    color: "text-pink-600 bg-pink-50" },
  milestone:   { label: "Milestone",   icon: <Flame size={11} />,    color: "text-orange-600 bg-orange-50" },
};

const NEW_FUND_TYPES: { type: FundType; emoji: string; label: string; desc: string }[] = [
  { type: "experience", emoji: "🎭", label: "Experience",   desc: "A night out, venue, or event" },
  { type: "group",      emoji: "👥", label: "Group Stash",  desc: "Split the cost with friends" },
  { type: "anniversary",emoji: "💍", label: "Anniversary",  desc: "Special occasion fund" },
  { type: "milestone",  emoji: "🏆", label: "Milestone",    desc: "A big goal worth celebrating" },
];

function cardTheme(pct: number) {
  if (pct >= 100) return {
    bg: "bg-[#0D2B1A]",
    bar: "bg-[#00C851]",
    track: "bg-black/40",
    glow: "shadow-[0_0_20px_rgba(0,200,81,0.25)]",
    text: "text-white",
    sub: "text-white/70",
    border: "border-transparent",
    divider: "border-white/10",
  };
  if (pct >= 70) return {
    bg: "bg-gradient-to-br from-[#1a1a2e] to-[#2d1b1e]",
    bar: "bg-gradient-to-r from-[#FF9500] to-[#FF5A5F]",
    track: "bg-white/10",
    glow: "shadow-[0_0_24px_rgba(255,90,95,0.2)]",
    text: "text-white",
    sub: "text-white/70",
    border: "border-transparent",
    divider: "border-white/10",
  };
  if (pct >= 30) return {
    bg: "bg-gradient-to-br from-gray-900 to-gray-800",
    bar: "bg-gradient-to-r from-amber-400 to-[#FF9500]",
    track: "bg-white/10",
    glow: "",
    text: "text-white",
    sub: "text-white/60",
    border: "border-transparent",
    divider: "border-white/10",
  };
  return {
    bg: "bg-gradient-to-br from-gray-200 to-gray-100",
    bar: "bg-gray-400",
    track: "bg-gray-300",
    glow: "",
    text: "text-foreground",
    sub: "text-muted-foreground",
    border: "border-border",
    divider: "border-border",
  };
}

function WarmthDots({ fund }: { fund: SinkingFund }) {
  const hasAutoSave = (fund.auto_save_amount ?? 0) > 0;
  const pct = fund.goal_amount > 0 ? (fund.current_amount / fund.goal_amount) * 100 : 0;
  const warmth: boolean[] = pct >= 70
    ? [true, true, true, true]
    : pct >= 30
    ? [true, true, false, true]
    : hasAutoSave
    ? [false, false, false, true]
    : [false, false, false, false];

  return (
    <div className="flex gap-1.5 items-center">
      {warmth.map((hot, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            hot ? "bg-[#FF9500] shadow-[0_0_4px_rgba(255,149,0,0.6)]" : "bg-white/20"
          )}
        />
      ))}
      <span className="text-[10px] font-semibold ml-1 opacity-60">
        {warmth.filter(Boolean).length}/{warmth.length}w streak
      </span>
    </div>
  );
}

function MilestoneBar({ pct, bar, track }: { pct: number; bar: string; track: string }) {
  const milestones = [25, 50, 75];
  return (
    <div className="relative h-3">
      <div className={cn("w-full h-full rounded-full overflow-hidden", track)}>
        <div
          className={cn("h-full rounded-full transition-all duration-700", bar)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      {milestones.map((m) => (
        <div
          key={m}
          className={cn("absolute top-0 bottom-0 w-px", pct >= m ? "bg-white/30" : "bg-black/20")}
          style={{ left: `${m}%` }}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function formatTxDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function Screen16Budget({ initialFunds, initialTransactions }: Screen16BudgetProps) {
  const router = useRouter();

  // Sinking funds state
  const [funds, setFunds] = useState<SinkingFund[]>(initialFunds);
  const [transactions, setTransactions] = useState<FundTransaction[]>(initialTransactions);
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const [fundAction, setFundAction] = useState<{ id: string; type: "deposit" | "withdraw" } | null>(null);
  const [fundActionAmount, setFundActionAmount] = useState("");

  // Create fund modal
  const [showModal, setShowModal] = useState(false);
  const [newFundType, setNewFundType] = useState<FundType | null>(null);
  const [modalEmoji, setModalEmoji] = useState("💰");
  const [modalName, setModalName] = useState("");
  const [modalGoal, setModalGoal] = useState("");
  const [modalAutoSave, setModalAutoSave] = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  const totalSaved = funds.reduce((s, f) => s + f.current_amount, 0);
  const totalGoal = funds.reduce((s, f) => s + f.goal_amount, 0);
  const unlockedCount = funds.filter((f) => f.current_amount >= f.goal_amount).length;

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
          auto_save_frequency: modalAutoSave ? "weekly" : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      setFunds((prev) => [data.fund, ...prev]);
      setShowModal(false);
      setNewFundType(null);
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
      // Optimistically prepend the new transaction to Recent Activity
      const newTx: FundTransaction = {
        id: data.transaction?.id ?? `tmp-${Date.now()}`,
        amount: amt,
        type: type === "deposit" ? "deposit" : "withdrawal",
        source: null,
        notes: null,
        created_at: new Date().toISOString(),
        sinking_funds: { name: fund.name, emoji: fund.emoji },
      };
      setTransactions((prev) => [newTx, ...prev].slice(0, 10));
      setFundAction(null);
      setFundActionAmount("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction failed");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-32">

      {/* Header */}
      <div className="bg-card px-6 pt-14 pb-4 flex justify-between items-center sticky top-0 z-20 shadow-sm border-b border-border">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-foreground hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-foreground text-lg leading-tight">Your Stash</h1>
          <p className="text-[11px] text-muted-foreground font-medium">Saving for the good stuff</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="pb-10">

        {/* Total hero strip */}
        <div className="mx-6 mt-5 mb-6 bg-foreground text-card rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-white/5 rounded-full" />
          <p className="text-white/60 text-sm font-medium mb-1 relative z-10">Total stashed</p>
          <h2 className="text-4xl font-black text-white relative z-10">
            K{totalSaved.toLocaleString()}<span className="text-white/40 text-2xl font-semibold">.00</span>
          </h2>
          <div className="flex items-center gap-4 mt-4 relative z-10">
            <div>
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider">Across</p>
              <p className="text-white font-bold text-[15px]">{funds.length} fund{funds.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider">Unlocked</p>
              <p className="text-[#00C851] font-bold text-[15px]">{unlockedCount} ready to book</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-white/50 text-[11px] font-bold uppercase tracking-wider">Goal</p>
              <p className="text-white font-bold text-[15px]">K{totalGoal.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Fund Cards */}
        <div className="px-6 flex flex-col gap-4 mb-8">
          {funds.map((fund) => {
            const pct = fund.goal_amount > 0 ? Math.round((fund.current_amount / fund.goal_amount) * 100) : 0;
            const unlocked = pct >= 100;
            const theme = cardTheme(pct);
            const isExpanded = expandedFund === fund.id;
            const activeTx = fundAction?.id === fund.id ? fundAction.type : null;
            const fundType = detectFundType(fund);
            const typeMeta = TYPE_META[fundType];

            return (
              <div
                key={fund.id}
                className={cn(
                  "rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer",
                  theme.bg, theme.border, theme.glow
                )}
                onClick={() => { setExpandedFund(isExpanded ? null : fund.id); setFundAction(null); setFundActionAmount(""); }}
              >
                <div className="p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500",
                        unlocked ? "bg-[#00C851]/20 shadow-[0_0_16px_rgba(0,200,81,0.4)]" :
                        pct >= 70 ? "bg-white/10 shadow-[0_0_12px_rgba(255,90,95,0.3)]" : "bg-white/10"
                      )}>
                        {fund.emoji}
                      </div>
                      <div>
                        <p className={cn("font-bold text-[16px] leading-tight", theme.text)}>{fund.name}</p>
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1", typeMeta.color)}>
                          {typeMeta.icon} {typeMeta.label}
                        </span>
                      </div>
                    </div>
                    {unlocked ? (
                      <span className="bg-[#00C851] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">✓ Ready</span>
                    ) : (
                      <div className="text-right">
                        <p className={cn("text-2xl font-black", theme.text)}>{pct}%</p>
                        <p className={cn("text-[11px] font-medium", theme.sub)}>complete</p>
                      </div>
                    )}
                  </div>

                  {/* Amount row */}
                  <div className="flex justify-between items-end mb-3">
                    <span className={cn("text-[22px] font-extrabold", theme.text)}>K{fund.current_amount.toLocaleString()}</span>
                    <span className={cn("text-sm font-medium", theme.sub)}>of K{fund.goal_amount.toLocaleString()}</span>
                  </div>

                  {/* Milestone progress bar */}
                  <MilestoneBar pct={pct} bar={theme.bar} track={theme.track} />

                  {/* Milestone labels */}
                  <div className="flex justify-between mt-1.5 mb-3 px-0.5">
                    {[25, 50, 75].map((m) => (
                      <span key={m} className={cn(
                        "text-[9px] font-bold",
                        pct >= m ? (unlocked ? "text-[#00C851]" : "text-white/50") : "text-black/30"
                      )}>
                        {m}%
                      </span>
                    ))}
                  </div>

                  {/* Warmth dots + auto-save */}
                  <div className={cn("flex items-center justify-between", theme.sub)}>
                    <WarmthDots fund={fund} />
                    {(fund.auto_save_amount ?? 0) > 0 && (
                      <span className={cn("text-[11px] font-semibold", theme.sub)}>
                        K{fund.auto_save_amount}/wk auto
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded actions */}
                {isExpanded && (
                  <div
                    className={cn("border-t px-5 pb-5 pt-4", theme.divider)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!activeTx ? (
                      unlocked ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); router.push("/plans"); }}
                          className="w-full bg-[#00C851] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-[0_6px_20px_-4px_rgba(0,200,81,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          🎉 Book from your plans
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFundAction({ id: fund.id, type: "deposit" })}
                            className="flex-1 bg-[#00C851]/90 text-white py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                          >
                            <Plus size={15} /> Stash
                          </button>
                          <button
                            type="button"
                            onClick={() => setFundAction({ id: fund.id, type: "withdraw" })}
                            className={cn(
                              "flex-1 py-3 rounded-xl font-bold text-[14px] active:scale-95 transition-transform flex items-center justify-center",
                              pct >= 30 ? "bg-white/10 text-white border border-white/20" : "bg-background text-foreground border border-border"
                            )}
                          >
                            Edit fund
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col gap-2">
                        <p className={cn("text-[12px] font-bold uppercase tracking-wider", theme.sub)}>
                          {activeTx === "deposit" ? "How much to stash?" : "How much to withdraw?"}
                          {activeTx === "withdraw" && fund.is_locked && pct < 100 && (
                            <span className="ml-2 text-[#FF9500] normal-case">10% early penalty</span>
                          )}
                        </p>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className={cn("absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm", pct >= 30 ? "text-white/60" : "text-muted-foreground")}>K</span>
                            <input
                              type="number"
                              value={fundActionAmount}
                              onChange={(e) => setFundActionAmount(e.target.value)}
                              placeholder="0"
                              className={cn(
                                "w-full pl-8 pr-3 py-2.5 rounded-xl font-bold text-sm outline-none",
                                pct >= 30 ? "bg-white/10 text-white placeholder-white/30 border border-white/20" : "bg-background text-foreground border border-border"
                              )}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFundTransaction(fund, activeTx)}
                            className="bg-primary text-primary-foreground px-4 rounded-xl font-bold text-sm flex items-center gap-1"
                          >
                            <Check size={14} /> OK
                          </button>
                          <button
                            type="button"
                            onClick={() => { setFundAction(null); setFundActionAmount(""); }}
                            className={cn("px-3 rounded-xl", pct >= 30 ? "bg-white/10 text-white" : "bg-background text-muted-foreground")}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Start a new stash — always visible */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full border-2 border-dashed border-border rounded-3xl py-5 flex items-center justify-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-background border border-border group-hover:bg-primary/10 group-hover:border-primary/30 flex items-center justify-center transition-colors">
              <Plus size={20} />
            </div>
            <span className="font-bold text-[15px]">Start a new stash</span>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="px-6">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-[17px] font-bold text-foreground">Recent Activity</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <p className="text-muted-foreground text-sm font-medium">No activity yet</p>
              <p className="text-muted-foreground text-xs mt-1">Stash something to get started</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {transactions.map((tx) => {
                const isDeposit = tx.type === "deposit";
                const fundName = tx.sinking_funds?.name ?? "Fund";
                const fundEmoji = tx.sinking_funds?.emoji ?? null;
                const label = `${fundName}`;
                const sub = `${isDeposit ? "Deposit" : "Withdrawal"} · ${formatTxDate(tx.created_at)}`;
                const amountStr = `${isDeposit ? "+" : "-"}K${tx.amount.toLocaleString()}`;
                return (
                  <div key={tx.id} className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center",
                        isDeposit ? "bg-[#E8FFF0] text-[#00C851]" : "bg-[#FFF0F1] text-primary"
                      )}>
                        {fundEmoji
                          ? <span className="text-xl">{fundEmoji}</span>
                          : isDeposit
                            ? <ArrowDownLeft size={18} strokeWidth={2.5} />
                            : <ArrowUpRight size={18} strokeWidth={2.5} />
                        }
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-[14px] leading-tight">{label}</h4>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{sub}</p>
                      </div>
                    </div>
                    <span className={cn("font-bold text-[15px]", isDeposit ? "text-[#00C851]" : "text-foreground")}>
                      {amountStr}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Fund Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowModal(false); setNewFundType(null); }}
          />
          <div className="relative bg-card rounded-t-3xl px-6 pt-5 pb-12 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[18px] font-bold text-foreground">Start a new stash</h3>
              <button
                type="button"
                onClick={() => { setShowModal(false); setNewFundType(null); }}
                className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">What are you saving for?</p>

            {!newFundType ? (
              /* Step 1: type selector */
              <div className="grid grid-cols-2 gap-3">
                {NEW_FUND_TYPES.map((ft) => (
                  <button
                    key={ft.type}
                    type="button"
                    onClick={() => { setNewFundType(ft.type); setModalEmoji(ft.emoji); }}
                    className="flex flex-col items-start gap-2 p-4 rounded-2xl border-2 border-border bg-background hover:border-primary hover:bg-primary/5 transition-all active:scale-95 text-left"
                  >
                    <span className="text-3xl">{ft.emoji}</span>
                    <div>
                      <p className="font-bold text-foreground text-[14px]">{ft.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{ft.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Step 2: fund details */
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Fund name</label>
                  <input
                    type="text"
                    placeholder={`e.g. ${newFundType === "experience" ? "Jazz Night at Latitude 15°" : newFundType === "group" ? "Group Ski Trip" : newFundType === "anniversary" ? "Anniversary Getaway" : "Big Celebration"}`}
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground font-medium outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Goal</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-bold text-sm">K</span>
                      <input
                        type="number"
                        placeholder="500"
                        value={modalGoal}
                        onChange={(e) => setModalGoal(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-3.5 text-foreground font-medium outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Auto-save /wk</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-bold text-sm">K</span>
                      <input
                        type="number"
                        placeholder="20"
                        value={modalAutoSave}
                        onChange={(e) => setModalAutoSave(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-3.5 text-foreground font-medium outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCreateFund}
                  disabled={modalSaving || !modalName || !modalGoal}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-[16px] shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)] active:scale-[0.98] transition-all mt-2 disabled:opacity-60"
                >
                  {modalSaving ? "Creating…" : "Create Stash ✨"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
