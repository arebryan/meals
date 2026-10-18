import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  if (
    req.nextUrl.pathname.startsWith("/admin") &&
    req.auth &&
    role !== "admin"
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/denied";
    url.searchParams.set("reason", "admin_only");
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
