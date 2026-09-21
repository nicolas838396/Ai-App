// A catalog of 100 achievements, computed entirely client-side from data
// the app already fetches (mood entries, journal entries, activity logs,
// activity-correlation rows) — no new backend endpoints needed. Titles and
// descriptions are inlined per-language here rather than in translations.ts,
// since 100 entries × 2 languages would otherwise double that file's size
// for copy that only ever appears alongside this data.
import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Sun,
  Sparkles,
  Smile,
  TrendingUp,
  Feather,
  BookOpen,
  NotebookPen,
  Footprints,
  Compass,
  Wind,
  CalendarCheck,
  Search,
  Sunrise,
  Moon,
  CalendarHeart,
  PenLine,
  Heart,
  Trophy,
} from "lucide-react";
import type { Language } from "./preferences";
import type { MoodEntryLite } from "./moodAnalytics";

export interface JournalEntryLite {
  content: string;
  createdAt: string;
}

export interface ActivityLogLite {
  activityId: string;
  occurredAt: string;
}

export interface CorrelationRowLite {
  avgMoodOnDay: number;
  daysLogged: number;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function distinctDayKeys(isoDates: string[]): Set<string> {
  return new Set(isoDates.map(dayKey));
}

/** Longest run of consecutive calendar days present in the given set. */
function longestStreakFromDays(days: Set<string>): number {
  if (days.size === 0) return 0;
  const sorted = Array.from(days)
    .map((d) => new Date(d + "T00:00:00Z").getTime())
    .sort((a, b) => a - b);
  const DAY_MS = 24 * 60 * 60 * 1000;
  let best = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] === DAY_MS) {
      current++;
      best = Math.max(best, current);
    } else if (sorted[i] !== sorted[i - 1]) {
      current = 1;
    }
  }
  return best;
}

/** Longest run of consecutive calendar days whose average mood score is >= 8. */
function longestGreatMoodStreak(entries: MoodEntryLite[]): number {
  const byDay = new Map<string, number[]>();
  for (const e of entries) {
    const k = dayKey(e.createdAt);
    (byDay.get(k) ?? byDay.set(k, []).get(k)!).push(e.score);
  }
  const greatDays = new Set<string>();
  for (const [k, scores] of byDay) {
    if (scores.reduce((a, b) => a + b, 0) / scores.length >= 8) greatDays.add(k);
  }
  return longestStreakFromDays(greatDays);
}

function totalGreatMoodDays(entries: MoodEntryLite[]): number {
  const byDay = new Map<string, number[]>();
  for (const e of entries) {
    const k = dayKey(e.createdAt);
    (byDay.get(k) ?? byDay.set(k, []).get(k)!).push(e.score);
  }
  let count = 0;
  for (const scores of byDay.values()) {
    if (scores.reduce((a, b) => a + b, 0) / scores.length >= 8) count++;
  }
  return count;
}

/** Best rolling-7-day-vs-previous-7-day percentage improvement ever reached. */
function bestWeeklyImprovementPct(entries: MoodEntryLite[]): number {
  if (entries.length === 0) return 0;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const times = entries.map((e) => new Date(e.createdAt).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  let best = 0;
  for (let t = minTime; t <= maxTime; t += DAY_MS) {
    const thisWeek = entries.filter((e) => {
      const age = t - new Date(e.createdAt).getTime();
      return age >= 0 && age < 7 * DAY_MS;
    });
    const lastWeek = entries.filter((e) => {
      const age = t - new Date(e.createdAt).getTime();
      return age >= 7 * DAY_MS && age < 14 * DAY_MS;
    });
    if (!thisWeek.length || !lastWeek.length) continue;
    const avg = (list: MoodEntryLite[]) => list.reduce((a, b) => a + b.score, 0) / list.length;
    const thisAvg = avg(thisWeek);
    const lastAvg = avg(lastWeek);
    if (lastAvg === 0) continue;
    const pct = ((thisAvg - lastAvg) / lastAvg) * 100;
    if (pct > best) best = pct;
  }
  return best;
}

function longestJournalEntryWords(entries: JournalEntryLite[]): number {
  let best = 0;
  for (const e of entries) {
    const words = e.content.trim().split(/\s+/).filter(Boolean).length;
    best = Math.max(best, words);
  }
  return best;
}

function countMoodEntriesWithNote(entries: (MoodEntryLite & { note?: string | null })[]): number {
  return entries.filter((e) => (e.note ?? "").trim().length > 0).length;
}

/** Number of times the user returned to log a mood after a gap of >= 7 days. */
function countComebacks(moodDays: Set<string>): number {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const sorted = Array.from(moodDays)
    .map((d) => new Date(d + "T00:00:00Z").getTime())
    .sort((a, b) => a - b);
  let comebacks = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] >= 7 * DAY_MS) comebacks++;
  }
  return comebacks;
}

