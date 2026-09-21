"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CorrelationRow {
  activityId: string;
  activityName: string;
  avgMoodOnDay: number;
  daysLogged: number;
}

// Below this many days logged, an average is too noisy to show as a
// meaningful pattern rather than a coincidence from a single day.
const MIN_DAYS_LOGGED = 2;

export function ActivityCorrelation() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<CorrelationRow[] | null>(null);

  useEffect(() => {
    apiFetch<CorrelationRow[]>("/activities/correlation")
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  const visibleRows = (rows ?? [])
    .filter((row) => row.daysLogged >= MIN_DAYS_LOGGED)
    .sort((a, b) => b.avgMoodOnDay - a.avgMoodOnDay);

  return (
    <div>
      <h3 className="font-bold text-slate-800">{t("analytics.correlationTitle")}</h3>
      <p className="mt-0.5 text-xs text-slate-400">{t("analytics.correlationSubtitle")}</p>

      {rows === null ? null : visibleRows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">{t("analytics.correlationEmpty")}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {visibleRows.map((row) => {
            const widthPct = Math.max(4, Math.min(100, ((row.avgMoodOnDay - 1) / 9) * 100));
            return (
              <div key={row.activityId}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-slate-700">{row.activityName}</span>
                  <span className="text-xs text-slate-400">
                    {row.avgMoodOnDay.toFixed(1)} · {t("analytics.correlationDays", { count: row.daysLogged })}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-sand-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${widthPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {visibleRows.length > 0 && (
        <p className="mt-4 text-xs text-slate-400">{t("analytics.correlationDisclaimer")}</p>
      )}
    </div>
  );
}
