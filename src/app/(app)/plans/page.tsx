import { AppShell } from "@/components/AppShell";
import { db } from "@/lib/db";
import { mealPlans } from "@/lib/db/schema";

export default async function PlansPage() {
  let rows: { id: string; weekStartDate: string; title: string | null }[] = [];
  let error: string | null = null;
  try {
    rows = await db
      .select({
        id: mealPlans.id,
        weekStartDate: mealPlans.weekStartDate,
        title: mealPlans.title,
      })
      .from(mealPlans)
      .limit(50);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load plans";
  }

  return (
    <AppShell title="Meal plans">
      <p className="mb-4 text-stone-600">
        Weekly plans and day × slot entries. Grid UI is Phase 2.
      </p>
      {error ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Database not ready: {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-stone-500">No plans yet.</p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {rows.map((p) => (
            <li key={p.id} className="px-4 py-3">
              <div className="font-medium">
                {p.title ?? `Week of ${p.weekStartDate}`}
              </div>
              <div className="text-sm text-stone-500">
                Starts {p.weekStartDate}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
