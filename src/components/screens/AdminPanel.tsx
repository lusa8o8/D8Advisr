"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft, ChevronRight, CheckCircle, AlertCircle, XCircle,
  ClipboardList, Search, Shield, Star, Eye, Edit3, Save,
  ChevronDown, Clock, RotateCcw, Plus, Lock, Activity, TrendingUp, Hourglass,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldMeta = {
  value: string;
  source: string;
  verifiedAt: string;
  confidence: "high" | "medium" | "low" | "live";
};

type Tier   = "Verified" | "D8 Approved" | "Hidden Gem";
type Health = "green" | "amber" | "red";

interface ChangeEntry {
  date: string; field: string; oldValue: string; newValue: string; by: string; reason: string;
}

interface DBVenue {
  id: string; name: string; category: string; city: string;
  address: string | null; price_range: string | null; price_level: number | null;
  opening_hours: Record<string, string> | null;
  verification_score: number; confidence_score: number;
  verified_at: string | null; source: string; tags: string[];
  is_active: boolean; created_at: string; updated_at: string;
}

interface UIVenue {
  id: string; name: string; category: string; city: string;
  tier: Tier; health: Health; nextInspectionDue: string;
  listing: Record<string, FieldMeta>;
  experience: Record<string, FieldMeta>;
  _raw: DBVenue;
}

type RawVenueItem = {
  id: string; raw_name: string | null; raw_category: string | null;
  raw_address: string | null; raw_latitude: number | null; raw_longitude: number | null;
  raw_cuisine: string | null; osm_id: string | null;
};

