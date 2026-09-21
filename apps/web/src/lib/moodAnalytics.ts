// Pure calculations over mood history, shared by the trend chart, the
// calendar heatmap, and the week/streak stat tiles on the journal page.
// Kept dependency-free and unit-testable in isolation from any component.

export interface MoodEntryLite {
  score: number;
  createdAt: string;
}

export interface DailyAverage {
  date: string; // YYYY-MM-DD
  avg: number | null;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function startOfLocalDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** One entry per day for the last `days` days (including today), oldest first. */
export function dailyMoodAverages(entries: MoodEntryLite[], days: number): DailyAverage[] {
  const byDay = new Map<string, number[]>();
  for (const entry of entries) {
    const key = dayKey(entry.createdAt);
    const scores = byDay.get(key) ?? [];
    scores.push(entry.score);
    byDay.set(key, scores);
  }

  const today = startOfLocalDay(new Date());
  const result: DailyAverage[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const scores = byDay.get(key);
    result.push({ date: key, avg: scores ? scores.reduce((a, b) => a + b, 0) / scores.length : null });
  }
  return result;
}

export interface WeekComparison {
  thisWeekAvg: number | null;
  lastWeekAvg: number | null;
  percentChange: number | null;
}

/** Rolling windows of `windowDays` (not calendar weeks/months) so "this period" always means "the last N days". */
function rollingPeriodChange(entries: MoodEntryLite[], windowDays: number): WeekComparison {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const thisPeriod: number[] = [];
  const lastPeriod: number[] = [];
  for (const entry of entries) {
    const age = now - new Date(entry.createdAt).getTime();
    if (age < 0) continue;
    if (age < windowDays * DAY_MS) thisPeriod.push(entry.score);
    else if (age < 2 * windowDays * DAY_MS) lastPeriod.push(entry.score);
  }

  const avg = (list: number[]) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null);
  const thisWeekAvg = avg(thisPeriod);
  const lastWeekAvg = avg(lastPeriod);
  const percentChange =
    thisWeekAvg !== null && lastWeekAvg !== null && lastWeekAvg !== 0
      ? ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100
      : null;

  return { thisWeekAvg, lastWeekAvg, percentChange };
}

export function weekOverWeekChange(entries: MoodEntryLite[]): WeekComparison {
  return rollingPeriodChange(entries, 7);
}

/** Same idea as weekOverWeekChange, but comparing the last 30 days to the 30 before that. */
export function monthOverMonthChange(entries: MoodEntryLite[]): WeekComparison {
  return rollingPeriodChange(entries, 30);
}

/**
 * Consecutive days with at least one mood entry, ending today or yesterday.
 * Ending "yesterday" still counts as an active streak (today isn't over yet),
 * same convention as habit-tracking apps like Duolingo.
 */
export function currentMoodStreak(entries: MoodEntryLite[]): number {
  const days = new Set(entries.map((entry) => dayKey(entry.createdAt)));
  const cursor = startOfLocalDay(new Date());

  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
