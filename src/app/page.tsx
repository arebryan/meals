import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-stone-100 to-stone-50">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-widest text-stone-500">
          Household
        </p>
        <h1 className="mt-2 text-5xl font-semibold tracking-tight text-stone-900">
          Meals
        </h1>
        <p className="mt-4 text-lg text-stone-600">
          Plan the week, cook from recipes, shop from one list. Invite-only for
          your kitchen.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {session?.user ? (
            <Link
              href="/meals"
              className="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-800"
            >
              Open app
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-800"
            >
              Sign in with Google
            </Link>
          )}
          <Link
            href="/api/health"
            className="rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Health check
          </Link>
        </div>
      </main>
    </div>
  );
}
