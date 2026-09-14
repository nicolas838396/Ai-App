import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateJournalEntryDto } from "./dto/create-journal-entry.dto";

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateJournalEntryDto) {
    return this.prisma.journalEntry.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
      },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }
}
