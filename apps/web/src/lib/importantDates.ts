import { Briefcase, Cake, Heart, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/translations";

export const IMPORTANT_DATE_CATEGORIES = ["work", "family", "birthday", "relationship", "other"] as const;
export type ImportantDateCategory = (typeof IMPORTANT_DATE_CATEGORIES)[number];

export interface ImportantDateEntry {
  id: string;
  title: string;
  category: ImportantDateCategory;
  emoji: string;
  date: string;
  recurringYearly: boolean;
}

export const CATEGORY_META: Record<
  ImportantDateCategory,
  { icon: LucideIcon; labelKey: TranslationKey; defaultEmoji: string }
> = {
  work: { icon: Briefcase, labelKey: "calendar.category.work", defaultEmoji: "💼" },
  family: { icon: Users, labelKey: "calendar.category.family", defaultEmoji: "👨‍👩‍👧" },
  birthday: { icon: Cake, labelKey: "calendar.category.birthday", defaultEmoji: "🎂" },
  relationship: { icon: Heart, labelKey: "calendar.category.relationship", defaultEmoji: "❤️" },
  other: { icon: Sparkles, labelKey: "calendar.category.other", defaultEmoji: "✨" },
};

export const EMOJI_CHOICES = [
  "✨", "🎂", "🎉", "❤️", "💼", "👨‍👩‍👧", "🏖️", "🎓", "🏡", "🐾", "🎵", "⚽", "✈️", "🎁", "🕯️",
];

// Parses a "YYYY-MM-DD" (or full ISO) date string as a local-date-only value
// at UTC midnight, matching how the backend stores/reads its @db.Date column
// — avoids off-by-one-day shifts that plain `new Date(str)` can cause when
// the string has no time component and the browser applies local timezone.
export function parseDateOnly(value: string): Date {
  const [datePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function nextOccurrence(entry: Pick<ImportantDateEntry, "date" | "recurringYearly">): Date {
  const date = parseDateOnly(entry.date);
  if (!entry.recurringYearly) return date;

  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  let candidate = Date.UTC(now.getFullYear(), date.getUTCMonth(), date.getUTCDate());
  if (candidate < todayUtc) {
    candidate = Date.UTC(now.getFullYear() + 1, date.getUTCMonth(), date.getUTCDate());
  }
  return new Date(candidate);
}

export function daysUntil(target: Date): number {
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - todayUtc) / (24 * 60 * 60 * 1000));
}

export function sortByNextOccurrence(entries: ImportantDateEntry[]): ImportantDateEntry[] {
  return [...entries].sort((a, b) => daysUntil(nextOccurrence(a)) - daysUntil(nextOccurrence(b)));
}
