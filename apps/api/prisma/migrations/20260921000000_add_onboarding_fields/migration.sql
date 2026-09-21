-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "pronoun" TEXT,
ADD COLUMN     "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "concerns" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "stressAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "usageFrequency" TEXT,
ADD COLUMN     "healthDataConsentAt" TIMESTAMP(3),
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3);
