import type { TranslationKey } from "@/lib/i18n/translations";

export interface MoodReasonOption {
  id: string;
  emoji: string;
  labelKey: TranslationKey;
}

export const MOOD_REASONS: MoodReasonOption[] = [
  { id: "money", emoji: "💰", labelKey: "moodReason.money" },
  { id: "tiredness", emoji: "😴", labelKey: "moodReason.tiredness" },
  { id: "stress", emoji: "😣", labelKey: "moodReason.stress" },
  { id: "work", emoji: "💼", labelKey: "moodReason.work" },
  { id: "family", emoji: "👨‍👩‍👧", labelKey: "moodReason.family" },
  { id: "friends", emoji: "🧑‍🤝‍🧑", labelKey: "moodReason.friends" },
  { id: "relationship", emoji: "❤️", labelKey: "moodReason.relationship" },
  { id: "health", emoji: "🩺", labelKey: "moodReason.health" },
  { id: "sleep", emoji: "🛌", labelKey: "moodReason.sleep" },
  { id: "otherWorries", emoji: "🌀", labelKey: "moodReason.otherWorries" },
];

export const MAX_MOOD_REASONS_PER_ENTRY = 10;

export function moodReasonLabelKey(id: string): TranslationKey | null {
  return MOOD_REASONS.find((r) => r.id === id)?.labelKey ?? null;
}