/** Distinct weekends (Sat+Sun pair) where both days have a mood entry. */
function countFullWeekendCheckins(moodDays: Set<string>): number {
  let count = 0;
  for (const key of moodDays) {
    const d = new Date(key + "T00:00:00Z");
    if (d.getUTCDay() !== 6) continue; // only count from the Saturday
    const sunday = new Date(d);
    sunday.setUTCDate(sunday.getUTCDate() + 1);
    const sundayKey = sunday.toISOString().slice(0, 10);
    if (moodDays.has(sundayKey)) count++;
  }
  return count;
}

function countDaysBeforeHour(entries: MoodEntryLite[], hour: number, before: boolean): number {
  const days = new Set<string>();
  for (const e of entries) {
    const d = new Date(e.createdAt);
    if (before ? d.getHours() < hour : d.getHours() >= hour) days.add(dayKey(e.createdAt));
  }
  return days.size;
}

export interface StatsSnapshot {
  longestMoodStreak: number;
  totalMoodEntries: number;
  longestGreatMoodStreakValue: number;
  totalGreatMoodDaysValue: number;
  bestWeeklyImprovementPctValue: number;
  totalJournalEntries: number;
  longestJournalEntryWordsValue: number;
  longestJournalStreak: number;
  totalActivityLogs: number;
  distinctActivitiesTried: number;
  longestActivityStreak: number;
  distinctMoodDays: number;
  correlationRowCount: number;
  hasCorrelationInsight: boolean;
  hasStrongTopActivity: boolean;
  earlyBirdDays: number;
  nightOwlDays: number;
  weekendCheckins: number;
  moodEntriesWithNote: number;
  comebackCount: number;
  combinedTotalEntries: number;
  hasAnyEntry: boolean;
  hasAllThreeInOneDay: boolean;
}

const MIN_DAYS_LOGGED_FOR_CORRELATION = 2;

export function computeStatsSnapshot(
  moodEntries: (MoodEntryLite & { note?: string | null })[],
  journalEntries: JournalEntryLite[],
  activityLogs: ActivityLogLite[],
  correlationRows: CorrelationRowLite[],
): StatsSnapshot {
  const moodDays = distinctDayKeys(moodEntries.map((e) => e.createdAt));
  const journalDays = distinctDayKeys(journalEntries.map((e) => e.createdAt));
  const activityDays = distinctDayKeys(activityLogs.map((e) => e.occurredAt));

  const visibleCorrelationRows = correlationRows.filter((r) => r.daysLogged >= MIN_DAYS_LOGGED_FOR_CORRELATION);

  const allThreeDayIntersection = Array.from(moodDays).some((d) => journalDays.has(d) && activityDays.has(d));

  return {
    longestMoodStreak: longestStreakFromDays(moodDays),
    totalMoodEntries: moodEntries.length,
    longestGreatMoodStreakValue: longestGreatMoodStreak(moodEntries),
    totalGreatMoodDaysValue: totalGreatMoodDays(moodEntries),
    bestWeeklyImprovementPctValue: bestWeeklyImprovementPct(moodEntries),
    totalJournalEntries: journalEntries.length,
    longestJournalEntryWordsValue: longestJournalEntryWords(journalEntries),
    longestJournalStreak: longestStreakFromDays(journalDays),
    totalActivityLogs: activityLogs.length,
    distinctActivitiesTried: new Set(activityLogs.map((l) => l.activityId)).size,
    longestActivityStreak: longestStreakFromDays(activityDays),
    distinctMoodDays: moodDays.size,
    correlationRowCount: visibleCorrelationRows.length,
    hasCorrelationInsight: visibleCorrelationRows.length >= 1,
    hasStrongTopActivity: visibleCorrelationRows.some((r) => r.avgMoodOnDay >= 8),
    earlyBirdDays: countDaysBeforeHour(moodEntries, 8, true),
    nightOwlDays: countDaysBeforeHour(moodEntries, 22, false),
    weekendCheckins: countFullWeekendCheckins(moodDays),
    moodEntriesWithNote: countMoodEntriesWithNote(moodEntries),
    comebackCount: countComebacks(moodDays),
    combinedTotalEntries: moodEntries.length + journalEntries.length + activityLogs.length,
    hasAnyEntry: moodEntries.length + journalEntries.length + activityLogs.length > 0,
    hasAllThreeInOneDay: allThreeDayIntersection,
  };
}

