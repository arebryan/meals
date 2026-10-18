import { AppShell } from "@/components/AppShell";
import { db } from "@/lib/db";
import { meals } from "@/lib/db/schema";

export default async function MealsPage() {
  let rows: { id: string; name: string; notes: string | null }[] = [];
  let error: string | null = null;
  try {
    rows = await db
      .select({ id: meals.id, name: meals.name, notes: meals.notes })
      .from(meals)
      .limit(50);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load meals";
  }

  return (
    <AppShell title="Meals">
      <p className="mb-4 text-stone-600">
        Named meal labels (optional recipe link). CRUD comes in Phase 2.
      </p>
      {error ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Database not ready: {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-stone-500">No meals yet.</p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {rows.map((m) => (
            <li key={m.id} className="px-4 py-3">
              <div className="font-medium">{m.name}</div>
              {m.notes ? (
                <div className="text-sm text-stone-500">{m.notes}</div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
