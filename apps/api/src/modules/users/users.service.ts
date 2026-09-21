import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthenticatedUser } from "../../common/guards/supabase-auth.guard";
import type { CompleteOnboardingDto } from "./dto/complete-onboarding.dto";

// Supabase owns the auth.users table; we lazily mirror a row into our own
// `users` table the first time we see a given user so app tables can hold a
// plain foreign key without querying the auth schema.
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureUser(authUser: AuthenticatedUser) {
    return this.prisma.user.upsert({
      where: { id: authUser.id },
      update: {},
      create: {
        id: authUser.id,
        email: authUser.email ?? `${authUser.id}@unknown.local`,
      },
    });
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto) {
    const birthDate = new Date(dto.birthDate);
    if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) {
      throw new BadRequestException("Ungültiges Geburtsdatum");
    }

    let lastPeriodStartDate: Date | null = null;
    if (dto.cycleTrackingEnabled) {
      lastPeriodStartDate = new Date(dto.lastPeriodStartDate!);
      if (Number.isNaN(lastPeriodStartDate.getTime()) || lastPeriodStartDate > new Date()) {
        throw new BadRequestException("Ungültiges Datum der letzten Periode");
      }
    }

    const now = new Date();
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        birthDate,
        goals: dto.goals,
        concerns: dto.concerns,
        stressAreas: dto.stressAreas ?? [],
        usageFrequency: dto.usageFrequency,
        cycleTrackingEnabled: dto.cycleTrackingEnabled,
        lastPeriodStartDate,
        cycleLengthDays: dto.cycleTrackingEnabled ? dto.cycleLengthDays : null,
        healthDataConsentAt: now,
        onboardingCompletedAt: now,
      },
    });
  }
}
