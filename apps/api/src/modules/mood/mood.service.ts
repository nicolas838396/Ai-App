import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateMoodEntryDto } from "./dto/create-mood-entry.dto";

@Injectable()
export class MoodService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateMoodEntryDto) {
    return this.prisma.moodEntry.create({
      data: {
        userId,
        score: dto.score,
        note: dto.note,
        tags: dto.tags ?? [],
      },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }
}
