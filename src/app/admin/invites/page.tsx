import { AppShell } from "@/components/AppShell";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invites } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function AdminInvitesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/denied?reason=admin_only");
  }

  let rows: {
    id: string;
    email: string;
    role: string;
    acceptedAt: Date | null;
    revokedAt: Date | null;
    createdAt: Date;
  }[] = [];
  let error: string | null = null;
  try {
    rows = await db
      .select({
        id: invites.id,
        email: invites.email,
        role: invites.role,
        acceptedAt: invites.acceptedAt,
        revokedAt: invites.revokedAt,
        createdAt: invites.createdAt,
      })
      .from(invites)
      .orderBy(desc(invites.createdAt))
      .limit(100);
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load invites";
  }

  return (
    <AppShell title="Invites">
      <p className="mb-4 text-stone-600">
        Admin-only. Create/revoke UI is next; seed an admin with{" "}
        <code className="rounded bg-stone-200 px-1 text-sm">npm run db:seed</code>
        .
      </p>
      {error ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Database not ready: {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-stone-500">No invites yet.</p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {rows.map((invite) => (
            <li key={invite.id} className="px-4 py-3 text-sm">
              <div className="font-medium">{invite.email}</div>
              <div className="text-stone-500">
                {invite.role}
                {invite.revokedAt
                  ? " · revoked"
                  : invite.acceptedAt
                    ? " · accepted"
                    : " · open"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
