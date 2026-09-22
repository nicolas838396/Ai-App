// Shared 1-10 mood-score → emoji scale, used anywhere a mood needs a quick
// visual instead of a plain number (journal history strip, dashboard).
export const MOOD_EMOJI = ["😞", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩", "🥳", "✨"];

export function moodEmojiForScore(score: number): string {
  return MOOD_EMOJI[Math.min(Math.max(score, 1), 10) - 1];
}

export function isToday(isoDate: string): boolean {
  return isoDate.slice(0, 10) === new Date().toISOString().slice(0, 10);
}
