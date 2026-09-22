"use client";

import { useEffect, useState } from "react";
import { CalendarHeart, Plus } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FullscreenLoader } from "@/components/FullscreenLoader";
import { useSession } from "@/lib/useSession";
import { apiFetch } from "@/lib/apiClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ImportantDatesCalendar } from "@/components/calendar/ImportantDatesCalendar";
import { ImportantDateForm, type ImportantDateFormValues } from "@/components/calendar/ImportantDateForm";
import { UpcomingImportantDates } from "@/components/calendar/UpcomingImportantDates";
import type { ImportantDateEntry } from "@/lib/importantDates";

export default function CalendarPage() {
  const { session, loading: sessionLoading } = useSession({ requireAuth: true });
  const { t } = useLanguage();

  const [entries, setEntries] = useState<ImportantDateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<{ date: string; editing: ImportantDateEntry | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    apiFetch<ImportantDateEntry[]>("/important-dates")
      .then(setEntries)
      .catch(() => setError(t("calendar.loadError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function openNewEntry(isoDate: string) {
    setError(null);
    setFormState({ date: isoDate, editing: null });
  }

  function openEditEntry(entry: ImportantDateEntry) {
    setError(null);
    setFormState({ date: entry.date, editing: entry });
  }

  async function handleSave(values: ImportantDateFormValues) {
    setSaving(true);
    setError(null);
    try {
      if (formState?.editing) {
        const updated = await apiFetch<ImportantDateEntry>(`/important-dates/${formState.editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
        setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        const created = await apiFetch<ImportantDateEntry>("/important-dates", {
          method: "POST",
          body: JSON.stringify(values),
        });
        setEntries((prev) => [...prev, created]);
      }
      setFormState(null);
    } catch {
      setError(t("calendar.saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(entry: ImportantDateEntry) {
    try {
      await apiFetch(`/important-dates/${entry.id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    } catch {
      setError(t("calendar.saveError"));
    }
  }

  if (sessionLoading || !session) {
    return <FullscreenLoader />;
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarHeart className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h1 className="text-2xl">{t("calendar.pageTitle")}</h1>
            <p className="mt-0.5 text-sm text-slate-500">{t("calendar.pageSubtitle")}</p>
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          {loading ? (
            <p className="text-sm text-slate-400">{t("calendar.loading")}</p>
          ) : (
            <ImportantDatesCalendar entries={entries} onSelectDay={openNewEntry} />
          )}
        </section>

        {formState && (
          <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
            <h3 className="mb-3 font-bold text-slate-800">
              {formState.editing ? t("calendar.formTitleEdit") : t("calendar.formTitleAdd")}
            </h3>
            <ImportantDateForm
              initialDate={formState.date}
              editing={formState.editing}
              saving={saving}
              onSave={handleSave}
              onCancel={() => setFormState(null)}
            />
          </section>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-black/5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{t("calendar.upcomingTitle")}</h3>
            {!formState && (
              <button
                type="button"
                onClick={() => openNewEntry(new Date().toISOString().slice(0, 10))}
                className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("calendar.addButton")}
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-sm text-slate-400">{t("calendar.loading")}</p>
          ) : (
            <UpcomingImportantDates entries={entries} onEdit={openEditEntry} onDelete={handleDelete} />
          )}
        </section>
      </main>
    </>
  );
}
