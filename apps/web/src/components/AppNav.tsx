"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MessageCircleHeart, NotebookPen, Wind, LogOut, Sparkles, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

const LINKS: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: "/dashboard", labelKey: "nav.overview", icon: LayoutDashboard },
  { href: "/chat", labelKey: "nav.chat", icon: MessageCircleHeart },
  { href: "/journal", labelKey: "nav.journal", icon: NotebookPen },
  { href: "/relax", labelKey: "nav.relax", icon: Wind },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

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
                <span className="hidden sm:inline">{t(link.labelKey)}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              pathname === "/settings"
                ? "bg-brand-500 text-white shadow-soft"
                : "text-slate-400 hover:bg-sand-100 hover:text-slate-600"
            }`}
            aria-label={t("nav.settings")}
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.logout")}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
