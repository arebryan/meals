import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { invites, users } from "@/lib/db/schema";
import { authConfig } from "@/lib/auth.config";

async function findOpenInvite(email: string) {
  const now = new Date();
  const rows = await db
    .select()
    .from(invites)
    .where(
      and(
        eq(invites.email, email.toLowerCase()),
        isNull(invites.acceptedAt),
        isNull(invites.revokedAt),
        or(isNull(invites.expiresAt), gt(invites.expiresAt, now)),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      const email = profile?.email?.toLowerCase();
      const googleSub = account?.providerAccountId;
      if (!email || !googleSub) {
        return "/denied?reason=missing_profile";
      }
      // Reject unverified Google emails so invites cannot be claimed via
      // an unverified address assertion.
      if (profile?.email_verified !== true) {
        return "/denied?reason=email_unverified";
      }

      const existing = await db
        .select()
        .from(users)
        .where(or(eq(users.googleSub, googleSub), eq(users.email, email)))
        .limit(1);

      if (existing[0]) {
        if (!existing[0].googleSub) {
          await db
            .update(users)
            .set({
              googleSub,
              name: profile?.name ?? existing[0].name,
              image:
                typeof profile?.picture === "string"
                  ? profile.picture
                  : existing[0].image,
            })
            .where(eq(users.id, existing[0].id));
        }
        return true;
      }

      const invite = await findOpenInvite(email);
      if (!invite) {
        return "/denied?reason=no_invite";
      }

      await db.transaction(async (tx) => {
        await tx.insert(users).values({
          email,
          googleSub,
          name: profile?.name ?? null,
          image:
            typeof profile?.picture === "string" ? profile.picture : null,
          role: invite.role,
        });
        await tx
          .update(invites)
          .set({ acceptedAt: new Date() })
          .where(eq(invites.id, invite.id));
      });

      return true;
    },
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        const email = profile.email.toLowerCase();
        const googleSub = account.providerAccountId;
        const row = await db
          .select()
          .from(users)
          .where(or(eq(users.googleSub, googleSub), eq(users.email, email)))
          .limit(1);
        if (row[0]) {
          token.id = row[0].id;
          token.role = row[0].role;
          token.email = row[0].email;
          token.name = row[0].name;
        }
        return token;
      }

      // Re-load role from DB so demotions/removals take effect without
      // waiting for a full re-login (JWT otherwise caches role).
      if (token.id) {
        const row = await db
          .select()
          .from(users)
          .where(eq(users.id, String(token.id)))
          .limit(1);
        if (!row[0]) {
          return {};
        }
        token.role = row[0].role;
        token.email = row[0].email;
        token.name = row[0].name;
      } else if (token.email) {
        const row = await db
          .select()
          .from(users)
          .where(eq(users.email, String(token.email).toLowerCase()))
          .limit(1);
        if (row[0]) {
          token.id = row[0].id;
          token.role = row[0].role;
        }
      }
      return token;
    },
  },
});
