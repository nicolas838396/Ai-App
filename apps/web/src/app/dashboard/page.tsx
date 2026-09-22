"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CircleCheck, CircleAlert, Flame, ArrowRight, Sparkles } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TranslationKey } from "@/lib/i18n/translations";
import { currentMoodStreak, type MoodEntryLite } from "@/lib/moodAnalytics";
import { moodEmojiForScore, isToday } from "@/lib/moodEmoji";
import { pickDailyStatementKey } from "@/lib/dailyStatement";

// A couple of varied options per time-of-day slot so the home screen
// greeting doesn't feel like the exact same static label every single day —
// small, low-risk bit of personality on the screen people see most often.
const GREETING_POOL: { untilHour: number; keys: TranslationKey[] }[] = [
  { untilHour: 11, keys: ["dashboard.greetingMorning1", "dashboard.greetingMorning2"] },
  { untilHour: 18, keys: ["dashboard.greeting", "dashboard.greetingAfternoon2"] },
  { untilHour: 23, keys: ["dashboard.greetingEvening1", "dashboard.greetingEvening2"] },
  { untilHour: 24, keys: ["dashboard.greetingNight1"] },
];

function pickGreetingKey(): TranslationKey {
  const hour = new Date().getHours();
  const slot = GREETING_POOL.find((s) => hour < s.untilHour) ?? GREETING_POOL[GREETING_POOL.length - 1];
  return slot.keys[Math.floor(Math.random() * slot.keys.length)];
}

interface HealthStatus {
  status: string;
  db: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Starts as the same static key the server rendered, then swaps to a
  // time-of-day-appropriate (and slightly randomized) greeting once we're
  // safely on the client — avoids a hydration mismatch from using
  // Date.getHours() during the static prerender.
  const [greetingKey, setGreetingKey] = useState<TranslationKey>("dashboard.greeting");
  const [statementKey, setStatementKey] = useState<TranslationKey | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntryLite[] | null>(null);

  useEffect(() => {
    setGreetingKey(pickGreetingKey());
    setStatementKey(pickDailyStatementKey());
  }, []);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setError(t("dashboard.backendUnreachable")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session) return;
    apiFetch<MoodEntryLite[]>("/mood")
      .then(setMoodEntries)
      .catch(() => {});
  }, [session]);

  const moodStreak = useMemo(() => (moodEntries ? currentMoodStreak(moodEntries) : null), [moodEntries]);
  // The API returns newest-first, so the first match for today is also the
  // most recent mood logged today (if someone logged more than once).
  const todaysMood = useMemo(() => moodEntries?.find((e) => isToday(e.createdAt)) ?? null, [moodEntries]);

  if (sessionLoading || !session) {
    return <FullscreenLoader />;
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl">{t(greetingKey)}</h1>
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

        {statementKey && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-gradient-to-r from-calm-500 to-brand-500 p-5 text-white shadow-glow">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-base font-semibold leading-snug">{t(statementKey)}</p>
          </div>
        )}

        <section className="mt-6 rounded-3xl bg-gradient-to-br from-brand-50 via-white to-calm-50 p-8 text-center shadow-soft ring-1 ring-black/5">
          <div key={todaysMood ? todaysMood.score : "none"} className="tap-pop mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-soft">
            {todaysMood ? moodEmojiForScore(todaysMood.score) : "❓"}
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            {todaysMood ? t("dashboard.todayMoodLogged") : t("dashboard.todayMoodPrompt")}
          </p>
          {!todaysMood && (
            <Link
              href="/journal"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
            >
              {t("dashboard.logMoodCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {moodStreak !== null && moodStreak > 0 && (
            <div className="mx-auto mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-700">
              <Flame className="h-4 w-4 animate-pulse" />
              {t("dashboard.streakChip", { days: moodStreak })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
