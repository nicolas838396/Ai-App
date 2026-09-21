"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { MoodEntryLite } from "@/lib/moodAnalytics";

const WEEKDAY_KEYS = [
  "analytics.weekdayMon",
  "analytics.weekdayTue",
  "analytics.weekdayWed",
  "analytics.weekdayThu",
  "analytics.weekdayFri",
  "analytics.weekdaySat",
  "analytics.weekdaySun",
] as const;

// Sequential single-hue ramp (brand green): lighter = lower mood, darker =
// higher mood. Deliberately not diverging (no red for "bad" days) to keep
// the tone gentle rather than judgmental.
function bucketClasses(avg: number): { bg: string; text: string } {
  if (avg < 3) return { bg: "bg-brand-100", text: "text-brand-800" };
  if (avg < 5) return { bg: "bg-brand-200", text: "text-brand-800" };
  if (avg < 7) return { bg: "bg-brand-400", text: "text-white" };
  if (avg < 9) return { bg: "bg-brand-600", text: "text-white" };
  return { bg: "bg-brand-800", text: "text-white" };
}

export function MoodCalendar({ entries }: { entries: MoodEntryLite[] }) {
  const { t, language } = useLanguage();
  const [viewedMonth, setViewedMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const avgByDay = useMemo(() => {
    const byDay = new Map<string, number[]>();
    for (const entry of entries) {
      const key = entry.createdAt.slice(0, 10);
      const list = byDay.get(key) ?? [];
      list.push(entry.score);
      byDay.set(key, list);
    }
    const result = new Map<string, number>();
    for (const [key, scores] of byDay) {
      result.set(key, scores.reduce((a, b) => a + b, 0) / scores.length);
    }
    return result;
  }, [entries]);

  const locale = language === "en" ? "en-US" : "de-DE";
  const monthLabel = viewedMonth.toLocaleDateString(locale, { month: "long", year: "numeric" });

  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // getDay(): 0=Sunday..6=Saturday -> convert to Monday-first index 0..6
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  const todayKey = new Date().toISOString().slice(0, 10);
  const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();

  const cells: { key: string | null; day: number | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ key: null, day: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key, day });
  }

  function changeMonth(delta: number) {
    setSelectedDay(null);
    setViewedMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">{t("analytics.calendarTitle")}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label={t("analytics.calendarPrevMonth")}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-sand-100 hover:text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="w-28 text-center text-sm font-semibold capitalize text-slate-600">{monthLabel}</span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            disabled={isCurrentMonth}
            aria-label={t("analytics.calendarNextMonth")}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-sand-100 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {WEEKDAY_KEYS.map((key) => (
          <div key={key} className="text-center text-[11px] font-medium text-slate-400">
            {t(key)}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (cell.day === null) return <div key={`empty-${i}`} />;
          const avg = cell.key ? avgByDay.get(cell.key) : undefined;
          const classes = avg !== undefined ? bucketClasses(avg) : { bg: "bg-sand-50", text: "text-slate-300" };
          const isToday = cell.key === todayKey;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelectedDay(cell.key)}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-semibold transition ${classes.bg} ${classes.text} ${
                isToday ? "ring-2 ring-brand-500 ring-offset-1" : ""
              } ${selectedDay === cell.key ? "scale-90" : ""}`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <p className="mt-3 min-h-[1.25rem] text-xs text-slate-500">
        {selectedDay
          ? avgByDay.has(selectedDay)
            ? t("analytics.calendarSelected", {
                date: new Date(selectedDay).toLocaleDateString(locale, { day: "numeric", month: "long" }),
                score: avgByDay.get(selectedDay)!.toFixed(1),
              })
            : t("analytics.calendarNoEntry")
          : t("analytics.calendarHint")}
      </p>
    </div>
  );
}
