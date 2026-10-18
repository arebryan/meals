import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  { href: "/meals", label: "Meals" },
  { href: "/recipes", label: "Recipes" },
  { href: "/plans", label: "Plans" },
  { href: "/shopping", label: "Shopping" },
  { href: "/admin/invites", label: "Invites" },
];

export function AppShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="flex min-h-full flex-col bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Meals
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-stone-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
  );
}