type AdminView = "queue" | "list" | "detail" | "tracker" | "health";
type NavTab    = "queue" | "venues" | "tracker" | "health";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_STYLE: Record<Tier, string> = {
  "Verified":    "bg-blue-50 text-blue-700 border-blue-200",
  "D8 Approved": "bg-amber-50 text-amber-700 border-amber-200",
  "Hidden Gem":  "bg-purple-50 text-purple-700 border-purple-200",
};
const TIER_DOT: Record<Tier, string> = {
  "Verified":    "bg-blue-500",
  "D8 Approved": "bg-amber-500",
  "Hidden Gem":  "bg-purple-500",
};
const HEALTH_LABEL: Record<Health, string> = {
  green: "Data current",
  amber: "Re-verify soon",
  red:   "Overdue — action required",
};
const CONFIDENCE_STYLE: Record<string, string> = {
  high:   "bg-[#E8FFF0] text-[#00C851]",
  medium: "bg-amber-50 text-amber-600",
  low:    "bg-red-50 text-[#FF5A5F]",
  live:   "bg-blue-50 text-blue-600",
};
const TIERS: Tier[] = ["Verified", "D8 Approved", "Hidden Gem"];
const TIER_TO_SCORE: Record<Tier, number> = {
  "Verified": 0.6, "D8 Approved": 0.75, "Hidden Gem": 0.95,
};
// UI listing field name → DB column
const LISTING_PATCH: Record<string, string> = {
  "Address": "address", "Price Range": "price_range",
  "Opening Hours": "opening_hours", "Category": "category", "Cuisine / Tags": "tags",
};
const QUEUE_CATS = ["restaurant","bar","cafe","nightclub","activity","park","other"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function healthIcon(h: Health) {
  if (h === "green") return <CheckCircle size={16} className="text-[#00C851]" />;
  if (h === "amber") return <AlertCircle  size={16} className="text-[#FF9500]" />;
  return <XCircle size={16} className="text-[#FF5A5F]" />;
}
function healthColor(h: Health) {
  return h === "green" ? "text-[#00C851]" : h === "amber" ? "text-[#FF9500]" : "text-[#FF5A5F]";
}
function deriveTier(v: DBVenue): Tier {
  if (v.verification_score >= 0.9) return "Hidden Gem";
  if (v.verification_score >= 0.7) return "D8 Approved";
  return "Verified";
}
function deriveHealth(verifiedAt: string | null): Health {
  if (!verifiedAt) return "red";
  const days = (Date.now() - new Date(verifiedAt).getTime()) / 86_400_000;
  return days <= 90 ? "green" : days <= 180 ? "amber" : "red";
}
function nextDue(verifiedAt: string | null): string {
  if (!verifiedAt) return "—";
  const d = new Date(verifiedAt);
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().split("T")[0];
}
function scoreConf(s: number): FieldMeta["confidence"] {
  return s >= 0.8 ? "high" : s >= 0.6 ? "medium" : "low";
}
function toUIVenue(v: DBVenue): UIVenue {
  const verAt  = (v.verified_at ?? v.created_at).split("T")[0];
  const hours  = v.opening_hours ? Object.values(v.opening_hours).join(", ") : "—";
  return {
    id: v.id, name: v.name, category: v.category, city: v.city,
    tier: deriveTier(v), health: deriveHealth(v.verified_at),
    nextInspectionDue: nextDue(v.verified_at),
    listing: {
      "Address":        { value: v.address      ?? "—", source: v.source, verifiedAt: verAt, confidence: v.address      ? "high" : "low" },
      "Price Range":    { value: v.price_range   ?? "—", source: v.source, verifiedAt: verAt, confidence: v.price_range  ? "high" : "low" },
      "Opening Hours":  { value: hours,                  source: v.source, verifiedAt: verAt, confidence: v.opening_hours? "high" : "low" },
      "Category":       { value: v.category,             source: v.source, verifiedAt: verAt, confidence: "high" },
      "Cuisine / Tags": { value: v.tags?.join(", ") || "—", source: v.source, verifiedAt: verAt, confidence: v.tags?.length ? "high" : "low" },
    },
    experience: {
      "Confidence Score":   { value: `${(v.confidence_score   * 5).toFixed(1)} / 5`, source: "Algorithm", verifiedAt: verAt, confidence: scoreConf(v.confidence_score)   },
      "Verification Score": { value: `${(v.verification_score * 5).toFixed(1)} / 5`, source: "Manual",    verifiedAt: verAt, confidence: scoreConf(v.verification_score) },
      "Data Source":        { value: v.source, source: "System", verifiedAt: v.created_at.split("T")[0], confidence: "high" },
    },
    _raw: v,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const router = useRouter();

  // View
  const [view,   setView]   = useState<AdminView>("queue");
  const [navTab, setNavTab] = useState<NavTab>("queue");

  // Data
  const [venues,  setVenues]  = useState<UIVenue[]>([]);
  const [queue,   setQueue]   = useState<RawVenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [changeLogs, setChangeLogs] = useState<Record<string, ChangeEntry[]>>({});

  // List filters
  const [filterTier,   setFilterTier]   = useState("All");
  const [filterHealth, setFilterHealth] = useState("All");
  const [search, setSearch] = useState("");

  // Detail state
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [editField,     setEditField]     = useState<string | null>(null);
  const [editValue,     setEditValue]     = useState("");
  const [editSaving,    setEditSaving]    = useState(false);
  const [showTierMenu,  setShowTierMenu]  = useState(false);
  const [tierReason,    setTierReason]    = useState("");
  const [pendingTier,   setPendingTier]   = useState<Tier | null>(null);
  const [activeSection, setActiveSection] = useState<"listing" | "experience" | "log">("listing");

  // Queue state
  const [queueEditingId,  setQueueEditingId]  = useState<string | null>(null);
  const [queueEditName,   setQueueEditName]   = useState("");
  const [queueEditCat,    setQueueEditCat]    = useState("restaurant");
  const [queueEditPrice,  setQueueEditPrice]  = useState(2);
  const [queueBusy,       setQueueBusy]       = useState<string | null>(null);
  const [queueFilterCat,  setQueueFilterCat]  = useState("all");
  const [queuePage,       setQueuePage]       = useState(1);
  const [batchBusy,       setBatchBusy]       = useState(false);

  const selectedVenue = venues.find(v => v.id === selectedId) ?? null;

  const PAGE_SIZE     = 20;
  const filteredQueue = queue.filter(v => queueFilterCat === "all" || v.raw_category === queueFilterCat);
  const pagedQueue    = filteredQueue.slice(0, queuePage * PAGE_SIZE);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/venues").then(r => r.json()),
      fetch("/api/admin/venues?mode=approved").then(r => r.json()),
    ]).then(([q, v]) => {
      setQueue(q.venues  ?? []);
      setVenues((v.venues ?? []).map(toUIVenue));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const filtered = venues.filter(v => {
    if (filterTier   !== "All" && v.tier   !== filterTier)   return false;
    if (filterHealth !== "All" && v.health !== filterHealth) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function openDetail(id: string) {
    setSelectedId(id); setView("detail"); setActiveSection("listing");
    setEditField(null); setShowTierMenu(false); setPendingTier(null);
  }

  function updateLocalVenue(updated: DBVenue) {
    setVenues(prev => prev.map(v => v.id === updated.id ? toUIVenue(updated) : v));
  }

  function addLog(id: string, entry: Omit<ChangeEntry, "date">) {
    const e: ChangeEntry = { ...entry, date: new Date().toISOString().split("T")[0] };
    setChangeLogs(prev => ({ ...prev, [id]: [e, ...(prev[id] ?? [])] }));
  }

  async function patchVenue(id: string, fields: Record<string, unknown>): Promise<DBVenue> {
    const res  = await fetch("/api/admin/venues", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...fields }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Update failed");
    return data.venue as DBVenue;
  }

  // ── Venue management ──────────────────────────────────────────────────────

  async function saveField(key: string) {
    if (!selectedVenue || !editValue.trim()) return;
    const old     = selectedVenue.listing[key]?.value ?? "—";
    const dbField = LISTING_PATCH[key];
    if (!dbField) { setEditField(null); return; }
    setEditSaving(true);
    try {
      const extra: Record<string, unknown> = {};
      if (dbField === "opening_hours") extra.opening_hours = { default: editValue };
      else if (dbField === "tags")     extra.tags = editValue.split(",").map(t => t.trim()).filter(Boolean);
      else if (dbField === "category") { extra.category = editValue; extra.activity_type = editValue; }
      else                             extra[dbField] = editValue;

      const updated = await patchVenue(selectedVenue.id, extra);
      updateLocalVenue(updated);
      addLog(selectedVenue.id, { field: key, oldValue: old, newValue: editValue, by: "D8 Team", reason: "Manual update via Admin Panel" });
      toast.success(`${key} updated`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setEditSaving(false); setEditField(null); setEditValue("");
    }
  }

  async function confirmTierChange() {
    if (!selectedVenue || !pendingTier || !tierReason.trim()) return;
    const oldTier = selectedVenue.tier;
    setEditSaving(true);
    try {
      const updated = await patchVenue(selectedVenue.id, { verification_score: TIER_TO_SCORE[pendingTier] });
      updateLocalVenue(updated);
      addLog(selectedVenue.id, { field: "Tier", oldValue: oldTier, newValue: pendingTier, by: "D8 Team", reason: tierReason });
      toast.success(`Tier → ${pendingTier}`);
      setPendingTier(null); setTierReason(""); setShowTierMenu(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tier change failed");
    } finally { setEditSaving(false); }
  }

  async function markVerified(id: string) {
    try {
      const updated = await patchVenue(id, { verified_at: new Date().toISOString() });
      updateLocalVenue(updated);
      addLog(id, { field: "Verification", oldValue: "Overdue", newValue: "Current", by: "D8 Team", reason: "Re-inspection completed" });
      toast.success("Marked as re-verified");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  // ── Queue actions ─────────────────────────────────────────────────────────

  function removeFromQueue(id: string) {
    setQueue(prev => prev.filter(v => v.id !== id));
    if (queueEditingId === id) setQueueEditingId(null);
  }

  async function handleApprove(v: RawVenueItem, overrides?: { name?: string; category?: string; price_level?: number }) {
    setQueueBusy(v.id);
    try {
      const res  = await fetch("/api/admin/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", raw_venue_id: v.id, ...overrides }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Approve failed");
      toast.success(`✅ ${overrides?.name ?? v.raw_name ?? "Venue"} approved`);
      removeFromQueue(v.id);
      if (data.venue) setVenues(prev => [toUIVenue(data.venue), ...prev]);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Approve failed"); }
    finally { setQueueBusy(null); }
  }

  async function handleReject(v: RawVenueItem) {
    setQueueBusy(`${v.id}_r`);
    try {
      const res = await fetch(`/api/admin/venues?id=${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Reject failed");
      toast.success("❌ Rejected");
      removeFromQueue(v.id);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Reject failed"); }
    finally { setQueueBusy(null); }
  }

  async function handleBatchApprove(criteria: { category: string; hasAddress: boolean }) {
    setBatchBusy(true);
    try {
      const res  = await fetch("/api/admin/venues/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Batch approve failed");
      toast.success(`✅ ${data.approved} venue${data.approved !== 1 ? "s" : ""} approved`);
      setQueue(prev => prev.filter(v => {
        if (v.raw_category !== criteria.category) return true;
        if (criteria.hasAddress && !v.raw_address) return true;
        return false;
      }));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Batch approve failed"); }
    finally { setBatchBusy(false); }
  }

  async function handleBatchReject(criteria: { category: string; hasNoAddress: boolean }) {
    setBatchBusy(true);
    try {
      const res  = await fetch("/api/admin/venues/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Batch reject failed");
      toast.success(`🗑️ ${data.rejected} venue${data.rejected !== 1 ? "s" : ""} rejected`);
      setQueue(prev => prev.filter(v => {
        if (v.raw_category !== criteria.category) return true;
        if (criteria.hasNoAddress && v.raw_address) return true;
        return false;
      }));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Batch reject failed"); }
    finally { setBatchBusy(false); }
  }

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <p className="text-white/40 text-sm animate-pulse">Loading admin panel…</p>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F7F7]">

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <div className="bg-[#141414] px-5 pt-12 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => view === "detail" ? setView(navTab === "venues" ? "list" : navTab) : router.back()}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-white font-black text-[15px] leading-tight tracking-tight">
              <span className="text-[#FF5A5F]">D8</span>Advisr Admin
            </p>
            <p className="text-white/40 text-[11px] font-medium">
              {view === "detail" && selectedVenue ? selectedVenue.name : "Internal — Team Only"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#00C851] animate-pulse" />
          <span className="text-white/50 text-[11px] font-semibold">Live</span>
        </div>
      </div>

      {/* ── NAV TABS ─────────────────────────────────────────────────────── */}
      {view !== "detail" && (
        <div className="bg-[#141414] px-5 pb-4 flex gap-1 shrink-0 overflow-x-auto">
          {([
            { tab: "queue"   as NavTab, v: "queue"   as AdminView, icon: <ClipboardList size={13} />, label: `Queue (${queue.length})` },
            { tab: "venues"  as NavTab, v: "list"    as AdminView, icon: <Search size={13} />,        label: `Venues (${venues.length})` },
            { tab: "tracker" as NavTab, v: "tracker" as AdminView, icon: <Clock size={13} />,         label: "Inspections" },
            { tab: "health"  as NavTab, v: "health"  as AdminView, icon: <Activity size={13} />,      label: "Health" },
          ] as const).map(({ tab, v, icon, label }) => (
            <button key={tab} onClick={() => { setNavTab(tab); setView(v); }}
              className={cn("shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold transition-all",
                navTab === tab ? "bg-[#FF5A5F] text-white" : "text-white/50 hover:text-white/80")}>
              {icon} {label}
            </button>
          ))}
        </div>
      )}

      {/* ── QUEUE VIEW ───────────────────────────────────────────────────── */}
      {view === "queue" && (
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
          <div className="max-w-xl mx-auto">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {filteredQueue.length} venue{filteredQueue.length !== 1 ? "s" : ""} pending review
              {queueFilterCat !== "all" && ` · ${queueFilterCat}`}
            </p>

            {/* Category filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
              {(["all", ...QUEUE_CATS] as string[]).map(cat => (
                <button key={cat} onClick={() => { setQueueFilterCat(cat); setQueuePage(1); }}
                  className={cn("shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all",
                    queueFilterCat === cat ? "bg-[#141414] text-white border-[#141414]" : "bg-white text-gray-600 border-gray-200")}>
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>

            {/* Batch action buttons */}
            {queueFilterCat === "restaurant" && filteredQueue.some(v => v.raw_address) && (
              <button disabled={batchBusy} onClick={() => handleBatchApprove({ category: "restaurant", hasAddress: true })}
                className="w-full bg-[#E8FFF0] text-[#00A845] font-bold text-sm py-3 rounded-2xl mb-2 border border-[#00C851]/20 active:scale-[0.98] transition-all disabled:opacity-50">
                ✅ Approve All with Address
              </button>
            )}
            <button disabled={batchBusy} onClick={() => handleBatchReject({ category: "bar", hasNoAddress: true })}
              className="w-full bg-[#FFF0F1] text-[#FF5A5F] font-bold text-sm py-3 rounded-2xl mb-4 border border-[#FF5A5F]/20 active:scale-[0.98] transition-all disabled:opacity-50">
              🗑️ Reject All Unnamed/Low Quality
            </button>

            {filteredQueue.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                <p className="text-2xl mb-2">🎉</p>
                <p className="font-semibold text-gray-800 text-sm">Queue is empty</p>
                <p className="text-xs text-gray-400 mt-1">All venues processed.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {pagedQueue.map(v => {
                const isEditing = queueEditingId === v.id;
                const busy      = queueBusy === v.id || queueBusy === `${v.id}_r`;
                return (
                  <div key={v.id} className={cn("bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-opacity", busy && "opacity-50 pointer-events-none")}>
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="font-bold text-[15px] text-gray-900 leading-snug">{v.raw_name ?? "—"}</p>
                        {v.raw_category && (
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0F1] text-[#FF5A5F] uppercase tracking-wide">
                            {v.raw_category}
                          </span>
                        )}
                      </div>
                      {v.raw_address
                        ? <p className="text-xs font-semibold text-gray-700 mb-0.5">{v.raw_address}</p>
                        : <p className="text-xs text-gray-400 mb-0.5 italic">No address — coordinates only</p>
                      }
                      {v.raw_cuisine  && <p className="text-xs text-gray-400 mb-0.5">Cuisine: {v.raw_cuisine}</p>}
                      {v.osm_id       && <p className="text-[10px] text-gray-300 mt-1 font-mono">osm:{v.osm_id}</p>}
                    </div>

                    {isEditing && (
                      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
                        <input type="text" value={queueEditName} onChange={e => setQueueEditName(e.target.value)} placeholder="Venue name"
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF5A5F]" />
                        <div className="flex gap-2">
                          <select value={queueEditCat} onChange={e => setQueueEditCat(e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF5A5F]">
                            {QUEUE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <select value={queueEditPrice} onChange={e => setQueueEditPrice(Number(e.target.value))}
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FF5A5F]">
                            {[1,2,3,4].map(n => <option key={n} value={n}>{"K".repeat(n)} (L{n})</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleApprove(v, { name: queueEditName, category: queueEditCat, price_level: queueEditPrice })}
                            className="flex-1 bg-[#FF5A5F] text-white rounded-xl py-2.5 font-bold text-sm active:scale-[0.98] transition-transform">
                            Confirm ✅
                          </button>
                          <button type="button" onClick={() => setQueueEditingId(null)}
                            className="px-4 rounded-xl border border-gray-200 text-gray-500 text-sm bg-white">Cancel</button>
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="border-t border-gray-100 px-3 py-2.5 flex gap-2">
                        <button type="button" onClick={() => handleApprove(v)}
                          className="flex-1 bg-[#E8FFF0] text-[#00A845] font-bold text-[13px] py-2 rounded-xl hover:bg-[#d0f5e0] active:scale-[0.97] transition-all">
                          ✅ Approve
                        </button>
                        <button type="button" onClick={() => { setQueueEditingId(v.id); setQueueEditName(v.raw_name ?? ""); setQueueEditCat(v.raw_category ?? "restaurant"); setQueueEditPrice(2); }}
                          className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold text-[13px] py-2 rounded-xl hover:bg-gray-50 active:scale-[0.97] transition-all">
                          ✏️ Edit
                        </button>
                        <button type="button" onClick={() => handleReject(v)}
                          className="flex-1 bg-[#FFF0F1] text-[#FF5A5F] font-bold text-[13px] py-2 rounded-xl hover:bg-[#ffe0e2] active:scale-[0.97] transition-all">
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {pagedQueue.length < filteredQueue.length && (
                <button onClick={() => setQueuePage(p => p + 1)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold text-[13px] hover:border-[#FF5A5F] hover:text-[#FF5A5F] transition-all">
                  Load more ({filteredQueue.length - pagedQueue.length} remaining)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ────────────────────────────────────────────────────── */}
      {view === "list" && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-3 flex flex-col gap-2.5 sticky top-0 bg-[#F7F7F7] z-10">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search venues…"
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#FF5A5F] focus:ring-1 focus:ring-[#FF5A5F] transition-all" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {["All", ...TIERS].map(t => (
                <button key={t} onClick={() => setFilterTier(t)}
                  className={cn("shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all",
                    filterTier === t ? "bg-[#FF5A5F] text-white border-[#FF5A5F]" : "bg-white text-gray-600 border-gray-200")}>
                  {t}
                </button>
              ))}
              {(["All","green","amber","red"] as const).map(h => (
                <button key={h} onClick={() => setFilterHealth(h)}
                  className={cn("shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all",
                    filterHealth === h ? "bg-[#141414] text-white border-[#141414]" : "bg-white text-gray-600 border-gray-200")}>
                  {h === "All" ? "● All health" : h === "green" ? "🟢" : h === "amber" ? "🟡" : "🔴"}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-6 flex flex-col gap-3">
            {filtered.length === 0 && <div className="text-center text-gray-400 text-[14px] py-12">No venues match filters.</div>}
            {filtered.map(v => (
              <button key={v.id} onClick={() => openDetail(v.id)}
                className="w-full bg-white rounded-2xl border border-gray-200 p-4 text-left active:scale-[0.98] transition-transform shadow-sm">
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-gray-900 text-[15px] leading-tight truncate">{v.name}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">{v.category} · {v.city}</p>
                  </div>
                  <div className={cn("shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold", TIER_STYLE[v.tier])}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", TIER_DOT[v.tier])} />
                    {v.tier}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {healthIcon(v.health)}
                    <span className={cn("text-[11px] font-semibold", healthColor(v.health))}>{HEALTH_LABEL[v.health]}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock size={11} />
                    <span className="text-[10px] font-medium">Due {v.nextInspectionDue}</span>
                    <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </button>
            ))}

            <button className="w-full bg-white rounded-2xl border-2 border-dashed border-gray-200 p-5 flex items-center justify-center gap-2 text-gray-400 font-bold text-[14px] hover:border-[#FF5A5F] hover:text-[#FF5A5F] active:scale-[0.98] transition-all">
              <Plus size={17} /> Add New Venue
            </button>
          </div>
        </div>
      )}

      {/* ── DETAIL VIEW ──────────────────────────────────────────────────── */}
      {view === "detail" && selectedVenue && (() => {
        const logs = changeLogs[selectedVenue.id] ?? [];
        return (
          <div className="flex-1 overflow-y-auto">

            <div className="bg-white border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full border", TIER_STYLE[selectedVenue.tier])}>
                  {selectedVenue.tier}
                </span>
                <div className="flex items-center gap-1.5">
                  {healthIcon(selectedVenue.health)}
                  <span className={cn("text-[11px] font-semibold", healthColor(selectedVenue.health))}>{HEALTH_LABEL[selectedVenue.health]}</span>
                </div>
              </div>
              <h2 className="font-black text-gray-900 text-[18px] leading-tight mt-2">{selectedVenue.name}</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">{selectedVenue.category} · {selectedVenue.city}</p>
            </div>

            {/* Tier control */}
            <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield size={15} className="text-[#FF5A5F]" />
                  <span className="font-bold text-gray-900 text-[13px]">Tier Assignment</span>
                </div>
                <button onClick={() => setShowTierMenu(s => !s)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                  Change <ChevronDown size={14} className={cn("transition-transform", showTierMenu && "rotate-180")} />
                </button>
              </div>

              {showTierMenu ? (
                <div>
                  <div className="flex flex-col gap-2 mb-3">
                    {TIERS.map(t => (
                      <button key={t} onClick={() => setPendingTier(t)}
                        className={cn("flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                          pendingTier === t ? "border-[#FF5A5F] bg-[#FFF0F1]" : "border-gray-200 hover:border-gray-300")}>
                        <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", TIER_DOT[t])} />
                        <span className={cn("text-[13px] font-bold", pendingTier === t ? "text-[#FF5A5F]" : "text-gray-700")}>{t}</span>
                      </button>
                    ))}
                  </div>
                  {pendingTier && (
                    <>
                      <textarea value={tierReason} onChange={e => setTierReason(e.target.value)}
                        placeholder="Reason for tier change (required)…" rows={2}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#FF5A5F] resize-none mb-2.5" />
                      <button onClick={confirmTierChange} disabled={!tierReason.trim() || editSaving}
                        className={cn("w-full py-2.5 rounded-xl font-bold text-[13px] transition-all",
                          tierReason.trim() ? "bg-[#FF5A5F] text-white active:scale-[0.98]" : "bg-gray-100 text-gray-400 cursor-not-allowed")}>
                        {editSaving ? "Saving…" : "Confirm Tier Change"}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className={cn("flex items-center gap-2.5 p-3 rounded-xl border", TIER_STYLE[selectedVenue.tier])}>
                  <div className={cn("w-3 h-3 rounded-full shrink-0", TIER_DOT[selectedVenue.tier])} />
                  <span className="font-bold text-[14px]">{selectedVenue.tier}</span>
                </div>
              )}
            </div>

            {/* Section tabs */}
            <div className="flex mx-4 mt-4 bg-white rounded-2xl border border-gray-200 p-1 shadow-sm">
              {(["listing","experience","log"] as const).map(s => (
                <button key={s} onClick={() => setActiveSection(s)}
                  className={cn("flex-1 py-2 rounded-xl text-[12px] font-bold transition-all capitalize",
                    activeSection === s ? "bg-[#141414] text-white" : "text-gray-500 hover:text-gray-800")}>
                  {s === "listing" ? "Listing" : s === "experience" ? "Experience" : "Log"}
                </button>
              ))}
            </div>

            <div className="px-4 pt-3 pb-6">

              {/* LISTING */}
              {activeSection === "listing" && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <Edit3 size={13} className="text-gray-400" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Listing Data — Editable</p>
                  </div>
                  {Object.entries(selectedVenue.listing).map(([key, meta]) => (
                    <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{key}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full capitalize", CONFIDENCE_STYLE[meta.confidence])}>
                              {meta.confidence}
                            </span>
                            <button onClick={() => { setEditField(editField === key ? null : key); setEditValue(meta.value); }}
                              className="text-[11px] font-bold text-[#FF5A5F] active:scale-95 transition-transform">
                              {editField === key ? "Cancel" : "Edit"}
                            </button>
                          </div>
                        </div>
                        {editField === key ? (
                          <div className="flex gap-2 mt-1">
                            <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                              className="flex-1 px-3 py-2 rounded-xl border border-[#FF5A5F] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#FF5A5F]" />
                            <button onClick={() => saveField(key)} disabled={editSaving}
                              className="px-3 py-2 bg-[#FF5A5F] text-white rounded-xl active:scale-95 transition-transform disabled:opacity-50">
                              <Save size={14} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-[14px] font-semibold text-gray-900">{meta.value}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1.5">{meta.source} · Verified {meta.verifiedAt}</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => markVerified(selectedVenue.id)}
                    className="w-full mt-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#E8FFF0] text-[#00C851] font-bold text-[13px] border border-[#00C851]/20 active:scale-[0.98] transition-transform">
                    <RotateCcw size={14} /> Mark All Listing Data as Re-Verified
                  </button>
                </div>
              )}

              {/* EXPERIENCE */}
              {activeSection === "experience" && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <Lock size={13} className="text-purple-400" />
                    <p className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Experience Data — Inspection Only</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl px-4 py-3 mb-1 flex items-start gap-3">
                    <Eye size={15} className="text-purple-500 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-purple-700 leading-relaxed">
                      Set during physical inspection. Locked from venue manager access.
                    </p>
                  </div>
                  {Object.entries(selectedVenue.experience).map(([key, meta]) => (
                    <div key={key} className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <div className="px-4 py-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{key}</span>
                          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full capitalize", CONFIDENCE_STYLE[meta.confidence])}>
                            {meta.confidence}
                          </span>
                        </div>
                        <p className="text-[14px] font-semibold text-gray-900">{meta.value}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5">{meta.source} · {meta.verifiedAt}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-1 mt-2">
                    <span className="text-[12px] text-gray-500 font-medium">⭐ Avg Score</span>
                    <span className="text-[13px] font-black text-gray-900">
                      {(() => {
                        const scores = Object.entries(selectedVenue.experience)
                          .filter(([k]) => k.includes("Score"))
                          .map(([, v]) => parseFloat(v.value));
                        return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
                      })()}
                      <span className="text-gray-400 font-medium"> / 5</span>
                    </span>
                  </div>
                </div>
              )}

              {/* CHANGE LOG */}
              {activeSection === "log" && (
                <div className="flex flex-col gap-0">
                  <div className="flex items-center gap-1.5 mb-3 px-1">
                    <Star size={13} className="text-gray-400" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Change History</p>
                  </div>
                  {logs.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                      <p className="text-[13px] text-gray-400">No changes recorded this session.</p>
                    </div>
                  )}
                  {logs.map((entry, i) => (
                    <div key={i} className="flex gap-3 pb-4 relative">
                      {i < logs.length - 1 && <div className="absolute left-[14px] top-8 bottom-0 w-[2px] bg-gray-100" />}
                      <div className="w-7 h-7 rounded-full bg-[#141414] flex items-center justify-center shrink-0 relative z-10 mt-0.5">
                        <Edit3 size={11} className="text-white" />
                      </div>
                      <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-3.5 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900 text-[13px]">{entry.field}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{entry.date}</span>
                        </div>
                        {entry.oldValue !== "—" && (
                          <div className="flex gap-2 text-[11px] mb-1.5 flex-wrap">
                            <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium line-through">{entry.oldValue}</span>
                            <span className="text-gray-400">→</span>
                            <span className="bg-[#E8FFF0] text-[#00C851] px-2 py-0.5 rounded-full font-medium">{entry.newValue}</span>
                          </div>
                        )}
                        <p className="text-[11px] text-gray-500 leading-relaxed">{entry.reason}</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium">by {entry.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── TRACKER VIEW ─────────────────────────────────────────────────── */}
      {view === "tracker" && (
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={15} className="text-[#FF5A5F]" />
              <p className="font-bold text-gray-900 text-[13px]">Overdue — Action Required</p>
            </div>
            {venues.filter(v => v.health === "red").length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center text-[13px] text-gray-400">All clear</div>
            )}
            {venues.filter(v => v.health === "red").map(v => (
              <div key={v.id} className="bg-white rounded-2xl border-2 border-[#FF5A5F]/30 p-4 mb-2.5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 text-[14px]">{v.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{v.category} · Due {v.nextInspectionDue}</p>
                  </div>
                  <div className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0", TIER_STYLE[v.tier])}>{v.tier}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openDetail(v.id)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-[12px] active:scale-95 transition-transform">View Venue</button>
                  <button onClick={() => markVerified(v.id)} className="flex-1 py-2.5 rounded-xl bg-[#FF5A5F] text-white font-bold text-[12px] active:scale-95 transition-transform">Mark Re-Verified</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={15} className="text-[#FF9500]" />
              <p className="font-bold text-gray-900 text-[13px]">Re-Verify Soon</p>
            </div>
            {venues.filter(v => v.health === "amber").length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center text-[13px] text-gray-400">Nothing upcoming</div>
            )}
            {venues.filter(v => v.health === "amber").map(v => (
              <div key={v.id} className="bg-white rounded-2xl border border-amber-200 p-4 mb-2.5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 text-[14px]">{v.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{v.category} · Due {v.nextInspectionDue}</p>
                  </div>
                  <div className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0", TIER_STYLE[v.tier])}>{v.tier}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openDetail(v.id)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-[12px] active:scale-95 transition-transform">View Venue</button>
                  <button onClick={() => markVerified(v.id)} className="flex-1 py-2.5 rounded-xl bg-[#FF9500] text-white font-bold text-[12px] active:scale-95 transition-transform">Mark Re-Verified</button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={15} className="text-[#00C851]" />
              <p className="font-bold text-gray-900 text-[13px]">Current — All Good</p>
            </div>
            {venues.filter(v => v.health === "green").length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center text-[13px] text-gray-400">None yet</div>
            )}
            {venues.filter(v => v.health === "green").map(v => (
              <div key={v.id} className="bg-white rounded-2xl border border-gray-200 p-4 mb-2.5 flex items-center gap-3 shadow-sm">
                <CheckCircle size={18} className="text-[#00C851] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-[14px] truncate">{v.name}</p>
                  <p className="text-[11px] text-gray-500">Next due {v.nextInspectionDue}</p>
                </div>
                <button onClick={() => openDetail(v.id)} className="text-[#FF5A5F] active:scale-95 transition-transform">
                  <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HEALTH VIEW ──────────────────────────────────────────────────── */}
      {view === "health" && (() => {
        const allFields   = venues.flatMap(v => [...Object.values(v.listing), ...Object.values(v.experience)]);
        const highFields  = allFields.filter(f => f.confidence === "high").length;
        const coverageRate = allFields.length ? Math.round((highFields / allFields.length) * 100) : 0;

        const tierCounts: Record<Tier, number> = { "Verified": 0, "D8 Approved": 0, "Hidden Gem": 0 };
        venues.forEach(v => { tierCounts[v.tier]++; });

        const hc = {
          green: venues.filter(v => v.health === "green").length,
          amber: venues.filter(v => v.health === "amber").length,
          red:   venues.filter(v => v.health === "red").length,
        };
        const today = new Date();
        const avgDays = venues.length ? Math.round(
          venues.reduce((sum, v) => {
            const oldest = Object.values({ ...v.listing, ...v.experience })
              .map(f => new Date(f.verifiedAt).getTime())
              .reduce((a, b) => Math.min(a, b), Date.now());
            return sum + (today.getTime() - oldest) / 86_400_000;
          }, 0) / venues.length
        ) : 0;
        const compliance   = venues.length ? Math.round((hc.green / venues.length) * 100) : 0;
        const totalChanges = Object.values(changeLogs).reduce((s, l) => s + l.length, 0);

        return (
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Activity size={14} className="text-gray-400" />
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Live — Computed from Venue Data</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Field Coverage</p>
                <p className={cn("text-3xl font-black leading-none mb-1", coverageRate >= 90 ? "text-[#00C851]" : coverageRate >= 70 ? "text-[#FF9500]" : "text-[#FF5A5F]")}>{coverageRate}%</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div className={cn("h-full rounded-full", coverageRate >= 90 ? "bg-[#00C851]" : coverageRate >= 70 ? "bg-[#FF9500]" : "bg-[#FF5A5F]")} style={{ width: `${coverageRate}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">{highFields} / {allFields.length} high-confidence</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Inspection Compliance</p>
                <p className={cn("text-3xl font-black leading-none mb-1", compliance >= 80 ? "text-[#00C851]" : compliance >= 50 ? "text-[#FF9500]" : "text-[#FF5A5F]")}>{compliance}%</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div className={cn("h-full rounded-full", compliance >= 80 ? "bg-[#00C851]" : compliance >= 50 ? "bg-[#FF9500]" : "bg-[#FF5A5F]")} style={{ width: `${compliance}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">{hc.green} of {venues.length} current</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Avg Data Age</p>
                <p className={cn("text-3xl font-black leading-none", avgDays <= 90 ? "text-[#00C851]" : avgDays <= 180 ? "text-[#FF9500]" : "text-[#FF5A5F]")}>{avgDays}</p>
                <p className="text-[10px] text-gray-400 mt-1">days since oldest verified field</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Changes</p>
                <p className="text-3xl font-black leading-none text-gray-900">{totalChanges}</p>
                <p className="text-[10px] text-gray-400 mt-1">logged edits this session</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Inspection Health Breakdown</p>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
                {hc.green > 0 && <div className="bg-[#00C851] rounded-l-full" style={{ flex: hc.green }} />}
                {hc.amber > 0 && <div className="bg-[#FF9500]"               style={{ flex: hc.amber }} />}
                {hc.red   > 0 && <div className="bg-[#FF5A5F] rounded-r-full" style={{ flex: hc.red   }} />}
              </div>
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-[#00C851]"><span className="w-2 h-2 rounded-full bg-[#00C851]" /> {hc.green} Current</span>
                <span className="flex items-center gap-1.5 text-[#FF9500]"><span className="w-2 h-2 rounded-full bg-[#FF9500]" /> {hc.amber} Re-verify</span>
                <span className="flex items-center gap-1.5 text-[#FF5A5F]"><span className="w-2 h-2 rounded-full bg-[#FF5A5F]" /> {hc.red}   Overdue</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm mb-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Tier Distribution</p>
              <div className="flex flex-col gap-3">
                {TIERS.map(t => {
                  const count = tierCounts[t];
                  const pct   = venues.length ? Math.round((count / venues.length) * 100) : 0;
                  return (
                    <div key={t}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", TIER_DOT[t])} />
                          <span className="text-[12px] font-semibold text-gray-800">{t}</span>
                        </div>
                        <span className="text-[12px] font-bold text-gray-500">{count} venue{count !== 1 ? "s" : ""} · {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", TIER_DOT[t])} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3 px-1">
              <Hourglass size={13} className="text-gray-400" />
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending — Requires User Data</p>
            </div>

            <div className="bg-[#141414] rounded-2xl p-4 mb-3 flex items-start gap-3">
              <TrendingUp size={15} className="text-white/40 mt-0.5 shrink-0" />
              <p className="text-[12px] text-white/50 leading-relaxed">
                Metrics below activate once users complete plans and return with post-date feedback. Data structures are already in place.
              </p>
            </div>

            {[
              { label: "Price Accuracy Rate",    desc: "Post-date: did actual cost match the estimate?",               why: "Triggers re-verification of specific price fields." },
              { label: "Post-Date Satisfaction", desc: "Average satisfaction score across completed date plans.",       why: "Signals whether D8 Approved venues deliver on the promise." },
              { label: "Review Submission Rate", desc: "Of users who completed a plan, % who returned to review.",     why: "Measures trust loop closure — experience data layer depends on this." },
              { label: "Time to First Inspection", desc: "Days between listing and first verified inspection visit.", why: "Tracks how quickly new listings reach verified data quality." },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl border border-gray-200 p-4 mb-2.5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-gray-900 text-[13px]">{m.label}</p>
                  <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2.5 py-1 rounded-full">Pending data</span>
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-2">{m.desc}</p>
                <div className="flex items-start gap-1.5 pt-2 border-t border-gray-100">
                  <Star size={11} className="text-[#FF9500] mt-0.5 shrink-0" />
                  <p className="text-[11px] text-gray-400 leading-snug">{m.why}</p>
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
