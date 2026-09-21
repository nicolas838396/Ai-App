-- AlterTable
ALTER TABLE "chat_conversations" ADD COLUMN     "summary" TEXT,
ADD COLUMN     "summarizedMessageCount" INTEGER NOT NULL DEFAULT 0;
