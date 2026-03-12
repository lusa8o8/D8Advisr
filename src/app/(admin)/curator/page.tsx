import QuickAddForm from "@/components/admin/QuickAddForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { searchVenues } from "@/lib/services/venue-service";
import { redirect } from "next/navigation";

export default async function CuratorDashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (!adminEmail || session.user.email !== adminEmail) {
    return (
      <div className="min-h-screen bg-background p-6">
        <p className="text-center text-lg font-semibold text-text-primary">
          Access denied
        </p>
      </div>
    );
  }

  const venues = await searchVenues({ city: "Lusaka", limit: 200 });
  const total = venues.length;
  const active = venues.filter((venue) => venue.is_active).length;
  const avgConfidence =
    total === 0
      ? 0
      : Number(
          (
            venues.reduce((sum, venue) => sum + venue.confidence_score, 0) / total
          ).toFixed(2)
        );
  const needsReview = venues.filter((venue) => venue.confidence_score < 0.7);

  return (
    <section className="min-h-screen bg-[#F7F7F7] p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">
          Venue quality curator
        </h1>
        <p className="text-sm text-text-secondary">
          Managing Lusaka venue pipeline data.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-text-secondary">Total venues</p>
              <p className="text-2xl font-semibold text-text-primary">{total}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-text-secondary">Active venues</p>
              <p className="text-2xl font-semibold text-text-primary">{active}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-text-secondary">Avg confidence</p>
              <p className="text-2xl font-semibold text-text-primary">
                {avgConfidence}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-text-primary">
              Venue queue (sorted by confidence)
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-text-secondary">
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2">Category</th>
                    <th className="px-2 py-2">Price</th>
                    <th className="px-2 py-2">Confidence</th>
                    <th className="px-2 py-2">Source</th>
                    <th className="px-2 py-2">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {venues
                    .slice()
                    .sort((a, b) => a.confidence_score - b.confidence_score)
                    .map((venue) => (
                      <tr
                        key={venue.id}
                        className={`border-t border-border ${
                          venue.confidence_score < 0.7
                            ? "bg-warning/10"
                            : "bg-transparent"
                        }`}
                      >
                        <td className="px-2 py-2">{venue.name}</td>
                        <td className="px-2 py-2">{venue.category}</td>
                        <td className="px-2 py-2">{venue.price_level}</td>
                        <td className="px-2 py-2">
                          {venue.confidence_score.toFixed(2)}
                        </td>
                        <td className="px-2 py-2">{venue.source}</td>
                        <td className="px-2 py-2">
                          {venue.is_active ? "active" : "inactive"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-text-primary">Stats</h2>
            <p className="text-sm text-text-secondary">
              Venues needing review: {needsReview.length}
            </p>
          </div>
          <QuickAddForm />
        </div>
      </div>
    </section>
  );
}
