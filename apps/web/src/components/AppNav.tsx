"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const LINKS = [
  { href: "/dashboard", label: "Übersicht" },
  { href: "/chat", label: "Chat" },
  { href: "/journal", label: "Tagebuch" },
  { href: "/relax", label: "Entspannung" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <div className="flex gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-brand-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-700">
          Abmelden
        </button>
      </div>
    </nav>
  );
}
