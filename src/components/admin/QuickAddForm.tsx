 "use client";

import { FormEvent, useState } from "react";

type QuickAddFormProps = {};

export default function QuickAddForm(props: QuickAddFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    activity_type: "",
    address: "",
    price_level: "2",
    tags: "",
  });

  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("saving");

    const payload = {
      name: formData.name,
      category: formData.category,
      activity_type: formData.activity_type,
      address: formData.address,
      price_level: Number(formData.price_level),
      tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    const response = await fetch("/api/admin/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json();
      setStatus(body.error ?? "Unable to add venue");
      return;
    }

    setStatus("saved");
    setFormData({
      name: "",
      category: "",
      activity_type: "",
      address: "",
      price_level: "2",
      tags: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary">Quick add venue</h3>
      <div className="grid grid-cols-1 gap-3">
        <input
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          placeholder="Name"
          className="rounded-2xl border border-border px-3 py-2"
        />
        <input
          value={formData.category}
          onChange={(event) => setFormData({ ...formData, category: event.target.value })}
          placeholder="Category"
          className="rounded-2xl border border-border px-3 py-2"
        />
        <input
          value={formData.activity_type}
          onChange={(event) => setFormData({ ...formData, activity_type: event.target.value })}
          placeholder="Activity type"
          className="rounded-2xl border border-border px-3 py-2"
        />
        <input
          value={formData.address}
          onChange={(event) => setFormData({ ...formData, address: event.target.value })}
          placeholder="Address"
          className="rounded-2xl border border-border px-3 py-2"
        />
        <input
          value={formData.tags}
          onChange={(event) => setFormData({ ...formData, tags: event.target.value })}
          placeholder="Tags (comma separated)"
          className="rounded-2xl border border-border px-3 py-2"
        />
        <select
          value={formData.price_level}
          onChange={(event) => setFormData({ ...formData, price_level: event.target.value })}
          className="rounded-2xl border border-border px-3 py-2"
        >
          <option value="1">Price level 1</option>
          <option value="2">Price level 2</option>
          <option value="3">Price level 3</option>
          <option value="4">Price level 4</option>
        </select>
      </div>
      <button className="w-full rounded-[12px] bg-[#FF5A5F] px-4 py-2 text-white">
        Add venue
      </button>
      {status && (
        <p className="text-sm text-text-secondary">
          {status === "saving" ? "Saving..." : status === "saved" ? "Venue added." : status}
        </p>
      )}
    </form>
  );
}
