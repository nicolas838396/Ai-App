"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppNav } from "@/components/AppNav";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";

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

export default function JournalPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });

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

  if (sessionLoading) return null;

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        <h1 className="text-xl font-semibold text-brand-700">Tagebuch</h1>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-medium text-brand-700">Wie fühlst du dich heute?</h2>
          <form onSubmit={handleMoodSubmit} className="mt-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-8 text-center font-semibold text-brand-700">{moodScore}</span>
            </div>
            <input
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Kurze Notiz (optional)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={moodSaving}
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Stimmung speichern
              </button>
              {moodSavedAt && <span className="text-xs text-slate-400">Gespeichert um {moodSavedAt}</span>}
            </div>
          </form>

          {moodHistory.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {moodHistory.slice(0, 10).map((entry) => (
                <span
                  key={entry.id}
                  title={new Date(entry.createdAt).toLocaleString()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-xs font-medium text-brand-700"
                >
                  {entry.score}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-medium text-brand-700">Gewohnheiten heute</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {activities.map((activity) => {
              const checked = todaysLogs.some((log) => log.activityId === activity.id);
              return (
                <button
                  key={activity.id}
                  type="button"
                  disabled={togglingId === activity.id}
                  onClick={() => toggleActivity(activity)}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition ${
                    checked
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:border-brand-300"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
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

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-medium text-brand-700">Tagebucheintrag</h2>
          <form onSubmit={handleJournalSubmit} className="mt-3 flex flex-col gap-3">
            <input
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              placeholder="Titel (optional)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              placeholder="Was beschäftigt dich heute?"
              rows={5}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={journalSaving || !journalContent.trim()}
              className="self-start rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Eintrag speichern
            </button>
          </form>

          {journalHistory.length > 0 && (
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
              {journalHistory.map((entry) => (
                <div key={entry.id} className="text-sm">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-slate-700">{entry.title || "Ohne Titel"}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">{entry.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
