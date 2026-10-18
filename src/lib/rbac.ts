export type UserRole = "admin" | "member";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
};

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role === "admin";
}

export function canAccessApp(user: SessionUser | null | undefined): boolean {
  return user?.role === "admin" || user?.role === "member";
}
