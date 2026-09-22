"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircleHeart, NotebookPen, LineChart, CalendarHeart, Wind, CircleCheck, CircleAlert } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { useSession } from "@/lib/useSession";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";

interface HealthStatus {
  status: string;
  db: string;
  timestamp: string;
}

const FEATURE_CARDS: {
  icon: typeof MessageCircleHeart;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  href: string;
  color: string;
}[] = [
  {
    icon: MessageCircleHeart,
    titleKey: "dashboard.card1.title",
    descKey: "dashboard.card1.desc",
    href: "/chat",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: NotebookPen,
    titleKey: "dashboard.card2.title",
    descKey: "dashboard.card2.desc",
    href: "/journal",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: LineChart,
    titleKey: "dashboard.card4.title",
    descKey: "dashboard.card4.desc",
    href: "/statistics",
    color: "bg-calm-50 text-calm-600",
  },
  {
    icon: Wind,
    titleKey: "dashboard.card3.title",
    descKey: "dashboard.card3.desc",
    href: "/relax",
    color: "bg-sky-50 text-sky-600",
  },
  {
    icon: CalendarHeart,
    titleKey: "dashboard.card5.title",
    descKey: "dashboard.card5.desc",
    href: "/calendar",
    color: "bg-rose-50 text-rose-600",
  },
];

export default function DashboardPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError(t("dashboard.backendUnreachable")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (sessionLoading || !session) {
    return <FullscreenLoader />;
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl">{t("dashboard.greeting")}</h1>
        <p className="mt-1 text-slate-500">{t("dashboard.subtitle")}</p>

        <div
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            error
              ? "bg-red-50 text-red-600"
              : health
                ? "bg-brand-50 text-brand-700"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          {error ? (
            <CircleAlert className="h-3.5 w-3.5" />
          ) : (
            <CircleCheck className="h-3.5 w-3.5" />
          )}
          {error ?? (health ? t("dashboard.allConnected", { time: new Date(health.timestamp).toLocaleTimeString() }) : t("dashboard.checkingConnection"))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <Link
              key={card.titleKey}
              href={card.href}
              className="group rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-bold text-slate-800">{t(card.titleKey)}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{t(card.descKey)}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
