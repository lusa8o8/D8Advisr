"use client"

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
        item.id === id ? { ...item, [field]: typeof value === "string" ? (value as string) : value } : item
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
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm font-semibold text-[#222222]"
        >
          ? Back
        </button>
        <h1 className="text-2xl font-bold text-[#222222]">Edit Plan</h1>
        {hasBudgetWarning && (
          <div className="rounded-2xl border border-amber-300 bg-[#FFF4E5] p-4 text-sm font-semibold text-[#FF9500]">
            ?? Budget Adjusted
            <p className="text-xs text-[#555555] mt-1">Your changes have increased the estimated cost</p>
          </div>
        )}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
              <p className="text-base font-semibold text-[#222222]">{item.venue_name}</p>
              <p className="text-xs text-[#555555]">{item.activity_type}</p>
              <label className="mt-3 flex flex-col text-xs text-[#555555]">
                Time Slot
                <input
                  className="mt-1 rounded-xl border border-[#E5E5E5] px-3 py-2 text-sm"
                  value={item.time_slot}
                  onChange={(event) => updateItem(item.id, "time_slot", event.target.value)}
                />
              </label>
              <label className="mt-3 flex flex-col text-xs text-[#555555]">
                Estimated Duration (mins)
                <input
                  type="number"
                  min={0}
                  className="mt-1 rounded-xl border border-[#E5E5E5] px-3 py-2 text-sm"
                  value={item.estimated_time_minutes}
                  onChange={(event) => updateItem(item.id, "estimated_time_minutes", Number(event.target.value))}
                />
              </label>
              <label className="mt-3 flex flex-col text-xs text-[#555555]">
                Estimated Cost (ZMW)
                <input
                  type="number"
                  min={0}
                  className="mt-1 rounded-xl border border-[#E5E5E5] px-3 py-2 text-sm"
                  value={item.estimated_cost}
                  onChange={(event) => updateItem(item.id, "estimated_cost", Number(event.target.value))}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#E5E5E5] bg-white px-4 py-4 pb-20">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 rounded-xl bg-[#FF5A5F] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => router.push(`/plans/${plan.id}`)}
            className="flex-1 rounded-xl border border-[#888888] px-4 py-3 text-sm font-semibold text-[#888888]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


