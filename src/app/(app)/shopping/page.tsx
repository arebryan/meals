import { AppShell } from "@/components/AppShell";
import { db } from "@/lib/db";
import { shoppingLists } from "@/lib/db/schema";

export default async function ShoppingPage() {
  let rows: { id: string; status: string; generatedAt: Date }[] = [];
  let error: string | null = null;
  try {
    rows = await db
      .select({
        id: shoppingLists.id,
        status: shoppingLists.status,
        generatedAt: shoppingLists.generatedAt,
      })
      .from(shoppingLists)
      .limit(50);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load shopping lists";
  }

  return (
    <AppShell title="Shopping lists">
      <p className="mb-4 text-stone-600">
        Lists generated from a plan (merged ingredients). Check-off UX next.
      </p>
      {error ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Database not ready: {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-stone-500">No shopping lists yet.</p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {rows.map((list) => (
            <li
              key={list.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="font-medium capitalize">{list.status}</span>
              <span className="text-sm text-stone-500">
                {list.generatedAt.toISOString().slice(0, 10)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
