import { AppShell } from "@/components/AppShell";
import { db } from "@/lib/db";
import { recipes } from "@/lib/db/schema";

export default async function RecipesPage() {
  let rows: { id: string; title: string; servings: number }[] = [];
  let error: string | null = null;
  try {
    rows = await db
      .select({
        id: recipes.id,
        title: recipes.title,
        servings: recipes.servings,
      })
      .from(recipes)
      .limit(50);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load recipes";
  }

  return (
    <AppShell title="Recipes">
      <p className="mb-4 text-stone-600">
        Recipes and ingredient lines. Wired to the data model; full editor next.
      </p>
      {error ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Database not ready: {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-stone-500">No recipes yet.</p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium">{r.title}</span>
              <span className="text-sm text-stone-500">{r.servings} servings</span>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
