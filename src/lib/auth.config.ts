import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/lib/rbac";

/**
 * Edge-safe Auth.js config (no DB imports).
 * Full providers + invite gate live in auth.ts (Node runtime).
 */
export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
    error: "/denied",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const publicPaths = new Set([
        "/",
        "/sign-in",
        "/denied",
        "/api/health",
        "/manifest.webmanifest",
      ]);
      if (
        publicPaths.has(pathname) ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/icons") ||
        pathname === "/sw.js" ||
        pathname.startsWith("/workbox-")
      ) {
        return true;
      }

      const user = auth?.user as
        | { id?: string; role?: UserRole }
        | undefined;
      // Admin-only paths redirect to /denied in middleware.ts after auth.
      return Boolean(user?.id && user.role);
    },
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = String(token.id);
        session.user.role = token.role as UserRole;
        if (token.email) session.user.email = String(token.email);
        if (token.name) session.user.name = String(token.name);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
