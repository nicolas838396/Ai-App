"use client";

import { Star, Triangle, Circle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FullscreenLoader({ label }: { label?: string }) {
  const { t } = useLanguage();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-hero-gradient px-6 text-center">
      <div className="relative h-10 w-10 text-brand-500">
        <Star className="shape-cycle-icon absolute inset-0 h-10 w-10" style={{ animationDelay: "0s" }} fill="currentColor" />
        <Triangle className="shape-cycle-icon absolute inset-0 h-10 w-10" style={{ animationDelay: "-1s" }} fill="currentColor" />
        <Circle className="shape-cycle-icon absolute inset-0 h-10 w-10" style={{ animationDelay: "-2s" }} fill="currentColor" />
      </div>
      <p className="max-w-xs text-sm text-slate-500">{label ?? t("loader.default")}</p>
    </main>
  );
}