export type AchievementCategory =
  | "streak"
  | "moodTotal"
  | "greatMoodStreak"
  | "greatMoodTotal"
  | "weeklyImprovement"
  | "journalTotal"
  | "journalDepth"
  | "journalStreak"
  | "activityTotal"
  | "activityVariety"
  | "activityStreak"
  | "consistency"
  | "insight"
  | "earlyBird"
  | "nightOwl"
  | "weekend"
  | "reflection"
  | "comeback"
  | "milestone";

export const CATEGORY_ICONS: Record<AchievementCategory, LucideIcon> = {
  streak: Flame,
  moodTotal: Sun,
  greatMoodStreak: Sparkles,
  greatMoodTotal: Smile,
  weeklyImprovement: TrendingUp,
  journalTotal: Feather,
  journalDepth: BookOpen,
  journalStreak: NotebookPen,
  activityTotal: Footprints,
  activityVariety: Compass,
  activityStreak: Wind,
  consistency: CalendarCheck,
  insight: Search,
  earlyBird: Sunrise,
  nightOwl: Moon,
  weekend: CalendarHeart,
  reflection: PenLine,
  comeback: Heart,
  milestone: Trophy,
};

export interface Achievement {
  id: string;
  category: AchievementCategory;
  tierIndex: number;
  tierCount: number;
  title: Record<Language, string>;
  description: Record<Language, string>;
  unlocked: (s: StatsSnapshot) => boolean;
}

function tiers(
  category: AchievementCategory,
  thresholds: number[],
  copy: (n: number) => { title: Record<Language, string>; description: Record<Language, string> },
  metric: (s: StatsSnapshot) => number,
): Achievement[] {
  return thresholds.map((n, idx) => ({
    id: `${category}-${idx}`,
    category,
    tierIndex: idx,
    tierCount: thresholds.length,
    ...copy(n),
    unlocked: (s) => metric(s) >= n,
  }));
}

