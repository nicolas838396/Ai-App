import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateImportantDateDto } from "./dto/create-important-date.dto";
import type { UpdateImportantDateDto } from "./dto/update-important-date.dto";

@Injectable()
export class ImportantDatesService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateImportantDateDto) {
    return this.prisma.importantDate.create({
      data: {
        userId,
        title: dto.title,
        category: dto.category,
        emoji: dto.emoji ?? "✨",
        date: new Date(dto.date),
        recurringYearly: dto.recurringYearly ?? true,
      },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.importantDate.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });
  }

  async update(userId: string, id: string, dto: UpdateImportantDateDto) {
    await this.ensureOwned(userId, id);
    return this.prisma.importantDate.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.emoji !== undefined ? { emoji: dto.emoji } : {}),
        ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
        ...(dto.recurringYearly !== undefined ? { recurringYearly: dto.recurringYearly } : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.ensureOwned(userId, id);
    await this.prisma.importantDate.delete({ where: { id } });
  }

  private async ensureOwned(userId: string, id: string): Promise<void> {
    const existing = await this.prisma.importantDate.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException("Besonderer Tag wurde nicht gefunden.");
    }
  }
}
