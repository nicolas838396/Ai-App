import { z } from "zod";

export const journalEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(20000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type JournalEntry = z.infer<typeof journalEntrySchema>;

export const createJournalEntrySchema = journalEntrySchema.pick({
  title: true,
  content: true,
});
export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
