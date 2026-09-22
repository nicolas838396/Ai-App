export interface MoodEntryWithReasons {
  score: number;
  reasons?: string[];
}

export interface ReasonAverage {
  reasonId: string;
  avgMood: number;
  daysLogged: number;
}

/** Average mood score for every reason tag that's been attached to a mood entry at least once. */
export function reasonAverages(entries: MoodEntryWithReasons[]): ReasonAverage[] {
  const byReason = new Map<string, number[]>();
  for (const entry of entries) {
    for (const reasonId of entry.reasons ?? []) {
      const scores = byReason.get(reasonId) ?? [];
      scores.push(entry.score);
      byReason.set(reasonId, scores);
    }
  }
  return [...byReason.entries()].map(([reasonId, scores]) => ({
    reasonId,
    avgMood: scores.reduce((a, b) => a + b, 0) / scores.length,
    daysLogged: scores.length,
  }));
}
