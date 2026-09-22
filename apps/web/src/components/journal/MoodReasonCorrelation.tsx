"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { reasonAverages, type MoodEntryWithReasons } from "@/lib/moodReasonAnalytics";
import { moodReasonLabelKey, MOOD_REASONS } from "@/lib/moodReasons";

// Same "too noisy from a single day" threshold used by ActivityCorrelation.
const MIN_DAYS_LOGGED = 2;

export function MoodReasonCorrelation({ entries }: { entries: MoodEntryWithReasons[] }) {
  const { t } = useLanguage();

  const visibleRows = useMemo(
    () =>
      reasonAverages(entries)
        .filter((row) => row.daysLogged >= MIN_DAYS_LOGGED)
        .sort((a, b) => a.avgMood - b.avgMood),
    [entries],
  );

  const reasonEmoji = (id: string) => MOOD_REASONS.find((r) => r.id === id)?.emoji ?? "";

  return (
    <div>
      <h3 className="font-bold text-slate-800">{t("analytics.reasonCorrelationTitle")}</h3>
      <p className="mt-0.5 text-xs text-slate-400">{t("analytics.reasonCorrelationSubtitle")}</p>

      {visibleRows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">{t("analytics.reasonCorrelationEmpty")}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {visibleRows.map((row) => {
            const labelKey = moodReasonLabelKey(row.reasonId);
            const widthPct = Math.max(4, Math.min(100, ((row.avgMood - 1) / 9) * 100));
            return (
              <div key={row.reasonId}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {reasonEmoji(row.reasonId)} {labelKey ? t(labelKey) : row.reasonId}
                  </span>
                  <span className="text-xs text-slate-400">
                    {row.avgMood.toFixed(1)} · {t("analytics.correlationDays", { count: row.daysLogged })}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-sand-100">
                  <div className="h-full rounded-full bg-calm-500" style={{ width: `${widthPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {visibleRows.length > 0 && <p className="mt-4 text-xs text-slate-400">{t("analytics.correlationDisclaimer")}</p>}
    </div>
  );
}
