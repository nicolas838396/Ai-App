"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MessageCircleHeart, NotebookPen, Wind, LogOut, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const LINKS = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageCircleHeart },
  { href: "/journal", label: "Tagebuch", icon: NotebookPen },
  { href: "/relax", label: "Entspannung", icon: Wind },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="hidden font-extrabold text-slate-800 sm:inline">Mira</span>
        </div>

        <div className="flex gap-1 rounded-full bg-sand-100 p-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-brand-500 text-white shadow-soft"
                    : "text-slate-500 hover:bg-white hover:text-slate-700"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Abmelden</span>
        </button>
      </div>
    </nav>
  );
}
