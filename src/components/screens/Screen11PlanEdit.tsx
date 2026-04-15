"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Plan, PlanItem } from "@/types/database";

type EditableStop = PlanItem & {
  venue_name: string;
  activity_type: string | null;
};

type Screen11PlanEditProps = {
  plan: Plan;
  stops: EditableStop[];
};

export default function Screen11PlanEdit({ plan, stops }: Screen11PlanEditProps) {
  const router = useRouter();
  const [items, setItems] = useState(
    stops.map((stop) => ({
      id: stop.id,
      time_slot: stop.time_slot ?? "",
      estimated_cost: stop.estimated_cost,
      estimated_time_minutes: stop.estimated_time_minutes ?? 60,
      venue_name: stop.venue_name,
      activity_type: stop.activity_type,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);

  const totalEstimate = useMemo(
    () => items.reduce((sum, item) => sum + item.estimated_cost, 0),
    [items]
  );

  const hasBudgetWarning = totalEstimate > plan.estimated_cost * 1.1;

  const updateItem = (id: string, field: keyof typeof items[number], value: string | number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/plans/${plan.id}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            time_slot: item.time_slot,
            estimated_cost: Number(item.estimated_cost),
            estimated_time_minutes: Number(item.estimated_time_minutes),
          })),
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Unable to save changes");
      }
      router.push(`/plans/${plan.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Sticky header */}
      <div className="bg-card px-6 pt-14 pb-4 flex justify-between items-center sticky top-0 z-20 shadow-sm border-b border-border">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-foreground hover:opacity-70 active:scale-95 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-foreground text-xl">Edit Plan</h1>
        </div>
      </div>

      <div className="px-6 py-6 pb-28 flex flex-col gap-8">

        {hasBudgetWarning && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
            Budget Adjusted
            <p className="text-xs text-muted-foreground mt-1 font-normal">Your changes have increased the estimated cost</p>
          </div>
        )}

        {/* Itinerary Steps */}
        <div>
          <h3 className="font-bold text-muted-foreground mb-4 text-sm uppercase tracking-wider">Itinerary Steps</h3>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-4 flex gap-3 shadow-sm">
                <div className="flex items-center text-muted-foreground/40 shrink-0">
                  <GripVertical size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-[15px] mb-1 truncate">{item.venue_name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{item.activity_type}</p>
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Time Slot</label>
                      <input
                        className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground font-medium focus:outline-none focus:border-primary w-full"
                        value={item.time_slot}
                        onChange={(e) => updateItem(item.id, "time_slot", e.target.value)}
                        placeholder="e.g. 7:00 PM"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Duration (min)</label>
                        <input
                          type="number"
                          min={0}
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground font-medium focus:outline-none focus:border-primary w-full"
                          value={item.estimated_time_minutes}
                          onChange={(e) => updateItem(item.id, "estimated_time_minutes", Number(e.target.value))}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Cost (ZMW)</label>
                        <input
                          type="number"
                          min={0}
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground font-medium focus:outline-none focus:border-primary w-full"
                          value={item.estimated_cost}
                          onChange={(e) => updateItem(item.id, "estimated_cost", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-semibold flex items-center justify-center gap-2 hover:bg-card hover:text-foreground transition-colors mt-2"
            >
              <Plus size={20} /> Add Another Stop
            </button>
          </div>
        </div>

        {/* Adjust Budget Target */}
        <div>
          <h3 className="font-bold text-muted-foreground mb-4 text-sm uppercase tracking-wider">Adjust Budget Target</h3>
          <div className="bg-card p-5 border border-border rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-foreground">Target Amount</span>
              <span className="font-bold text-primary text-xl">K{plan.estimated_cost.toFixed(0)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="3000"
              defaultValue={plan.estimated_cost}
              className="w-full accent-primary h-2 bg-background rounded-lg appearance-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-bold mt-2">
              <span>K50</span>
              <span>K3,000+</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="font-bold text-muted-foreground mb-4 text-sm uppercase tracking-wider">Notes</h3>
          <textarea
            placeholder="Add notes for this plan..."
            className="w-full bg-card border border-border rounded-2xl p-4 min-h-[120px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>

      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-6 flex items-center gap-4 z-20">
        <button
          type="button"
          onClick={() => router.push(`/plans/${plan.id}`)}
          className="font-bold text-muted-foreground hover:text-foreground px-4"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-[17px] shadow-md active:scale-95 transition-all disabled:opacity-60 hover:bg-primary/90"
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
