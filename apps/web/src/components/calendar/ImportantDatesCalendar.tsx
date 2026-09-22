"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { parseDateOnly, type ImportantDateEntry } from "@/lib/importantDates";

const WEEKDAY_KEYS = [
  "analytics.weekdayMon",
  "analytics.weekdayTue",
  "analytics.weekdayWed",
  "analytics.weekdayThu",
  "analytics.weekdayFri",
  "analytics.weekdaySat",
  "analytics.weekdaySun",
] as const;

function occursOn(entry: ImportantDateEntry, year: number, month: number, day: number): boolean {
  const date = parseDateOnly(entry.date);
  if (entry.recurringYearly) {
    return date.getUTCMonth() === month && date.getUTCDate() === day;
  }
  return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day;
}

export function ImportantDatesCalendar({
  entries,
  onSelectDay,
}: {
  entries: ImportantDateEntry[];
  onSelectDay: (isoDate: string) => void;
}) {
  const { t, language } = useLanguage();
  const [viewedMonth, setViewedMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const locale = language === "en" ? "en-US" : "de-DE";
  const monthLabel = viewedMonth.toLocaleDateString(locale, { month: "long", year: "numeric" });

  const year = viewedMonth.getFullYear();
  const month = viewedMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const todayKey = new Date().toISOString().slice(0, 10);

  const entriesByDay = useMemo(() => {
    const map = new Map<number, ImportantDateEntry[]>();
    for (let day = 1; day <= daysInMonth; day++) {
      const matches = entries.filter((e) => occursOn(e, year, month, day));
      if (matches.length > 0) map.set(day, matches);
    }
    return map;
  }, [entries, year, month, daysInMonth]);

  const cells: { key: string | null; day: number | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ key: null, day: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key, day });
  }

  function changeMonth(delta: number) {
    setViewedMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800">{t("calendar.title")}</h3>
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
            aria-label={t("analytics.calendarNextMonth")}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-sand-100 hover:text-slate-600"
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
          const dayEntries = entriesByDay.get(cell.day) ?? [];
          const isToday = cell.key === todayKey;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => cell.key && onSelectDay(cell.key)}
              className={`tap-pop relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-semibold transition ${
                dayEntries.length > 0 ? "bg-brand-100 text-brand-800" : "bg-sand-50 text-slate-500 hover:bg-sand-100"
              } ${isToday ? "ring-2 ring-brand-500 ring-offset-1" : ""}`}
            >
              <span>{cell.day}</span>
              {dayEntries.length > 0 && (
                <span className="text-sm leading-none">{dayEntries[0].emoji}</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">{t("calendar.calendarHint")}</p>
    </div>
  );
}
