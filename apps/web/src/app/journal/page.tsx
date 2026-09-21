"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Smile, ListChecks, PenLine, LineChart } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { MoodTrendChart } from "@/components/journal/MoodTrendChart";
import { MoodCalendar } from "@/components/journal/MoodCalendar";
import { ActivityCorrelation } from "@/components/journal/ActivityCorrelation";
import { WeekAndStreakStats } from "@/components/journal/WeekAndStreakStats";

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

export default function JournalPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [todaysLogs, setTodaysLogs] = useState<ActivityLog[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [moodScore, setMoodScore] = useState(5);
  const [moodNote, setMoodNote] = useState("");
  const [moodSaving, setMoodSaving] = useState(false);
  const [moodSavedAt, setMoodSavedAt] = useState<string | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);

  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalSaving, setJournalSaving] = useState(false);
  const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (!session) return;
    apiFetch<Activity[]>("/activities").then(setActivities).catch(() => {});
    apiFetch<ActivityLog[]>("/activities/log")
      .then((logs) => setTodaysLogs(logs.filter((log) => isToday(log.occurredAt))))
      .catch(() => {});
    apiFetch<MoodEntry[]>("/mood").then(setMoodHistory).catch(() => {});
    apiFetch<JournalEntry[]>("/journal").then(setJournalHistory).catch(() => {});
  }, [session]);

  async function toggleActivity(activity: Activity) {
    setTogglingId(activity.id);
    const existingLog = todaysLogs.find((log) => log.activityId === activity.id);
    try {
      if (existingLog) {
        await apiFetch(`/activities/log/${existingLog.id}`, { method: "DELETE" });
        setTodaysLogs((prev) => prev.filter((log) => log.id !== existingLog.id));
      } else {
        const newLog = await apiFetch<ActivityLog>("/activities/log", {
          method: "POST",
          body: JSON.stringify({ activityId: activity.id }),
        });
        setTodaysLogs((prev) => [...prev, newLog]);
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

  async function handleJournalSubmit(event: FormEvent) {
    event.preventDefault();
    if (!journalContent.trim()) return;
    setJournalSaving(true);
    try {
      const entry = await apiFetch<JournalEntry>("/journal", {
        method: "POST",
        body: JSON.stringify({ title: journalTitle || undefined, content: journalContent }),
      });
      setJournalHistory((prev) => [entry, ...prev]);
      setJournalTitle("");
      setJournalContent("");
    } finally {
      setJournalSaving(false);
    }
  }

  if (sessionLoading || !session) {
    return <FullscreenLoader />;
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <div>
          <h1 className="text-2xl">{t("journal.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("journal.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 pt-1 text-slate-500">
          <LineChart className="h-4 w-4" />
          <h2 className="text-sm font-bold uppercase tracking-wide">{t("analytics.sectionLabel")}</h2>
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
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-calm-50 text-calm-600">
              <PenLine className="h-[18px] w-[18px]" />
            </span>
            <h2 className="font-bold text-slate-800">{t("journal.entryTitle")}</h2>
          </div>
          <form onSubmit={handleJournalSubmit} className="mt-4 flex flex-col gap-3">
            <input
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              placeholder={t("journal.titlePlaceholder")}
              className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
            />
            <textarea
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              placeholder={t("journal.contentPlaceholder")}
              rows={5}
              className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={journalSaving || !journalContent.trim()}
              className="self-start rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-50"
            >
              {t("journal.saveEntry")}
            </button>
          </form>

          {journalHistory.length > 0 && (
            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
              {journalHistory.map((entry) => (
                <div key={entry.id} className="rounded-xl bg-sand-50 p-4 text-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-slate-700">{entry.title || t("journal.noTitle")}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-slate-600">{entry.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
