-- AlterTable
ALTER TABLE "users" DROP COLUMN "pronoun",
ADD COLUMN     "cycleTrackingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastPeriodStartDate" DATE,
ADD COLUMN     "cycleLengthDays" INTEGER;
