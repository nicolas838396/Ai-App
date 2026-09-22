"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Smile, ListChecks, PenLine } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { EmotionPicker } from "@/components/journal/EmotionPicker";
import { ReasonPicker } from "@/components/journal/ReasonPicker";
import { CategorizedActivityPicker, type Activity, type ActivityLog } from "@/components/journal/CategorizedActivityPicker";
import { MOOD_EMOJI, isToday } from "@/lib/moodEmoji";

interface MoodEntry {
  id: string;
  score: number;
  note?: string | null;
  tags?: string[];
  reasons?: string[];
  createdAt: string;
}

interface JournalEntry {
  id: string;
  title?: string | null;
  content: string;
  createdAt: string;
}

export default function JournalPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [moodScore, setMoodScore] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [moodNote, setMoodNote] = useState("");
  const [moodSaving, setMoodSaving] = useState(false);
  const [moodSavedAt, setMoodSavedAt] = useState<string | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [moodError, setMoodError] = useState<string | null>(null);
  const [moodSlow, setMoodSlow] = useState(false);

  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalSaving, setJournalSaving] = useState(false);
  const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);
  const [journalError, setJournalError] = useState<string | null>(null);
  const [journalSlow, setJournalSlow] = useState(false);

  useEffect(() => {
    if (!session) return;
    apiFetch<Activity[]>("/activities").then(setActivities).catch(() => {});
    apiFetch<ActivityLog[]>("/activities/log").then(setActivityLogs).catch(() => {});
    apiFetch<MoodEntry[]>("/mood").then(setMoodHistory).catch(() => {});
    apiFetch<JournalEntry[]>("/journal").then(setJournalHistory).catch(() => {});
  }, [session]);

  const todaysLogs = activityLogs.filter((log) => isToday(log.occurredAt));

  function toggleEmotion(id: string) {
    setSelectedEmotions((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  }

  function toggleReason(id: string) {
    setSelectedReasons((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

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

  async function logActivityByName(name: string) {
    const activity = activities.find((a) => a.name === name);
    if (!activity) return;
    if (todaysLogs.some((log) => log.activityId === activity.id)) return; // already logged today
    const newLog = await apiFetch<ActivityLog>("/activities/log", {
      method: "POST",
      body: JSON.stringify({ activityId: activity.id }),
    });
    setActivityLogs((prev) => [newLog, ...prev]);
  }

  async function handleMoodSubmit(event: FormEvent) {
    event.preventDefault();
    setMoodSaving(true);
    setMoodError(null);
    const slowTimer = setTimeout(() => setMoodSlow(true), 4000);
    try {
      const entry = await apiFetch<MoodEntry>("/mood", {
        method: "POST",
        body: JSON.stringify({
          score: moodScore,
          note: moodNote || undefined,
          tags: selectedEmotions,
          reasons: selectedReasons,
        }),
      });
      setMoodHistory((prev) => [entry, ...prev]);
      setMoodNote("");
      setSelectedEmotions([]);
      setSelectedReasons([]);
      setMoodSavedAt(new Date().toLocaleTimeString());
    } catch {
      setMoodError(t("journal.moodSaveError"));
    } finally {
      clearTimeout(slowTimer);
      setMoodSlow(false);
      setMoodSaving(false);
    }
  }

  async function handleJournalSubmit(event: FormEvent) {
    event.preventDefault();
    if (!journalContent.trim()) return;
    setJournalSaving(true);
    setJournalError(null);
    const slowTimer = setTimeout(() => setJournalSlow(true), 4000);
    try {
      const entry = await apiFetch<JournalEntry>("/journal", {
        method: "POST",
        body: JSON.stringify({ title: journalTitle || undefined, content: journalContent }),
      });
      setJournalHistory((prev) => [entry, ...prev]);
      setJournalTitle("");
      setJournalContent("");
    } catch {
      setJournalError(t("journal.entrySaveError"));
    } finally {
      clearTimeout(slowTimer);
      setJournalSlow(false);
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

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Smile className="h-[18px] w-[18px]" />
            </span>
            <h2 className="font-bold text-slate-800">{t("journal.emotionsTitle")}</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">{t("journal.emotionsSubtitle")}</p>

          <div className="mt-4">
            <EmotionPicker selected={selectedEmotions} onToggle={toggleEmotion} />
          </div>

          <form onSubmit={handleMoodSubmit} className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5">
            <p className="text-sm font-semibold text-slate-700">{t("journal.moodQuestion")}</p>
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

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500">{t("journal.reasonQuestion")}</p>
              <ReasonPicker selected={selectedReasons} onToggle={toggleReason} />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={moodSaving}
                className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600 disabled:opacity-50"
              >
                {t("journal.saveMood")}
              </button>
              {moodSavedAt && !moodSaving && (
                <span className="text-xs text-slate-400">{t("journal.savedAt", { time: moodSavedAt })}</span>
              )}
            </div>
            {moodSlow && <p className="text-xs text-amber-600">{t("journal.slowHint")}</p>}
            {moodError && <p className="text-xs text-red-500">{moodError}</p>}
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
            {journalSlow && <p className="text-xs text-amber-600">{t("journal.slowHint")}</p>}
            {journalError && <p className="text-xs text-red-500">{journalError}</p>}
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

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ListChecks className="h-[18px] w-[18px]" />
            </span>
            <h2 className="font-bold text-slate-800">{t("journal.habitsToday")}</h2>
          </div>
          <div className="mt-4">
            <CategorizedActivityPicker
              activities={activities}
              todaysLogs={todaysLogs}
              togglingId={togglingId}
              onToggle={toggleActivity}
              onLogByName={logActivityByName}
            />
          </div>
        </section>
      </main>
    </>
  );
}
