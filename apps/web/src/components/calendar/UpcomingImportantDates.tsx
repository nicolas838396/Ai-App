"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  CATEGORY_META,
  daysUntil,
  nextOccurrence,
  sortByNextOccurrence,
  type ImportantDateEntry,
} from "@/lib/importantDates";

export function UpcomingImportantDates({
  entries,
  onEdit,
  onDelete,
}: {
  entries: ImportantDateEntry[];
  onEdit: (entry: ImportantDateEntry) => void;
  onDelete: (entry: ImportantDateEntry) => void;
}) {
  const { t } = useLanguage();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const sorted = sortByNextOccurrence(entries);

  if (sorted.length === 0) {
    return <p className="text-sm text-slate-500">{t("calendar.upcomingEmpty")}</p>;
  }

  return (
    <ul className="space-y-2">
      {sorted.map((entry) => {
        const days = daysUntil(nextOccurrence(entry));
        const when =
          days === 0 ? t("calendar.today") : days === 1 ? t("calendar.tomorrow") : t("calendar.inDays", { days });
        const meta = CATEGORY_META[entry.category];
        return (
          <li
            key={entry.id}
            className="flex items-center gap-3 rounded-xl bg-sand-50 px-3 py-2.5 ring-1 ring-black/5"
          >
            <span className="text-xl">{entry.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{entry.title}</p>
              <p className="text-xs text-slate-500">
                {t(meta.labelKey)} · {when}
              </p>
            </div>
            {confirmingId === entry.id ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onDelete(entry)}
                  className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white"
                >
                  {t("calendar.deleteConfirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingId(null)}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-slate-500"
                >
                  {t("calendar.cancel")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(entry)}
                  aria-label={t("calendar.edit")}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingId(entry.id)}
                  aria-label={t("calendar.delete")}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
