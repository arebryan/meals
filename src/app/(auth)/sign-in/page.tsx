import { signIn } from "@/lib/auth";
import Link from "next/link";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/meals";

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Meals</h1>
          <p className="mt-2 text-stone-600">
            Invite-only meal planning. Sign in with Google after an admin
            invites your email.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-800"
          >
            Sign in with Google
          </button>
        </form>
        <p className="text-sm text-stone-500">
          No invite? Ask a household admin.{" "}
          <Link href="/" className="underline">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}
