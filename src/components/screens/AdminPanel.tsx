"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type RawVenueItem = {
  id: string;
  raw_name: string | null;
  raw_category: string | null;
  raw_address: string | null;
  raw_latitude: number | null;
  raw_longitude: number | null;
  raw_cuisine: string | null;
  osm_id: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "restaurant",
  "bar",
  "cafe",
  "nightclub",
  "activity",
  "park",
  "other",
];

const PRICE_LABELS: Record<number, string> = {
  1: "K  (budget)",
  2: "KK  (mid)",
  3: "KKK  (upscale)",
  4: "KKKK  (luxury)",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [venues, setVenues] = useState<RawVenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("restaurant");
  const [editPriceLevel, setEditPriceLevel] = useState(2);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/venues")
      .then((r) => r.json())
      .then((data) => {
        setVenues(data.venues ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function removeFromList(id: string) {
    setVenues((prev) => prev.filter((v) => v.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function openEdit(v: RawVenueItem) {
    setEditingId(v.id);
    setEditName(v.raw_name ?? "");
    setEditCategory(v.raw_category ?? "restaurant");
    setEditPriceLevel(2);
  }

  async function handleApprove(
    v: RawVenueItem,
    overrides?: { name?: string; category?: string; price_level?: number }
  ) {
    setActionLoading(v.id);
    try {
      const res = await fetch("/api/admin/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          raw_venue_id: v.id,
          ...overrides,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Approve failed");
      toast.success(`✅ ${overrides?.name ?? v.raw_name ?? "Venue"} approved`);
      removeFromList(v.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(v: RawVenueItem) {
    setActionLoading(`${v.id}_reject`);
    try {
      const res = await fetch(`/api/admin/venues?id=${v.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reject failed");
      toast.success("❌ Rejected");
      removeFromList(v.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">
          Loading venue queue…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] px-4 py-8">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Venue Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="font-bold text-foreground">{venues.length}</span> remaining
          </p>
        </div>

        {/* Empty state */}
        {venues.length === 0 && (
          <div className="bg-white rounded-2xl border border-border p-10 text-center shadow-sm">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-semibold text-foreground text-sm">
              Queue is empty
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All venues have been processed.
            </p>
          </div>
        )}

        {/* Venue cards */}
        <div className="flex flex-col gap-3">
          {venues.map((v) => {
            const isEditing = editingId === v.id;
            const busy =
              actionLoading === v.id || actionLoading === `${v.id}_reject`;

            return (
              <div
                key={v.id}
                className={cn(
                  "bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-opacity",
                  busy && "opacity-50 pointer-events-none"
                )}
              >
                {/* Info */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="font-bold text-[15px] text-foreground leading-snug">
                      {v.raw_name ?? "—"}
                    </p>
                    {v.raw_category && (
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0F1] text-primary uppercase tracking-wide">
                        {v.raw_category}
                      </span>
                    )}
                  </div>

                  {v.raw_address && (
                    <p className="text-xs text-muted-foreground leading-snug mb-0.5">
                      {v.raw_address}
                    </p>
                  )}

                  {v.raw_latitude != null && v.raw_longitude != null && (
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {v.raw_latitude.toFixed(5)}, {v.raw_longitude.toFixed(5)}
                    </p>
                  )}

                  {v.raw_cuisine && (
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Cuisine: {v.raw_cuisine}
                    </p>
                  )}

                  {v.osm_id && (
                    <p className="text-[10px] text-muted-foreground/50 mt-1 font-mono">
                      osm:{v.osm_id}
                    </p>
                  )}
                </div>

                {/* Inline edit form */}
                {isEditing && (
                  <div className="border-t border-border px-4 py-3 bg-background space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Venue name"
                      className="w-full bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                    />
                    <div className="flex gap-2">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="flex-1 bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editPriceLevel}
                        onChange={(e) =>
                          setEditPriceLevel(Number(e.target.value))
                        }
                        className="flex-1 bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>
                            {PRICE_LABELS[n]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleApprove(v, {
                            name: editName,
                            category: editCategory,
                            price_level: editPriceLevel,
                          })
                        }
                        className="flex-1 bg-primary text-white rounded-xl py-2.5 font-bold text-sm active:scale-[0.98] transition-transform"
                      >
                        Confirm ✅
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 rounded-xl border border-border text-muted-foreground text-sm font-medium bg-background"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {!isEditing && (
                  <div className="border-t border-border px-3 py-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(v)}
                      className="flex-1 bg-[#E8FFF0] text-[#00A845] font-bold text-[13px] py-2 rounded-xl hover:bg-[#d0f5e0] active:scale-[0.97] transition-all"
                    >
                      ✅ Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(v)}
                      className="flex-1 bg-background border border-border text-foreground font-bold text-[13px] py-2 rounded-xl hover:bg-gray-50 active:scale-[0.97] transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(v)}
                      className="flex-1 bg-[#FFF0F1] text-primary font-bold text-[13px] py-2 rounded-xl hover:bg-[#ffe0e2] active:scale-[0.97] transition-all"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