export const ACHIEVEMENTS: Achievement[] = [
  ...tiers(
    "streak",
    [3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 150, 200],
    (n) => ({
      title: { de: `${n} Tage in Folge`, en: `${n}-day streak` },
      description: {
        de: `Du hast ${n} Tage hintereinander deine Stimmung festgehalten.`,
        en: `You've logged your mood ${n} days in a row.`,
      },
    }),
    (s) => s.longestMoodStreak,
  ),
  ...tiers(
    "moodTotal",
    [1, 5, 10, 25, 50, 75, 100, 150, 200],
    (n) => ({
      title: { de: `${n} Stimmungs-Einträge`, en: `${n} mood check-ins` },
      description: {
        de: `Du hast insgesamt ${n} Mal deine Stimmung festgehalten.`,
        en: `You've logged your mood ${n} times in total.`,
      },
    }),
    (s) => s.totalMoodEntries,
  ),
  ...tiers(
    "greatMoodStreak",
    [2, 3, 5, 7, 10, 14, 21],
    (n) => ({
      title: { de: `${n} strahlende Tage in Folge`, en: `${n} radiant days in a row` },
      description: {
        de: `${n} Tage hintereinander mit einer richtig guten Stimmung (8 oder mehr).`,
        en: `${n} days in a row with a really great mood (8 or higher).`,
      },
    }),
    (s) => s.longestGreatMoodStreakValue,
  ),
  ...tiers(
    "greatMoodTotal",
    [5, 10, 25, 50, 100, 150],
    (n) => ({
      title: { de: `${n}x richtig gute Stimmung`, en: `${n}x great mood` },
      description: {
        de: `Du hattest schon ${n} Tage mit einer Stimmung von 8 oder höher.`,
        en: `You've had ${n} days with a mood of 8 or higher.`,
      },
    }),
    (s) => s.totalGreatMoodDaysValue,
  ),
  ...tiers(
    "weeklyImprovement",
    [10, 20, 35, 50, 75],
    (n) => ({
      title: { de: `+${n}% bessere Woche`, en: `+${n}% better week` },
      description: {
        de: `Eine Woche mit einer um ${n}% besseren Stimmung als die Woche davor.`,
        en: `A week with a mood ${n}% better than the previous week.`,
      },
    }),
    (s) => s.bestWeeklyImprovementPctValue,
  ),
  ...tiers(
    "journalTotal",
    [1, 5, 10, 25, 50, 100, 150, 200],
    (n) => ({
      title: { de: `${n} Tagebucheinträge`, en: `${n} journal entries` },
      description: {
        de: `Du hast ${n} Einträge in deinem Tagebuch geschrieben.`,
        en: `You've written ${n} entries in your journal.`,
      },
    }),
    (s) => s.totalJournalEntries,
  ),
  ...tiers(
    "journalDepth",
    [50, 150, 300, 500],
    (n) => ({
      title: { de: `${n}+ Wörter geschrieben`, en: `${n}+ words written` },
      description: {
        de: `Ein Tagebucheintrag mit mindestens ${n} Wörtern.`,
        en: `A journal entry with at least ${n} words.`,
      },
    }),
    (s) => s.longestJournalEntryWordsValue,
  ),
  ...tiers(
    "journalStreak",
    [3, 7, 14, 30],
    (n) => ({
      title: { de: `${n} Tage Tagebuch-Serie`, en: `${n}-day journal streak` },
      description: {
        de: `${n} Tage in Folge einen Tagebucheintrag geschrieben.`,
        en: `Written a journal entry ${n} days in a row.`,
      },
    }),
    (s) => s.longestJournalStreak,
  ),
  ...tiers(
    "activityTotal",
    [5, 10, 25, 50, 100, 150, 200],
    (n) => ({
      title: { de: `${n} Gewohnheiten geloggt`, en: `${n} habits logged` },
      description: {
        de: `Du hast insgesamt ${n} Mal eine Aktivität eingetragen.`,
        en: `You've logged an activity ${n} times in total.`,
      },
    }),
    (s) => s.totalActivityLogs,
  ),
  ...tiers(
    "activityVariety",
    [3, 5, 8, 12],
    (n) => ({
      title: { de: `${n} verschiedene Aktivitäten`, en: `${n} different activities` },
      description: {
        de: `Du hast ${n} unterschiedliche Aktivitäten ausprobiert.`,
        en: `You've tried ${n} different activities.`,
      },
    }),
    (s) => s.distinctActivitiesTried,
  ),
  ...tiers(
    "activityStreak",
    [3, 7, 14, 30, 60],
    (n) => ({
      title: { de: `${n} Tage aktiv in Folge`, en: `${n}-day activity streak` },
      description: {
        de: `${n} Tage hintereinander mindestens eine Aktivität geloggt.`,
        en: `Logged at least one activity ${n} days in a row.`,
      },
    }),
    (s) => s.longestActivityStreak,
  ),
  ...tiers(
    "consistency",
    [10, 30, 60, 100, 180],
    (n) => ({
      title: { de: `${n} Tage dabei`, en: `${n} days logged` },
      description: {
        de: `An ${n} verschiedenen Tagen hast du deine Stimmung festgehalten.`,
        en: `You've logged your mood on ${n} different days.`,
      },
    }),
    (s) => s.distinctMoodDays,
  ),
  {
    id: "insight-0",
    category: "insight",
    tierIndex: 0,
    tierCount: 3,
    title: { de: "Erste Erkenntnis", en: "First insight" },
    description: {
      de: "Du hast genug Daten für deinen ersten Zusammenhang gesammelt.",
      en: "You've gathered enough data for your first pattern.",
    },
    unlocked: (s) => s.hasCorrelationInsight,
  },
  {
    id: "insight-1",
    category: "insight",
    tierIndex: 1,
    tierCount: 3,
    title: { de: "Klarer Favorit", en: "Clear favorite" },
    description: {
      de: "Eine Aktivität zeigt einen klar positiven Zusammenhang mit deiner Stimmung.",
      en: "One activity shows a clearly positive link with your mood.",
    },
    unlocked: (s) => s.hasStrongTopActivity,
  },
  {
    id: "insight-2",
    category: "insight",
    tierIndex: 2,
    tierCount: 3,
    title: { de: "Vielseitig erforscht", en: "Well explored" },
    description: {
      de: "Du siehst jetzt Zusammenhänge für 5 verschiedene Aktivitäten.",
      en: "You can now see patterns for 5 different activities.",
    },
    unlocked: (s) => s.correlationRowCount >= 5,
  },
  ...tiers(
    "earlyBird",
    [5, 15, 30],
    (n) => ({
      title: { de: `Frühaufsteher x${n}`, en: `Early bird x${n}` },
      description: {
        de: `An ${n} Tagen hast du vor 8 Uhr deine Stimmung eingetragen.`,
        en: `You logged your mood before 8am on ${n} days.`,
      },
    }),
    (s) => s.earlyBirdDays,
  ),
  ...tiers(
    "nightOwl",
    [5, 15, 30],
    (n) => ({
      title: { de: `Nachteule x${n}`, en: `Night owl x${n}` },
      description: {
        de: `An ${n} Tagen hast du nach 22 Uhr deine Stimmung eingetragen.`,
        en: `You logged your mood after 10pm on ${n} days.`,
      },
    }),
    (s) => s.nightOwlDays,
  ),
  ...tiers(
    "weekend",
    [2, 6, 12],
    (n) => ({
      title: { de: `${n} volle Wochenenden`, en: `${n} full weekends` },
      description: {
        de: `An ${n} Wochenenden hast du sowohl Samstag als auch Sonntag eingecheckt.`,
        en: `You checked in on both Saturday and Sunday on ${n} weekends.`,
      },
    }),
    (s) => s.weekendCheckins,
  ),
  ...tiers(
    "reflection",
    [5, 15, 30, 60],
    (n) => ({
      title: { de: `${n}x mit Notiz`, en: `${n}x with a note` },
      description: {
        de: `Du hast ${n} Mal deiner Stimmung eine Notiz hinzugefügt.`,
        en: `You've added a note to your mood ${n} times.`,
      },
    }),
    (s) => s.moodEntriesWithNote,
  ),
  ...tiers(
    "comeback",
    [1, 5, 15],
    (n) => ({
      title: { de: `${n}x zurückgekommen`, en: `${n}x came back` },
      description: {
        de: `Du bist ${n} Mal nach einer längeren Pause zurückgekehrt – das zählt.`,
        en: `You've returned after a longer break ${n} times — that counts.`,
      },
    }),
    (s) => s.comebackCount,
  ),
  {
    id: "milestone-0",
    category: "milestone",
    tierIndex: 0,
    tierCount: 5,
    title: { de: "Erster Schritt", en: "First step" },
    description: { de: "Dein allererster Eintrag in Mira.", en: "Your very first entry in Mira." },
    unlocked: (s) => s.hasAnyEntry,
  },
  ...tiers(
    "milestone",
    [50, 150, 300],
    (n) => ({
      title: { de: `${n} Einträge insgesamt`, en: `${n} entries in total` },
      description: {
        de: `Stimmung, Tagebuch und Gewohnheiten zusammengezählt: ${n} Einträge.`,
        en: `Mood, journal and habits combined: ${n} entries.`,
      },
    }),
    (s) => s.combinedTotalEntries,
  ).map((a, i) => ({ ...a, id: `milestone-combined-${i}`, tierIndex: i + 1, tierCount: 5 })),
  {
    id: "milestone-4",
    category: "milestone",
    tierIndex: 4,
    tierCount: 5,
    title: { de: "Alles an einem Tag", en: "All in one day" },
    description: {
      de: "Stimmung, Tagebucheintrag und eine Aktivität – alles am selben Tag.",
      en: "Mood, a journal entry and an activity — all on the same day.",
    },
    unlocked: (s) => s.hasAllThreeInOneDay,
  },
];
