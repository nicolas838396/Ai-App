import type { TranslationKey } from "./i18n/translations";

// Stored as free-form tags on a mood entry (the backend already accepts up
// to 10 per entry), independent of the 1–10 mood score used everywhere
// else for trends/streaks/achievements — this lets people name specific
// feelings without us having to rebuild those around a categorical scale.
export interface EmotionOption {
  id: string;
  emoji: string;
  labelKey: TranslationKey;
}

export const EMOTIONS: EmotionOption[] = [
  { id: "joy", emoji: "😄", labelKey: "emotion.joy" },
  { id: "gratitude", emoji: "🙏", labelKey: "emotion.gratitude" },
  { id: "contentment", emoji: "😊", labelKey: "emotion.contentment" },
  { id: "calm", emoji: "😌", labelKey: "emotion.calm" },
  { id: "love", emoji: "🥰", labelKey: "emotion.love" },
  { id: "pride", emoji: "💪", labelKey: "emotion.pride" },
  { id: "excitement", emoji: "🤩", labelKey: "emotion.excitement" },
  { id: "hope", emoji: "🌱", labelKey: "emotion.hope" },
  { id: "surprise", emoji: "😮", labelKey: "emotion.surprise" },
  { id: "tiredness", emoji: "😴", labelKey: "emotion.tiredness" },
  { id: "boredom", emoji: "😑", labelKey: "emotion.boredom" },
  { id: "confusion", emoji: "😕", labelKey: "emotion.confusion" },
  { id: "sadness", emoji: "😢", labelKey: "emotion.sadness" },
  { id: "loneliness", emoji: "😔", labelKey: "emotion.loneliness" },
  { id: "fear", emoji: "😨", labelKey: "emotion.fear" },
  { id: "anger", emoji: "😠", labelKey: "emotion.anger" },
  { id: "stress", emoji: "😖", labelKey: "emotion.stress" },
  { id: "shame", emoji: "😳", labelKey: "emotion.shame" },
];

export const MAX_EMOTIONS_PER_ENTRY = 10;
