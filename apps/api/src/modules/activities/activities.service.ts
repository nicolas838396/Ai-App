import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateActivityLogDto } from "./dto/create-activity-log.dto";

export interface CorrelationRow {
  activityId: string;
  activityName: string;
  avgMoodOnDay: number;
  daysLogged: number;
}

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllActivities() {
    return this.prisma.activity.findMany({ orderBy: { category: "asc" } });
  }

  logActivity(userId: string, dto: CreateActivityLogDto) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        activityId: dto.activityId,
        durationMin: dto.durationMin,
      },
    });
  }

  async deleteLog(userId: string, logId: string) {
    const log = await this.prisma.activityLog.findUnique({ where: { id: logId } });
    if (!log) throw new NotFoundException("Activity log not found");
    if (log.userId !== userId) throw new ForbiddenException();
    await this.prisma.activityLog.delete({ where: { id: logId } });
  }

  findLogsForUser(userId: string) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      include: { activity: true },
      orderBy: { occurredAt: "desc" },
      take: 200,
    });
  }

  // First-pass correlation: for each activity, average the user's mood
  // score on days that activity was logged. Enough signal to show "does X
  // seem to relate to mood" without a dedicated analytics pipeline; a
  // proper statistical treatment (confounders, significance) is a later task.
  async correlationSummary(userId: string): Promise<CorrelationRow[]> {
    const [moodEntries, activityLogs] = await Promise.all([
      this.prisma.moodEntry.findMany({ where: { userId } }),
      this.prisma.activityLog.findMany({
        where: { userId },
        include: { activity: true },
      }),
    ]);

    const dayKey = (date: Date) => date.toISOString().slice(0, 10);

    const moodByDay = new Map<string, number[]>();
    for (const entry of moodEntries) {
      const key = dayKey(entry.createdAt);
      const scores = moodByDay.get(key) ?? [];
      scores.push(entry.score);
      moodByDay.set(key, scores);
    }

    const perActivity = new Map<string, { name: string; scores: number[]; days: Set<string> }>();
    for (const log of activityLogs) {
      const key = dayKey(log.occurredAt);
      const dayScores = moodByDay.get(key);
      if (!dayScores || dayScores.length === 0) continue;

      const bucket = perActivity.get(log.activityId) ?? {
        name: log.activity.name,
        scores: [],
        days: new Set<string>(),
      };
      const avgForDay = dayScores.reduce((a, b) => a + b, 0) / dayScores.length;
      bucket.scores.push(avgForDay);
      bucket.days.add(key);
      perActivity.set(log.activityId, bucket);
    }

    return Array.from(perActivity.entries()).map(([activityId, bucket]) => ({
      activityId,
      activityName: bucket.name,
      avgMoodOnDay: Number(
        (bucket.scores.reduce((a, b) => a + b, 0) / bucket.scores.length).toFixed(2),
      ),
      daysLogged: bucket.days.size,
    }));
  }
}
