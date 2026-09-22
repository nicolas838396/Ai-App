-- AlterTable
ALTER TABLE "mood_entries" ADD COLUMN "reasons" TEXT[] DEFAULT ARRAY[]::TEXT[];
