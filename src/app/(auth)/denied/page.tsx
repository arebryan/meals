import Link from "next/link";

const reasons: Record<string, string> = {
  no_invite:
    "Your Google account is not on the invite list. Ask an admin to invite your email.",
  missing_profile: "Google did not return an email we could use.",
  email_unverified:
    "Google has not verified that email address. Verify it with Google and try again.",
  admin_only: "That page is for admins only.",
  AccessDenied: "Access denied. You may need an invite.",
};

export default async function DeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; error?: string }>;
}) {
  const params = await searchParams;
  const key = params.reason ?? params.error ?? "";
  const message =
    reasons[key] ??
    "You do not have access. Sign in with an invited Google account.";

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Access denied</h1>
        <p className="text-stone-600">{message}</p>
        <div className="flex justify-center gap-4 text-sm">
          <Link href="/sign-in" className="underline">
            Try another account
          </Link>
          <Link href="/" className="underline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
