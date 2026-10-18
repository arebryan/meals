/**
 * Seed the first admin user (invite-only bootstrap).
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=you@example.com npm run db:seed
 *
 * Creates a User with role=admin if none exists for that email.
 * Optionally creates an Invite so Google login can link googleSub later.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../src/lib/db";
import { invites, users } from "../src/lib/db/schema";

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!email) {
    console.error("Set SEED_ADMIN_EMAIL to the admin's Google account email.");
    process.exit(1);
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing[0]) {
    if (existing[0].role !== "admin") {
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, existing[0].id));
      console.log(`Promoted existing user to admin: ${email}`);
    } else {
      console.log(`Admin already exists: ${email}`);
    }
    process.exit(0);
  }

  const [admin] = await db
    .insert(users)
    .values({
      email,
      name: process.env.SEED_ADMIN_NAME ?? "Admin",
      role: "admin",
    })
    .returning();

  // Open invite so first Google login can attach googleSub if user row
  // was seeded without OAuth yet. signIn callback updates googleSub on match.
  const token = randomBytes(24).toString("hex");
  await db.insert(invites).values({
    email,
    token,
    role: "admin",
    invitedBy: admin.id,
  });

  console.log(`Seeded admin user: ${email} (id=${admin.id})`);
  console.log("Sign in with Google using that email to attach googleSub.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
