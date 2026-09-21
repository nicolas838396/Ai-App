"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PenLine } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface JournalEntry {
  id: string;
  title?: string | null;
  content: string;
  createdAt: string;
}

export default function JournalPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();

  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalSaving, setJournalSaving] = useState(false);
  const [journalHistory, setJournalHistory] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (!session) return;
    apiFetch<JournalEntry[]>("/journal").then(setJournalHistory).catch(() => {});
  }, [session]);

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
