import type { TranslationKey } from "@/lib/i18n/translations";

// A rotating pool of short, warm affirmations for the dashboard's daily
// eyecatcher. Deterministic by calendar day (not random per page load) so
// it reads as "today's statement" rather than refreshing every visit.
export const DAILY_STATEMENT_KEYS: TranslationKey[] = [
  "dashboard.statement1",
  "dashboard.statement2",
  "dashboard.statement3",
  "dashboard.statement4",
  "dashboard.statement5",
  "dashboard.statement6",
  "dashboard.statement7",
  "dashboard.statement8",
  "dashboard.statement9",
  "dashboard.statement10",
  "dashboard.statement11",
  "dashboard.statement12",
  "dashboard.statement13",
  "dashboard.statement14",
  "dashboard.statement15",
  "dashboard.statement16",
  "dashboard.statement17",
  "dashboard.statement18",
  "dashboard.statement19",
  "dashboard.statement20",
];

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function pickDailyStatementKey(date = new Date()): TranslationKey {
  const index = (dayOfYear(date) + date.getFullYear()) % DAILY_STATEMENT_KEYS.length;
  return DAILY_STATEMENT_KEYS[index];
}
