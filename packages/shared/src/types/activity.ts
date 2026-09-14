import { z } from "zod";

export const activitySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
});
export type Activity = z.infer<typeof activitySchema>;

export const activityLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  activityId: z.string(),
  durationMin: z.number().int().positive().optional(),
  occurredAt: z.string().datetime(),
});
export type ActivityLog = z.infer<typeof activityLogSchema>;

export const createActivityLogSchema = activityLogSchema.pick({
  activityId: true,
  durationMin: true,
});
export type CreateActivityLogInput = z.infer<typeof createActivityLogSchema>;
