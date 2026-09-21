"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Smile, ListChecks, LineChart } from "lucide-react";
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

interface Activity {
  id: string;
  name: string;
  category: string;
}

interface ActivityLog {
  id: string;
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

function isToday(isoDate: string) {
  return isoDate.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

const MOOD_EMOJI = ["😞", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩", "🥳", "✨"];

export default function StatisticsPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [moodScore, setMoodScore] = useState(5);
  const [moodNote, setMoodNote] = useState("");
  const [moodSaving, setMoodSaving] = useState(false);
  const [moodSavedAt, setMoodSavedAt] = useState<string | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);
  const [correlationRows, setCorrelationRows] = useState<CorrelationRowLite[]>([]);
  const [dataReady, setDataReady] = useState(false);

  const [newlyUnlocked, setNewlyUnlocked] = useState<typeof ACHIEVEMENTS>([]);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      apiFetch<Activity[]>("/activities").then(setActivities).catch(() => {}),
      apiFetch<ActivityLog[]>("/activities/log").then(setActivityLogs).catch(() => {}),
      apiFetch<MoodEntry[]>("/mood").then(setMoodHistory).catch(() => {}),
      apiFetch<JournalEntry[]>("/journal").then(setJournalHistory).catch(() => {}),
      apiFetch<CorrelationRowLite[]>("/activities/correlation").then(setCorrelationRows).catch(() => {}),
    ]).finally(() => setDataReady(true));
  }, [session]);

  const todaysLogs = useMemo(() => activityLogs.filter((log) => isToday(log.occurredAt)), [activityLogs]);

  const stats = useMemo(
    () => computeStatsSnapshot(moodHistory, journalHistory, activityLogs, correlationRows),
    [moodHistory, journalHistory, activityLogs, correlationRows],
  );

  // Detect achievements that just became unlocked (only once the initial
  // data load is complete, so achievements don't briefly "unlock" and
  // "re-lock" as the four fetches above resolve one by one) and queue a
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

  async function toggleActivity(activity: Activity) {
    setTogglingId(activity.id);
    const existingLog = todaysLogs.find((log) => log.activityId === activity.id);
    try {
      if (existingLog) {
        await apiFetch(`/activities/log/${existingLog.id}`, { method: "DELETE" });
        setActivityLogs((prev) => prev.filter((log) => log.id !== existingLog.id));
      } else {
        const newLog = await apiFetch<ActivityLog>("/activities/log", {
          method: "POST",
          body: JSON.stringify({ activityId: activity.id }),
        });
        setActivityLogs((prev) => [newLog, ...prev]);
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function handleMoodSubmit(event: FormEvent) {
    event.preventDefault();
    setMoodSaving(true);
    try {
      const entry = await apiFetch<MoodEntry>("/mood", {
        method: "POST",
        body: JSON.stringify({ score: moodScore, note: moodNote || undefined }),
      });
      setMoodHistory((prev) => [entry, ...prev]);
      setMoodNote("");
      setMoodSavedAt(new Date().toLocaleTimeString());
    } finally {
      setMoodSaving(false);
    }
  }

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
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Smile className="h-[18px] w-[18px]" />
            </span>
            <h2 className="font-bold text-slate-800">{t("journal.moodQuestion")}</h2>
          </div>

          <form onSubmit={handleMoodSubmit} className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-4 rounded-xl bg-sand-50 px-4 py-3">
              <span className="text-2xl">{MOOD_EMOJI[moodScore - 1]}</span>
              <input
                type="range"
                min={1}
                max={10}
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-brand-100 accent-brand-500"
              />
              <span className="w-6 text-center font-bold text-brand-700">{moodScore}</span>
            </div>
            <input
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder={t("journal.moodNotePlaceholder")}
              className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={moodSaving}
                className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-50"
              >
                {t("journal.saveMood")}
              </button>
              {moodSavedAt && (
                <span className="text-xs text-slate-400">{t("journal.savedAt", { time: moodSavedAt })}</span>
              )}
            </div>
          </form>

          {moodHistory.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {moodHistory.slice(0, 12).map((entry) => (
                <span
                  key={entry.id}
                  title={new Date(entry.createdAt).toLocaleString()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-sand-50 text-base"
                >
                  {MOOD_EMOJI[entry.score - 1]}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ListChecks className="h-[18px] w-[18px]" />
            </span>
            <h2 className="font-bold text-slate-800">{t("journal.habitsToday")}</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {activities.map((activity) => {
              const checked = todaysLogs.some((log) => log.activityId === activity.id);
              return (
                <button
                  key={activity.id}
                  type="button"
                  disabled={togglingId === activity.id}
                  onClick={() => toggleActivity(activity)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                    checked
                      ? "border-brand-200 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:border-brand-200"
                  }`}
                >
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border text-[10px] ${
                      checked ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300"
                    }`}
                  >
                    {checked ? "✓" : ""}
                  </span>
                  {activity.name}
                </button>
              );
            })}
          </div>
        </section>

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
