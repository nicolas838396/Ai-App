import { z } from "zod";

export const moodEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  score: z.number().int().min(1).max(10),
  note: z.string().max(2000).optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
});
export type MoodEntry = z.infer<typeof moodEntrySchema>;

export const createMoodEntrySchema = moodEntrySchema.pick({
  score: true,
  note: true,
  tags: true,
});
export type CreateMoodEntryInput = z.infer<typeof createMoodEntrySchema>;
