"use client";

import { Flame, TrendingDown, TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { currentMoodStreak, weekOverWeekChange, type MoodEntryLite } from "@/lib/moodAnalytics";

export function WeekAndStreakStats({ entries }: { entries: MoodEntryLite[] }) {
  const { t } = useLanguage();
  const { thisWeekAvg, percentChange } = weekOverWeekChange(entries);
  const streak = currentMoodStreak(entries);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-sand-50 p-4">
        <p className="text-xs font-medium text-slate-500">{t("analytics.weekCompareLabel")}</p>
        {thisWeekAvg === null ? (
          <p className="mt-1 text-sm text-slate-400">{t("analytics.weekCompareNoData")}</p>
        ) : (
          <>
            <p className="mt-1 text-2xl font-bold text-slate-800">{thisWeekAvg.toFixed(1)}</p>
            {percentChange !== null && (
              <p
                className={`mt-0.5 flex items-center gap-1 text-xs font-semibold ${
                  percentChange >= 0 ? "text-brand-600" : "text-amber-600"
                }`}
              >
                {percentChange >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {percentChange >= 0 ? "+" : ""}
                {percentChange.toFixed(0)}% {t("analytics.weekCompareVsLast")}
              </p>
            )}
          </>
        )}
      </div>

      <div className="rounded-xl bg-sand-50 p-4">
        <p className="text-xs font-medium text-slate-500">{t("analytics.streakLabel")}</p>
        <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-slate-800">
          {streak}
          {streak > 0 && <Flame className="h-5 w-5 text-amber-500" />}
        </p>
        {streak === 0 && <p className="mt-0.5 text-xs text-slate-400">{t("analytics.streakZero")}</p>}
      </div>
    </div>
  );
}
