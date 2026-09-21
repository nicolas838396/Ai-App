"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { MoodTrendChart } from "@/components/journal/MoodTrendChart";
import { MoodCalendar } from "@/components/journal/MoodCalendar";
import { ActivityCorrelation } from "@/components/journal/ActivityCorrelation";
import { WeekAndStreakStats } from "@/components/journal/WeekAndStreakStats";
import { AchievementsSection } from "@/components/achievements/AchievementsSection";
import { AchievementUnlockToast } from "@/components/achievements/AchievementUnlockToast";
import { ACHIEVEMENTS, computeStatsSnapshot, type CorrelationRowLite } from "@/lib/achievements";
import { getStoredUnlockedIds, setStoredUnlockedIds } from "@/lib/achievementStorage";

interface ActivityLog {
  activityId: string;
  occurredAt: string;
}

interface MoodEntry {
  id: string;
  score: number;
  note?: string | null;
  createdAt: string;
}

interface JournalEntry {
  id: string;
  title?: string | null;
  content: string;
  createdAt: string;
}

export default function StatisticsPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);
  const [correlationRows, setCorrelationRows] = useState<CorrelationRowLite[]>([]);
  const [dataReady, setDataReady] = useState(false);

  const [newlyUnlocked, setNewlyUnlocked] = useState<typeof ACHIEVEMENTS>([]);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      apiFetch<ActivityLog[]>("/activities/log").then(setActivityLogs).catch(() => {}),
      apiFetch<MoodEntry[]>("/mood").then(setMoodHistory).catch(() => {}),
      apiFetch<JournalEntry[]>("/journal").then(setJournalHistory).catch(() => {}),
      apiFetch<CorrelationRowLite[]>("/activities/correlation").then(setCorrelationRows).catch(() => {}),
    ]).finally(() => setDataReady(true));
  }, [session]);

  const stats = useMemo(
    () => computeStatsSnapshot(moodHistory, journalHistory, activityLogs, correlationRows),
    [moodHistory, journalHistory, activityLogs, correlationRows],
  );

  // Detect achievements that just became unlocked (only once the initial
  // data load is complete, so achievements don't briefly "unlock" and
  // "re-lock" as the fetches above resolve one by one) and queue a
  // celebration toast for each, then remember them so they never re-fire.
  useEffect(() => {
    if (!dataReady) return;
    const stored = getStoredUnlockedIds();
    const currentlyUnlocked = ACHIEVEMENTS.filter((a) => a.unlocked(stats));
    const fresh = currentlyUnlocked.filter((a) => !stored.has(a.id));
    if (fresh.length > 0) {
      setNewlyUnlocked((prev) => [...prev, ...fresh]);
    }
    setStoredUnlockedIds(new Set(currentlyUnlocked.map((a) => a.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady, stats]);

  if (sessionLoading || !session) {
    return <FullscreenLoader />;
  }

  return (
    <>
      <AppNav />
      {newlyUnlocked.length > 0 && (
        <AchievementUnlockToast achievements={newlyUnlocked} onDone={() => setNewlyUnlocked([])} />
      )}
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <LineChart className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h1 className="text-2xl">{t("statistics.title")}</h1>
            <p className="mt-0.5 text-sm text-slate-500">{t("statistics.subtitle")}</p>
          </div>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <WeekAndStreakStats entries={moodHistory} />
          <div className="mt-6 border-t border-slate-100 pt-5">
            <MoodTrendChart entries={moodHistory} />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <MoodCalendar entries={moodHistory} />
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <ActivityCorrelation />
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <AchievementsSection stats={stats} />
        </section>
      </main>
    </>
  );
}
